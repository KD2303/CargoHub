"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Clock, Package, Settings, Navigation, Navigation2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function GlobalSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("cargohub_recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        let found: any[] = [];

        // Static routes
        const staticRoutes = [
          { type: 'route', title: 'New Booking', path: '/dashboard/book', icon: <Package className="w-4 h-4 text-blue-500" /> },
          { type: 'route', title: 'My Orders', path: '/dashboard/orders', icon: <Package className="w-4 h-4 text-emerald-500" /> },
          { type: 'route', title: 'Settings', path: '/dashboard/settings', icon: <Settings className="w-4 h-4 text-gray-500" /> },
          { type: 'route', title: 'Track Shipment', path: '/dashboard/track', icon: <Navigation2 className="w-4 h-4 text-purple-500" /> },
        ];

        found = staticRoutes.filter(r => r.title.toLowerCase().includes(query.toLowerCase()));

        // Fetch bookings
        const token = await auth.currentUser?.getIdToken();
        if (token) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/bookings?limit=50`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success && data.data) {
            const matchingBookings = data.data.filter((b: any) => 
              b.id.toLowerCase().includes(query.toLowerCase()) || 
              b.pickupAddress?.toLowerCase().includes(query.toLowerCase()) ||
              b.dropAddress?.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5);

            matchingBookings.forEach((b: any) => {
              found.push({
                type: 'booking',
                title: `Order ${b.id.substring(0,8)}...`,
                desc: `${b.pickupAddress} → ${b.dropAddress}`,
                path: `/dashboard/track?id=${b.id}`,
                icon: <Navigation className="w-4 h-4 text-orange-500" />
              });
            });
          }
        }
        setResults(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("cargohub_recent_searches", JSON.stringify(updated));
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    localStorage.setItem("cargohub_recent_searches", JSON.stringify(updated));
  };

  const handleSelect = (result: any) => {
    saveRecentSearch(query || result.title);
    onClose();
    router.push(result.path);
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] shadow-2xl rounded-2xl overflow-hidden z-[101] flex flex-col max-h-[80vh]"
          >
            {/* Search Input */}
            <div className="relative flex items-center px-4 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <Search className="w-5 h-5 text-[var(--text-muted)] mr-3 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search orders, bookings, pages..."
                className="flex-1 bg-transparent border-none outline-none text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />
              {query && (
                <button onClick={() => setQuery("")} className="p-1 hover:bg-[var(--bg-primary)] rounded-full text-[var(--text-muted)] mr-2 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center gap-1 bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-2 py-1 rounded-md">
                <span className="text-[10px] font-bold text-[var(--text-muted)]">ESC</span>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-2">
              {/* Recent Searches */}
              {!query && recentSearches.length > 0 && (
                <div className="p-2">
                  <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 px-2">Recent Searches</h3>
                  <div className="space-y-1">
                    {recentSearches.map((term, i) => (
                      <div 
                        key={i}
                        onClick={() => handleRecentClick(term)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[var(--bg-secondary)] cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-3 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                          <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                          <span className="text-sm font-medium">{term}</span>
                        </div>
                        <button 
                          onClick={(e) => removeRecentSearch(e, term)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[var(--bg-primary)] rounded-md text-[var(--text-muted)] hover:text-red-500 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions / Results */}
              {query && (
                <div className="p-2">
                  <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 px-2">
                    {loading ? "Searching..." : "Suggestions"}
                  </h3>
                  
                  {results.length === 0 && !loading ? (
                    <div className="py-8 text-center text-[var(--text-muted)]">
                      <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No results found for "{query}"</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {results.map((item, i) => (
                        <div 
                          key={i}
                          onClick={() => handleSelect(item)}
                          className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex items-center justify-center flex-shrink-0">
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[var(--text-primary)] truncate">{item.title}</p>
                            {item.desc && (
                              <p className="text-xs text-[var(--text-muted)] truncate">{item.desc}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!query && recentSearches.length === 0 && (
                <div className="py-12 text-center text-[var(--text-muted)] flex flex-col items-center">
                  <Search className="w-8 h-8 opacity-20 mb-3" />
                  <p className="text-sm">Type anything to search CargoHub</p>
                </div>
              )}
            </div>
            
            <div className="px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center gap-4 text-[11px] text-[var(--text-muted)] font-medium">
              <span className="flex items-center gap-1">
                <kbd className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-1.5 rounded">↑↓</kbd> to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-1.5 rounded">↵</kbd> to select
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

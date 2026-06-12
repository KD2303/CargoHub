"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, X as XIcon, Loader2, LogOut, User } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { useAuthStore } from "@/store/authStore";

import { useAdminLayoutStore } from "@/store/adminLayoutStore";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, Check, X, ClipboardCheck } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { adminFetch } from "@/lib/admin/api";

const formatPathName = (pathname: string) => {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 2) return "Dashboard";
  const lastPart = parts[parts.length - 1];
  return lastPart
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const title = formatPathName(pathname);
  const { toggleSidebar, toggleMobile, sidebarCollapsed } = useAdminLayoutStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { adminUser, logoutAdmin } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Fetch system events as notifications
    const fetchNotifications = async () => {
      try {
        const data = await adminFetch("/api/admin/dashboard-stats");
        if (data?.data?.liveEvents) {
          setNotifications(data.data.liveEvents.map((evt: any) => ({
            id: evt.id,
            type: 'SYSTEM',
            title: evt.text,
            desc: 'System event logged by the admin portal.',
            sender: 'SYSTEM',
            time: evt.time,
            unread: true
          })));
        }
      } catch(e) {
        // ignore
      }
    };
    fetchNotifications();
    
    // Close notifications when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search debounce effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const res = await adminFetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
          setSearchResults(res.data || []);
          setShowSearchResults(true);
        } catch(e) { }
        setIsSearching(false);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleLogout = () => {
    logoutAdmin();
    router.push('/admin/login');
  };

  const getInitials = () => {
    if (!adminUser?.name) return "AD";
    return adminUser.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <header 
      className={`fixed top-0 right-0 h-16 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] z-10 flex items-center justify-between px-4 lg:px-8 transition-all duration-300 ease-in-out left-0 ${
        sidebarCollapsed ? "md:left-[80px]" : "md:left-[220px]"
      }`}
    >
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors hidden md:block"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button 
          onClick={toggleMobile}
          className="p-2 -ml-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* Page Title */}
        <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Search */}
        <div className="relative w-48 sm:w-64 hidden md:block" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
            onFocus={() => { if(searchQuery.trim().length > 1) setShowSearchResults(true); }}
            placeholder="Search bookings, users..."
            className="w-full pl-9 pr-8 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:bg-[var(--bg-primary)] focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] rounded-full text-sm outline-none transition-all text-[var(--text-primary)]"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setShowSearchResults(false); setSearchResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <XIcon className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Search Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full left-0 mt-2 w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] shadow-xl rounded-xl overflow-hidden z-50">
              {isSearching ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="w-5 h-5 text-[var(--brand-primary)] animate-spin" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-80 overflow-y-auto">
                  {searchResults.map((res: any) => (
                    <button 
                      key={`${res.type}-${res.id}`} 
                      onClick={() => { setShowSearchResults(false); router.push(res.url); }}
                      className="w-full text-left p-3 hover:bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] last:border-none flex items-center gap-3 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{res.title}</span>
                          <span className="text-[10px] font-bold text-white bg-[var(--brand-primary)] px-1.5 py-0.5 rounded uppercase">{res.type}</span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] truncate">{res.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-[var(--text-secondary)]">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        {mounted && (
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] rounded-full transition-colors"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        )}

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-full transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notifications.some(n => n.unread) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--brand-secondary)] rounded-full ring-2 ring-[var(--bg-primary)]" />
            )}
          </button>

          {/* Notification Panel */}
          {showNotifications && (
            <div className="absolute -right-2 sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px] max-h-[85vh] flex flex-col bg-[var(--bg-primary)] border border-[var(--border-subtle)] shadow-2xl rounded-2xl overflow-hidden z-50">
              {/* Header */}
              <div className="p-4 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)] text-white flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[16px] text-[var(--text-primary)] leading-tight">Notifications</h3>
                    <p className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{notifications.filter(n => n.unread).length} UNREAD MESSAGES</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setNotifications([])}
                    className="p-2 rounded-lg border border-[var(--border-subtle)] text-[var(--brand-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                    title="Clear all notifications"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setShowNotifications(false)} className="p-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 bg-[#F8FAFC] dark:bg-[var(--bg-primary)]">
                {notifications.length > 0 ? (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">TODAY</span>
                      <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                    </div>
                    
                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="relative bg-[var(--bg-primary)] border border-[var(--border-subtle)] p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                          {notif.unread && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500" />}
                          
                          <div className="flex gap-3">
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800">
                              <ClipboardCheck className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded uppercase">{notif.type}</span>
                                <span className="text-xs font-medium text-[var(--text-muted)]">{notif.time}</span>
                              </div>
                              <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">{notif.title}</h4>
                              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">{notif.desc}</p>
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                                  {notif.sender.charAt(0)}
                                </div>
                                <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">{notif.sender}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-4">
                      <Bell className="w-8 h-8 text-[var(--text-muted)]" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">No new notifications</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">You're all caught up!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="hidden sm:block ml-2 relative" ref={profileRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
          >
            <Avatar initials={getInitials()} className="w-8 h-8 text-white bg-[var(--brand-primary)] border-transparent" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-[var(--bg-primary)] border border-[var(--border-subtle)] shadow-xl rounded-xl overflow-hidden z-50">
              <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                <p className="text-sm font-bold text-[var(--text-primary)] truncate">{adminUser?.name || "Administrator"}</p>
                <p className="text-xs text-[var(--text-secondary)] truncate">{adminUser?.email || "admin@cargohub.com"}</p>
              </div>
              <div className="p-2 space-y-1">
                <button 
                  onClick={() => { setShowProfileMenu(false); router.push('/admin/settings'); }}
                  className="w-full flex items-center px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                >
                  <User className="w-4 h-4 mr-3" />
                  View Profile
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

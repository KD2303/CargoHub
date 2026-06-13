"use client";

import { useState, useEffect } from "react";
import B2BFleetMap from "@/components/b2b/B2BFleetMap";
import { Search, Filter, Truck, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { auth as firebaseAuth } from "@/lib/firebase";

export default function FleetTrackingPage() {
  const [search, setSearch] = useState("");
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [fleet, setFleet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFleet = async () => {
      try {
        const currentUser = firebaseAuth.currentUser;
        if (!currentUser) return;
        const token = await currentUser.getIdToken();
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/business/fleet`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setFleet(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch fleet data", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Wait for auth to initialize if currentUser is not immediately available
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        fetchFleet();
      } else {
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  const filteredFleet = fleet.filter(truck => {
    const matchesSearch = truck.id.toLowerCase().includes(search.toLowerCase()) || 
                          truck.driver.toLowerCase().includes(search.toLowerCase()) ||
                          truck.from.toLowerCase().includes(search.toLowerCase()) ||
                          truck.to.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === "All" || truck.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--text-primary)]">Command Center</h1>
          <p className="text-[var(--text-secondary)] mt-1">Live tracking for all your active corporate shipments.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search trucks, drivers, cities..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-input)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setFilterOpen(!filterOpen)}
              className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-outline)] rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-primary)] shrink-0 h-full"
            >
              <Filter className="w-4 h-4" /> Filter {filterStatus !== "All" && <span className="ml-1 text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded text-xs">{filterStatus}</span>}
            </button>
            {filterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-outline)] rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">By Status</div>
                  {["All", "In Transit", "Delayed", "Delivered"].map(status => (
                    <button 
                      key={status}
                      onClick={() => { setFilterStatus(status); setFilterOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-tertiary)] transition-colors ${filterStatus === status ? 'text-blue-600 font-semibold bg-blue-500/5' : 'text-[var(--text-primary)]'}`}
                    >
                      {status === "All" ? "All Trucks" : status}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Sidebar List */}
        <div className="w-full lg:w-96 bg-[var(--bg-card)] border border-[var(--border-outline)] rounded-2xl flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-[var(--border-outline)] bg-[var(--bg-tertiary)]/50">
            <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" /> Active Fleet ({fleet.length})
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : filteredFleet.map(truck => (
              <div 
                key={truck.id}
                onClick={() => setSelectedTruckId(truck.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedTruckId === truck.id ? 'border-blue-500 bg-blue-500/5 shadow-md' : 'border-[var(--border-outline)] hover:border-blue-500/50 hover:bg-[var(--bg-tertiary)]'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-[var(--text-primary)] text-sm">{truck.id}</h4>
                    <p className="text-xs text-[var(--text-secondary)]">{truck.type} • {truck.driver}</p>
                  </div>
                  {truck.status === 'In Transit' && <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-500/10 px-2 py-1 rounded-md"><Clock className="w-3 h-3" /> {truck.eta}</span>}
                  {truck.status === 'Delayed' && <span className="flex items-center gap-1 text-xs font-semibold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-md"><AlertCircle className="w-3 h-3" /> Delayed</span>}
                  {truck.status === 'Delivered' && <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md"><CheckCircle2 className="w-3 h-3" /> Delivered</span>}
                </div>
                
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1 font-medium text-[var(--text-primary)]">
                      <span>{truck.from}</span>
                      <span>{truck.to}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${truck.status === 'Delayed' ? 'bg-orange-500' : truck.status === 'Delivered' ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                        style={{ width: `${truck.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {(!loading && filteredFleet.length === 0) && (
              <div className="text-center py-8 text-[var(--text-muted)] text-sm">
                No trucks found matching your search.
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border-outline)] rounded-2xl overflow-hidden relative min-h-[400px]">
          <B2BFleetMap 
            fleet={filteredFleet} 
            selectedTruckId={selectedTruckId} 
            onMarkerClick={(id) => setSelectedTruckId(id)} 
          />
        </div>
      </div>
    </div>
  );
}

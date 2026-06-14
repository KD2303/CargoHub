"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { auth as firebaseAuth } from "@/lib/firebase";
import { FileText, Download, Loader2, Search, ArrowUpRight, DollarSign, AlertTriangle } from "lucide-react";
import { generateInvoicePDF } from "@/lib/pdf";
import { toast } from "react-hot-toast";

export default function B2BInvoicesPage() {
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user || !firebaseAuth.currentUser) return;
      try {
        const token = await firebaseAuth.currentUser.getIdToken();
        const res = await fetch((`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, '')}`) + "/api/business/invoices", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success && json.data) {
          setInvoices(json.data);
        } else {
          setError(json.error || "Failed to fetch invoices");
        }
      } catch (err) {
        console.error(err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [user]);

  const filteredInvoices = invoices.filter(inv => 
    inv.bookingRef?.toLowerCase().includes(search.toLowerCase()) || 
    inv.pickup?.toLowerCase().includes(search.toLowerCase()) || 
    inv.drop?.toLowerCase().includes(search.toLowerCase())
  );

  const exportAllCSV = () => {
    if (filteredInvoices.length === 0) {
      toast.error("No invoices to export");
      return;
    }
    const headers = ['Booking Ref', 'Date', 'Pickup', 'Drop', 'Vehicle', 'Amount (INR)'];
    const rows = filteredInvoices.map(inv => [
      inv.bookingRef,
      new Date(inv.date).toLocaleDateString(),
      `"${inv.pickup}"`,
      `"${inv.drop}"`,
      inv.vehicleType,
      inv.amount
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `cargohub_invoices_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
        <p className="text-[var(--text-secondary)] font-medium tracking-wide animate-pulse">Loading invoices...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-2">Invoices & Billing</h1>
          <p className="text-[var(--text-secondary)]">Manage your B2B account statements and download tax invoices.</p>
        </div>
        <button 
          onClick={exportAllCSV}
          className="px-5 py-2.5 bg-[var(--bg-card)] border border-[var(--border-outline)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-outline)] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)] font-medium">Total Spent</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">₹{invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-outline)] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)] font-medium">Total Invoices</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{invoices.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-outline)] overflow-hidden">
        <div className="p-5 border-b border-[var(--border-outline)] flex gap-4 bg-[var(--bg-secondary)]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Booking Ref or Location..." 
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-input)] text-[var(--text-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm shadow-sm"
            />
          </div>
        </div>

        {error && (
          <div className="p-8 text-center bg-red-500/10">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        )}

        {!error && filteredInvoices.length === 0 ? (
          <div className="p-16 text-center text-[var(--text-muted)]">
            <FileText className="w-16 h-16 opacity-30 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">No Invoices Found</h3>
            <p>You haven't completed any matching B2B shipments yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[var(--bg-card)] border-b border-[var(--border-outline)] text-[var(--text-secondary)]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Booking Ref</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Route</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-outline)]">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[var(--bg-secondary)] transition-colors group">
                    <td className="px-6 py-4 font-mono font-semibold text-[var(--text-primary)]">
                      <div className="flex items-center gap-2">
                        {inv.bookingRef}
                        <ArrowUpRight className="w-3 h-3 text-[var(--text-muted)] group-hover:text-orange-500 transition-colors" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      <div className="font-medium text-[var(--text-primary)]">{new Date(inv.date).toLocaleDateString()}</div>
                      <div className="text-xs">{new Date(inv.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[var(--text-primary)] font-medium truncate max-w-[200px]" title={inv.pickup}>{inv.pickup}</p>
                      <p className="text-[var(--text-muted)] text-xs truncate max-w-[200px]" title={inv.drop}>→ {inv.drop}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[var(--text-primary)] bg-[var(--bg-secondary)] px-2 py-1 rounded-md">
                        ₹{inv.amount?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => generateInvoicePDF(inv)}
                        className="px-3 py-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ml-auto text-xs"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

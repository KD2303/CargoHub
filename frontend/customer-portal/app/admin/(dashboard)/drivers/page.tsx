"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { DataTable } from "@/components/admin/ui/DataTable";
import { Badge } from "@/components/admin/ui/Badge";
import { Search, Filter, Ban, Download, CheckCircle2 } from "lucide-react";
import { adminFetch } from "@/lib/admin/api";
import { exportToCsv } from "@/lib/admin/exportToCsv";
import { toast } from '@/store/toastStore';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadDrivers = async () => {
    try {
      const res = await adminFetch('/api/admin/drivers');
      setDrivers(res.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleStatusChange = async (uid: string, isActive: boolean) => {
    if (isActive) {
      if (!confirm(`Are you sure you want to reinstate this driver?`)) return;
      try {
        await adminFetch(`/api/admin/drivers/${uid}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ isActive, reason: 'Admin action via dashboard' })
        });
        toast.success("Driver reinstated");
        loadDrivers();
      } catch(err: any) {
        toast.error("Failed to update status: " + err.message);
      }
    }
  };

  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<any>(null);
  const [suspendDays, setSuspendDays] = useState(7);
  const [suspendReason, setSuspendReason] = useState("");

  const handleSuspendSubmit = async () => {
    try {
      const reasonStr = `Suspended for ${suspendDays} days. Reason: ${suspendReason}`;
      await adminFetch(`/api/admin/drivers/${suspendTarget.firebaseUid}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: false, reason: reasonStr })
      });
      toast.success("Driver suspended successfully");
      setShowSuspendModal(false);
      setSuspendTarget(null);
      setSuspendReason("");
      loadDrivers();
    } catch(err: any) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const handleExport = () => {
    exportToCsv('cargohub-drivers', drivers, [
      { key: "name", label: "Driver Name" },
      { key: "phone", label: "Phone" },
      { key: "vehicleType", label: "Vehicle Type" },
      { key: "plateNumber", label: "Plate" },
      { key: "kycStatus", label: "KYC Status" },
      { key: "isActive", label: "Active Status" },
      { key: "isAvailable", label: "Available" }
    ]);
  };

  const columns = [
    { key: "name", label: "Driver" },
    { key: "phone", label: "Phone" },
    { key: "vehicleType", label: "Vehicle Type" },
    { key: "plateNumber", label: "Plate" },
    { 
      key: "status", 
      label: "Status",
      render: (row: any) => {
        let variant: any = "default";
        let label = "Offline";
        
        if (row.isActive === false) {
          variant = "error";
          label = "Suspended";
        } else if (row.kycStatus !== "VERIFIED") {
          variant = "warning";
          label = `KYC ${row.kycStatus}`;
        } else if (row.isAvailable) {
          variant = "success";
          label = "Online";
        }

        return <Badge label={label} variant={variant} />;
      }
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <div className="flex items-center space-x-2">
          {row.isActive ? (
            <button onClick={() => { setSuspendTarget(row); setShowSuspendModal(true); }} className="p-1.5 text-[var(--text-muted)] hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-md transition-colors" title="Suspend Driver">
              <Ban className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => handleStatusChange(row.firebaseUid, true)} className="p-1.5 text-[var(--text-muted)] hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors" title="Reinstate Driver">
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={async () => {
              if (confirm('Are you sure you want to permanently delete this driver?')) {
                try {
                  await adminFetch(`/api/admin/drivers/${row.firebaseUid}`, { method: 'DELETE' });
                  toast.success("Driver deleted successfully");
                  loadDrivers();
                } catch(e: any) {
                  toast.error("Failed to delete driver: " + e.message);
                }
              }
            }}
            className="p-1.5 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" 
            title="Delete Driver"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>
        </div>
      )
    }
  ];

  const onlineCount = drivers.filter(d => d.isAvailable && d.isActive).length;
  const suspendedCount = drivers.filter(d => !d.isActive).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Driver Management" />
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg text-sm font-medium hover:bg-[var(--bg-secondary)] transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[var(--bg-primary)] p-5 rounded-lg border border-[var(--border-subtle)] shadow-sm">
          <p className="text-sm font-medium text-[var(--text-secondary)]">Total Drivers</p>
          <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">{drivers.length}</p>
        </div>
        <div className="bg-[var(--bg-primary)] p-5 rounded-lg border border-[var(--border-subtle)] shadow-sm border-l-4 border-l-[var(--green-text)]">
          <p className="text-sm font-medium text-[var(--text-secondary)]">Online Now</p>
          <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">{onlineCount}</p>
        </div>
        <div className="bg-[var(--bg-primary)] p-5 rounded-lg border border-[var(--border-subtle)] shadow-sm border-l-4 border-l-[var(--red-text)]">
          <p className="text-sm font-medium text-[var(--text-secondary)]">Suspended</p>
          <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">{suspendedCount}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search by name, phone or vehicle..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--brand-primary)] outline-none"
          />
        </div>
      </div>

      {/* Suspend Driver Modal */}
      {showSuspendModal && suspendTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--bg-primary)] p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-500" />
              Suspend Driver
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-[var(--text-secondary)]">
                You are about to suspend <strong>{suspendTarget.name}</strong>. They will not be able to accept any bookings.
              </p>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Suspend Duration (Days)</label>
                <input type="number" min="1" value={suspendDays} onChange={e => setSuspendDays(Number(e.target.value))} className="w-full border border-[var(--border-subtle)] rounded-lg px-3 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Reason (Visible to Driver)</label>
                <textarea rows={3} value={suspendReason} onChange={e => setSuspendReason(e.target.value)} placeholder="Violation of terms..." className="w-full border border-[var(--border-subtle)] rounded-lg px-3 py-2 bg-[var(--bg-secondary)] resize-none text-[var(--text-primary)]" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => { setShowSuspendModal(false); setSuspendTarget(null); }} className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-lg">Cancel</button>
                <button 
                  onClick={handleSuspendSubmit} 
                  disabled={suspendReason.trim() === ""}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Suspend Driver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading drivers...</div>
      ) : (
        <DataTable columns={columns} rows={drivers.filter(d => 
          (d.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
          (d.phone || "").includes(searchQuery) || 
          (d.vehicleType || "").toLowerCase().includes(searchQuery.toLowerCase())
        )} />
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { DataTable } from "@/components/admin/ui/DataTable";
import { Badge } from "@/components/admin/ui/Badge";
import { Download, Search, Ban, Loader2 } from "lucide-react";
import { adminFetch } from "@/lib/admin/api";
import { exportToCsv } from "@/lib/admin/exportToCsv";
import { toast } from '@/store/toastStore';
import { Modal } from "@/components/admin/ui/Modal";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const loadBookings = async (pageNumber: number) => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/admin/bookings?page=${pageNumber}&limit=10`);
      setBookings(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setPage(pageNumber);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings(1);
  }, []);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBookingRoute, setNewBookingRoute] = useState("");
  const [newBookingAmount, setNewBookingAmount] = useState("");

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleCreateBooking = async () => {
    if (!newBookingRoute || !newBookingAmount) return toast.error("Please fill all fields");
    try {
      await adminFetch(`/api/admin/bookings`, {
        method: 'POST',
        body: JSON.stringify({ 
          route: newBookingRoute, 
          fareEstimate: parseInt(newBookingAmount),
          userId: 'admin-manual',
          pickupAddress: newBookingRoute.split(' to ')[0] || '',
          dropAddress: newBookingRoute.split(' to ')[1] || '',
          distance: 10,
          vehicleType: 'TRUCK',
        })
      });
      toast.success("Booking created manually");
      setShowCreateModal(false);
      setNewBookingRoute("");
      setNewBookingAmount("");
      loadBookings(1);
    } catch (e: any) {
      toast.error("Failed to create booking: " + e.message);
    }
  };

  const handleExport = () => {
    exportToCsv('cargohub-bookings', bookings, [
      { key: "id", label: "Booking ID" },
      { key: "pickupAddress", label: "Pickup" },
      { key: "dropAddress", label: "Drop" },
      { key: "status", label: "Status" },
      { key: "fareEstimate", label: "Fare (₹)" },
      { key: "createdAt", label: "Date" }
    ]);
  };

  const columns = [
    { key: "id", label: "Booking ID" },
    { 
      key: "route", 
      label: "Route",
      render: (row: any) => (
        <div className="max-w-[200px] truncate" title={`${row.pickupAddress} → ${row.dropAddress}`}>
          {row.pickupAddress?.split(',')[0]} → {row.dropAddress?.split(',')[0]}
        </div>
      )
    },
    { 
      key: "amount", 
      label: "Amount",
      render: (row: any) => `₹${row.fareEstimate || 0}`
    },
    { 
      key: "status", 
      label: "Status",
      render: (row: any) => {
        let variant: any = "default";
        if (row.status === "IN_TRANSIT" || row.status === "ACCEPTED" || row.status === "PICKED_UP") variant = "info";
        if (row.status === "DELIVERED") variant = "success";
        if (row.status === "CANCELLED") variant = "error";
        if (row.status === "PENDING") variant = "warning";
        return <Badge label={row.status} variant={variant} />;
      }
    },
    { 
      key: "time", 
      label: "Date",
      render: (row: any) => new Date(row.createdAt).toLocaleDateString()
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <div className="flex items-center space-x-2">
          {row.status !== 'CANCELLED' && row.status !== 'DELIVERED' && (
            <button onClick={() => {
              setCancelBookingId(row.id);
              setCancelReason("");
              setShowCancelModal(true);
            }} className="p-1.5 text-[var(--text-muted)] hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-md transition-colors" title="Force Cancel">
              <Ban className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={async () => {
              if (confirm('Are you sure you want to permanently delete this booking?')) {
                try {
                  await adminFetch(`/api/admin/bookings/${row.id}`, { method: 'DELETE' });
                  toast.success("Booking deleted successfully");
                  loadBookings(page);
                } catch(e: any) {
                  toast.error("Failed to delete booking: " + e.message);
                }
              }
            }}
            className="p-1.5 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" 
            title="Delete Booking"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader 
        title="All Bookings" 
        action={
          <div className="flex gap-2">
            <button onClick={() => setShowCreateModal(true)} className="flex items-center px-4 py-2 bg-[var(--brand-primary)] text-white font-semibold rounded-lg text-sm hover:brightness-110 transition-all shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              New Booking
            </button>
            <button onClick={handleExport} className="flex items-center px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-semibold rounded-lg text-sm hover:bg-[var(--bg-secondary)] transition-colors shadow-sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        }
      />

      {error && <div className="p-4 mb-6 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg">{error}</div>}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--bg-primary)] p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Manual Booking</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Route (e.g. Delhi to Mumbai)</label>
                <input value={newBookingRoute} onChange={e => setNewBookingRoute(e.target.value)} className="w-full border border-[var(--border-subtle)] rounded-lg px-3 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)]" placeholder="Pickup to Drop" />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Fare Amount (₹)</label>
                <input type="number" value={newBookingAmount} onChange={e => setNewBookingAmount(e.target.value)} className="w-full border border-[var(--border-subtle)] rounded-lg px-3 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)]" placeholder="2500" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-subtle)]">Cancel</button>
                <button onClick={handleCreateBooking} className="px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-lg hover:brightness-110">Create Booking</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      <Modal isOpen={showCancelModal} onClose={() => !actionLoading && setShowCancelModal(false)} title="Cancel Booking">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">Please provide a reason for forcibly cancelling this booking. This will be logged in the system and notified to the user.</p>
          <div>
            <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Cancellation Reason</label>
            <input 
              type="text" 
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="e.g., Vehicle broke down, Driver unavailable" 
              className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]" 
            />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-subtle)] mt-6">
            <button 
              onClick={() => setShowCancelModal(false)}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-lg text-sm font-semibold hover:bg-[var(--bg-secondary)] transition-colors"
            >
              Close
            </button>
            <button 
              onClick={async () => {
                if(!cancelReason) return toast.error("Please provide a reason");
                setActionLoading(true);
                try {
                  await adminFetch(`/api/admin/bookings/${cancelBookingId}/cancel`, {
                    method: 'PATCH',
                    body: JSON.stringify({ reason: cancelReason })
                  });
                  toast.success("Booking cancelled");
                  setShowCancelModal(false);
                  loadBookings(page);
                } catch(e: any) {
                  toast.error("Failed to cancel: " + e.message);
                } finally {
                  setActionLoading(false);
                }
              }}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-50 flex items-center"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Confirm Cancellation
            </button>
          </div>
        </div>
      </Modal>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search by ID or driver..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--brand-primary)] outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-[var(--text-secondary)]">Loading bookings...</div>
      ) : (
        <>
          <DataTable columns={columns} rows={bookings.filter(b => 
            (b.id || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
            (b.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
            (b.driverName || "").toLowerCase().includes(searchQuery.toLowerCase())
          )} />
          
          {/* Pagination Footer */}
          <div className="flex items-center justify-between mt-6 px-1">
            <p className="text-sm text-[var(--text-secondary)]">Showing page <span className="font-semibold text-[var(--text-primary)]">{page}</span> of {totalPages} ({total} total bookings)</p>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => loadBookings(page - 1)} 
                disabled={page <= 1}
                className="px-3 py-1 border border-[var(--border-subtle)] rounded-md text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={() => loadBookings(page + 1)} 
                disabled={page >= totalPages}
                className="px-3 py-1 border border-[var(--border-subtle)] rounded-md text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

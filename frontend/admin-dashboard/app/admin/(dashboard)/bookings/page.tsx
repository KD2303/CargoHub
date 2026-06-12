"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Download, Search, Filter, Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetchApi("/admin/bookings?limit=50");
        const json = await res.json();
        if (json.success) {
          const formatted = json.data.map((b: any) => ({
            id: b.bookingRef || b.id.substring(0,8).toUpperCase(),
            customer: "Customer",
            driver: b.driverId ? "Assigned" : "-",
            route: `${b.pickupAddress?.split(',')[0] || 'Pickup'} → ${b.dropAddress?.split(',')[0] || 'Drop'}`,
            amount: `₹${b.fareEstimate || 0}`,
            status: b.status,
            time: new Date(b.createdAt).toLocaleDateString(),
            rawId: b.id
          }));
          setBookings(formatted);
          setTotal(json.total || formatted.length);
        } else {
          toast.error("Failed to load bookings");
        }
      } catch (e) {
        toast.error("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);
  const columns = [
    { key: "id", label: "Booking ID" },
    { key: "customer", label: "Customer" },
    { key: "driver", label: "Driver" },
    { key: "route", label: "Route" },
    { key: "amount", label: "Amount" },
    { 
      key: "status", 
      label: "Status",
      render: (row: any) => {
        let variant: any = "default";
        if (row.status === "ONGOING" || row.status === "IN_TRANSIT" || row.status === "ACCEPTED") variant = "info";
        if (row.status === "COMPLETED" || row.status === "DELIVERED") variant = "success";
        if (row.status === "CANCELLED") variant = "error";
        if (row.status === "PENDING" || row.status === "FINDING_DRIVER") variant = "warning";
        return <Badge label={row.status.replace(/_/g, ' ')} variant={variant} />;
      }
    },
    { key: "time", label: "Date" },
    {
      key: "actions",
      label: "",
      render: (row: any) => (
        row.status !== 'CANCELLED' && row.status !== 'COMPLETED' && row.status !== 'DELIVERED' ? (
          <button 
            onClick={() => handleCancel(row.rawId)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Cancel
          </button>
        ) : null
      )
    }
  ];

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
      const res = await fetchApi(`/admin/bookings/${id}/cancel`, {
        method: "PATCH",
        body: JSON.stringify({ reason: "Admin requested cancellation" })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Booking cancelled");
        setBookings(bookings.map(b => b.rawId === id ? { ...b, status: "CANCELLED" } : b));
      } else {
        toast.error(json.error || "Failed to cancel");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  return (
    <div>
      <PageHeader 
        title="All Bookings" 
        action={
          <button className="flex items-center px-4 py-2 bg-white border border-[var(--admin-border)] text-[var(--admin-primary)] font-semibold rounded-lg text-sm hover:bg-[var(--bg-secondary)] transition-colors shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">Total Bookings</p>
            <p className="text-2xl font-bold mt-1">{total}</p>
          </div>
          <Badge label="All time" variant="default" />
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between border-l-4 border-l-[var(--blue-text)]">
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">Ongoing</p>
            <p className="text-2xl font-bold mt-1">{bookings.filter(b => b.status === 'ONGOING' || b.status === 'IN_TRANSIT').length}</p>
          </div>
          <Badge label="In transit" variant="info" />
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between border-l-4 border-l-[var(--red-text)]">
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">Cancelled</p>
            <p className="text-2xl font-bold mt-1">{bookings.filter(b => b.status === 'CANCELLED').length}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by ID, Customer, or Driver..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--admin-primary-light)] outline-none"
          />
        </div>
        <div className="flex gap-4">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-[var(--text-secondary)]">
            <Filter className="w-4 h-4 mr-2" /> Filter Status
          </button>
          <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-[var(--text-secondary)]">
            Last 30 Days
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <DataTable columns={columns} rows={bookings} />
      )}
      
      {/* Pagination Footer */}
      {!loading && bookings.length > 0 && (
        <div className="flex items-center justify-between mt-6 px-1">
          <p className="text-sm text-[var(--text-secondary)]">Showing <span className="font-semibold text-[var(--text-primary)]">1-{bookings.length}</span> of {total} results</p>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:bg-gray-50" disabled>Previous</button>
          <button className="px-3 py-1 bg-[var(--admin-primary)] text-white rounded-md text-sm font-medium">1</button>
          <button className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:bg-gray-50">2</button>
          <button className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:bg-gray-50">3</button>
          <span className="text-[var(--text-secondary)]">...</span>
          <button className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:bg-gray-50">Next</button>
        </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { RECENT_BOOKINGS } from "@/lib/mockData";
import { Badge } from "@/components/ui/Badge";
import { Download, Search, Filter } from "lucide-react";

export default function BookingsPage() {
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
        if (row.status === "Ongoing") variant = "info";
        if (row.status === "Completed") variant = "success";
        if (row.status === "Cancelled") variant = "error";
        if (row.status === "Finding Driver") variant = "warning";
        return <Badge label={row.status} variant={variant} />;
      }
    },
    { key: "time", label: "Date" }
  ];

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
            <p className="text-2xl font-bold mt-1">2,847</p>
          </div>
          <Badge label="All time" variant="default" />
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between border-l-4 border-l-[var(--blue-text)]">
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">Ongoing</p>
            <p className="text-2xl font-bold mt-1">89</p>
          </div>
          <Badge label="In transit" variant="info" />
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between border-l-4 border-l-[var(--red-text)]">
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">Cancelled Rate</p>
            <p className="text-2xl font-bold mt-1">4.2%</p>
          </div>
          <Badge label="-0.5%" variant="success" />
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

      <DataTable columns={columns} rows={[...RECENT_BOOKINGS, ...RECENT_BOOKINGS, ...RECENT_BOOKINGS].slice(0, 8)} />
      
      {/* Pagination Footer */}
      <div className="flex items-center justify-between mt-6 px-1">
        <p className="text-sm text-[var(--text-secondary)]">Showing <span className="font-semibold text-[var(--text-primary)]">1-8</span> of 2,847 results</p>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:bg-gray-50" disabled>Previous</button>
          <button className="px-3 py-1 bg-[var(--admin-primary)] text-white rounded-md text-sm font-medium">1</button>
          <button className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:bg-gray-50">2</button>
          <button className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:bg-gray-50">3</button>
          <span className="text-[var(--text-secondary)]">...</span>
          <button className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
}

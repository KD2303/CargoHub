"use client";

import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { CUSTOMERS } from "@/lib/mockData";
import { Search, Eye, Mail, Ban } from "lucide-react";

export default function CustomersPage() {
  const columns = [
    { key: "name", label: "Customer" },
    { key: "contact", label: "Phone/Email" },
    { key: "city", label: "City" },
    { key: "bookings", label: "Total Bookings" },
    { key: "spent", label: "Total Spent" },
    { key: "lastActive", label: "Last Active" },
    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <div className="flex items-center space-x-2">
          <button className="p-1.5 text-gray-400 hover:text-[var(--admin-primary)] hover:bg-[var(--admin-primary-light)] rounded-md transition-colors" title="View Details">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Email Customer">
            <Mail className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Block">
            <Ban className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader title="Customer Management" />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-[var(--text-secondary)]">Total Customers</p>
          <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">8,342</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm border-l-4 border-l-[var(--admin-primary-mid)]">
          <p className="text-sm font-medium text-[var(--text-secondary)]">Active This Month</p>
          <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">1,240</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm border-l-4 border-l-[var(--green-text)]">
          <p className="text-sm font-medium text-[var(--text-secondary)]">New This Week</p>
          <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">87</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--admin-primary-light)] outline-none"
          />
        </div>
        <div className="flex gap-4">
          <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--admin-primary-light)]">
            <option>All Cities</option>
            <option>Mumbai</option>
            <option>Delhi</option>
            <option>Bangalore</option>
          </select>
        </div>
      </div>

      <DataTable columns={columns} rows={CUSTOMERS} />
    </div>
  );
}

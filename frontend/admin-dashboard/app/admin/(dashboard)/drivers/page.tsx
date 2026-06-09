"use client";

import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { DRIVERS } from "@/lib/mockData";
import { Badge } from "@/components/ui/Badge";
import { Search, Filter, Eye, Ban, MessageSquare } from "lucide-react";

export default function DriversPage() {
  const columns = [
    { key: "name", label: "Driver" },
    { key: "phone", label: "Phone" },
    { key: "vehicle", label: "Vehicle Type" },
    { key: "plate", label: "Plate" },
    { 
      key: "status", 
      label: "Status",
      render: (row: any) => {
        let variant: any = "default";
        if (row.status === "Online") variant = "success";
        if (row.status === "Offline") variant = "default";
        if (row.status === "Suspended") variant = "error";
        if (row.status === "Pending KYC") variant = "warning";
        return <Badge label={row.status} variant={variant} />;
      }
    },
    { key: "rating", label: "Rating" },
    { key: "jobs", label: "Total Jobs" },
    { key: "joined", label: "Joined" },
    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <div className="flex items-center space-x-2">
          <button className="p-1.5 text-gray-400 hover:text-[var(--admin-primary)] hover:bg-[var(--admin-primary-light)] rounded-md transition-colors" title="View Profile">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Message Driver">
            <MessageSquare className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Suspend">
            <Ban className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader title="Driver Management" />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-[var(--text-secondary)]">Total Drivers</p>
          <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">312</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm border-l-4 border-l-[var(--green-text)]">
          <p className="text-sm font-medium text-[var(--text-secondary)]">Online Now</p>
          <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">89</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm border-l-4 border-l-[var(--amber-text)]">
          <p className="text-sm font-medium text-[var(--text-secondary)]">Pending KYC</p>
          <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">3</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm border-l-4 border-l-[var(--red-text)]">
          <p className="text-sm font-medium text-[var(--text-secondary)]">Suspended</p>
          <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">7</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--admin-primary-light)] outline-none"
          />
        </div>
        <div className="flex gap-4">
          <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--admin-primary-light)]">
            <option>All Statuses</option>
            <option>Online</option>
            <option>Offline</option>
            <option>Suspended</option>
            <option>Pending KYC</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-[var(--text-secondary)]">
            <Filter className="w-4 h-4 mr-2" /> More Filters
          </button>
        </div>
      </div>

      <DataTable columns={columns} rows={DRIVERS} />
    </div>
  );
}

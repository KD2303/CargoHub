"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Search, Eye, Mail, Ban, CheckCircle, Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/Badge";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const res = await fetchApi("/admin/customers");
      const json = await res.json();
      if (json.success) {
        const formatted = json.data.map((c: any) => ({
          rawId: c.id || c.firebaseUid,
          name: c.name || 'Unknown',
          contact: c.phone || c.email || '-',
          city: 'Unknown',
          bookings: c.totalBookings || 0,
          spent: `₹${c.spent || 0}`,
          lastActive: new Date(c.createdAt || Date.now()).toLocaleDateString(),
          status: c.isActive === false ? 'Blocked' : 'Active'
        }));
        setCustomers(formatted);
      } else {
        toast.error("Failed to load customers");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    // Reusing the same endpoint logic if we want to block users (currently we don't have a /users/:id/status endpoint, so we just mock the toast for now unless we add it to the backend)
    toast.success("This feature is coming soon!");
  };

  const columns = [
    { key: "name", label: "Customer" },
    { key: "contact", label: "Phone/Email" },
    { 
      key: "status", 
      label: "Status",
      render: (row: any) => (
        <Badge label={row.status} variant={row.status === 'Active' ? 'success' : 'error'} />
      )
    },
    { key: "bookings", label: "Total Bookings" },
    { key: "spent", label: "Total Spent" },
    { key: "lastActive", label: "Joined" },
    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleToggleStatus(row.rawId, row.status)}
            className={`p-1.5 rounded-md transition-colors ${row.status === 'Blocked' ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`} 
            title={row.status === 'Blocked' ? 'Unblock' : 'Block'}
          >
            {row.status === 'Blocked' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
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
          <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">{customers.length}</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm border-l-4 border-l-[var(--admin-primary-mid)]">
          <p className="text-sm font-medium text-[var(--text-secondary)]">Active</p>
          <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">{customers.filter(c => c.status === 'Active').length}</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm border-l-4 border-l-[var(--red-text)]">
          <p className="text-sm font-medium text-[var(--text-secondary)]">Blocked</p>
          <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">{customers.filter(c => c.status === 'Blocked').length}</p>
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
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <DataTable columns={columns} rows={customers} />
      )}
    </div>
  );
}

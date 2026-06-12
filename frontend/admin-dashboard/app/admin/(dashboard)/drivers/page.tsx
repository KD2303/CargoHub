"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Search, Filter, Eye, Ban, CheckCircle, Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = async () => {
    try {
      const res = await fetchApi("/admin/drivers");
      const json = await res.json();
      if (json.success) {
        const formatted = json.data.map((d: any) => ({
          rawId: d.id || d.firebaseUid,
          name: d.name || 'Unknown',
          phone: d.phone || '-',
          vehicle: d.vehicleType?.replace('_', ' ') || '-',
          plate: d.vehicleNumber || '-',
          status: !d.isActive ? 'Suspended' : (d.kycStatus === 'VERIFIED' ? (d.isAvailable ? 'Online' : 'Offline') : 'Pending KYC'),
          rating: d.rating?.toFixed(1) || '0.0',
          jobs: d.totalTrips || 0,
          joined: new Date(d.createdAt || Date.now()).toLocaleDateString()
        }));
        setDrivers(formatted);
      } else {
        toast.error("Failed to load drivers");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const isSuspending = currentStatus !== 'Suspended';
    if (!confirm(`Are you sure you want to ${isSuspending ? 'suspend' : 'reinstate'} this driver?`)) return;

    try {
      const res = await fetchApi(`/admin/drivers/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !isSuspending, reason: "Admin action" })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Driver ${isSuspending ? 'suspended' : 'reinstated'}`);
        fetchDrivers();
      } else {
        toast.error(json.error || "Action failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

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
          <button 
            onClick={() => handleToggleStatus(row.rawId, row.status)}
            className={`p-1.5 rounded-md transition-colors ${row.status === 'Suspended' ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`} 
            title={row.status === 'Suspended' ? 'Reinstate' : 'Suspend'}
          >
            {row.status === 'Suspended' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
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
          <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">{drivers.length}</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm border-l-4 border-l-[var(--green-text)]">
          <p className="text-sm font-medium text-[var(--text-secondary)]">Online Now</p>
          <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">{drivers.filter(d => d.status === 'Online').length}</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm border-l-4 border-l-[var(--amber-text)]">
          <p className="text-sm font-medium text-[var(--text-secondary)]">Pending KYC</p>
          <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">{drivers.filter(d => d.status === 'Pending KYC').length}</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm border-l-4 border-l-[var(--red-text)]">
          <p className="text-sm font-medium text-[var(--text-secondary)]">Suspended</p>
          <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">{drivers.filter(d => d.status === 'Suspended').length}</p>
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

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <DataTable columns={columns} rows={drivers} />
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { PROMO_CODES } from "@/lib/mockData";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, Edit2, Trash2, Tag } from "lucide-react";

export default function PromoCodesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    { key: "code", label: "Code", render: (row: any) => <span className="font-mono font-bold text-[var(--admin-primary)]">{row.code}</span> },
    { key: "discount", label: "Discount" },
    { key: "type", label: "Type" },
    { key: "minOrder", label: "Min Order" },
    { key: "usage", label: "Usage / Limit" },
    { 
      key: "status", 
      label: "Status",
      render: (row: any) => {
        let variant: any = "default";
        if (row.status === "Active") variant = "success";
        if (row.status === "Paused") variant = "warning";
        if (row.status === "Draft") variant = "default";
        return <Badge label={row.status} variant={variant} />;
      }
    },
    { key: "expiry", label: "Expiry" },
    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <div className="flex items-center space-x-2">
          <button className="p-1.5 text-gray-400 hover:text-[var(--admin-primary)] hover:bg-[var(--admin-primary-light)] rounded-md transition-colors" title="Edit">
            <Edit2 className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Promo Codes" 
        action={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-[var(--admin-primary)] text-white font-semibold rounded-lg text-sm hover:bg-[var(--admin-primary-mid)] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Code
          </button>
        }
      />

      <DataTable columns={columns} rows={PROMO_CODES} />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Promo Code"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Code Name</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="e.g., SUMMER50" className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary-light)] uppercase font-mono" />
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Discount Type</label>
              <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary-light)]">
                <option>Flat Amount (₹)</option>
                <option>Percentage (%)</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Value</label>
              <input type="number" placeholder="50" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary-light)]" />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Min Order (₹)</label>
              <input type="number" placeholder="200" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary-light)]" />
            </div>
            <div className="flex-1">
              <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Usage Limit</label>
              <input type="number" placeholder="500" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary-light)]" />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Expiry Date</label>
              <input type="date" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary-light)]" />
            </div>
            <div className="flex-1">
              <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Status</label>
              <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary-light)]">
                <option>Active</option>
                <option>Draft</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-white border border-gray-200 text-[var(--text-secondary)] rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-[var(--admin-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--admin-primary-mid)] transition-colors shadow-sm"
            >
              Create Promo Code
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

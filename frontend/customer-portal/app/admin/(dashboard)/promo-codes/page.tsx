"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { DataTable } from "@/components/admin/ui/DataTable";
import { Badge } from "@/components/admin/ui/Badge";
import { Modal } from "@/components/admin/ui/Modal";
import { Plus, Trash2, Tag, Loader2 } from "lucide-react";
import { adminFetch } from "@/lib/admin/api";
import { toast } from '@/store/toastStore';

export default function PromoCodesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    discountType: "Percentage (%)",
    discountAmount: "",
    expiryDate: ""
  });

  const loadPromos = async () => {
    try {
      const res = await adminFetch("/api/admin/promo-codes");
      setPromos(res.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const handleCreate = async () => {
    if (!formData.code || !formData.discountAmount || !formData.expiryDate) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      await adminFetch("/api/admin/promo-codes", {
        method: "POST",
        body: JSON.stringify({
          code: formData.code.toUpperCase(),
          discountType: formData.discountType.includes("%") ? "PERCENTAGE" : "FLAT",
          discountAmount: Number(formData.discountAmount),
          expiryDate: new Date(formData.expiryDate).toISOString()
        })
      });
      setIsModalOpen(false);
      setFormData({ code: "", discountType: "Percentage (%)", discountAmount: "", expiryDate: "" });
      loadPromos();
    } catch(err: any) {
      toast.error("Failed to create: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to delete this promo code?")) return;
    try {
      await adminFetch(`/api/admin/promo-codes/${id}`, { method: "DELETE" });
      loadPromos();
    } catch(err: any) {
      toast.error("Failed to delete: " + err.message);
    }
  };

  const columns = [
    { key: "code", label: "Code", render: (row: any) => <span className="font-mono font-bold text-[var(--admin-primary)]">{row.code}</span> },
    { key: "discount", label: "Discount", render: (row: any) => row.discountType === 'PERCENTAGE' ? `${row.discountAmount}%` : `₹${row.discountAmount}` },
    { 
      key: "status", 
      label: "Status",
      render: (row: any) => {
        const isExpired = new Date(row.expiryDate) < new Date();
        if (isExpired) return <Badge label="Expired" variant="error" />;
        return <Badge label={row.isActive ? "Active" : "Disabled"} variant={row.isActive ? "success" : "default"} />;
      }
    },
    { key: "expiry", label: "Expiry", render: (row: any) => new Date(row.expiryDate).toLocaleDateString() },
    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <div className="flex items-center space-x-2">
          <button onClick={() => handleDelete(row.id)} className="p-1.5 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Delete">
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

      {error && <div className="p-4 mb-6 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg">{error}</div>}

      {loading ? (
        <div className="p-8 text-center text-[var(--text-secondary)]">Loading promo codes...</div>
      ) : (
        <DataTable columns={columns} rows={promos} />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Promo Code"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Code Name</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input 
                type="text" 
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value})}
                placeholder="e.g., SUMMER50" 
                className="w-full pl-9 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] uppercase font-mono" 
              />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Discount Type</label>
              <select 
                value={formData.discountType}
                onChange={e => setFormData({...formData, discountType: e.target.value})}
                className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              >
                <option>Flat Amount (₹)</option>
                <option>Percentage (%)</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Value</label>
              <input 
                type="number" 
                value={formData.discountAmount}
                onChange={e => setFormData({...formData, discountAmount: e.target.value})}
                placeholder="50" 
                className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]" 
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Expiry Date</label>
              <input 
                type="date" 
                value={formData.expiryDate}
                onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]" 
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-subtle)] mt-6">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-lg text-sm font-semibold hover:bg-[var(--bg-secondary)] transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreate}
              disabled={submitting}
              className="px-5 py-2.5 bg-[var(--admin-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--admin-primary-mid)] transition-colors shadow-sm disabled:opacity-50 flex items-center"
            >
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {submitting ? "Creating..." : "Create Promo Code"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

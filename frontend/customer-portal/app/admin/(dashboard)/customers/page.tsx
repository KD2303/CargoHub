"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { DataTable } from "@/components/admin/ui/DataTable";
import { Search, Eye, Ban, Download, Trash2, CheckCircle2 } from "lucide-react";
import { adminFetch } from "@/lib/admin/api";
import { exportToCsv } from "@/lib/admin/exportToCsv";
import { toast } from '@/store/toastStore';

export default function CustomersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadUsers = async () => {
    try {
      const res = await adminFetch('/api/admin/users');
      setUsers(res.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleStatusChange = async (uid: string, isActive: boolean) => {
    if (isActive) {
      if (!confirm(`Are you sure you want to reinstate this user?`)) return;
      try {
        await adminFetch(`/api/admin/users/${uid}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ isActive, reason: 'Admin action via dashboard' })
        });
        toast.success("User reinstated");
        loadUsers();
      } catch(err: any) {
        toast.error("Failed to update status: " + err.message);
      }
    }
  };

  const handleSuspendSubmit = async () => {
    try {
      const reasonStr = `Suspended for ${suspendDays} days. Reason: ${suspendReason}`;
      await adminFetch(`/api/admin/users/${suspendTarget.firebaseUid}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: false, reason: reasonStr })
      });
      toast.success("User suspended successfully");
      setShowSuspendModal(false);
      setSuspendTarget(null);
      setSuspendReason("");
      loadUsers();
    } catch(err: any) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const handleDelete = async (uid: string) => {
    if (!confirm(`WARNING: Are you sure you want to PERMANENTLY delete this user?`)) return;
    try {
      await adminFetch(`/api/admin/users/${uid}`, { method: 'DELETE' });
      loadUsers();
    } catch(err: any) {
      toast.error("Failed to delete user: " + err.message);
    }
  };

  const handleExport = () => {
    exportToCsv('cargohub-customers', users, [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "role", label: "Role" },
      { key: "isActive", label: "Active Status" },
      { key: "createdAt", label: "Registered Date" },
    ]);
  };

  const columns = [
    { key: "name", label: "Customer" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "role", label: "Role" },
    { 
      key: "isActive", 
      label: "Status",
      render: (row: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {row.isActive ? 'Active' : 'Suspended'}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <div className="flex items-center space-x-2">
          {row.isActive ? (
            <button onClick={() => { setSuspendTarget(row); setShowSuspendModal(true); }} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors" title="Suspend User">
              <Ban className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => handleStatusChange(row.firebaseUid, true)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Reinstate User">
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => { setEditUser(row); setShowEditModal(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit User">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          </button>
          <button onClick={() => handleDelete(row.firebaseUid)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete User">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);

  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<any>(null);
  const [suspendDays, setSuspendDays] = useState(7);
  const [suspendReason, setSuspendReason] = useState("");

  const handleEditSubmit = async () => {
    try {
      await adminFetch(`/api/admin/users/${editUser.firebaseUid}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: editUser.name, phone: editUser.phone })
      });
      toast.success("User updated successfully");
      setShowEditModal(false);
      loadUsers();
    } catch(err: any) {
      toast.error("Failed to update: " + err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Customer Management" />
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--brand-primary)] outline-none"
          />
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--bg-primary)] p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Name</label>
                <input value={editUser.name} onChange={e => setEditUser({...editUser, name: e.target.value})} className="w-full border border-[var(--border-subtle)] rounded-lg px-3 py-2 bg-[var(--bg-secondary)]" />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Phone</label>
                <input value={editUser.phone} onChange={e => setEditUser({...editUser, phone: e.target.value})} className="w-full border border-[var(--border-subtle)] rounded-lg px-3 py-2 bg-[var(--bg-secondary)]" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-lg">Cancel</button>
                <button onClick={handleEditSubmit} className="px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-lg">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspend User Modal */}
      {showSuspendModal && suspendTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--bg-primary)] p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-500" />
              Suspend User
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-[var(--text-secondary)]">
                You are about to suspend <strong>{suspendTarget.name}</strong>. They will not be able to log in or book shipments.
              </p>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Suspend Duration (Days)</label>
                <input type="number" min="1" value={suspendDays} onChange={e => setSuspendDays(Number(e.target.value))} className="w-full border border-[var(--border-subtle)] rounded-lg px-3 py-2 bg-[var(--bg-secondary)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Reason (Visible to User)</label>
                <textarea rows={3} value={suspendReason} onChange={e => setSuspendReason(e.target.value)} placeholder="Violation of terms..." className="w-full border border-[var(--border-subtle)] rounded-lg px-3 py-2 bg-[var(--bg-secondary)] resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => { setShowSuspendModal(false); setSuspendTarget(null); }} className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-lg">Cancel</button>
                <button 
                  onClick={handleSuspendSubmit} 
                  disabled={suspendReason.trim() === ""}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Suspend User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-[var(--text-muted)]">Loading customers...</div>
      ) : (
        <DataTable columns={columns} rows={users.filter(u => 
          (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
          (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (u.phone || "").includes(searchQuery)
        )} />
      )}
    </div>
  );
}

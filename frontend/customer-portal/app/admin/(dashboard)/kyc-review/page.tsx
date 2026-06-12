"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Avatar } from "@/components/admin/ui/Avatar";
import { Modal } from "@/components/admin/ui/Modal";
import { Check, X, Eye, FileText, FileImage, Loader2 } from "lucide-react";

import { adminFetch } from "@/lib/admin/api";
import { toast } from '@/store/toastStore';

export default function KycReviewPage() {
  const [activeTab, setActiveTab] = useState("Pending");
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeDocTab, setActiveDocTab] = useState("Aadhaar");

  const tabs = ["All", "Pending", "Approved", "Rejected"];

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/api/admin/drivers");
      setDrivers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleDecision = async (id: string, decision: 'VERIFIED' | 'REJECTED') => {
    try {
      setActionLoading(id);
      const res = await adminFetch(`/api/admin/drivers/${id}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ decision, reason: "Admin review" })
      });
      if (res.success) {
        setDrivers(drivers.map(d => d.id === id || d.firebaseUid === id ? { ...d, kycStatus: decision } : d));
        if (selectedDoc) setSelectedDoc(null);
      } else {
        toast.error(res.error || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredDrivers = drivers.filter(d => {
    if (activeTab === "All") return true;
    if (activeTab === "Pending") return d.kycStatus === "UNSUBMITTED" || d.kycStatus === "PENDING";
    if (activeTab === "Approved") return d.kycStatus === "VERIFIED";
    if (activeTab === "Rejected") return d.kycStatus === "REJECTED";
    return true;
  });

  const pendingCount = drivers.filter(d => d.kycStatus === "UNSUBMITTED" || d.kycStatus === "PENDING").length;

  return (
    <div>
      <PageHeader title="KYC Review" subtitle={`${pendingCount} pending approvals require your attention`} />

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 mb-8 bg-[var(--bg-primary)] p-1.5 rounded-lg border border-[var(--border-subtle)] w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
      <div className="space-y-4">
        {filteredDrivers.map((driver) => (
          <div key={driver.id} className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border-subtle)] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[var(--admin-border)] transition-colors">
            
            <div className="flex items-center space-x-4">
              <Avatar initials={driver.name?.split(" ").map((n: string) => n[0]).join("")} className="w-12 h-12 text-lg" />
              <div>
                <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">{driver.name}</h3>
                <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{driver.phone} • Submitted {driver.submitted}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider ${
                    driver.kycStatus === 'VERIFIED' ? 'bg-[var(--green-bg)] text-[var(--green-text)]' : 
                    driver.kycStatus === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                    'bg-[var(--amber-bg)] text-[var(--amber-text)]'
                  }`}>
                    {driver.kycStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider w-24">Vehicle:</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{driver.vehicleType} • {driver.plate}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider w-24">Documents:</span>
                <div className="flex flex-wrap gap-2">
                  {["Aadhaar", "License", "RC", "Insurance"].map((doc) => (
                    <div key={doc} className="flex items-center bg-[var(--green-bg)] text-[var(--green-text)] px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">
                      {doc} <Check className="w-3 h-3 ml-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
              <button 
                onClick={() => setSelectedDoc(driver)}
                className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-[var(--admin-primary-light)] text-[var(--admin-primary)] rounded-lg text-sm font-semibold hover:bg-[var(--admin-primary-light)]/80 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" /> View Docs
              </button>
              {(driver.kycStatus === "UNSUBMITTED" || driver.kycStatus === "PENDING") && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => handleDecision(driver.id || driver.firebaseUid, 'REJECTED')}
                    disabled={actionLoading === (driver.id || driver.firebaseUid)}
                    className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 border border-red-200 text-red-600 dark:border-red-900/50 dark:text-red-400 rounded-lg text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4 mr-1.5" /> Reject
                  </button>
                  <button 
                    onClick={() => handleDecision(driver.id || driver.firebaseUid, 'VERIFIED')}
                    disabled={actionLoading === (driver.id || driver.firebaseUid)}
                    className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-[var(--admin-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--admin-primary-mid)] transition-colors shadow-sm disabled:opacity-50"
                  >
                    {actionLoading === (driver.id || driver.firebaseUid) ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />} Approve
                  </button>
                </div>
              )}
            </div>

          </div>
        ))}
        {filteredDrivers.length === 0 && (
          <div className="text-center py-12 text-[var(--text-secondary)]">No applications found in this category.</div>
        )}
      </div>
      )}

      {/* Document Preview Modal */}
      <Modal 
        isOpen={!!selectedDoc} 
        onClose={() => setSelectedDoc(null)} 
        title={`Document Verification — ${selectedDoc?.name}`}
      >
        <div className="flex border-b border-[var(--border-subtle)] mb-6 space-x-6">
          {["Aadhaar", "License", "RC", "Insurance"].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveDocTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 ${activeDocTab === tab ? 'border-[var(--admin-primary)] text-[var(--admin-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl aspect-[4/3] flex flex-col items-center justify-center text-[var(--text-secondary)] mb-6 overflow-hidden">
           <img 
             src={`https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/documents%2F${selectedDoc?.firebaseUid}%2F${activeDocTab.toLowerCase()}.jpg?alt=media&key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`} 
             alt={`${activeDocTab} Document`} 
             className="w-full h-full object-contain"
             onError={(e) => {
               (e.target as HTMLImageElement).src = `https://placehold.co/800x600/111111/FFFFFF/png?text=Document+Not+Uploaded%0A(Or+Invalid+Firebase+Key)`;
             }}
           />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <button 
            onClick={() => handleDecision(selectedDoc?.id || selectedDoc?.firebaseUid, 'REJECTED')}
            disabled={actionLoading === (selectedDoc?.id || selectedDoc?.firebaseUid)}
            className="px-5 py-2.5 border border-red-200 text-red-600 dark:border-red-900/50 dark:text-red-400 rounded-lg text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
          >
            Reject Application
          </button>
          <button 
            onClick={() => handleDecision(selectedDoc?.id || selectedDoc?.firebaseUid, 'VERIFIED')}
            disabled={actionLoading === (selectedDoc?.id || selectedDoc?.firebaseUid)}
            className="px-5 py-2.5 bg-[var(--admin-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--admin-primary-mid)] transition-colors shadow-sm disabled:opacity-50"
          >
            {actionLoading === (selectedDoc?.id || selectedDoc?.firebaseUid) ? "Processing..." : "Approve Application"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

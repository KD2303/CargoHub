"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { KYC_APPLICATIONS } from "@/lib/mockData";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { Check, X, Eye, FileText, FileImage } from "lucide-react";

export default function KycReviewPage() {
  const [activeTab, setActiveTab] = useState("Pending (3)");
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const tabs = ["All", "Pending (3)", "Approved", "Rejected"];

  return (
    <div>
      <PageHeader title="KYC Review" subtitle="3 pending approvals require your attention" />

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 mb-8 bg-white p-1.5 rounded-lg border border-gray-200 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Driver Cards */}
      <div className="space-y-4">
        {KYC_APPLICATIONS.map((driver) => (
          <div key={driver.id} className="bg-[var(--bg-surface)] p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[var(--admin-border)] transition-colors">
            
            <div className="flex items-center space-x-4">
              <Avatar initials={driver.name.split(" ").map(n => n[0]).join("")} className="w-12 h-12 text-lg" />
              <div>
                <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">{driver.name}</h3>
                <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{driver.phone} • Submitted {driver.submitted}</p>
                <div className="flex items-center mt-2">
                  <span className="text-[11px] font-bold uppercase bg-[var(--amber-bg)] text-[var(--amber-text)] px-2 py-0.5 rounded-full tracking-wider">
                    {driver.status}
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
                onClick={() => setSelectedDoc(driver.name)}
                className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-[var(--admin-primary-light)] text-[var(--admin-primary)] rounded-lg text-sm font-semibold hover:bg-[var(--admin-primary-light)]/80 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" /> View Docs
              </button>
              <div className="flex gap-2 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors">
                  <X className="w-4 h-4 mr-1.5" /> Reject
                </button>
                <button className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-[#0F6E56] text-white rounded-lg text-sm font-semibold hover:bg-[#0F6E56]/90 transition-colors shadow-sm">
                  <Check className="w-4 h-4 mr-1.5" /> Approve
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Document Preview Modal */}
      <Modal 
        isOpen={!!selectedDoc} 
        onClose={() => setSelectedDoc(null)} 
        title={`Document Verification — ${selectedDoc}`}
      >
        <div className="flex border-b border-gray-100 mb-6 space-x-6">
          {["Aadhaar", "License", "RC", "Insurance"].map((tab, i) => (
            <button 
              key={tab} 
              className={`pb-3 text-sm font-medium border-b-2 ${i === 0 ? 'border-[var(--admin-primary)] text-[var(--admin-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="bg-[#F9F9FC] border border-gray-200 rounded-xl aspect-[4/3] flex flex-col items-center justify-center text-[var(--text-secondary)] mb-6">
          <FileImage className="w-16 h-16 mb-4 opacity-20" />
          <p className="font-medium">Document Preview Placeholder</p>
          <p className="text-sm mt-1">Aadhaar Card Front & Back</p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button 
            onClick={() => setSelectedDoc(null)}
            className="px-5 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            Reject Application
          </button>
          <button 
            onClick={() => setSelectedDoc(null)}
            className="px-5 py-2.5 bg-[#0F6E56] text-white rounded-lg text-sm font-semibold hover:bg-[#0F6E56]/90 transition-colors shadow-sm"
          >
            Approve Application
          </button>
        </div>
      </Modal>
    </div>
  );
}

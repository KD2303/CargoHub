"use client";

import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Platform Settings" subtitle="Manage your dashboard preferences and system configuration." />
      
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">Settings Area</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-2">
          Configuration options will be available here.
        </p>
      </div>
    </div>
  );
}

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Toaster } from "react-hot-toast";
import { AuthGuard } from "@/components/AuthGuard";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--bg-base)] flex">
        <Sidebar />
        <div className="flex-1 ml-[220px] flex flex-col">
          <Topbar />
          <main className="flex-1 mt-16 p-8 overflow-auto">
            {children}
          </main>
          <Toaster position="top-right" />
        </div>
      </div>
    </AuthGuard>
  );
}

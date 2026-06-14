"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { PageTransition } from "./PageTransition";
import { useAdminLayoutStore } from "@/store/adminLayoutStore";
import { cn } from "@/lib/admin/utils";

export function AdminClientLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useAdminLayoutStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans relative">
      <Sidebar />
      <div 
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300 ease-in-out w-full",
          "pl-0", // mobile padding
          sidebarCollapsed ? "md:pl-[80px]" : "md:pl-[220px]"
        )}
      >
        <Topbar />
        <main className="flex-1 mt-16 p-6 lg:p-8 overflow-auto bg-[var(--bg-secondary)] w-full">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}

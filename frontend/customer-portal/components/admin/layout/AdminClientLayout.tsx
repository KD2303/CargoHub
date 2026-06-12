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
    <div className="min-h-screen bg-[var(--bg-primary)] flex font-sans">
      <Sidebar />
      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out min-w-0 w-full",
          "ml-0", // mobile margin
          sidebarCollapsed ? "md:ml-[80px]" : "md:ml-[220px]"
        )}
      >
        <Topbar />
        <main className="flex-1 mt-16 p-6 lg:p-8 overflow-auto bg-[var(--bg-secondary)]">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}

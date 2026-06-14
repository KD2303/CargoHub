"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import { useDashboardStore } from "@/store/dashboardStore";
import { useAuthStore } from "@/store/authStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarCollapsed } = useDashboardStore();
  const { isAuthenticated, loading, user } = useAuthStore();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh" style={{ background: "var(--bg-primary)" }}>
        <div className="w-10 h-10 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin shadow-glow"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh bg-grid relative overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" style={{ background: "var(--brand-primary)" }} />
        <div className="absolute bottom-[10%] left-[20%] w-[300px] h-[300px] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" style={{ background: "var(--brand-secondary)" }} />
      </div>

      {/* Persistent Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <motion.div 
        animate={{ paddingLeft: isSidebarCollapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex flex-col min-h-screen relative z-10"
      >
        <TopNav />
        
        {/* Page Content with AnimatePresence for layout transitions */}
        <div className="flex-1 p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[1400px] mx-auto w-full h-full"
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

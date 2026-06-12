"use client";

import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { Loader2, Briefcase, FileText, Settings, LogOut, Package } from "lucide-react";
import Link from "next/link";
import RouteGuardLogin from "@/components/auth/RouteGuardLogin";
import { toast } from '@/store/toastStore';

export default function B2BLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading, setUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isB2BAuthorized = isAuthenticated && user?.role === "USER" && user?.accountType === "B2B";

  const handleDemoLogin = (email: string, pass: string) => {
    if (email === "b2b@demo.com" && pass === "password") {
      setUser({
        id: "b2b-demo-123",
        firebaseUid: "b2b-demo-123",
        name: "Demo B2B User",
        email: "b2b@demo.com",
        phone: "+910000000000",
        role: "USER",
        accountType: "B2B",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      toast.error("Invalid credentials. Please use the demo credentials provided.");
    }
  };

  if (!isB2BAuthorized) {
    return (
      <RouteGuardLogin
        title="B2B Portal Access"
        subtitle="Please log in with your corporate account to manage fleet bookings and invoices."
        demoEmail="b2b@demo.com"
        demoPass="password"
        onLogin={handleDemoLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a192f] text-slate-300 flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Package className="w-6 h-6 text-blue-400 mr-2" />
          <span className="font-display font-bold text-lg text-white">CargoHub B2B</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/b2b-portal" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-500/10 text-blue-400 font-semibold">
            <Briefcase className="w-5 h-5" /> Bulk Bookings
          </Link>
          <Link href="/b2b-portal/invoices" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors">
            <FileText className="w-5 h-5" /> Invoices
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors">
            <Settings className="w-5 h-5" /> Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={() => {}} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-left hover:bg-white/5 hover:text-white transition-colors">
            <LogOut className="w-5 h-5 text-red-400" /> <span className="text-red-400">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

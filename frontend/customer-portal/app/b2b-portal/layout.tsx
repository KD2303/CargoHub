"use client";

import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { Loader2, Briefcase, FileText, Settings, LogOut, BarChart3, Users, Menu, Bell, User, X, Map, Code } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { toast } from '@/store/toastStore';
import { ThemeToggle } from "@/components/ThemeToggle";

export default function B2BLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading, setUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    // Auto-close sidebar on small screens
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  const isB2BAuthorized = isAuthenticated && user?.role === "USER" && user?.accountType === "B2B";

  useEffect(() => {
    if (mounted && !loading && !isB2BAuthorized) {
      if (!pathname.includes("/login") && !pathname.includes("/register")) {
        router.push("/b2b-portal/login");
      }
    }
  }, [mounted, loading, isB2BAuthorized, pathname, router]);

  if (loading || !mounted || (!isB2BAuthorized && !pathname.includes("/login") && !pathname.includes("/register"))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (pathname.includes("/login") || pathname.includes("/register")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex transition-colors overflow-hidden">
      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`bg-[var(--bg-secondary)] border-r border-[var(--border-outline)] flex flex-col fixed inset-y-0 left-0 z-50 transition-all duration-300 ${sidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'}`}>
        <div className={`h-16 flex items-center border-b border-[var(--border-outline)] ${sidebarOpen ? 'px-6 justify-between' : 'justify-center'}`}>
          <div className={`flex items-center ${sidebarOpen ? 'gap-3' : ''}`}>
            <div className="w-8 h-8 bg-[var(--bg-card)] rounded flex items-center justify-center p-1 shadow-sm shrink-0">
              <img src="/logo.png" alt="CargoHub Logo" className="w-full h-full object-contain" />
            </div>
            {sidebarOpen && (
              <span className="font-display font-bold text-lg text-[var(--text-primary)] tracking-tight whitespace-nowrap">
                CargoHub <span className="text-blue-600 dark:text-blue-500">B2B</span>
              </span>
            )}
          </div>
          {sidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] shrink-0">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link href="/b2b-portal" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${pathname === '/b2b-portal' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'} ${!sidebarOpen && 'justify-center'}`}>
            <Briefcase className="w-5 h-5 shrink-0" /> 
            {sidebarOpen && <span className="whitespace-nowrap">Bulk Bookings</span>}
          </Link>
          <Link href="/b2b-portal/fleet-tracking" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${pathname.includes('/fleet-tracking') ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'} ${!sidebarOpen && 'justify-center'}`}>
            <Map className="w-5 h-5 shrink-0" /> 
            {sidebarOpen && <span>Live Fleet Tracking</span>}
          </Link>
          <Link href="/b2b-portal/developer-hub" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${pathname.includes('/developer-hub') ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'} ${!sidebarOpen && 'justify-center'}`}>
            <Code className="w-5 h-5 shrink-0" /> 
            {sidebarOpen && <span>Developer API Hub</span>}
          </Link>
          <Link href="/b2b-portal/invoices" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${pathname.includes('/invoices') ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'} ${!sidebarOpen && 'justify-center'}`}>
            <FileText className="w-5 h-5 shrink-0" /> 
            {sidebarOpen && <span>Invoices</span>}
          </Link>
          <Link href="/b2b-portal/reports" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${pathname.includes('/reports') ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'} ${!sidebarOpen && 'justify-center'}`}>
            <BarChart3 className="w-5 h-5 shrink-0" /> 
            {sidebarOpen && <span>Reports & Analytics</span>}
          </Link>
          <Link href="/b2b-portal/team" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${pathname.includes('/team') ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'} ${!sidebarOpen && 'justify-center'}`}>
            <Users className="w-5 h-5 shrink-0" /> 
            {sidebarOpen && <span>Team Management</span>}
          </Link>
        </nav>

        {/* Bottom Actions (Settings, Logout) */}
        <div className="p-4 border-t border-[var(--border-outline)] space-y-2">
          <Link href="/b2b-portal/settings" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${pathname.includes('/settings') ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'} ${!sidebarOpen && 'justify-center'}`}>
            <Settings className="w-5 h-5 shrink-0" /> 
            {sidebarOpen && <span>Settings</span>}
          </Link>
          <button onClick={() => { setUser(null); router.push('/b2b-portal/login'); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-500 transition-colors ${!sidebarOpen && 'justify-center'}`}>
            <LogOut className="w-5 h-5 shrink-0" /> 
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20 ml-0'}`}>
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-[var(--border-outline)] bg-[var(--bg-primary)]/80 backdrop-blur sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-display font-semibold hidden sm:block text-[var(--text-primary)]">Dashboard</h2>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-[var(--bg-primary)]"></span>
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-[var(--bg-card)] border border-[var(--border-outline)] rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-[var(--border-outline)] flex justify-between items-center mb-2">
                      <h3 className="font-bold text-[var(--text-primary)]">Notifications</h3>
                      <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full font-semibold">1 New</span>
                    </div>
                    <div className="px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer border-l-2 border-orange-500 bg-[var(--bg-secondary)]/50">
                      <p className="text-sm text-[var(--text-primary)] font-semibold">Welcome to CargoHub B2B</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">Your corporate account is fully active and ready to use.</p>
                      <p className="text-xs text-orange-500 mt-2 font-medium">Just now</p>
                    </div>
                    <div className="px-4 py-2 border-t border-[var(--border-outline)] mt-2 text-center">
                      <button onClick={() => setNotificationsOpen(false)} className="text-sm text-[var(--text-secondary)] font-semibold hover:text-orange-500 transition-colors">Mark all as read</button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 pl-2 pr-3 bg-[var(--bg-tertiary)] hover:bg-[var(--border-outline)] border border-[var(--border-outline)] rounded-full transition-colors"
              >
                <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="text-sm font-medium hidden md:block text-[var(--text-primary)]">{user?.name || 'User'}</span>
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-outline)] rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-[var(--border-outline)] mb-1">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{user?.name || 'User'}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
                    </div>
                    <Link href="/b2b-portal/settings?tab=profile" onClick={() => setProfileOpen(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]">
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <button 
                      onClick={() => { setUser(null); router.push('/b2b-portal/login'); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors mt-1 border-t border-[var(--border-outline)] pt-2"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

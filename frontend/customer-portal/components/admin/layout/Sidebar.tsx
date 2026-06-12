"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/admin/utils";
import { Avatar } from "../ui/Avatar";
import {
  LayoutDashboard,
  ShieldCheck,
  Truck,
  Users,
  Package,
  BarChart3,
  Bell,
  Tag,
  Settings,
  LogOut,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: any;
  badge?: number;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "KYC Review", href: "/admin/kyc-review", icon: ShieldCheck },
  { label: "Drivers", href: "/admin/drivers", icon: Truck },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Bookings", href: "/admin/bookings", icon: Package },
  { label: "Revenue", href: "/admin/revenue", icon: BarChart3 },
  { label: "Broadcasts", href: "/admin/broadcasts", icon: Bell },
  { label: "Promo Codes", href: "/admin/promo-codes", icon: Tag },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
// ... imports

import { useAdminLayoutStore } from "@/store/adminLayoutStore";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { adminUser, logoutAdmin } = useAuthStore();
  const { sidebarCollapsed, mobileOpen, closeMobile, toggleSidebar } = useAdminLayoutStore();

  const handleLogout = () => {
    logoutAdmin();
    router.push('/admin/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity" 
          onClick={closeMobile}
        />
      )}
      
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 bg-[var(--bg-primary)] border-r border-[var(--border-subtle)] flex flex-col z-50 transition-all duration-300 ease-in-out shadow-sm",
          sidebarCollapsed ? "md:w-[80px]" : "md:w-[220px]",
          "w-[260px]", // fixed width on mobile
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-[var(--border-subtle)] shrink-0 relative px-4">
        <Image src="/logo.png" alt="CargoHub Logo" width={24} height={24} className="shrink-0 w-auto h-auto" priority />
        {!sidebarCollapsed && (
          <div className="flex items-center overflow-hidden whitespace-nowrap ml-2">
            <span className="font-bold text-lg tracking-tight text-[var(--text-primary)]">CargoHub</span>
            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-[var(--brand-primary)] text-white">
              Admin
            </span>
          </div>
        )}
        
        {/* Mobile Close Button */}
        <button 
          onClick={closeMobile}
          className="md:hidden absolute right-3 p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobile}
              title={sidebarCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors relative group",
                isActive
                  ? "bg-[var(--brand-primary)] text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]",
                sidebarCollapsed && "justify-center px-0"
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0", !sidebarCollapsed && "mr-3")} />
              
              {!sidebarCollapsed && (
                <span className="flex-1 whitespace-nowrap">{item.label}</span>
              )}

              {!sidebarCollapsed && item.badge && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-auto">
                  {item.badge}
                </span>
              )}
              
              {/* Tooltip for collapsed state */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-[var(--border-subtle)] shrink-0">
        <div className={cn("flex items-center mb-4", sidebarCollapsed && "justify-center")}>
          <Avatar initials={adminUser?.name?.substring(0,2).toUpperCase() || "AD"} className="w-9 h-9 shrink-0 text-white bg-[var(--brand-primary)]" />
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0 ml-3">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{adminUser?.name || "Admin User"}</p>
              <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide">Super Admin</p>
            </div>
          )}
        </div>
        <button 
          onClick={handleLogout}
          className={cn(
            "flex items-center py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors",
            sidebarCollapsed ? "justify-center w-full" : "px-3 w-full"
          )}
          title={sidebarCollapsed ? "Logout" : undefined}
        >
          <LogOut className={cn("w-4 h-4 shrink-0", !sidebarCollapsed && "md:mr-2", "mr-2")} />
          <span className={cn(sidebarCollapsed && "md:hidden")}>Logout</span>
        </button>
      </div>
    </aside>
    </>
  );
}

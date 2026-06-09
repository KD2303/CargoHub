"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "KYC Review", href: "/admin/kyc-review", icon: ShieldCheck, badge: 3 },
  { label: "Drivers", href: "/admin/drivers", icon: Truck },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Bookings", href: "/admin/bookings", icon: Package },
  { label: "Revenue", href: "/admin/revenue", icon: BarChart3 },
  { label: "Broadcasts", href: "/admin/broadcasts", icon: Bell },
  { label: "Promo Codes", href: "/admin/promo-codes", icon: Tag },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-[220px] bg-[var(--admin-primary)] text-white flex flex-col z-20">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
        <Package className="w-6 h-6 text-[var(--admin-primary-light)] mr-2" />
        <span className="font-bold text-lg tracking-tight">CargoHub</span>
        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-[var(--admin-primary-light)] text-[var(--admin-primary)]">
          Admin
        </span>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/12 text-white border-l-[3px] border-white pl-[9px]"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center">
                <Icon className={cn("w-5 h-5 mr-3", isActive ? "text-white" : "text-white/60")} />
                {item.label}
              </div>
              {item.badge && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <div className="flex items-center mb-4">
          <Avatar initials="SB" className="w-9 h-9 border-white/20 mr-3 text-[var(--admin-primary)] bg-[var(--admin-primary-light)]" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Sumit Bhadoria</p>
            <p className="text-[11px] text-white/60 uppercase tracking-wide">Super Admin</p>
          </div>
        </div>
        <Link 
          href="/admin"
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Link>
      </div>
    </aside>
  );
}

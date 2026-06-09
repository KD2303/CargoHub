"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { Avatar } from "../ui/Avatar";

const formatPathName = (pathname: string) => {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 2) return "Dashboard";
  const lastPart = parts[parts.length - 1];
  return lastPart
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function Topbar() {
  const pathname = usePathname();
  const title = formatPathName(pathname);

  return (
    <header className="fixed top-0 right-0 left-[220px] h-16 bg-[var(--bg-surface)] border-b border-gray-200 z-10 flex items-center justify-between px-8">
      {/* Page Title */}
      <h1 className="text-[18px] font-semibold text-[var(--text-primary)]">
        {title}
      </h1>

      <div className="flex items-center space-x-6">
        {/* Search */}
        <div className="relative w-64 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-secondary)] border-transparent focus:bg-white focus:border-[var(--admin-border)] focus:ring-1 focus:ring-[var(--admin-primary-mid)] rounded-md text-sm outline-none transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User Avatar */}
        <Avatar initials="SB" className="w-8 h-8 text-[var(--admin-primary)] bg-[var(--admin-primary-light)] border-transparent" />
      </div>
    </header>
  );
}

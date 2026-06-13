"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Bell, Search, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { NotificationPopover } from "../NotificationPopover";
import { useLanguageStore } from "@/store/languageStore";
import GlobalSearch from "./GlobalSearch";

export default function TopNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { t } = useLanguageStore();
  
  // Create breadcrumb from pathname
  const paths = pathname.split('/').filter(Boolean);
  const currentPath = paths[paths.length - 1] || 'overview';
  const title = t(currentPath);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Global hotkey to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="sticky top-0 z-40 w-full glass" style={{ borderBottom: "1px solid var(--border-subtle)", borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0 }}>
      <div className="h-16 px-6 flex items-center justify-between">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>{t('dashboard')}</span>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>/</span>
          <motion.span 
            key={title}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-bold" 
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </motion.span>
        </div>

        {/* Center */}
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full">
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <div 
            className="relative hidden md:block cursor-text"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
            <div 
              className="pl-9 pr-4 py-2 text-sm rounded-full flex items-center justify-between w-48 transition-all hover:bg-gray-50 dark:hover:bg-gray-800"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}
            >
              <span>Search...</span>
              <kbd className="hidden sm:inline-block text-[10px] font-sans px-1.5 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)]">
                ⌘K
              </kbd>
            </div>
          </div>
          
          {mounted && (
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100 dark:hover:bg-gray-800" 
              style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-primary)" }}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
              ) : (
                <Moon className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
              )}
            </button>
          )}

          <NotificationPopover />
        </div>

      </div>

      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

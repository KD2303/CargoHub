"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  LayoutDashboard, PackagePlus, MapPin, ClipboardList, 
  Wallet, Star, HeadphonesIcon, Settings, LogOut, ChevronLeft, ChevronRight
} from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import { useAuthStore } from "@/store/authStore";
import { useBookingStore } from "@/store/bookingStore";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", route: "/dashboard" },
  { icon: PackagePlus, label: "New Booking", route: "/dashboard/book" },
  { icon: MapPin, label: "Track Shipment", route: "/dashboard/track" },
  { icon: ClipboardList, label: "My Orders", route: "/dashboard/orders" },
  { icon: Wallet, label: "Payments", route: "/dashboard/payments" },
  { icon: Star, label: "Saved Addresses", route: "/dashboard/addresses" },
  { icon: HeadphonesIcon, label: "Support", route: "/dashboard/support" },
  { icon: Settings, label: "Settings", route: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar, stats } = useDashboardStore();
  const { user } = useAuthStore();
  const resetBooking = useBookingStore(state => state.resetBooking);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const handleLogout = async () => {
    try {
      const { auth } = await import('@/lib/firebase');
      await auth.signOut();
      window.location.href = '/';
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.aside 
      animate={{ width: isSidebarCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen glass z-50 flex flex-col" 
      style={{ 
        background: "var(--bg-primary)",
        borderRight: "1px solid var(--border-subtle)" 
      }}
    >
      {/* Collapse Toggle */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 bg-white dark:bg-gray-800 border shadow-sm rounded-full w-6 h-6 flex items-center justify-center z-50 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
        style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
      >
        {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Logo Area */}
      <div className={`h-20 flex items-center border-b ${isSidebarCollapsed ? "justify-center px-0" : "px-6"}`} style={{ borderColor: "var(--border-subtle)" }}>
        <Link href="/">
          <motion.div 
            className="flex items-center gap-3 cursor-pointer"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Image
            src="/logo.png"
            alt="CargoHub Logo"
            width={48}
            height={48}
            className="object-contain flex-shrink-0"
          />
          {!isSidebarCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="font-display text-xl font-bold tracking-tight whitespace-nowrap" 
              style={{ color: "var(--text-primary)" }}
            >
              CargoHub
            </motion.span>
          )}
        </motion.div>
        </Link>
      </div>

      {/* Nav Links */}
      <div className={`flex-1 overflow-y-auto py-6 flex flex-col gap-2 ${isSidebarCollapsed ? "px-2" : "px-4"}`}>
        {navItems.map((item) => {
          const isActive = pathname === item.route || pathname.startsWith(item.route + "/");
          return (
            <Link key={item.route} href={item.route} onClick={() => {
              if (item.label === "New Booking") {
                resetBooking();
              }
            }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center transition-all relative overflow-hidden ${isSidebarCollapsed ? "justify-center w-12 h-12 mx-auto rounded-xl" : "gap-3 px-4 py-3 rounded-xl"}`}
                style={{
                  background: isActive ? "rgba(2, 89, 221, 0.08)" : "transparent",
                  color: isActive ? "var(--brand-primary)" : "var(--text-secondary)",
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNavIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ background: "var(--brand-secondary)" }}
                  />
                )}
                <item.icon className="w-5 h-5 flex-shrink-0" style={{ color: isActive ? "var(--brand-primary)" : "var(--text-muted)" }} />
                {!isSidebarCollapsed && (
                  <span className="text-sm whitespace-nowrap">{item.label}</span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Stats / User */}
      <div className={`p-4 border-t ${isSidebarCollapsed ? "flex flex-col items-center" : ""}`} style={{ borderColor: "var(--border-subtle)" }}>
        {!isSidebarCollapsed && (
          <div className="mb-4 p-3 rounded-xl" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Wallet</span>
              <span className="text-xs font-bold" style={{ color: "var(--brand-primary)" }}>₹0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Active</span>
              <span className="text-xs font-bold flex items-center gap-1" style={{ color: "var(--brand-secondary)" }}>
                {stats?.activeShipments || 0} bookings
              </span>
            </div>
          </div>
        )}

        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)} 
            className={`flex items-center transition-colors hover:bg-[var(--bg-secondary)] ${isSidebarCollapsed ? "justify-center w-10 h-10 rounded-full" : "gap-3 px-4 py-2 w-full text-left rounded-xl"} ${showProfileMenu ? "bg-[var(--bg-secondary)]" : ""}`} 
            style={{ color: "var(--text-secondary)" }}
          >
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profile" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-xs flex-shrink-0" style={{ color: "var(--brand-primary)" }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            {!isSidebarCollapsed && (
              <>
                <div className="flex-1 whitespace-nowrap overflow-hidden">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{user?.name || "Loading..."}</p>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{user?.role === 'DRIVER' ? 'Driver' : 'Customer'}</p>
                </div>
                {/* Optional indicator could go here */}
              </>
            )}
          </button>
          
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`absolute bottom-full mb-2 bg-[var(--bg-primary)] border shadow-lg rounded-xl overflow-hidden ${isSidebarCollapsed ? "left-0 w-48" : "left-0 w-full"}`}
                style={{ borderColor: "var(--border-subtle)", zIndex: 100 }}
              >
                <Link 
                  href="/dashboard/settings" 
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-primary)]"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium">View Profile</span>
                </Link>
                <div className="h-px w-full" style={{ background: "var(--border-subtle)" }} />
                <button 
                  onClick={() => {
                    setShowProfileMenu(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-red-500 transition-colors w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}

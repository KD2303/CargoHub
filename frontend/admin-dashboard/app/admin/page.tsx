import React from "react";
import Link from "next/link";
import { Package } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background grid pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--admin-primary) 1px, transparent 1px), linear-gradient(90deg, var(--admin-primary) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="relative z-10 w-full max-w-[420px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-10 overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[var(--admin-primary-mid)]" />
        
        <div className="flex flex-col items-center mb-10 mt-2">
          <div className="w-14 h-14 bg-[var(--admin-primary-light)] rounded-xl flex items-center justify-center mb-5 text-[var(--admin-primary)] shadow-sm">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">CargoHub</h1>
          <p className="text-sm font-medium text-[var(--admin-primary-mid)] mt-1 tracking-wide uppercase">
            Admin Panel
          </p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">
              Email Address
            </label>
            <input 
              type="email" 
              placeholder="admin@cargohub.com"
              className="w-full px-4 py-2.5 bg-[#F9F9FC] border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary-light)] focus:border-[var(--admin-primary-mid)] transition-all"
              suppressHydrationWarning
            />
          </div>
          
          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                Password
              </label>
            </div>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-[#F9F9FC] border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary-light)] focus:border-[var(--admin-primary-mid)] transition-all"
              suppressHydrationWarning
            />
          </div>

          <Link 
            href="/admin/dashboard" 
            className="w-full flex items-center justify-center py-2.5 bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-mid)] text-white text-sm font-semibold rounded-lg transition-colors mt-8 shadow-sm"
          >
            Sign in to Dashboard
          </Link>
        </form>

        <p className="text-center text-xs text-[var(--text-secondary)] mt-8 font-medium">
          Protected access — Admin only
        </p>
      </div>
    </div>
  );
}

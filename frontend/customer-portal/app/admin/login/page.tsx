"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail, Lock, ArrowRight, LayoutDashboard,
  Users, BarChart3, Settings, ChevronLeft, Eye, EyeOff
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "../../../components/ThemeToggle";

import { useAuthStore } from "../../../store/authStore";
import { toast } from '@/store/toastStore';

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const setAdminLogin = useAuthStore((state) => state.setAdminLogin);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch((`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`) + '/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (data.success) {
        setAdminLogin(data.token, data.user);
        window.location.href = "/admin/dashboard";
      } else {
        toast.error("Login failed: " + data.message);
        setLoading(false);
      }
    } catch (err: any) {
      toast.error("Login failed: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)] font-sans relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top Navigation */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-50">
        <Link href="/" className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-2 transition-colors">
          <ChevronLeft className="w-4 h-4"/> Back to Home
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-center min-h-screen pt-12">
        {/* Left panel */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 lg:p-12 relative z-10">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: "color-mix(in srgb, var(--brand-primary) 10%, transparent)" }} />
            
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight text-[var(--text-primary)]">
                CargoHub <br/>
                <span style={{ color: "var(--brand-primary)" }}>Administration.</span>
            </h1>

            <p className="text-base text-[var(--text-secondary)] mb-8 max-w-lg leading-relaxed">
                Centralized control for your logistics operations. Monitor bookings, review driver KYC applications, and manage platform settings all in one secure place.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Feature 1 */}
                <div className="p-5 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-tertiary)] transition-colors hover:border-[var(--brand-primary)]">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: "color-mix(in srgb, var(--brand-primary) 10%, transparent)", color: "var(--brand-primary)" }}>
                        <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Live Dashboard</h3>
                    <p className="text-xs text-[var(--text-muted)]">Real-time overview of active bookings and platform revenue.</p>
                </div>
                {/* Feature 2 */}
                <div className="p-5 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-tertiary)] transition-colors hover:border-[var(--brand-primary)]">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: "color-mix(in srgb, var(--brand-primary) 10%, transparent)", color: "var(--brand-primary)" }}>
                        <Users className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Driver Management</h3>
                    <p className="text-xs text-[var(--text-muted)]">Review KYC documents, approve new drivers, and manage suspensions.</p>
                </div>
                {/* Feature 3 */}
                <div className="p-5 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-tertiary)] transition-colors hover:border-[var(--brand-primary)]">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: "color-mix(in srgb, var(--brand-primary) 10%, transparent)", color: "var(--brand-primary)" }}>
                        <BarChart3 className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Advanced Analytics</h3>
                    <p className="text-xs text-[var(--text-muted)]">Track booking trends, revenue metrics, and regional performance.</p>
                </div>
                {/* Feature 4 */}
                <div className="p-5 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-tertiary)] transition-colors hover:border-[var(--brand-primary)]">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: "color-mix(in srgb, var(--brand-primary) 10%, transparent)", color: "var(--brand-primary)" }}>
                        <Settings className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">System Settings</h3>
                    <p className="text-xs text-[var(--text-muted)]">Configure fare matrices, promo codes, and platform broadcasts.</p>
                </div>
            </div>
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
            <motion.div 
                className="w-full max-w-[400px] p-6 lg:p-8 rounded-3xl border border-[var(--border-outline)] bg-[var(--bg-secondary)] shadow-2xl relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Top accent line removed to match customer login, or changed to brand-primary */}

                <div className="flex flex-col items-center mb-6 text-center mt-2">
                    <div className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-5 border border-[var(--border-outline)] bg-[var(--bg-primary)] shadow-sm">
                        <LayoutDashboard className="w-10 h-10" style={{ color: "var(--brand-primary)" }} />
                    </div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight mb-1">Admin Portal</h2>
                    <p className="text-[var(--text-muted)] text-sm">Protected access — Authorized personnel only.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                                <Mail className="w-4 h-4" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@cargohub.com"
                                className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] dark:bg-transparent border border-[var(--border-input)] rounded-xl focus:outline-none transition-colors text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--brand-primary)]"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-10 py-2.5 bg-[var(--bg-primary)] dark:bg-transparent border border-[var(--border-input)] rounded-xl focus:outline-none transition-colors text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--brand-primary)]"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!email || !password || loading}
                        className="w-full py-3 mt-4 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-white hover:opacity-90 shadow-md text-sm"
                        style={{ backgroundColor: "var(--brand-primary)" }}
                    >
                        {loading ? "Authenticating..." : "Sign in to Dashboard"} <ArrowRight className="w-4 h-4" />
                    </button>
                </form>
            </motion.div>
        </div>
      </div>
    </div>
  );
}

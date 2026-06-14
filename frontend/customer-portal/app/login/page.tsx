"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Mail, Lock, ArrowRight, Truck,
  Shield, Zap, ChevronLeft, Eye, EyeOff
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "../../components/ThemeToggle";
// @ts-ignore - TS module resolution bug with Firebase 11+
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth as firebaseAuth, googleProvider } from "../../lib/firebase";

export default function LoginPage() {
  const [mode, setMode] = useState<"user" | "driver">("user");

  // Clear any existing admin session when accessing user/driver login
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
    }
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      
      const redirectParams = new URLSearchParams(window.location.search);
      const redirectUrl = redirectParams.get("redirect") || (mode === "user" ? "/dashboard" : "/driver");
      window.location.href = redirectUrl;
    } catch (err: any) {
      toast.error("Login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      // We optionally try to register the user in case this is their first time logging in
      const idToken = await result.user.getIdToken();
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, '');
      await fetch(`${baseUrl}/api/auth/${mode === 'user' ? 'register-user' : 'register-driver'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          name: result.user.displayName || 'Unknown User',
          email: result.user.email,
          phone: result.user.phoneNumber || '+910000000000'
        })
      });
      const redirectParams = new URLSearchParams(window.location.search);
      const redirectUrl = redirectParams.get("redirect") || (mode === "user" ? "/dashboard" : "/driver");
      window.location.href = redirectUrl;
    } catch (err: any) {
      toast.error("Google login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)] font-sans relative overflow-hidden">
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
                Cargo Logistics, <br/>
                <span style={{ color: "var(--brand-primary)" }}>Reimagined.</span>
            </h1>

            <p className="text-base text-[var(--text-secondary)] mb-8 max-w-lg leading-relaxed">
                Experience seamless freight management. Book shipments, track deliveries in real-time, and manage your supply chain efficiently with our all-in-one logistics platform.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Feature 1 */}
                <div className="relative p-5 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-glass)] dark:bg-white/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--bg-card)] dark:hover:bg-white/10 hover:border-[var(--brand-primary)] hover:shadow-xl hover:shadow-[var(--brand-primary)]/10 overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-[var(--brand-primary)]/5 group-hover:to-transparent transition-all duration-500 opacity-0 group-hover:opacity-100" />
                    <div className="relative z-10">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: "color-mix(in srgb, var(--brand-primary) 10%, transparent)", color: "var(--brand-primary)" }}>
                            <Zap className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Smart Route Optimization</h3>
                        <p className="text-xs text-[var(--text-muted)]">AI-powered routing to ensure fastest delivery times and lower fuel costs.</p>
                    </div>
                </div>
                {/* Feature 2 */}
                <div className="relative p-5 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-glass)] dark:bg-white/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--bg-card)] dark:hover:bg-white/10 hover:border-[var(--brand-primary)] hover:shadow-xl hover:shadow-[var(--brand-primary)]/10 overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-[var(--brand-primary)]/5 group-hover:to-transparent transition-all duration-500 opacity-0 group-hover:opacity-100" />
                    <div className="relative z-10">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: "color-mix(in srgb, var(--brand-primary) 10%, transparent)", color: "var(--brand-primary)" }}>
                            <Truck className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Live GPS Tracking</h3>
                        <p className="text-xs text-[var(--text-muted)]">Monitor your shipments in real-time with updates every 3 seconds.</p>
                    </div>
                </div>
                {/* Feature 3 */}
                <div className="relative p-5 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-glass)] dark:bg-white/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--bg-card)] dark:hover:bg-white/10 hover:border-[var(--brand-primary)] hover:shadow-xl hover:shadow-[var(--brand-primary)]/10 overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-[var(--brand-primary)]/5 group-hover:to-transparent transition-all duration-500 opacity-0 group-hover:opacity-100" />
                    <div className="relative z-10">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: "color-mix(in srgb, var(--brand-primary) 10%, transparent)", color: "var(--brand-primary)" }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Instant Fleet Matching</h3>
                        <p className="text-xs text-[var(--text-muted)]">Map your shipments to available verified drivers instantly.</p>
                    </div>
                </div>
                {/* Feature 4 */}
                <div className="relative p-5 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-glass)] dark:bg-white/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--bg-card)] dark:hover:bg-white/10 hover:border-[var(--brand-primary)] hover:shadow-xl hover:shadow-[var(--brand-primary)]/10 overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-[var(--brand-primary)]/5 group-hover:to-transparent transition-all duration-500 opacity-0 group-hover:opacity-100" />
                    <div className="relative z-10">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: "color-mix(in srgb, var(--brand-primary) 10%, transparent)", color: "var(--brand-primary)" }}>
                            <Shield className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Secure & Verified</h3>
                        <p className="text-xs text-[var(--text-muted)]">Every driver is KYC-verified. Goods are insured and secured.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
            <motion.div 
                className="w-full max-w-[400px] p-6 lg:p-8 rounded-3xl border border-[var(--border-outline)] bg-[var(--bg-secondary)] shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex flex-col items-center mb-6 text-center">
                    <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center mb-5 overflow-hidden border border-[var(--border-outline)] bg-[var(--bg-primary)] p-4 shadow-sm">
                        <img src="/logo.png" alt="CargoHub Logo" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Welcome Back</h2>
                    <p className="text-[var(--text-muted)] text-sm">Sign in to access your dashboard.</p>
                </div>

                <div className="flex p-1 mb-5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-outline)]">
                    <button
                        onClick={() => setMode("user")}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "user" ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm border border-[var(--border-outline)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                    >
                        Customer
                    </button>
                    <button
                        onClick={() => setMode("driver")}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "driver" ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm border border-[var(--border-outline)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                    >
                        Driver
                    </button>
                </div>

                <button 
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-[var(--bg-primary)] border border-[var(--border-outline)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium rounded-xl transition-colors flex items-center justify-center gap-2 mb-5"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Continue with Google
                </button>

                <div className="flex items-center gap-4 mb-5">
                    <div className="flex-1 border-t border-[var(--border-subtle)]" />
                    <span className="text-xs text-[var(--text-muted)] font-medium">OR EMAIL</span>
                    <div className="flex-1 border-t border-[var(--border-subtle)]" />
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                                <Mail className="w-4 h-4" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@cargohub.com"
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
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-[10px] text-[var(--text-muted)] opacity-70">Min. 6 characters</span>
                            <Link href="#" className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] underline decoration-[var(--border-subtle)] underline-offset-2">Forgot Password?</Link>
                        </div>
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={!email || !password || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || loading}
                        className="w-full py-3 mt-1 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-white hover:opacity-90 shadow-md text-sm"
                        style={{ backgroundColor: "var(--brand-primary)" }}
                    >
                        {loading ? "Signing in..." : "Sign In"} <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-center text-xs text-[var(--text-muted)] mt-5">
                    Don't have an account? <Link href="/register" className="font-semibold hover:underline" style={{ color: "var(--brand-primary)" }}>Create Account</Link>
                </p>
            </motion.div>
        </div>
      </div>
    </div>
  );
}

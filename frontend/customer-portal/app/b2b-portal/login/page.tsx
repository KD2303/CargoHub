"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Mail, Lock, ArrowRight, Briefcase,
  TrendingUp, BarChart3, ChevronLeft, Eye, EyeOff, Package
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
// @ts-ignore
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth as firebaseAuth, googleProvider } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";

export default function B2BLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (val: string) => {
    if (!val) {
      setEmailError("");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (emailError) validateEmail(val);
  };

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      toast.error("Please provide a valid email.");
      return;
    }
    if (!password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const idToken = await result.user.getIdToken();
      
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, '');
      await fetch(`${baseUrl}/api/auth/register-b2b`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          name: result.user.displayName || email.split('@')[0],
          email: result.user.email || email,
          phone: result.user.phoneNumber || '+910000000000'
        })
      });

      window.location.href = "/b2b-portal";
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
      const idToken = await result.user.getIdToken();
      // Call our new B2B registration endpoint just in case it's a first time login
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, '');
      await fetch(`${baseUrl}/api/auth/register-b2b`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          name: result.user.displayName || 'B2B User',
          email: result.user.email,
          phone: result.user.phoneNumber || '+910000000000'
        })
      });
      window.location.href = "/b2b-portal";
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
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 lg:p-12 relative z-10 text-[var(--text-primary)]">
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">
                CargoHub <br/>
                <span className="text-orange-500">Business Portal.</span>
            </h1>

            <p className="text-base text-[var(--text-secondary)] mb-8 max-w-lg leading-relaxed">
                Scale your enterprise logistics. Manage bulk bookings, analyze shipping expenses, and empower your team with our premium B2B logistics solution.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Feature 1 */}
                <div className="relative p-5 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-glass)] dark:bg-white/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--bg-card)] dark:hover:bg-white/10 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden group">
                    <div className="relative z-10">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 bg-blue-500/20 text-blue-500 dark:text-blue-400">
                            <Package className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Bulk Shipments</h3>
                        <p className="text-xs text-[var(--text-muted)]">Upload CSVs to create 100s of bookings instantly.</p>
                    </div>
                </div>
                {/* Feature 2 */}
                <div className="relative p-5 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-glass)] dark:bg-white/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--bg-card)] dark:hover:bg-white/10 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 overflow-hidden group">
                    <div className="relative z-10">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 bg-orange-500/20 text-orange-500 dark:text-orange-400">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Spend Analytics</h3>
                        <p className="text-xs text-[var(--text-muted)]">Track and visualize your logistics expenses in real-time.</p>
                    </div>
                </div>
                {/* Feature 3 */}
                <div className="relative p-5 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-glass)] dark:bg-white/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--bg-card)] dark:hover:bg-white/10 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden group">
                    <div className="relative z-10">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 bg-blue-500/20 text-blue-500 dark:text-blue-400">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Team Management</h3>
                        <p className="text-xs text-[var(--text-muted)]">Add members and set booking limits for your company.</p>
                    </div>
                </div>
                {/* Feature 4 */}
                <div className="relative p-5 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-glass)] dark:bg-white/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--bg-card)] dark:hover:bg-white/10 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 overflow-hidden group">
                    <div className="relative z-10">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 bg-orange-500/20 text-orange-500 dark:text-orange-400">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">B2B Priority</h3>
                        <p className="text-xs text-[var(--text-muted)]">Get guaranteed fleet matching and priority support.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
            <motion.div 
                className="w-full max-w-[420px] p-8 rounded-3xl border border-[var(--border-outline)] bg-[var(--bg-secondary)] shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 overflow-hidden bg-blue-600 shadow-lg shadow-blue-500/30">
                        <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Partner Sign In</h2>
                    <p className="text-[var(--text-muted)] text-sm">Access your CargoHub Business Portal.</p>
                </div>

                <button 
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[var(--bg-primary)] border border-[var(--border-outline)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-bold rounded-xl transition-colors flex items-center justify-center gap-3 mb-6 shadow-sm"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Continue with Google
                </button>

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 border-t border-[var(--border-subtle)]" />
                    <span className="text-xs text-[var(--text-muted)] font-medium tracking-wider">OR CORPORATE EMAIL</span>
                    <div className="flex-1 border-t border-[var(--border-subtle)]" />
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                                <Mail className={`w-5 h-5 ${emailError ? 'text-red-500' : ''}`} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={handleEmailChange}
                                onBlur={() => validateEmail(email)}
                                placeholder="work@company.com"
                                className={`w-full pl-11 pr-4 py-3 bg-[var(--bg-primary)] dark:bg-transparent border ${emailError ? 'border-red-500 focus:border-red-500' : 'border-[var(--border-input)] focus:border-blue-500'} rounded-xl focus:outline-none transition-colors text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]`}
                            />
                        </div>
                        {emailError && <p className="text-red-500 text-xs mt-1.5 ml-1">{emailError}</p>}
                    </div>

                    <div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-11 pr-11 py-3 bg-[var(--bg-primary)] dark:bg-transparent border border-[var(--border-input)] rounded-xl focus:outline-none transition-colors text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-blue-500"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={!email || !!emailError || !password || loading}
                        className="w-full py-3.5 mt-2 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-white hover:opacity-90 shadow-md text-sm bg-orange-500 hover:bg-orange-600"
                    >
                        {loading ? "Authenticating..." : "Sign In to Workspace"} <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-center text-sm text-[var(--text-muted)] mt-8">
                    Is your company new here? <Link href="/b2b-portal/register" className="font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">Apply for B2B Account</Link>
                </p>
            </motion.div>
        </div>
      </div>
    </div>
  );
}

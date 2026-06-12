"use client";

import { useState } from "react";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }
    setLoading(true);

    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'dummy' || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      console.warn('Firebase API key missing, bypassing login for development');
      setTimeout(() => {
        window.location.href = mode === "user" ? "/dashboard" : "/driver";
      }, 800);
      return;
    }

    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      window.location.href = mode === "user" ? "/dashboard" : "/driver";
    } catch (err: any) {
      if (err.message && err.message.includes('api-key')) {
        console.warn('Firebase API key error detected, bypassing login for development');
        window.location.href = mode === "user" ? "/dashboard" : "/driver";
      } else {
        alert("Login failed: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'dummy' || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      console.warn('Firebase API key missing, bypassing Google login for development');
      setTimeout(() => {
        window.location.href = mode === "user" ? "/dashboard" : "/driver";
      }, 800);
      return;
    }

    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      // We optionally try to register the user in case this is their first time logging in
      const idToken = await result.user.getIdToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/${mode === 'user' ? 'register-user' : 'register-driver'}`, {
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
      window.location.href = mode === "user" ? "/dashboard" : "/driver";
    } catch (err: any) {
      if (err.message && err.message.includes('api-key')) {
        console.warn('Firebase API key error detected, bypassing Google login for development');
        window.location.href = mode === "user" ? "/dashboard" : "/driver";
      } else {
        alert("Google login failed: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-primary)" }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-16 overflow-hidden" style={{
        background: "radial-gradient(circle at 30% 30%, rgba(29, 78, 216, 0.15) 0%, var(--bg-primary) 100%)",
        borderRight: "1px solid var(--border-subtle)",
      }}>
        {/* Decorative glass orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src="/logo.png" alt="CargoHub Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-display text-3xl font-bold">CargoHub</span>
          </div>

          <h2 className="text-4xl font-extrabold mb-6 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            Cargo logistics,<br />
            <span className="gradient-text">reimagined.</span>
          </h2>

          <div className="space-y-5">
            {[
              { icon: <Zap className="w-5 h-5" />, title: "Instant Matching", desc: "AI finds the nearest driver in seconds" },
              { icon: <Shield className="w-5 h-5" />, title: "Verified Drivers", desc: "KYC verified with Aadhaar & license" },
              { icon: <Truck className="w-5 h-5" />, title: "Real-Time Tracking", desc: "GPS updates every 3 seconds" },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(2, 89, 221, 0.15)", color: "var(--brand-primary-light)" }}>
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{f.title}</p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Back to home */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
              <ChevronLeft className="w-4 h-4" /> Back to home
            </Link>
            <ThemeToggle />
          </div>

          <h1 className="font-display text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Welcome back
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
            Sign in to manage your bookings and shipments.
          </p>

          {/* Role toggle */}
          <div className="flex p-1 mb-8" style={{ background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)" }}>
            {(["user", "driver"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setMode(r)}
                className="flex-1 py-2.5 text-sm font-semibold transition-all"
                style={{
                  background: mode === r ? "var(--brand-primary)" : "transparent",
                  color: mode === r ? "white" : "var(--text-muted)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                {r === "user" ? "👤 Customer" : "🚛 Driver"}
              </button>
            ))}
          </div>

          {/* Email input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Email Address</label>
            <div className="flex gap-2">
              <div className="input-field flex items-center justify-center" style={{ width: 50, textAlign: "center" }}>
                <Mail className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input-field flex-1"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="mb-6 relative">
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Password</label>
            <div className="flex gap-2 relative">
              <div className="input-field flex items-center justify-center" style={{ width: 50, textAlign: "center" }}>
                <Lock className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-field flex-1"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            className="btn-primary w-full mb-6"
            style={{ padding: "14px", opacity: (!email || !password) || loading ? 0.5 : 1 }}
            disabled={(!email || !password) || loading}
          >
            {loading ? "Signing in..." : "Sign In"} <ArrowRight className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 divider" />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>OR</span>
            <div className="flex-1 divider" />
          </div>

          {/* Google sign-in */}
          <button 
            onClick={handleGoogleLogin}
            className="btn-secondary w-full" style={{ padding: "14px" }}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="inline-block mr-2"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          {/* Register link */}
          <p className="text-sm text-center mt-8" style={{ color: "var(--text-muted)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold" style={{ color: "var(--brand-primary-light)" }}>
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

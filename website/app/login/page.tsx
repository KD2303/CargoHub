"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone, Mail, ArrowRight, Eye, EyeOff, Truck,
  Shield, Zap, ChevronLeft,
} from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"user" | "driver">("user");
  const [method, setMethod] = useState<"phone" | "google">("phone");
  const [phone, setPhone] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleSendOtp = () => {
    if (phone.length >= 10) setShowOtp(true);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-primary)" }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-16" style={{
        background: "linear-gradient(135deg, rgba(2, 89, 221, 0.15), rgba(132, 175, 251, 0.1))",
        borderRight: "1px solid var(--border-subtle)",
      }}>
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))" }}>
              🚛
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
          <a href="/" className="flex items-center gap-2 text-sm mb-8" style={{ color: "var(--text-muted)" }}>
            <ChevronLeft className="w-4 h-4" /> Back to home
          </a>

          <h1 className="font-display text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Welcome back
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
            Sign in to manage your bookings and shipments.
          </p>

          {/* Role toggle */}
          <div className="flex rounded-xl p-1 mb-8" style={{ background: "var(--bg-tertiary)" }}>
            {(["user", "driver"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setMode(r)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: mode === r ? "var(--brand-primary)" : "transparent",
                  color: mode === r ? "white" : "var(--text-muted)",
                }}
              >
                {r === "user" ? "👤 Customer" : "🚛 Driver"}
              </button>
            ))}
          </div>

          {!showOtp ? (
            <>
              {/* Phone input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Phone Number</label>
                <div className="flex gap-2">
                  <div className="input-field flex items-center justify-center" style={{ width: 70, textAlign: "center", fontSize: "14px" }}>
                    +91
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Enter 10-digit number"
                    className="input-field flex-1"
                  />
                </div>
              </div>

              <button
                onClick={handleSendOtp}
                className="btn-primary w-full mb-6"
                style={{ padding: "14px", opacity: phone.length === 10 ? 1 : 0.5 }}
                disabled={phone.length !== 10}
              >
                Send OTP <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 divider" />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>OR</span>
                <div className="flex-1 divider" />
              </div>

              {/* Google sign-in */}
              <button className="btn-secondary w-full" style={{ padding: "14px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
            </>
          ) : (
            <>
              {/* OTP input */}
              <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                Enter the 6-digit code sent to +91 {phone}
              </p>
              <div className="flex gap-3 mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const newOtp = [...otp];
                      newOtp[i] = e.target.value;
                      setOtp(newOtp);
                      if (e.target.value && i < 5) {
                        const next = e.target.nextElementSibling as HTMLInputElement;
                        next?.focus();
                      }
                    }}
                    className="input-field text-center font-mono text-xl font-bold"
                    style={{ width: 52, height: 56, padding: 0 }}
                  />
                ))}
              </div>

              <button
                className="btn-primary w-full mb-4"
                style={{ padding: "14px" }}
                onClick={() => window.location.href = mode === "user" ? "/book" : "/driver"}
              >
                Verify & Sign In <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowOtp(false)}
                className="text-sm font-medium w-full text-center"
                style={{ color: "var(--brand-primary-light)" }}
              >
                Change number
              </button>
            </>
          )}

          {/* Register link */}
          <p className="text-sm text-center mt-8" style={{ color: "var(--text-muted)" }}>
            Don&apos;t have an account?{" "}
            <a href="/register" className="font-semibold" style={{ color: "var(--brand-primary-light)" }}>
              Sign up
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

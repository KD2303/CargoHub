"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone, Mail, ArrowRight, Eye, EyeOff, Truck,
  Shield, Zap, ChevronLeft, User, Lock
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "../../components/ThemeToggle";
// @ts-ignore - TS module resolution bug with Firebase 11+
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth as firebaseAuth, googleProvider } from "../../lib/firebase";

export default function RegisterPage() {
  const [mode, setMode] = useState<"user" | "driver">("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("male");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState<1 | 2>(1);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const proceedToDashboard = () => {
    window.location.href = mode === "user" ? "/dashboard" : "/driver";
  };

  const handleRegister = async () => {
    if (phone.length < 10 || name.length < 2 || password.length < 6 || password !== verifyPassword || !gender) {
      alert("Please fill all fields correctly (Password min 6 chars, Passwords must match, Phone 10 digits).");
      return;
    }
    setLoading(true);

    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'dummy' || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      console.warn('Firebase API key missing, bypassing registration for development');
      setTimeout(() => setStep(2), 800);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const idToken = await userCredential.user.getIdToken();

      const regRes = await fetch(`http://localhost:5000/api/auth/${mode === 'user' ? 'register-user' : 'register-driver'}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          name,
          email,
          phone: '+91' + phone,
          gender,
          role: mode === 'user' ? 'CUSTOMER' : 'DRIVER'
        })
      });
      
      const regData = await regRes.json();
      if (regData.success || regRes.ok) {
         setStep(2);
      } else {
         alert('Registration failed in database: ' + (regData.error || 'Unknown error'));
      }
    } catch (err: any) {
      if (err.message && err.message.includes('api-key')) {
        console.warn('Firebase API key error detected, bypassing registration for development');
        setStep(2);
      } else {
        alert('Registration failed: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);

    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'dummy' || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      console.warn('Firebase API key missing, bypassing Google signup for development');
      setTimeout(() => setStep(2), 800);
      return;
    }

    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const regRes = await fetch(`http://localhost:5000/api/auth/${mode === 'user' ? 'register-user' : 'register-driver'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          name: result.user.displayName || 'Unknown User',
          email: result.user.email,
          phone: phone.length === 10 ? '+91' + phone : (result.user.phoneNumber || '+910000000000'),
          gender: 'male',
          role: mode === 'user' ? 'CUSTOMER' : 'DRIVER'
        })
      });
      
      const regData = await regRes.json();
      if (regData.success || regRes.ok) {
        setStep(2);
      } else {
        alert('Database registration failed: ' + (regData.message || regData.error));
      }
    } catch (err: any) {
      if (err.message && err.message.includes('api-key')) {
        console.warn('Firebase API key error detected, bypassing Google signup for development');
        setStep(2);
      } else {
        alert("Google signup failed: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarPreview) return proceedToDashboard();
    
    setUploadingAvatar(true);
    try {
      const currentUser = firebaseAuth.currentUser;
      if (!currentUser) throw new Error("No user logged in");
      const idToken = await currentUser.getIdToken();
      
      const res = await fetch('http://localhost:5000/api/auth/upload-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ base64Image: avatarPreview })
      });
      
      const data = await res.json();
      if (!data.success) {
        alert("Failed to upload avatar, proceeding without it.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading avatar, proceeding without it.");
    } finally {
      setUploadingAvatar(false);
      proceedToDashboard();
    }
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
            Join the logistics,<br />
            <span className="gradient-text">revolution.</span>
          </h2>

          <div className="space-y-5">
            {[
              { icon: <Zap className="w-5 h-5" />, title: "Instant Setup", desc: "Get your account running in 2 minutes" },
              { icon: <Shield className="w-5 h-5" />, title: "Secure Platform", desc: "Enterprise-grade encryption and safety" },
              { icon: <Truck className="w-5 h-5" />, title: "Endless Opportunities", desc: "Connect with thousands of shipments daily" },
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
          {step === 1 ? (
            <>
              {/* Back to home */}
              <div className="flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                  <ChevronLeft className="w-4 h-4" /> Back to home
                </Link>
                <ThemeToggle />
              </div>

              <h1 className="font-display text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                Create an account
              </h1>
              <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
                Sign up to start managing your logistics today.
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

              {/* Name input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Full Name</label>
                <div className="flex gap-2">
                  <div className="input-field flex items-center justify-center" style={{ width: 50, textAlign: "center" }}>
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="input-field flex-1"
                  />
                </div>
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

              {/* Gender input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Gender</label>
                <div className="flex gap-2">
                  <div className="input-field flex items-center justify-center" style={{ width: 50, textAlign: "center" }}>
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="input-field flex-1"
                    style={{ backgroundColor: "transparent" }}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Phone input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Phone Number (Optional for Google Signup)</label>
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
                    placeholder="Create a password (min 6 chars)"
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

              {/* Verify Password input */}
              <div className="mb-6 relative">
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Verify Password</label>
                <div className="flex gap-2 relative">
                  <div className="input-field flex items-center justify-center" style={{ width: 50, textAlign: "center" }}>
                    <Lock className="w-4 h-4 text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={verifyPassword}
                    onChange={(e) => setVerifyPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="input-field flex-1"
                  />
                </div>
              </div>

              <button
                onClick={handleRegister}
                className="btn-primary w-full mb-6"
                style={{ padding: "14px", opacity: phone.length === 10 && name.length > 2 && password.length >= 6 && !loading ? 1 : 0.5 }}
                disabled={phone.length !== 10 || name.length <= 2 || password.length < 6 || loading}
              >
                {loading ? "Creating Account..." : "Create Account"} <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 divider" />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>OR</span>
                <div className="flex-1 divider" />
              </div>

              {/* Google sign-in */}
              <button 
                onClick={handleGoogleSignup}
                className="btn-secondary w-full" style={{ padding: "14px" }}
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" className="inline-block mr-2"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Sign up with Google
              </button>

              {/* Login link */}
              <p className="text-sm text-center mt-8" style={{ color: "var(--text-muted)" }}>
                Already have an account?{" "}
                <Link href="/login" className="font-semibold" style={{ color: "var(--brand-primary-light)" }}>
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center">
              <h1 className="font-display text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                Profile Picture
              </h1>
              <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
                Add a photo so others can recognize you. (Optional)
              </p>

              <div className="flex justify-center mb-8">
                <div className="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden border-4" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-secondary)" }}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <User className="w-12 h-12 mb-2 opacity-50" />
                      <span className="text-xs font-semibold">Upload</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold tracking-wide">CHANGE</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={uploadAvatar}
                  disabled={uploadingAvatar || !avatarPreview}
                  className="btn-primary w-full py-3"
                  style={{ opacity: uploadingAvatar || !avatarPreview ? 0.5 : 1 }}
                >
                  {uploadingAvatar ? "Uploading..." : "Complete Setup"}
                </button>
                <button
                  onClick={proceedToDashboard}
                  disabled={uploadingAvatar}
                  className="w-full py-3 text-sm font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

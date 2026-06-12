"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (phone.length !== 10 || name.length < 2 || password.length < 6 || password !== verifyPassword || !gender) {
      toast.error("Please fill all fields correctly (Password min 6 chars, Passwords must match, Phone exactly 10 digits).");
      return;
    }
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const idToken = await userCredential.user.getIdToken();

      const regRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/${mode === 'user' ? 'register-user' : 'register-driver'}`, {
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
         toast.error('Registration failed in database: ' + (regData.error || 'Unknown error'));
      }
    } catch (err: any) {
      toast.error('Registration failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);

    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const regRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/${mode === 'user' ? 'register-user' : 'register-driver'}`, {
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
        toast.error('Database registration failed: ' + (regData.message || regData.error));
      }
    } catch (err: any) {
      toast.error("Google signup failed: " + err.message);
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
      
      const res = await fetch((`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`) + '/api/auth/upload-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ base64Image: avatarPreview })
      });
      
      const data = await res.json();
      if (!data.success) {
        toast.error("Failed to upload avatar, proceeding without it.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error uploading avatar, proceeding without it.");
    } finally {
      setUploadingAvatar(false);
      proceedToDashboard();
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
                <div className="p-5 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-tertiary)] transition-colors hover:border-[var(--brand-primary)]">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: "color-mix(in srgb, var(--brand-primary) 10%, transparent)", color: "var(--brand-primary)" }}>
                        <Zap className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Smart Route Optimization</h3>
                    <p className="text-xs text-[var(--text-muted)]">AI-powered routing to ensure fastest delivery times and lower fuel costs.</p>
                </div>
                {/* Feature 2 */}
                <div className="p-5 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-tertiary)] transition-colors hover:border-[var(--brand-primary)]">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: "color-mix(in srgb, var(--brand-primary) 10%, transparent)", color: "var(--brand-primary)" }}>
                        <Truck className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Live GPS Tracking</h3>
                    <p className="text-xs text-[var(--text-muted)]">Monitor your shipments in real-time with updates every 3 seconds.</p>
                </div>
                {/* Feature 3 */}
                <div className="p-5 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-tertiary)] transition-colors hover:border-[var(--brand-primary)]">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: "color-mix(in srgb, var(--brand-primary) 10%, transparent)", color: "var(--brand-primary)" }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Instant Fleet Matching</h3>
                    <p className="text-xs text-[var(--text-muted)]">Map your shipments to available verified drivers instantly.</p>
                </div>
                {/* Feature 4 */}
                <div className="p-5 rounded-2xl border border-[var(--border-outline)] bg-[var(--bg-tertiary)] transition-colors hover:border-[var(--brand-primary)]">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: "color-mix(in srgb, var(--brand-primary) 10%, transparent)", color: "var(--brand-primary)" }}>
                        <Shield className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Secure & Verified</h3>
                    <p className="text-xs text-[var(--text-muted)]">Every driver is KYC-verified. Goods are insured and secured.</p>
                </div>
            </div>
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
            <motion.div 
                className="w-full max-w-[480px] p-6 lg:p-8 rounded-3xl border border-[var(--border-outline)] bg-[var(--bg-secondary)] shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {step === 1 ? (
                    <>
                        <div className="flex flex-col items-center mb-5 text-center">
                            <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center mb-5 overflow-hidden border border-[var(--border-outline)] bg-[var(--bg-primary)] p-4 shadow-sm">
                                <img src="/logo.png" alt="CargoHub Logo" className="w-full h-full object-contain" />
                            </div>
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Create an account</h2>
                            <p className="text-[var(--text-muted)] text-sm">Sign up to start managing your logistics today.</p>
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
                            onClick={handleGoogleSignup}
                            disabled={loading}
                            className="w-full py-2.5 px-4 bg-[var(--bg-primary)] border border-[var(--border-outline)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium rounded-xl transition-colors flex items-center justify-center gap-2 mb-4"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                            Sign up with Google
                        </button>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex-1 border-t border-[var(--border-subtle)]" />
                            <span className="text-xs text-[var(--text-muted)] font-medium">OR EMAIL</span>
                            <div className="flex-1 border-t border-[var(--border-subtle)]" />
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Full name"
                                        className="w-full pl-9 pr-3 py-2 bg-[var(--bg-primary)] dark:bg-transparent border border-[var(--border-input)] rounded-xl focus:outline-none transition-colors text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--brand-primary)]"
                                    />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email address"
                                        className="w-full pl-9 pr-3 py-2 bg-[var(--bg-primary)] dark:bg-transparent border border-[var(--border-input)] rounded-xl focus:outline-none transition-colors text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--brand-primary)]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-[var(--bg-primary)] dark:bg-transparent border border-[var(--border-input)] rounded-xl focus:outline-none transition-colors text-sm text-[var(--text-primary)] focus:border-[var(--brand-primary)] appearance-none"
                                    >
                                        <option value="male" className="bg-[var(--bg-secondary)]">Male</option>
                                        <option value="female" className="bg-[var(--bg-secondary)]">Female</option>
                                        <option value="other" className="bg-[var(--bg-secondary)]">Other</option>
                                    </select>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                                        <span className="text-xs font-semibold">+91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                        placeholder="Phone (opt)"
                                        className="w-full pl-9 pr-3 py-2 bg-[var(--bg-primary)] dark:bg-transparent border border-[var(--border-input)] rounded-xl focus:outline-none transition-colors text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--brand-primary)]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                        className="w-full pl-9 pr-8 py-2 bg-[var(--bg-primary)] dark:bg-transparent border border-[var(--border-input)] rounded-xl focus:outline-none transition-colors text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--brand-primary)]"
                                    />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={verifyPassword}
                                        onChange={(e) => setVerifyPassword(e.target.value)}
                                        placeholder="Verify Pass"
                                        className="w-full pl-9 pr-8 py-2 bg-[var(--bg-primary)] dark:bg-transparent border border-[var(--border-input)] rounded-xl focus:outline-none transition-colors text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--brand-primary)]"
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
                        </div>

                        <button
                            onClick={handleRegister}
                            disabled={phone.length !== 10 || name.length <= 2 || password.length < 6 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || loading}
                            className="w-full py-3 mt-5 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-white hover:opacity-90 shadow-md text-sm"
                            style={{ backgroundColor: "var(--brand-primary)" }}
                        >
                            {loading ? "Creating..." : "Create Account"} <ArrowRight className="w-4 h-4" />
                        </button>

                        <p className="text-center text-xs text-[var(--text-muted)] mt-5">
                            Already have an account? <Link href="/login" className="font-semibold hover:underline" style={{ color: "var(--brand-primary)" }}>Sign in</Link>
                        </p>
                    </>
                ) : (
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Profile Picture</h1>
                        <p className="text-sm text-[var(--text-secondary)] mb-6">Add a photo so others can recognize you. (Optional)</p>

                        <div className="flex justify-center mb-6">
                            <div className="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-muted)]">
                                        <User className="w-10 h-10 mb-2 opacity-50" />
                                        <span className="text-xs font-semibold">Upload</span>
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-bold tracking-wide">CHANGE</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={uploadAvatar}
                                disabled={uploadingAvatar || !avatarPreview}
                                className="w-full py-3 font-semibold rounded-xl transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: "var(--brand-primary)" }}
                            >
                                {uploadingAvatar ? "Uploading..." : "Complete Setup"}
                            </button>
                            <button
                                onClick={proceedToDashboard}
                                disabled={uploadingAvatar}
                                className="w-full py-3 text-sm font-semibold transition-colors hover:bg-[var(--bg-tertiary)] rounded-xl text-[var(--text-secondary)]"
                            >
                                Skip for now
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
      </div>
    </div>
  );
}

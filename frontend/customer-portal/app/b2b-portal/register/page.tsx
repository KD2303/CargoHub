"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Phone, Mail, ArrowRight, Eye, EyeOff, Building,
  Briefcase, ChevronLeft, User, Lock, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
// @ts-ignore
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth as firebaseAuth, googleProvider } from "@/lib/firebase";

export default function B2BRegisterPage() {
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const validateEmail = (val: string) => {
    if (!val) {
      setEmailError("");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setEmailError("Valid email required");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePhone = (val: string) => {
    if (!val) {
      setPhoneError("");
      return false;
    }
    if (val.length !== 10) {
      setPhoneError("Must be 10 digits");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (emailError) validateEmail(val);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(val);
    if (phoneError) validatePhone(val);
  };

  const handleRegister = async () => {
    const isEmailValid = validateEmail(email);
    const isPhoneValid = validatePhone(phone);
    
    if (!isEmailValid || !isPhoneValid) {
      toast.error("Please fix validation errors before submitting.");
      return;
    }

    if (name.length < 2 || companyName.length < 2 || password.length < 6 || password !== verifyPassword) {
      toast.error("Please ensure all fields are correct (10-digit phone, matching passwords >= 6 chars).");
      return;
    }
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const idToken = await userCredential.user.getIdToken();

      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, '');
      const regRes = await fetch(`${baseUrl}/api/auth/register-b2b`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          name: `${name} (${companyName})`,
          email,
          phone: '+91' + phone,
          gender: 'other',
        })
      });
      
      const regData = await regRes.json();
      if (regData.success || regRes.ok) {
         setStep(2);
      } else {
         toast.error('Registration failed: ' + (regData.error || 'Unknown error'));
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
      
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, '');
      const regRes = await fetch(`${baseUrl}/api/auth/register-b2b`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          name: result.user.displayName || 'B2B User',
          email: result.user.email,
          phone: phone.length === 10 ? '+91' + phone : (result.user.phoneNumber || '+910000000000'),
          gender: 'other'
        })
      });
      
      const regData = await regRes.json();
      if (regData.success || regRes.ok) {
        setStep(2);
      } else {
        toast.error('Registration failed: ' + (regData.message || regData.error));
      }
    } catch (err: any) {
      toast.error("Google signup failed: " + err.message);
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
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight">
                Empower your supply chain with <br/>
                <span className="text-orange-500">CargoHub B2B.</span>
            </h1>

            <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-lg leading-relaxed">
                Join hundreds of enterprises optimizing their logistics. Create your corporate account to get started.
            </p>

            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-[var(--text-secondary)]">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <span className="font-medium">Priority fleet allocation & zero surge pricing</span>
              </li>
              <li className="flex items-center gap-3 text-[var(--text-secondary)]">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <span className="font-medium">Monthly GST invoicing & credit lines</span>
              </li>
              <li className="flex items-center gap-3 text-[var(--text-secondary)]">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <span className="font-medium">Dedicated account manager & 24/7 support</span>
              </li>
              <li className="flex items-center gap-3 text-[var(--text-secondary)]">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <span className="font-medium">Advanced spend analytics & team management</span>
              </li>
            </ul>
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
            <motion.div 
                className="w-full max-w-[500px] p-8 rounded-3xl border border-[var(--border-outline)] bg-[var(--bg-secondary)] shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {step === 1 ? (
                    <>
                        <div className="flex flex-col items-center mb-8 text-center">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Apply for a Corporate Account</h2>
                            <p className="text-[var(--text-muted)] text-sm">Tell us about your company to get started.</p>
                        </div>

                        <button 
                            onClick={handleGoogleSignup}
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-[var(--bg-primary)] border border-[var(--border-outline)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-bold rounded-xl transition-colors flex items-center justify-center gap-3 mb-6 shadow-sm"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                            Sign up with Google Workspace
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1 border-t border-[var(--border-subtle)]" />
                            <span className="text-xs text-[var(--text-muted)] font-medium tracking-wider">OR MANUAL SETUP</span>
                            <div className="flex-1 border-t border-[var(--border-subtle)]" />
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                                        <Building className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="Company Name"
                                        className="w-full pl-11 pr-3 py-3 bg-[var(--bg-primary)] dark:bg-transparent border border-[var(--border-input)] rounded-xl focus:outline-none transition-colors text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-blue-500"
                                    />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your Name"
                                        className="w-full pl-11 pr-3 py-3 bg-[var(--bg-primary)] dark:bg-transparent border border-[var(--border-input)] rounded-xl focus:outline-none transition-colors text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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
                                            placeholder="Work Email"
                                            className={`w-full pl-11 pr-3 py-3 bg-[var(--bg-primary)] dark:bg-transparent border ${emailError ? 'border-red-500 focus:border-red-500' : 'border-[var(--border-input)] focus:border-blue-500'} rounded-xl focus:outline-none transition-colors text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]`}
                                        />
                                    </div>
                                    {emailError && <p className="text-red-500 text-xs mt-1 ml-1">{emailError}</p>}
                                </div>
                                <div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                                            <span className={`text-sm font-semibold ${phoneError ? 'text-red-500' : ''}`}>+91</span>
                                        </div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={handlePhoneChange}
                                            onBlur={() => validatePhone(phone)}
                                            placeholder="Phone Number"
                                            className={`w-full pl-11 pr-3 py-3 bg-[var(--bg-primary)] dark:bg-transparent border ${phoneError ? 'border-red-500 focus:border-red-500' : 'border-[var(--border-input)] focus:border-blue-500'} rounded-xl focus:outline-none transition-colors text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]`}
                                        />
                                    </div>
                                    {phoneError && <p className="text-red-500 text-xs mt-1 ml-1">{phoneError}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                        className="w-full pl-11 pr-8 py-3 bg-[var(--bg-primary)] dark:bg-transparent border border-[var(--border-input)] rounded-xl focus:outline-none transition-colors text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-blue-500"
                                    />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={verifyPassword}
                                        onChange={(e) => setVerifyPassword(e.target.value)}
                                        placeholder="Confirm Pass"
                                        className="w-full pl-11 pr-8 py-3 bg-[var(--bg-primary)] dark:bg-transparent border border-[var(--border-input)] rounded-xl focus:outline-none transition-colors text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-blue-500"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleRegister}
                            disabled={phone.length !== 10 || !!emailError || !!phoneError || name.length < 2 || companyName.length < 2 || password.length < 6 || loading}
                            className="w-full py-3.5 mt-6 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-white hover:opacity-90 shadow-md text-sm bg-orange-500 hover:bg-orange-600"
                        >
                            {loading ? "Creating Profile..." : "Submit Application"} <ArrowRight className="w-5 h-5" />
                        </button>

                        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
                            Already a partner? <Link href="/b2b-portal/login" className="font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">Sign In</Link>
                        </p>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">Application Received!</h1>
                        <p className="text-[var(--text-secondary)] mb-8 max-w-sm mx-auto leading-relaxed">
                            Welcome aboard! Your corporate account has been provisioned. You can now access your workspace.
                        </p>
                        <button
                            onClick={() => window.location.href = "/b2b-portal"}
                            className="w-full py-3.5 font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30 transition-all"
                        >
                            Go to Business Workspace
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone, Download, QrCode, ShieldCheck, CheckCircle2,
  ChevronRight, ArrowRight, Truck, Navigation, IndianRupee,
  Play, LogOut, Settings, Star, Info, HelpCircle, AlertCircle
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import Image from "next/image";
import logo from "../icon.jpeg";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DownloadPage() {
  const { user } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<"customer" | "driver">("customer");
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      const { auth } = await import('@/lib/firebase');
      await auth.signOut();
      window.location.href = '/';
    } catch (err) {
      console.error(err);
    }
  };

  const triggerDownload = (type: "customer" | "driver") => {
    setDownloading(type);
    
    // Simulate APK download process
    setTimeout(() => {
      // Create a dummy file download
      const element = document.createElement("a");
      const file = new Blob(["mock-apk-content"], { type: "application/vnd.android.package-archive" });
      element.href = URL.createObjectURL(file);
      element.download = `cargohub-${type}-app-v1.0.apk`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setDownloading(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
        style={{ background: "var(--bg-glass)", borderColor: "var(--border-subtle)" }}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between h-[68px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="CargoHub Logo"
              width={48}
              height={48}
              className="object-contain flex-shrink-0"
            />
            <span className="font-sans text-[17px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              CargoHub
            </span>
          </Link>

          {/* Center Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-[14px] font-semibold transition-colors" style={{ color: "var(--text-secondary)" }}>Home</Link>
            <Link href="/download" className="text-[14px] font-semibold transition-colors" style={{ color: "var(--brand-primary)" }}>Download App</Link>
            <Link href="/developer" className="text-[14px] font-semibold transition-colors" style={{ color: "var(--text-secondary)" }}>Developers</Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
            {user ? (
              <div 
                className="relative"
                onMouseEnter={() => setShowProfileMenu(true)}
                onMouseLeave={() => setShowProfileMenu(false)}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full border cursor-pointer overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-sm" style={{ color: "var(--brand-primary)" }}>
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 bg-[var(--bg-primary)] border shadow-lg rounded-xl overflow-hidden w-48"
                      style={{ borderColor: "var(--border-subtle)", zIndex: 100 }}
                    >
                      <Link 
                        href="/dashboard/settings" 
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-primary)]"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-medium">View Profile</span>
                      </Link>
                      <div className="h-px w-full" style={{ background: "var(--border-subtle)" }} />
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-red-500 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-[13px] md:text-[14px] font-semibold transition-colors px-2 md:px-4 py-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Log In
              </Link>
            )}
            <Link
              href={user ? "/dashboard" : "/book"}
              className="text-[13px] md:text-[14px] font-bold text-white px-4 md:px-5 py-2 md:py-2.5 shadow-sm transition-opacity hover:opacity-90 whitespace-nowrap"
              style={{ background: "var(--brand-primary)", borderRadius: "4px" }}
            >
              {user ? "Dashboard" : "Book Now"}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-mesh bg-grid">
        <div className="container-wide relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left: Content */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="pill" style={{ borderColor: "var(--brand-primary)", color: "var(--brand-primary)", background: "rgba(2, 89, 221, 0.05)" }}>
                  <Smartphone className="w-4 h-4 mr-2 inline" /> Mobile App v1.0
                </span>
                <h1 className="text-4xl md:text-6xl font-extrabold mt-4 leading-tight">
                  Logistics at Your <br />
                  <span className="gradient-text">Fingertips</span>
                </h1>
                <p className="text-lg mt-4 max-w-xl mx-auto lg:mx-0" style={{ color: "var(--text-secondary)" }}>
                  Download the CargoHub APK. Seamlessly manage bookings as a customer, or accept rides and earn money as a verified driver. One powerful application suite for everyone.
                </p>
              </motion.div>

              {/* Tab Selector */}
              <div className="flex items-center justify-center lg:justify-start gap-4 p-1.5 rounded-xl border max-w-sm mx-auto lg:mx-0 bg-[var(--bg-glass)]" style={{ borderColor: "var(--border-subtle)" }}>
                <button
                  onClick={() => setActiveTab("customer")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    activeTab === "customer"
                      ? "bg-[var(--brand-primary)] text-white shadow"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                  }`}
                >
                  Customer App
                </button>
                <button
                  onClick={() => setActiveTab("driver")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    activeTab === "driver"
                      ? "bg-[var(--brand-secondary)] text-white shadow"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                  }`}
                >
                  Driver App
                </button>
              </div>

              {/* Action Buttons & QR Code */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start"
              >
                <div className="space-y-3 w-full sm:w-auto">
                  <button
                    onClick={() => triggerDownload(activeTab)}
                    disabled={downloading !== null}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-transform hover:-translate-y-1 shadow-lg text-white"
                    style={{
                      background: activeTab === "customer" ? "var(--brand-primary)" : "var(--brand-secondary)",
                      boxShadow: activeTab === "customer" ? "0 4px 20px rgba(2, 89, 221, 0.3)" : "0 4px 20px rgba(255, 102, 72, 0.3)"
                    }}
                  >
                    <Download className={`w-5 h-5 ${downloading === activeTab ? "animate-bounce" : ""}`} />
                    {downloading === activeTab ? "Downloading APK..." : `Download ${activeTab === "customer" ? "Customer" : "Driver"} APK`}
                  </button>
                  <p className="text-xs text-center lg:text-left flex items-center justify-center lg:justify-start gap-1.5" style={{ color: "var(--text-muted)" }}>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Download · Verified Safe APK (34.2 MB)
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-4 p-3 rounded-xl border bg-[var(--bg-glass)]" style={{ borderColor: "var(--border-subtle)" }}>
                  <div className="w-16 h-16 bg-white p-1 rounded-lg flex items-center justify-center shadow-sm">
                    {/* CSS QR Code representation */}
                    <div className="w-full h-full relative" style={{ backgroundImage: "radial-gradient(#000 20%, transparent 20%), radial-gradient(#000 20%, transparent 20%)", backgroundSize: "6px 6px", backgroundPosition: "0 0, 3px 3px" }}>
                      <div className="absolute top-0 left-0 w-4 h-4 border-2 border-black bg-white" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-2 border-black bg-white" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-2 border-black bg-white" />
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Scan to download</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Directly on your smartphone</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Phone Mockup */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                className="relative w-[300px] h-[600px] rounded-[48px] border-[12px] border-neutral-900 dark:border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden"
              >
                {/* Dynamic Screen contents based on selected app role */}
                <div className="absolute inset-0 w-full h-full flex flex-col bg-slate-900 text-white overflow-hidden font-sans select-none">
                  {/* Smartphone Top Notch/Island */}
                  <div className="w-full h-8 flex justify-between items-center px-6 text-[10px] font-bold text-neutral-400 bg-black/40 z-30">
                    <span>9:41 AM</span>
                    <div className="w-20 h-4 rounded-full bg-black absolute left-1/2 -translate-x-1/2 top-1.5" />
                    <div className="flex items-center gap-1">
                      <span>5G</span>
                      <div className="w-4 h-2.5 rounded-sm border border-neutral-400 p-[1px] flex items-center"><div className="w-full h-full bg-neutral-400 rounded-2xs" /></div>
                    </div>
                  </div>

                  {/* App Container */}
                  <div className="flex-1 flex flex-col relative z-10 pt-2 pb-6 px-4">
                    <AnimatePresence mode="wait">
                      {activeTab === "customer" ? (
                        <motion.div
                          key="customer-screen"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex-1 flex flex-col justify-between"
                        >
                          {/* Mini Header */}
                          <div className="flex items-center justify-between pb-2 border-b border-white/10">
                            <div className="flex items-center gap-1.5">
                              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-[10px]">CH</div>
                              <span className="text-xs font-bold">CargoHub</span>
                            </div>
                            <div className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[9px] font-bold text-emerald-400">Online</div>
                          </div>

                          {/* Mini Map Visual */}
                          <div className="h-44 rounded-xl relative overflow-hidden bg-slate-800 border border-white/5 my-2 flex items-center justify-center">
                            <div className="absolute inset-0 bg-grid opacity-30" />
                            {/* Path Line */}
                            <svg className="absolute inset-0 w-full h-full opacity-40">
                              <path d="M 40 40 Q 120 70 200 120" fill="transparent" stroke="var(--brand-primary-light)" strokeWidth="3" strokeDasharray="5 3" />
                            </svg>
                            {/* Map Pins */}
                            <div className="absolute top-8 left-8 flex flex-col items-center">
                              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[8px] font-bold">A</div>
                              <span className="text-[7px] text-slate-400">Pickup</span>
                            </div>
                            <div className="absolute bottom-8 right-12 flex flex-col items-center">
                              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] font-bold">B</div>
                              <span className="text-[7px] text-slate-400">Drop</span>
                            </div>
                            {/* Moving Mini Truck */}
                            <motion.div
                              className="absolute z-10 w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center shadow"
                              animate={{
                                top: ["25%", "45%", "65%", "45%"],
                                left: ["25%", "55%", "75%", "55%"],
                              }}
                              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                            >
                              <Truck className="w-3.5 h-3.5 text-white" />
                            </motion.div>
                          </div>

                          {/* Order Details Panel */}
                          <div className="bg-slate-950/70 border border-white/10 rounded-xl p-3 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-neutral-400">CHOOSE VEHICLE</span>
                              <span className="text-[9px] text-blue-400">View All</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="border border-blue-500/50 bg-blue-900/20 p-2 rounded-lg text-left">
                                <span className="text-lg block">🛻</span>
                                <span className="text-[9px] font-bold block">Tata Ace</span>
                                <span className="text-[8px] text-slate-400">750 kg · ₹299</span>
                              </div>
                              <div className="border border-white/10 bg-slate-900 p-2 rounded-lg text-left opacity-70">
                                <span className="text-lg block">🚛</span>
                                <span className="text-[9px] font-bold block">Tempo 407</span>
                                <span className="text-[8px] text-slate-400">2.5 t · ₹599</span>
                              </div>
                            </div>
                            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-lg text-center shadow transition-colors">
                              Book Tata Ace Now
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="driver-screen"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex-1 flex flex-col justify-between"
                        >
                          {/* Mini Header */}
                          <div className="flex items-center justify-between pb-2 border-b border-white/10">
                            <div className="flex items-center gap-1.5">
                              <div className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center font-bold text-[10px]">CD</div>
                              <span className="text-xs font-bold text-orange-400">CargoDriver</span>
                            </div>
                            <div className="px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-[9px] font-bold text-orange-400">On Duty</div>
                          </div>

                          {/* Earnings Overview */}
                          <div className="bg-slate-950/80 border border-orange-500/20 p-3 rounded-xl text-center space-y-1 my-2">
                            <span className="text-[9px] text-slate-400 tracking-wider uppercase block">Today&apos;s Earnings</span>
                            <span className="text-2xl font-bold font-mono text-orange-400">₹2,840.00</span>
                            <div className="flex justify-around text-[9px] text-slate-400 pt-1 border-t border-white/5">
                              <div><span className="font-bold text-white">6</span> Rides</div>
                              <div><span className="font-bold text-white">4.9</span> ★ Rating</div>
                            </div>
                          </div>

                          {/* Incoming Booking Request Alert */}
                          <motion.div
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="bg-orange-600 border border-orange-400 rounded-xl p-3.5 space-y-2.5 shadow-lg"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-extrabold bg-black/30 px-1.5 py-0.5 rounded tracking-wide text-white">NEW BOOKING REQUEST</span>
                              <span className="text-[10px] font-mono font-bold">2.4 km away</span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[11px] font-bold truncate">📦 Fragile Electronics Load</p>
                              <p className="text-[9px] text-orange-100 truncate">From: Hazratganj Metro Gate 3</p>
                              <p className="text-[9px] text-orange-100 truncate">To: Gomti Nagar, Wave Mall</p>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                              <span className="font-mono text-sm font-bold text-white">Payout: ₹480</span>
                              <div className="flex gap-2">
                                <button className="px-3 py-1 bg-black/30 hover:bg-black/50 text-[9px] font-bold rounded">Reject</button>
                                <button className="px-4 py-1 bg-white text-orange-600 hover:bg-orange-50 text-[9px] font-bold rounded shadow">Accept</button>
                              </div>
                            </div>
                          </motion.div>

                          {/* Navigation Tip */}
                          <p className="text-[8px] text-slate-500 text-center">Swipe up for active navigations</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabs Content Detailed Features ─────────────────────────────── */}
      <section className="py-20" style={{ background: "var(--bg-secondary)" }}>
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold">
              One Application. <span className="gradient-text">Double Power.</span>
            </h2>
            <p className="text-lg mt-3 max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              The CargoHub app dynamically configures itself based on your login credentials. Use the same app to book vehicles, or switch to your driver partner account.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Customer Features */}
            <div className="card space-y-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-[var(--brand-primary)]">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">CargoHub for Customers</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Book local logistics and delivery trucks in minutes. Experience a completely digital flow from pickup request to delivery confirmation.
              </p>
              <ul className="space-y-3.5">
                {[
                  "Choose from a wide fleet (Tata Ace, Tempo, Pickup, Large Trucks)",
                  "Enter addresses easily with auto-suggest address search",
                  "Monitor your goods with high-frequency 3-second live GPS tracking",
                  "Get complete transparent pricing breakdowns with zero hidden charges",
                  "Pay securely through UPI, debit/credit cards, or net banking"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Driver Features */}
            <div className="card space-y-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 text-[var(--brand-secondary)]">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">CargoHub for Drivers</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Join India&apos;s fastest growing digital logistics portal. Earn regular booking commissions, withdraw funds instantly, and optimize routes.
              </p>
              <ul className="space-y-3.5">
                {[
                  "Receive regular local booking requests nearest to your location",
                  "Get detailed customer routes and real-time navigation guides",
                  "Secure and guaranteed payouts with instant direct-to-bank transfers",
                  "Zero paperwork onboarding — complete Aadhaar & license KYC instantly",
                  "24/7 dedicated driver support helpline for route issues"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── APK Installation Guide ─────────────────────────────────────── */}
      <section className="py-20">
        <div className="container-narrow">
          <div className="card bg-slate-900/5 dark:bg-white/5 border" style={{ borderColor: "var(--border-subtle)" }}>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Info className="w-6 h-6 text-[var(--brand-primary)]" />
              How to Install CargoHub APK on Android
            </h3>
            
            <div className="space-y-6">
              {[
                {
                  step: "01",
                  title: "Download the APK",
                  desc: "Click the Download APK button above. The download will start automatically in your browser. Save the file to your downloads directory."
                },
                {
                  step: "02",
                  title: "Enable Unknown Sources",
                  desc: "Go to Settings > Security (or Settings > Apps > Special app access) on your device and turn on 'Install Unknown Apps' for your browser or file manager."
                },
                {
                  step: "03",
                  title: "Install and Launch",
                  desc: "Open your file manager, locate the downloaded cargohub-app.apk, and tap it. Follow the onscreen instructions to complete the installation."
                }
              ].map((inst, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <span className="font-mono text-base font-bold bg-[var(--brand-primary)] text-white w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                    {inst.step}
                  </span>
                  <div>
                    <h4 className="font-bold text-[15px]" style={{ color: "var(--text-primary)" }}>{inst.title}</h4>
                    <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{inst.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex gap-3 text-sm">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p style={{ color: "var(--text-secondary)" }}>
                <strong>Note:</strong> Since this app is distributed as a direct APK download for custom testing during the <strong>Far Away</strong> hackathon, Google Play Protect might display a warning. Please tap &quot;Install Anyway&quot; to continue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="py-16" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <div className="container-wide">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-12 px-4 md:px-0 text-center sm:text-left">
                  <div>
                    <div className="flex items-center gap-2.5 mb-4">
                      <Image
                        src={logo}
                        alt="CargoHub Logo"
                        width={48}
                        height={48}
                        className="rounded-full object-cover flex-shrink-0 shadow-sm"
                      />
                      <span className="font-display text-xl font-bold">CargoHub</span>
                    </div>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      India&apos;s smart cargo logistics platform. Built for speed, transparency, and trust.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-display font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Product</h4>
                    <div className="space-y-3">
                      <Link href={user ? "/dashboard/book" : "/login"} className="block text-sm hover:underline" style={{ color: "var(--text-secondary)" }}>Book a Truck</Link>
                      <Link href={user ? "/dashboard/track" : "/login"} className="block text-sm hover:underline" style={{ color: "var(--text-secondary)" }}>Track Shipment</Link>
                      <Link href="/b2b-portal" className="block text-sm hover:underline" style={{ color: "var(--text-secondary)" }}>Business Account</Link>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-display font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Company</h4>
                    <div className="space-y-3">
                      <Link href="/developer" className="block text-sm hover:underline" style={{ color: "var(--text-secondary)" }}>Our Team (Panchayat)</Link>
                      <a href="mailto:support@cargohub.in" className="block text-sm hover:underline" style={{ color: "var(--text-secondary)" }}>Contact</a>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-display font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Download</h4>
                    <div className="space-y-3">
                      <Link href="/download" className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                        <Smartphone className="w-4 h-4" /> Android App APK
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="divider mb-8" />
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    © 2026 CargoHub. All rights reserved. Made with ❤️ in India.
                  </p>
                  <div className="flex items-center gap-6">
                    <a href="#" className="text-sm" style={{ color: "var(--text-muted)" }}>Privacy</a>
                    <a href="#" className="text-sm" style={{ color: "var(--text-muted)" }}>Terms</a>
                  </div>
                </div>
              </div>
            </footer>
    </div>
  );
}

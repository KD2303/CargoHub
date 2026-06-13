"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { auth as firebaseAuth } from "@/lib/firebase";
import { io, Socket } from "socket.io-client";
import {
  Truck, MapPin, Power, IndianRupee, Star, Clock,
  Package, ArrowRight, ChevronLeft, Navigation,
  CheckCircle2, AlertTriangle, Upload, FileText,
  TrendingUp, Calendar, Activity, Smartphone, Camera,
  Bell, MapIcon, Zap, CreditCard, MessageSquare, Database,
  Shield, Cloud, Lock, GitBranch, Loader2, X
} from "lucide-react";
import Link from "next/link";
import { toast } from '@/store/toastStore';


const mockEarnings = {
  today: 2450,
  thisWeek: 14800,
  thisMonth: 52300,
  tripCount: 8,
};

const recentTrips = [
  { id: "FA-K8X7YT", pickup: "Hazratganj", drop: "Gomti Nagar", fare: 847, status: "DELIVERED", time: "2:30 PM" },
  { id: "FA-L9M2AB", pickup: "Alambagh", drop: "Chinhat", fare: 1523, status: "DELIVERED", time: "11:15 AM" },
  { id: "FA-N3P5CD", pickup: "Charbagh", drop: "Aliganj", fare: 623, status: "DELIVERED", time: "9:40 AM" },
];

// ── API Tag colors matching fleetora_rbac_workflow ──────────────────────────
const tagStyles: Record<string, { bg: string; color: string; border: string }> = {
  "api-auth": { bg: "#FAEEDA", color: "#854F0B", border: "#F0D0A0" },
  "api-sec": { bg: "#FCEBEB", color: "#A32D2D", border: "#F5B0B0" },
  "api-db": { bg: "#E6F1FB", color: "#185FA5", border: "#B4D6F6" },
  "api-map": { bg: "#E1F5EE", color: "#0F6E56", border: "#A2E2C8" },
  "api-notify": { bg: "#EAF3DE", color: "#3B6D11", border: "#C1DF9E" },
  "api-pay": { bg: "#FAECE7", color: "#993C1D", border: "#F0C4B4" },
  "api-media": { bg: "#E6F1FB", color: "#185FA5", border: "#B4D6F6" },
};

interface ApiTag { label: string; type: keyof typeof tagStyles; icon: React.ReactNode }
interface WorkflowStep {
  num: number;
  title: string;
  desc: string;
  tags: ApiTag[];
  isLast?: boolean;
}

const driverSteps: WorkflowStep[] = [
  {
    num: 1,
    title: "Register / Login",
    desc: "Email / Password auth. Role stored in PostgreSQL.",
    tags: [
      { label: "Firebase Auth", type: "api-auth", icon: <Smartphone className="w-3 h-3" /> },
      { label: "Abstract API", type: "api-sec", icon: <CheckCircle2 className="w-3 h-3" /> },
    ],
  },
  {
    num: 2,
    title: "Complete KYC",
    desc: "Driver uploads Aadhaar, License, RC, Insurance. Images are compressed on device, uploaded to CDN. Status: Pending Admin Approval.",
    tags: [
      { label: "Cloudinary", type: "api-media", icon: <Cloud className="w-3 h-3" /> },
      { label: "Supabase", type: "api-db", icon: <Database className="w-3 h-3" /> },
    ],
  },
  {
    num: 3,
    title: "Go Online & Background GPS",
    desc: "Driver marks online. Background location task starts fetching GPS every 3s. Location cached in Redis to avoid hitting PostgreSQL too hard.",
    tags: [
      { label: "expo-location", type: "api-map", icon: <MapIcon className="w-3 h-3" /> },
      { label: "Upstash Redis (GEOADD)", type: "api-db", icon: <Zap className="w-3 h-3" /> },
    ],
  },
  {
    num: 4,
    title: "Accept & Navigate Job",
    desc: "FCM push wakes device. Driver accepts job. Mapbox navigation SDK starts turn-by-turn. Driver uploads photo of cargo before departure.",
    tags: [
      { label: "FCM Push", type: "api-notify", icon: <Bell className="w-3 h-3" /> },
      { label: "Mapbox Navigation", type: "api-map", icon: <Navigation className="w-3 h-3" /> },
      { label: "Cloudinary", type: "api-media", icon: <Camera className="w-3 h-3" /> },
    ],
  },
  {
    num: 5,
    title: "Job Complete & Payout",
    desc: "Driver taps \"Delivered\". Customer pays. Platform commission (15%) deducted automatically, 85% payout sent instantly to Driver's bank account. SMS confirmation sent.",
    tags: [
      { label: "Razorpay Route", type: "api-pay", icon: <GitBranch className="w-3 h-3" /> },
      { label: "MSG91 SMS", type: "api-auth", icon: <MessageSquare className="w-3 h-3" /> },
    ],
    isLast: true,
  },
];

// ── Sub-components ───────────────────────────────────────────────────────────

function ApiTagBadge({ tag }: { tag: ApiTag }) {
  const s = tagStyles[tag.type];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {tag.icon}
      {tag.label}
    </span>
  );
}

function StepCard({ step, index }: { step: WorkflowStep; index: number }) {
  return (
    <motion.div
      className="flex gap-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.12, duration: 0.5 }}
    >
      {/* Left: dot + line */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 36 }}>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm"
          style={{ background: "#FAECE7", color: "#712B13", border: "1.5px solid #F0C4B4" }}
        >
          {step.num}
        </div>
        {!step.isLast && (
          <div
            className="flex-1 mt-1"
            style={{ width: 2, minHeight: 28, background: "linear-gradient(180deg, #F0C4B4, rgba(240,196,180,0.2))", borderRadius: 2 }}
          />
        )}
      </div>

      {/* Right: card */}
      <div
        className="flex-1 mb-4 rounded-2xl p-5 border transition-all hover:shadow-md"
        style={{
          background: "rgba(255,255,255,0.9)",
          borderColor: "rgba(240,196,180,0.5)",
          boxShadow: "0 2px 12px rgba(114,43,19,0.05)",
        }}
      >
        <p className="font-display font-bold text-base mb-1.5" style={{ color: "#3B1208" }}>
          {step.title}
        </p>
        <p className="text-sm leading-relaxed mb-3" style={{ color: "#6C82AB" }}>
          {step.desc}
        </p>
        <div className="flex flex-wrap gap-2">
          {step.tags.map((t) => <ApiTagBadge key={t.label} tag={t} />)}
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DriverDashboard() {
  const { user } = useAuthStore();
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "earnings" | "kyc" | "workflow">("dashboard");
  const [earnings, setEarnings] = useState(mockEarnings);
  const [statusLoading, setStatusLoading] = useState(false);
  const [incomingBooking, setIncomingBooking] = useState<any>(null);
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !firebaseAuth.currentUser) return;

    // Connect Socket.io
    const socket = io((`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/^http/, "ws")}`), {
      auth: { token: user.firebaseUid }
    });
    socketRef.current = socket;

    socket.on("booking:new", (booking: any) => {
      setIncomingBooking(booking);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleAcceptBooking = () => {
    if (incomingBooking && socketRef.current) {
      socketRef.current.emit("booking:accept", { bookingId: incomingBooking.id });
      toast.success("Booking Accepted!");
      setActiveBooking(incomingBooking);
      setIncomingBooking(null);
    }
  };

  const handleCancelBooking = () => {
    if (confirm("Are you sure you want to cancel this booking? This may affect your rating.")) {
      // Typically call an API to cancel
      setActiveBooking(null);
      toast.error("Booking Cancelled");
    }
  };

  const handleCompleteBooking = () => {
    // Typically call an API to complete
    setActiveBooking(null);
    toast.success("Trip Completed! Earnings updated.");
  };

  useEffect(() => {
    // Attempt to fetch real earnings if authenticated
    const fetchEarnings = async () => {
      if (!user || !firebaseAuth.currentUser) return;
      try {
        const token = await firebaseAuth.currentUser.getIdToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/drivers/${user.firebaseUid}/earnings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success && json.data) {
          setEarnings(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch earnings, using mock data", err);
      }
    };
    fetchEarnings();
  }, [user]);

  const toggleAvailability = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus); // optimistic update

    if (user && firebaseAuth.currentUser) {
      try {
        setStatusLoading(true);
        const token = await firebaseAuth.currentUser.getIdToken();
        const res = await fetch((`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`) + "/api/drivers/availability", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ available: newStatus })
        });
        const json = await res.json();
        if (!json.success) {
          setIsOnline(!newStatus); // revert on failure
          toast.error(json.error || "Failed to update availability");
        }
      } catch (err) {
        console.error("Availability update failed", err);
        setIsOnline(!newStatus); // revert on failure
      } finally {
        setStatusLoading(false);
      }
    }
  };

  const tabs = [
    { key: "dashboard", label: "Dashboard" },
    { key: "earnings", label: "Earnings" },
    { key: "kyc", label: "KYC Status" },
    { key: "workflow", label: "My Workflow" },
  ] as const;

  return (
    <div className="min-h-screen bg-mesh bg-grid" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass" style={{ borderRadius: 0, borderTop: "none", borderLeft: "none", borderRight: "none" }}>
        <div className="container-wide flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] hover:shadow-sm transition-all">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-gray-800">Driver Portal</span>
              <span className={`badge ml-3 font-semibold ${isOnline ? "badge-delivered" : "badge-cancelled"}`} style={{ fontSize: "9px" }}>
                <Activity className="w-3 h-3" /> {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          <button
            onClick={toggleAvailability}
            disabled={statusLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all tracking-wider uppercase disabled:opacity-50"
            style={{
              background: isOnline ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
              color: isOnline ? "var(--brand-success)" : "var(--brand-danger)",
              border: `1px solid ${isOnline ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)"}`,
            }}
          >
            {statusLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
            {isOnline ? "Go Offline" : "Go Online"}
          </button>
        </div>
      </header>

      {/* Incoming Booking Modal */}
      <AnimatePresence>
        {incomingBooking && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-4 right-4 z-50 md:left-1/2 md:-translate-x-1/2 md:w-96"
          >
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-brand-primary overflow-hidden">
              <div className="bg-brand-primary/10 p-4 border-b border-brand-primary/20 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center">
                    <Bell className="w-4 h-4 animate-bounce" />
                  </div>
                  <span className="font-bold text-brand-primary">New Request!</span>
                </div>
                <button onClick={() => setIncomingBooking(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-700">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">Estimated Fare</p>
                    <p className="text-2xl font-mono font-bold text-gray-900">₹{incomingBooking.fareEstimate}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-brand-success mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Pickup</p>
                      <p className="text-sm font-bold text-gray-800 line-clamp-1">{incomingBooking.pickupLocation?.address || "Selected Location"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Navigation className="w-4 h-4 text-brand-secondary mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Dropoff</p>
                      <p className="text-sm font-bold text-gray-800 line-clamp-1">{incomingBooking.dropoffLocation?.address || "Selected Location"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setIncomingBooking(null)} className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                    Reject
                  </button>
                  <button onClick={handleAcceptBooking} className="flex-1 py-3 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-secondary transition-colors shadow-lg shadow-blue-500/30">
                    Accept Request
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Nav */}
      <div className="container-wide py-6">
        <div className="flex gap-2 p-1.5 rounded-2xl border border-gray-200 bg-white/60 backdrop-blur-md overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap tracking-wider"
              style={{
                background: activeTab === tab.key
                  ? (tab.key === "workflow" ? "rgba(255,102,72,0.08)" : "rgba(2, 89, 221, 0.08)")
                  : "transparent",
                color: activeTab === tab.key
                  ? (tab.key === "workflow" ? "var(--brand-secondary)" : "var(--brand-primary)")
                  : "var(--text-secondary)",
                border: activeTab === tab.key
                  ? (tab.key === "workflow" ? "1px solid rgba(255,102,72,0.15)" : "1px solid rgba(2, 89, 221, 0.12)")
                  : "1px solid transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container-wide pb-12">

        {/* ── Dashboard Tab ─────────────────────────────────────────────── */}
        {activeTab === "dashboard" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-sm" style={{ background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))" }}>
                  SK
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Suresh Kumar</h2>
                  <p className="text-sm font-semibold text-gray-400 mt-0.5">Tata Ace · UP32AB1234</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold text-gray-800">4.7</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <span className="text-sm font-semibold text-gray-500">156 trips</span>
                    <span className="badge badge-delivered font-semibold text-[10px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified Profile
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Today's Earnings", value: `₹${earnings.today.toLocaleString()}`, icon: <IndianRupee className="w-5 h-5" />, color: "var(--brand-success)" },
                { label: "Trips Today", value: earnings.tripCount.toString(), icon: <Truck className="w-5 h-5" />, color: "var(--brand-primary)" },
                { label: "This Week", value: `₹${earnings.thisWeek.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, color: "var(--brand-secondary)" },
                { label: "This Month", value: `₹${earnings.thisMonth.toLocaleString()}`, icon: <Calendar className="w-5 h-5" />, color: "var(--brand-accent)" },
              ].map((stat, i) => (
                <motion.div key={stat.label} className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{stat.label}</span>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: `${stat.color}08`, color: stat.color, border: `1px solid ${stat.color}15` }}>
                      {stat.icon}
                    </div>
                  </div>
                  <span className="text-2xl font-mono font-bold tracking-tight text-gray-800">{stat.value}</span>
                </motion.div>
              ))}
            </div>

            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-bold mb-4 tracking-tight" style={{ color: "var(--text-primary)" }}>Your Location</h3>
              <div className="rounded-2xl border border-gray-150/60 overflow-hidden h-64 flex items-center justify-center bg-white/40 relative">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0259dd_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
                <div className="text-center z-10">
                  <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <Navigation className="w-6 h-6 animate-pulse text-[var(--brand-primary)]" />
                  </div>
                  <p className="text-sm font-bold text-gray-700">Live GPS Location Active</p>
                  <p className="text-xs mt-1 font-mono text-gray-500">26.8467° N, 80.9462° E</p>
                </div>
              </div>
            </div>

            {/* Active Booking */}
            {activeBooking && (
              <div className="glass-card p-6 border border-brand-primary/20 bg-brand-primary/5">
                <h3 className="font-display text-lg font-bold mb-4 tracking-tight text-brand-primary flex items-center gap-2">
                  <Truck className="w-5 h-5" /> Active Trip
                </h3>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Booking Ref</p>
                      <p className="font-mono font-bold text-gray-900">{activeBooking.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Est. Fare</p>
                      <p className="font-mono font-bold text-gray-900 text-lg text-emerald-600">₹{activeBooking.fareEstimate}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-brand-success mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Pickup</p>
                        <p className="text-sm font-bold text-gray-800">{activeBooking.pickupLocation?.address || "Selected Location"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Navigation className="w-4 h-4 text-brand-secondary mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Dropoff</p>
                        <p className="text-sm font-bold text-gray-800">{activeBooking.dropoffLocation?.address || "Selected Location"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={handleCancelBooking} className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold bg-red-50 hover:bg-red-100 transition-colors text-sm">
                      Cancel Trip
                    </button>
                    <button onClick={handleCompleteBooking} className="flex-[2] py-2.5 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-secondary transition-colors text-sm">
                      Mark as Delivered
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-bold mb-4 tracking-tight" style={{ color: "var(--text-primary)" }}>Today&apos;s Trips</h3>
              <div className="space-y-4">
                {recentTrips.map((trip) => (
                  <div key={trip.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white/40">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 border border-emerald-100">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold" style={{ color: "var(--brand-primary)" }}>{trip.id}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{trip.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-semibold text-gray-700 truncate">{trip.pickup}</span>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <span className="text-xs font-semibold text-gray-700 truncate">{trip.drop}</span>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-bold text-emerald-600">+₹{trip.fare}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Earnings Tab ──────────────────────────────────────────────── */}
        {activeTab === "earnings" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
            <h2 className="font-display text-2xl font-bold mb-6 tracking-tight text-gray-800">Earnings Overview</h2>
            <div className="text-center p-8 rounded-2xl mb-8 border border-blue-100" style={{ background: "linear-gradient(135deg, rgba(2, 89, 221, 0.06), rgba(132, 175, 251, 0.03))" }}>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">This Month</p>
              <p className="font-mono text-5xl font-bold mt-2 text-gray-800">₹{earnings.thisMonth.toLocaleString()}</p>
              <p className="text-xs font-bold mt-3 text-emerald-600 flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4" /> +18% vs last month
              </p>
            </div>
            <h3 className="font-display text-lg font-bold mb-6 tracking-tight text-gray-800">This Week</h3>
            <div className="flex items-end gap-3.5 h-44 px-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                const heights = [60, 85, 45, 92, 70, 55, 30];
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2.5">
                    <div className="w-full bg-gray-200/50 rounded-t-lg h-full flex flex-col justify-end overflow-hidden">
                      <motion.div
                        className="w-full rounded-t-lg"
                        style={{ background: i === 3 ? "linear-gradient(to top, var(--brand-primary), var(--brand-secondary))" : "linear-gradient(to top, rgba(2, 89, 221, 0.4), rgba(2, 89, 221, 0.2))" }}
                        initial={{ height: 0 }}
                        animate={{ height: `${heights[i]}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{day}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── KYC Tab ───────────────────────────────────────────────────── */}
        {activeTab === "kyc" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-emerald-50 border border-emerald-100 shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="font-display text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>KYC Verified</h2>
              <p className="text-sm font-medium text-gray-500 mt-1.5">Your documents have been verified. You can accept bookings.</p>
            </div>
            {[
              { name: "Aadhaar Card" },
              { name: "Driving License" },
              { name: "Vehicle RC" },
              { name: "Vehicle Photo" },
            ].map((doc) => (
              <div key={doc.name} className="glass-card p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 border border-emerald-100 shadow-sm">
                  <FileText className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{doc.name}</p>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">Uploaded &amp; verified</p>
                </div>
                <span className="badge badge-delivered font-semibold text-[10px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Workflow Tab ──────────────────────────────────────────────── */}
        {activeTab === "workflow" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Header card */}
            <div
              className="rounded-3xl p-6 md:p-8 border relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #FAECE7 0%, #FFF5F2 60%, #FAECE7 100%)",
                borderColor: "#F0C4B4",
              }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2" style={{ background: "#FF6648" }} />
              <div className="relative z-10">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 border"
                  style={{ background: "#FAECE7", color: "#712B13", borderColor: "#F0C4B4" }}
                >
                  <Truck className="w-3.5 h-3.5" /> Driver Role · Mobile App Only
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold mb-2 tracking-tight" style={{ color: "#3B1208" }}>
                  Driver API Workflow
                </h2>
                <p className="text-sm leading-relaxed max-w-lg" style={{ color: "#7A4030" }}>
                  End-to-end journey of a CargoHub driver — from onboarding and KYC to job acceptance,
                  live GPS navigation, and instant payout. Every step is powered by a specific set of APIs.
                </p>

                {/* Platform badge */}
                <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border" style={{ background: "rgba(255,255,255,0.7)", borderColor: "#F0C4B4", color: "#712B13" }}>
                  <Smartphone className="w-4 h-4" /> Mobile App Only
                </div>
              </div>
            </div>

            {/* Step-by-step flow */}
            <div className="glass-card p-6 md:p-8">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-6" style={{ color: "var(--text-muted)" }}>
                Workflow — Powered by APIs
              </p>
              <div>
                {driverSteps.map((step, i) => (
                  <StepCard key={step.num} step={step} index={i} />
                ))}
              </div>
            </div>

            {/* Payout highlight */}
            <div
              className="rounded-2xl p-6 border flex flex-col md:flex-row md:items-center gap-4"
              style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.06), rgba(16,185,129,0.02))", borderColor: "rgba(16,185,129,0.15)" }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.1)", color: "var(--brand-success)" }}>
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <p className="font-display font-bold text-base" style={{ color: "var(--text-primary)" }}>Instant 85% Payout</p>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  Platform deducts 15% commission automatically. Remaining 85% is transferred to your linked bank account
                  via <strong>Razorpay Route</strong> within seconds of delivery confirmation.
                </p>
              </div>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
}


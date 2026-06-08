"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Truck, MapPin, Power, IndianRupee, Star, Clock,
  Package, ArrowRight, ChevronLeft, Navigation,
  CheckCircle2, AlertTriangle, Upload, FileText,
  TrendingUp, Calendar, Activity,
} from "lucide-react";

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

export default function DriverDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "earnings" | "kyc">("dashboard");

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass" style={{ borderRadius: 0, borderTop: "none", borderLeft: "none", borderRight: "none" }}>
        <div className="container-wide flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <a href="/" className="btn-icon" style={{ width: 32, height: 32 }}>
              <ChevronLeft className="w-4 h-4" />
            </a>
            <div>
              <span className="font-display text-lg font-bold">Driver Portal</span>
              <span className={`badge ml-2 ${isOnline ? "badge-delivered" : "badge-cancelled"}`} style={{ fontSize: "9px" }}>
                <Activity className="w-3 h-3" /> {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          {/* Online toggle */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: isOnline ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
              color: isOnline ? "var(--brand-success)" : "var(--brand-danger)",
              border: `1px solid ${isOnline ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            }}
          >
            <Power className="w-4 h-4" />
            {isOnline ? "Go Offline" : "Go Online"}
          </button>
        </div>
      </header>

      {/* Tab Nav */}
      <div className="container-wide py-4">
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: "var(--bg-secondary)" }}>
          {(["dashboard", "earnings", "kyc"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize"
              style={{
                background: activeTab === tab ? "var(--brand-primary)" : "transparent",
                color: activeTab === tab ? "white" : "var(--text-muted)",
              }}
            >
              {tab === "kyc" ? "KYC Status" : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="container-wide pb-8">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Driver profile card */}
            <div className="card">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold" style={{ background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))", color: "white" }}>
                  SK
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>Suresh Kumar</h2>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Tata Ace · UP32AB1234</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>4.7</span>
                    </div>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>·</span>
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>156 trips</span>
                    <span className="badge badge-verified" style={{ fontSize: "10px" }}>
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Today's Earnings", value: `₹${mockEarnings.today.toLocaleString()}`, icon: <IndianRupee className="w-5 h-5" />, color: "var(--brand-success)" },
                { label: "Trips Today", value: mockEarnings.tripCount.toString(), icon: <Truck className="w-5 h-5" />, color: "var(--brand-primary)" },
                { label: "This Week", value: `₹${mockEarnings.thisWeek.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, color: "var(--brand-secondary)" },
                { label: "This Month", value: `₹${mockEarnings.thisMonth.toLocaleString()}`, icon: <Calendar className="w-5 h-5" />, color: "var(--brand-accent)" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="stat-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="stat-label">{stat.label}</span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15`, color: stat.color }}>
                      {stat.icon}
                    </div>
                  </div>
                  <span className="stat-value" style={{ fontSize: 22 }}>{stat.value}</span>
                </motion.div>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="card">
              <h3 className="font-display text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>Your Location</h3>
              <div className="rounded-xl overflow-hidden h-64 flex items-center justify-center" style={{ background: "var(--bg-tertiary)" }}>
                <div className="text-center">
                  <Navigation className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--brand-primary)", opacity: 0.5 }} />
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Live map with your GPS location</p>
                  <p className="text-xs mt-1 font-mono" style={{ color: "var(--text-secondary)" }}>26.8467°N, 80.9462°E</p>
                </div>
              </div>
            </div>

            {/* Recent Trips */}
            <div className="card">
              <h3 className="font-display text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>Today&apos;s Trips</h3>
              <div className="space-y-3">
                {recentTrips.map((trip) => (
                  <div key={trip.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: "var(--bg-tertiary)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(16, 185, 129, 0.15)" }}>
                      <CheckCircle2 className="w-5 h-5" style={{ color: "var(--brand-success)" }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold" style={{ color: "var(--brand-primary-light)" }}>{trip.id}</span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{trip.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3 h-3" style={{ color: "var(--brand-primary)" }} />
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{trip.pickup}</span>
                        <ArrowRight className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{trip.drop}</span>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-bold" style={{ color: "var(--brand-success)" }}>+₹{trip.fare}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Earnings Tab */}
        {activeTab === "earnings" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h2 className="font-display text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
              💰 Earnings Overview
            </h2>
            <div className="text-center p-8 rounded-xl mb-6" style={{ background: "linear-gradient(135deg, rgba(2, 89, 221, 0.1), rgba(132, 175, 251, 0.05))" }}>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>This Month</p>
              <p className="font-mono text-5xl font-bold gradient-text mt-2">₹{mockEarnings.thisMonth.toLocaleString()}</p>
              <p className="text-sm mt-2" style={{ color: "var(--brand-success)" }}>
                <TrendingUp className="w-4 h-4 inline" /> +18% vs last month
              </p>
            </div>

            {/* Weekly bar chart mock */}
            <h3 className="font-display font-bold mb-4" style={{ color: "var(--text-primary)" }}>This Week</h3>
            <div className="flex items-end gap-3 h-40">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                const heights = [60, 85, 45, 92, 70, 55, 30];
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      className="w-full rounded-t-lg"
                      style={{ background: i === 3 ? "var(--brand-primary)" : "rgba(2, 89, 221, 0.3)" }}
                      initial={{ height: 0 }}
                      animate={{ height: `${heights[i]}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                    />
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{day}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* KYC Tab */}
        {activeTab === "kyc" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="card text-center">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(16, 185, 129, 0.15)" }}>
                <CheckCircle2 className="w-8 h-8" style={{ color: "var(--brand-success)" }} />
              </div>
              <h2 className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>KYC Verified</h2>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Your documents have been verified. You can accept bookings.</p>
            </div>

            {[
              { name: "Aadhaar Card", status: "verified", icon: <FileText className="w-5 h-5" /> },
              { name: "Driving License", status: "verified", icon: <FileText className="w-5 h-5" /> },
              { name: "Vehicle RC", status: "verified", icon: <FileText className="w-5 h-5" /> },
              { name: "Vehicle Photo", status: "verified", icon: <FileText className="w-5 h-5" /> },
            ].map((doc) => (
              <div key={doc.name} className="card flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--brand-success)" }}>
                  {doc.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{doc.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Uploaded & verified</p>
                </div>
                <span className="badge badge-verified" style={{ fontSize: "10px" }}>
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

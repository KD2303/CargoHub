"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Truck, Package, Users, ArrowRight, ChevronLeft,
  IndianRupee, Navigation, Clock, AlertCircle, CheckCircle2,
  Minus, Plus, Info, Zap,
} from "lucide-react";
import Link from "next/link";
import { VEHICLE_CONFIG, LOAD_CONFIG, FARE_CONSTANTS } from "@cargohub/shared";
import { calculateSmartFare, formatCurrency } from "@cargohub/shared";
import type { VehicleType, LoadType, FareBreakdown } from "@cargohub/shared";

import { useAuthStore } from "@/store/authStore";

const vehicleTypes = Object.entries(VEHICLE_CONFIG) as [VehicleType, typeof VEHICLE_CONFIG[VehicleType]][];
const loadTypes = Object.entries(LOAD_CONFIG) as [LoadType, typeof LOAD_CONFIG[LoadType]][];

export default function BookingPage() {
  const { user, loading } = useAuthStore();
  const [step, setStep] = useState(1);
  const [pickup, setPickup] = useState("Hazratganj, Lucknow");
  const [drop, setDrop] = useState("Gomti Nagar, Lucknow");
  const [vehicle, setVehicle] = useState<VehicleType>("TATA_ACE");
  const [loadType, setLoadType] = useState<LoadType>("BOXES_CARTONS");
  const [helpers, setHelpers] = useState(0);
  const [fare, setFare] = useState<FareBreakdown | null>(null);

  // Calculate fare when moving to step 3
  const handleCalculateFare = () => {
    const result = calculateSmartFare({
      pickupLat: 26.8467,
      pickupLng: 80.9462,
      dropLat: 26.8722,
      dropLng: 80.9908,
      vehicleType: vehicle,
      loadType,
      helpersRequested: helpers,
    });
    setFare(result);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-mesh bg-grid" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass" style={{ borderRadius: 0, borderTop: "none", borderLeft: "none", borderRight: "none" }}>
        <div className="container-wide flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <Link href="/" className="w-10 h-10 rounded-xl bg-white border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] hover:shadow-sm transition-all">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <span className="font-display text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Book a Truck</span>
          </div>
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-sm" style={{
                  background: step >= s ? "var(--brand-primary)" : "var(--bg-secondary)",
                  color: step >= s ? "white" : "var(--text-muted)",
                  border: step >= s ? "1px solid var(--brand-primary)" : "1px solid var(--border-subtle)"
                }}>
                  {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                {s < 3 && <div className="w-10 h-0.5 rounded-full" style={{ background: step > s ? "var(--brand-primary)" : "var(--border-subtle)" }} />}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="container-wide py-12">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-8 h-8 rounded-full border-4 border-[var(--brand-primary)] border-t-transparent animate-spin"></div>
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">Login Required</h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-md text-center leading-relaxed">
              You need to be logged in to book a vehicle. Please log in or create a new account to proceed with your booking.
            </p>
            <div className="flex gap-4">
              <Link href="/login?redirect=/book" className="px-8 py-3 bg-[var(--brand-primary)] text-white font-bold rounded-xl shadow-md hover:-translate-y-0.5 transition-all">
                Log In
              </Link>
              <Link href="/register?redirect=/book" className="px-8 py-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold rounded-xl hover:bg-[var(--bg-tertiary)] transition-all">
                Create Account
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Locations */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass-card p-8"
                >
                  <h2 className="font-display text-2xl font-bold mb-8 flex items-center gap-3" style={{ color: "var(--text-primary)" }}>
                    <span className="w-8 h-8 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center text-sm">📍</span>
                    Set Pickup & Drop-off
                  </h2>

                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6 items-center relative">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Pickup Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--brand-primary)]" />
                          <input
                            value={pickup}
                            onChange={(e) => setPickup(e.target.value)}
                            className="input-field pl-12 h-14 bg-white/70"
                            placeholder="Enter pickup address"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Drop-off Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--brand-secondary)]" />
                          <input
                            value={drop}
                            onChange={(e) => setDrop(e.target.value)}
                            className="input-field pl-12 h-14 bg-white/70"
                            placeholder="Enter drop-off address"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Editorial Route Map Mockup Frame */}
                    <div className="relative rounded-2xl overflow-hidden h-72 border-2 border-dashed border-[#FF6648]/20 bg-[#FFF5EF] flex flex-col items-center justify-center p-6 text-center group hover:border-[#0259DD]/30 transition-all duration-300">
                      <div className="absolute inset-0 bg-grid opacity-[0.03]" />
                      
                      {/* Elegant Map Representation */}
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
                        <div className="absolute w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-[#FF6648]/8 to-[#0259DD]/4 filter blur-xl" />
                        
                        {/* Interactive route path dot indicator */}
                        <div className="absolute w-[70%] h-[50%]">
                          <svg className="w-full h-full" viewBox="0 0 200 100" fill="none">
                            <path d="M30 65 Q 100 20, 170 45" stroke="#0259DD" strokeWidth="2" strokeDasharray="4 4" />
                            <circle cx="170" cy="45" r="4.5" fill="#0259DD" />
                            <circle cx="30" cy="65" r="4.5" fill="#FF6648" />
                          </svg>
                        </div>
                        
                        {/* Hazratganj Marker label */}
                        <div className="absolute left-[8%] bottom-[20%] bg-white px-2.5 py-1.5 rounded-lg border border-gray-100 shadow-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6648]" />
                          <span className="text-[10px] font-bold text-gray-800">Hazratganj</span>
                        </div>

                        {/* Gomti Nagar Marker label */}
                        <div className="absolute right-[12%] top-[30%] bg-white px-2.5 py-1.5 rounded-lg border border-gray-100 shadow-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0259DD]" />
                          <span className="text-[10px] font-bold text-gray-800">Gomti Nagar</span>
                        </div>
                      </div>

                      {/* Map information container overlay */}
                      <div className="relative z-10 bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-gray-100 shadow-md max-w-xs">
                        <Navigation className="w-8 h-8 mx-auto mb-2 text-[var(--brand-primary)]" />
                        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Map Route Preview</h4>
                        <p className="text-[10px] text-gray-500 mt-1">Route automatically optimized for lowest tolls & quickest delivery time.</p>
                        <p className="text-[11px] mt-2 font-semibold text-gray-700">Estimated distance: <span className="font-mono font-bold text-[var(--brand-primary)]">12.4 km</span></p>
                      </div>
                    </div>

                    <button
                      onClick={() => setStep(2)}
                      className="btn-primary w-full h-14 text-base font-semibold"
                      disabled={!pickup || !drop}
                    >
                      Continue <ArrowRight className="w-5 h-5 ml-1" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Vehicle & Load */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Vehicle Selection */}
                  <div className="glass-card p-8">
                    <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: "var(--text-primary)" }}>
                      <span className="w-8 h-8 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center text-sm">🚛</span>
                      Choose Vehicle
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vehicleTypes.map(([type, config]) => (
                        <button
                          key={type}
                          onClick={() => setVehicle(type)}
                          className="p-5 rounded-2xl text-left transition-all relative overflow-hidden group"
                          style={{
                            background: vehicle === type ? "white" : "rgba(255,255,255,0.4)",
                            border: vehicle === type ? "2px solid var(--brand-primary)" : "2px solid rgba(255,255,255,0.7)",
                            boxShadow: vehicle === type ? "0 10px 25px -5px rgba(2, 89, 221, 0.12)" : "none",
                          }}
                        >
                          <span className="text-4xl block mb-3">{config.icon}</span>
                          <p className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>{config.label}</p>
                          <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{config.description}</p>
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100/60">
                            <span className="badge font-semibold" style={{ background: "rgba(2, 89, 221, 0.08)", color: "var(--brand-primary)", fontSize: "10px" }}>{config.capacity}</span>
                            <span className="font-mono text-sm font-bold" style={{ color: "var(--brand-primary)" }}>₹{config.baseFare}+</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Load Type */}
                  <div className="glass-card p-8">
                    <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: "var(--text-primary)" }}>
                      <span className="w-8 h-8 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center text-sm">📦</span>
                      What are you shipping?
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {loadTypes.map(([type, config]) => (
                        <button
                          key={type}
                          onClick={() => setLoadType(type)}
                          className="p-4 rounded-xl text-center transition-all flex flex-col items-center justify-center"
                          style={{
                            background: loadType === type ? "white" : "rgba(255,255,255,0.4)",
                            border: loadType === type ? "2px solid var(--brand-primary)" : "2px solid rgba(255,255,255,0.7)",
                            boxShadow: loadType === type ? "0 4px 12px rgba(2, 89, 221, 0.08)" : "none",
                          }}
                        >
                          <span className="text-3xl block mb-2">{config.icon}</span>
                          <p className="text-xs font-semibold" style={{ color: loadType === type ? "var(--brand-primary)" : "var(--text-secondary)" }}>{config.label}</p>
                          {config.surchargePercent > 0 && (
                            <p className="text-[10px] mt-1 font-mono font-bold" style={{ color: "var(--brand-accent)" }}>+{config.surchargePercent}% surcharge</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Helpers */}
                  <div className="glass-card p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="font-display text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                          👷 Need Helpers?
                        </h2>
                        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                          ₹{FARE_CONSTANTS.HELPER_CHARGE_PER_PERSON} per helper for loading/unloading
                        </p>
                      </div>
                      <div className="flex items-center gap-4 bg-white/60 p-2 rounded-xl border border-white/80 self-end md:self-auto">
                        <button
                          onClick={() => setHelpers(Math.max(0, helpers - 1))}
                          className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:text-[var(--brand-primary)] transition-all"
                          disabled={helpers === 0}
                          style={{ opacity: helpers === 0 ? 0.4 : 1 }}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-mono text-2xl font-bold w-8 text-center" style={{ color: "var(--text-primary)" }}>{helpers}</span>
                        <button
                          onClick={() => setHelpers(Math.min(3, helpers + 1))}
                          className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:text-[var(--brand-primary)] transition-all"
                          disabled={helpers === 3}
                          style={{ opacity: helpers === 3 ? 0.4 : 1 }}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="btn-secondary flex-1 h-14 font-semibold" style={{ padding: "14px" }}>
                      Back
                    </button>
                    <button onClick={handleCalculateFare} className="btn-primary flex-1 h-14 font-semibold" style={{ padding: "14px" }}>
                      Get Fare Estimate <ArrowRight className="w-5 h-5 ml-1" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirm */}
              {step === 3 && fare && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass-card p-8"
                >
                  <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: "var(--text-primary)" }}>
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-sm">✓</span>
                    Confirm Booking
                  </h2>

                  {/* Route summary */}
                  <div className="p-5 rounded-2xl mb-6 border border-gray-150" style={{ background: "rgba(255,255,255,0.4)" }}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-3.5 h-3.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "var(--brand-primary)" }} />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>PICKUP</p>
                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{pickup}</p>
                      </div>
                    </div>
                    <div className="w-px h-6 ml-1.5 border-l-2 border-dashed border-gray-300" />
                    <div className="flex items-start gap-3 mt-3">
                      <div className="w-3.5 h-3.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "var(--brand-secondary)" }} />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>DROP-OFF</p>
                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{drop}</p>
                      </div>
                    </div>
                  </div>

                  {/* Booking details */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 rounded-xl border border-gray-150" style={{ background: "rgba(255,255,255,0.4)" }}>
                      <span className="text-3xl block mb-1">{VEHICLE_CONFIG[vehicle].icon}</span>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-2">{VEHICLE_CONFIG[vehicle].label}</p>
                    </div>
                    <div className="text-center p-4 rounded-xl border border-gray-150" style={{ background: "rgba(255,255,255,0.4)" }}>
                      <span className="text-3xl block mb-1">{LOAD_CONFIG[loadType].icon}</span>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-2">{LOAD_CONFIG[loadType].label}</p>
                    </div>
                    <div className="text-center p-4 rounded-xl border border-gray-150" style={{ background: "rgba(255,255,255,0.4)" }}>
                      <span className="text-3xl block mb-1">👷</span>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-2">{helpers} helper{helpers !== 1 ? "s" : ""}</p>
                    </div>
                  </div>

                  {/* Fare breakdown */}
                  <div className="rounded-2xl p-5 space-y-4 mb-6 border border-gray-150" style={{ background: "rgba(255,255,255,0.5)" }}>
                    <h3 className="font-display text-sm font-bold flex items-center gap-2 pb-2 border-b border-gray-100" style={{ color: "var(--text-primary)" }}>
                      <IndianRupee className="w-4 h-4" /> Fare Breakdown
                    </h3>
                    <div className="space-y-2.5">
                      {[
                        { label: "Base fare", value: fare.base },
                        { label: `Distance (${fare.distanceKm} km)`, value: fare.distanceCharge },
                        { label: "Load surcharge", value: fare.loadSurcharge },
                        { label: `Helpers (${helpers})`, value: fare.helperCharge },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                          <span className="font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{formatCurrency(item.value)}</span>
                        </div>
                      ))}
                      {fare.surgeMultiplier > 1 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center gap-1 font-semibold" style={{ color: "var(--brand-accent)" }}>
                            <Zap className="w-3.5 h-3.5" /> Surge ({fare.surgeMultiplier}x)
                          </span>
                          <span className="font-mono text-sm font-semibold" style={{ color: "var(--brand-accent)" }}>Applied</span>
                        </div>
                      )}
                      <div className="divider" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Subtotal</span>
                        <span className="font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{formatCurrency(fare.subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span style={{ color: "var(--text-secondary)" }}>Weight Charge</span>
                        <span className="font-semibold">{formatCurrency(fare.weightCharge || 0)}</span>
                      </div>
                      <div className="divider" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>GST (18%)</span>
                        <span className="font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{formatCurrency(fare.gst)}</span>
                      </div>
                      <div className="divider" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-800" style={{ color: "var(--text-primary)" }}>Total</span>
                        <span className="font-mono text-2xl font-extrabold text-[var(--brand-primary)]">{formatCurrency(fare.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setStep(2)} className="btn-secondary flex-1 h-14 font-semibold" style={{ padding: "14px" }}>
                      Back
                    </button>
                    <button className="btn-primary flex-1 h-14 font-semibold" style={{ padding: "14px" }}>
                      Confirm Booking <ArrowRight className="w-5 h-5 ml-1" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Summary */}
          <div className="hidden lg:block">
            <div className="glass-card p-6 sticky top-28">
              <h3 className="font-display text-lg font-bold mb-4 pb-2 border-b border-gray-100" style={{ color: "var(--text-primary)" }}>Booking Summary</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 flex-shrink-0 text-[var(--brand-primary)]" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>From</p>
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{pickup || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 flex-shrink-0 text-[var(--brand-secondary)]" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>To</p>
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{drop || "—"}</p>
                  </div>
                </div>

                <div className="divider" />

                <div className="flex items-center gap-3">
                  <Truck className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{VEHICLE_CONFIG[vehicle].label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{LOAD_CONFIG[loadType].label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{helpers} helper{helpers !== 1 ? "s" : ""}</span>
                </div>

                {fare && (
                  <>
                    <div className="divider" />
                    <div className="p-4 rounded-xl text-center border border-[#0259DD]/20 bg-[#0259DD]/5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">ESTIMATED TOTAL</p>
                      <p className="font-mono text-3xl font-extrabold text-[var(--brand-primary)]">{formatCurrency(fare.total)}</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">incl. 18% GST & Tolls</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

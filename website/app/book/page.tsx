"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Truck, Package, Users, ArrowRight, ChevronLeft,
  IndianRupee, Navigation, Clock, AlertCircle, CheckCircle2,
  Minus, Plus, Info, Zap,
} from "lucide-react";
import { VEHICLE_CONFIG, LOAD_CONFIG, FARE_CONSTANTS } from "@cargohub/shared";
import { calculateFare, formatCurrency } from "@cargohub/shared";
import type { VehicleType, LoadType, FareBreakdown } from "@cargohub/shared";

const vehicleTypes = Object.entries(VEHICLE_CONFIG) as [VehicleType, typeof VEHICLE_CONFIG[VehicleType]][];
const loadTypes = Object.entries(LOAD_CONFIG) as [LoadType, typeof LOAD_CONFIG[LoadType]][];

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [pickup, setPickup] = useState("Hazratganj, Lucknow");
  const [drop, setDrop] = useState("Gomti Nagar, Lucknow");
  const [vehicle, setVehicle] = useState<VehicleType>("TATA_ACE");
  const [loadType, setLoadType] = useState<LoadType>("BOXES_CARTONS");
  const [helpers, setHelpers] = useState(0);
  const [fare, setFare] = useState<FareBreakdown | null>(null);

  // Calculate fare when moving to step 3
  const handleCalculateFare = () => {
    const result = calculateFare({
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
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass" style={{ borderRadius: 0, borderTop: "none", borderLeft: "none", borderRight: "none" }}>
        <div className="container-wide flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <a href="/" className="btn-icon" style={{ width: 32, height: 32 }}>
              <ChevronLeft className="w-4 h-4" />
            </a>
            <span className="font-display text-lg font-bold">Book a Truck</span>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all" style={{
                  background: step >= s ? "var(--brand-primary)" : "var(--bg-tertiary)",
                  color: step >= s ? "white" : "var(--text-muted)",
                }}>
                  {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                {s < 3 && <div className="w-8 h-0.5 rounded" style={{ background: step > s ? "var(--brand-primary)" : "var(--border-subtle)" }} />}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="container-wide py-8">
        <div className="grid lg:grid-cols-3 gap-8">
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
                  className="card"
                >
                  <h2 className="font-display text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
                    📍 Set Pickup & Drop-off
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Pickup Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--brand-primary)" }} />
                        <input
                          value={pickup}
                          onChange={(e) => setPickup(e.target.value)}
                          className="input-field pl-11"
                          placeholder="Enter pickup address"
                        />
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }}>
                        <ArrowRight className="w-4 h-4 rotate-90" style={{ color: "var(--text-muted)" }} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Drop-off Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--brand-success)" }} />
                        <input
                          value={drop}
                          onChange={(e) => setDrop(e.target.value)}
                          className="input-field pl-11"
                          placeholder="Enter drop-off address"
                        />
                      </div>
                    </div>

                    {/* Mock map placeholder */}
                    <div className="rounded-xl overflow-hidden h-64 flex items-center justify-center" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }}>
                      <div className="text-center">
                        <Navigation className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--brand-primary)", opacity: 0.5 }} />
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Map will load here with Mapbox GL</p>
                        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Estimated distance: <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>12.4 km</span></p>
                      </div>
                    </div>

                    <button
                      onClick={() => setStep(2)}
                      className="btn-primary w-full"
                      style={{ padding: "14px" }}
                      disabled={!pickup || !drop}
                    >
                      Continue <ArrowRight className="w-5 h-5" />
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
                  <div className="card">
                    <h2 className="font-display text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
                      🚛 Choose Vehicle
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {vehicleTypes.map(([type, config]) => (
                        <button
                          key={type}
                          onClick={() => setVehicle(type)}
                          className="p-4 rounded-xl text-left transition-all"
                          style={{
                            background: vehicle === type ? "rgba(2, 89, 221, 0.1)" : "var(--bg-tertiary)",
                            border: vehicle === type ? "2px solid var(--brand-primary)" : "2px solid var(--border-subtle)",
                          }}
                        >
                          <span className="text-3xl block mb-2">{config.icon}</span>
                          <p className="font-display font-bold" style={{ color: "var(--text-primary)" }}>{config.label}</p>
                          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{config.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="badge badge-delivered" style={{ fontSize: "10px" }}>{config.capacity}</span>
                            <span className="font-mono text-sm font-bold" style={{ color: "var(--brand-primary-light)" }}>₹{config.baseFare}+</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Load Type */}
                  <div className="card">
                    <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                      📦 What are you shipping?
                    </h2>
                    <div className="grid grid-cols-3 gap-3">
                      {loadTypes.map(([type, config]) => (
                        <button
                          key={type}
                          onClick={() => setLoadType(type)}
                          className="p-3 rounded-xl text-center transition-all"
                          style={{
                            background: loadType === type ? "rgba(2, 89, 221, 0.1)" : "var(--bg-tertiary)",
                            border: loadType === type ? "2px solid var(--brand-primary)" : "2px solid var(--border-subtle)",
                          }}
                        >
                          <span className="text-2xl block mb-1">{config.icon}</span>
                          <p className="text-xs font-medium" style={{ color: loadType === type ? "var(--brand-primary-light)" : "var(--text-secondary)" }}>{config.label}</p>
                          {config.surchargePercent > 0 && (
                            <p className="text-xs mt-1 font-mono" style={{ color: "var(--brand-accent)" }}>+{config.surchargePercent}%</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Helpers */}
                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                          👷 Need Helpers?
                        </h2>
                        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                          ₹{FARE_CONSTANTS.HELPER_CHARGE_PER_PERSON} per helper for loading/unloading
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setHelpers(Math.max(0, helpers - 1))}
                          className="btn-icon"
                          disabled={helpers === 0}
                          style={{ opacity: helpers === 0 ? 0.3 : 1 }}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-mono text-2xl font-bold w-8 text-center" style={{ color: "var(--text-primary)" }}>{helpers}</span>
                        <button
                          onClick={() => setHelpers(Math.min(3, helpers + 1))}
                          className="btn-icon"
                          disabled={helpers === 3}
                          style={{ opacity: helpers === 3 ? 0.3 : 1 }}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="btn-secondary flex-1" style={{ padding: "14px" }}>
                      Back
                    </button>
                    <button onClick={handleCalculateFare} className="btn-primary flex-1" style={{ padding: "14px" }}>
                      Get Fare Estimate <ArrowRight className="w-5 h-5" />
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
                  className="card"
                >
                  <h2 className="font-display text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
                    ✅ Confirm Booking
                  </h2>

                  {/* Route summary */}
                  <div className="p-4 rounded-xl mb-6" style={{ background: "var(--bg-tertiary)" }}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ background: "var(--brand-primary)" }} />
                      <div>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>PICKUP</p>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{pickup}</p>
                      </div>
                    </div>
                    <div className="w-px h-4 ml-1.5" style={{ background: "var(--border-subtle)" }} />
                    <div className="flex items-start gap-3 mt-3">
                      <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ background: "var(--brand-success)" }} />
                      <div>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>DROP-OFF</p>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{drop}</p>
                      </div>
                    </div>
                  </div>

                  {/* Booking details */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 rounded-xl" style={{ background: "var(--bg-tertiary)" }}>
                      <span className="text-2xl block mb-1">{VEHICLE_CONFIG[vehicle].icon}</span>
                      <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{VEHICLE_CONFIG[vehicle].label}</p>
                    </div>
                    <div className="text-center p-3 rounded-xl" style={{ background: "var(--bg-tertiary)" }}>
                      <span className="text-2xl block mb-1">{LOAD_CONFIG[loadType].icon}</span>
                      <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{LOAD_CONFIG[loadType].label}</p>
                    </div>
                    <div className="text-center p-3 rounded-xl" style={{ background: "var(--bg-tertiary)" }}>
                      <span className="text-2xl block mb-1">👷</span>
                      <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{helpers} helper{helpers !== 1 ? "s" : ""}</p>
                    </div>
                  </div>

                  {/* Fare breakdown */}
                  <div className="rounded-xl p-4 space-y-3 mb-6" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }}>
                    <h3 className="font-display text-sm font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                      <IndianRupee className="w-4 h-4" /> Fare Breakdown
                    </h3>
                    <div className="space-y-2">
                      {[
                        { label: "Base fare", value: fare.base },
                        { label: `Distance (${fare.distanceKm} km)`, value: fare.distanceCharge },
                        { label: "Load surcharge", value: fare.loadSurcharge },
                        { label: `Helpers (${helpers})`, value: fare.helperCharge },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                          <span className="font-mono text-sm" style={{ color: "var(--text-primary)" }}>{formatCurrency(item.value)}</span>
                        </div>
                      ))}
                      {fare.surgeMultiplier > 1 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center gap-1" style={{ color: "var(--brand-accent)" }}>
                            <Zap className="w-3.5 h-3.5" /> Surge ({fare.surgeMultiplier}x)
                          </span>
                          <span className="font-mono text-sm" style={{ color: "var(--brand-accent)" }}>Applied</span>
                        </div>
                      )}
                      <div className="divider" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Subtotal</span>
                        <span className="font-mono text-sm" style={{ color: "var(--text-primary)" }}>{formatCurrency(fare.subtotal)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>GST (18%)</span>
                        <span className="font-mono text-sm" style={{ color: "var(--text-primary)" }}>{formatCurrency(fare.gst)}</span>
                      </div>
                      <div className="divider" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold" style={{ color: "var(--text-primary)" }}>Total</span>
                        <span className="font-mono text-xl font-bold gradient-text">{formatCurrency(fare.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setStep(2)} className="btn-secondary flex-1" style={{ padding: "14px" }}>
                      Back
                    </button>
                    <button className="btn-primary flex-1" style={{ padding: "14px" }}>
                      Confirm Booking <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Summary */}
          <div className="hidden lg:block">
            <div className="card sticky top-20">
              <h3 className="font-display text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>Booking Summary</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "var(--brand-primary)" }} />
                  <div className="min-w-0">
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>From</p>
                    <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>{pickup || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "var(--brand-success)" }} />
                  <div className="min-w-0">
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>To</p>
                    <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>{drop || "—"}</p>
                  </div>
                </div>

                <div className="divider" />

                <div className="flex items-center gap-3">
                  <Truck className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{VEHICLE_CONFIG[vehicle].label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{LOAD_CONFIG[loadType].label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{helpers} helper{helpers !== 1 ? "s" : ""}</span>
                </div>

                {fare && (
                  <>
                    <div className="divider" />
                    <div className="p-4 rounded-xl text-center" style={{ background: "linear-gradient(135deg, rgba(2, 89, 221, 0.1), rgba(132, 175, 251, 0.05))" }}>
                      <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>ESTIMATED TOTAL</p>
                      <p className="font-mono text-3xl font-bold gradient-text">{formatCurrency(fare.total)}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>incl. 18% GST</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

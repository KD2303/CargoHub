"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Package, MapPin, Navigation, ArrowRight } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import LocationAutocomplete from "./LocationAutocomplete";

export default function QuickBookCard() {
  const [showEstimate, setShowEstimate] = useState(false);
  const [vehicle, setVehicle] = useState("tempo");
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [weight, setWeight] = useState<string>("");
  const [fareData, setFareDataLocal] = useState<{ total: number; distanceKm: number; durationMin: number } | null>(null);

  const { pickup, dropoff, setVehicle: setStoreVehicle, setWeight: setStoreWeight, setFareData: setStoreFareData } = useBookingStore();

  // Reset estimate if inputs change
  useEffect(() => {
    setShowEstimate(false);
  }, [pickup, dropoff, vehicle, weight]);

  const getVehicleEnum = (v: string) => {
    if (v === "mini") return "TATA_ACE";
    if (v === "tempo") return "TEMPO_407";
    return "LARGE_TRUCK";
  };

  const handleEstimate = async () => {
    if (!pickup || !dropoff) {
      alert("Please select both pickup and dropoff locations first.");
      return;
    }
    
    setEstimating(true);
    try {
      const res = await fetch("http://localhost:5000/api/fare/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupLat: pickup.lat,
          pickupLng: pickup.lng,
          dropLat: dropoff.lat,
          dropLng: dropoff.lng,
          vehicleType: getVehicleEnum(vehicle),
          loadType: "BOXES_CARTONS",
          helpersRequested: 0,
          weight: weight ? Number(weight) : undefined,
        })
      });
      
      const data = await res.json();
      if (data.success && data.data) {
        setFareDataLocal(data.data);
        setShowEstimate(true);
      } else {
        alert("Could not calculate fare: " + (data.message || data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error calculating fare. Ensure the backend is running.");
    } finally {
      setEstimating(false);
    }
  };

  const handleBook = () => {
    setLoading(true);
    // Push local state to global store before navigating
    setStoreVehicle(vehicle);
    setStoreWeight(weight);
    setStoreFareData(fareData as any);
    
    setTimeout(() => {
      // Simulate routing to booking page
      window.location.href = "/dashboard/book";
    }, 1500);
  };

  return (
    <div className="card col-span-1 flex flex-col relative overflow-hidden group">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary to-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center gap-3 mb-6">
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
          className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"
        >
          <Package className="w-5 h-5" style={{ color: "var(--brand-primary)" }} />
        </motion.div>
        <h2 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>Book Cargo</h2>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {/* Pickup Input */}
        <div className="relative z-20">
          <LocationAutocomplete 
            type="pickup"
            placeholder="Search Pickup Location"
            icon={
              <>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-blue-500 animate-pulse z-10" />
                <div className="absolute left-[17px] top-[28px] w-px h-6 bg-gray-300 z-0" />
              </>
            }
          />
        </div>

        {/* Drop Input */}
        <div className="relative z-10">
          <LocationAutocomplete 
            type="dropoff"
            placeholder="Search Drop Location"
            icon={
              <MapPin className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 z-10" style={{ color: "var(--brand-secondary)" }} />
            }
          />
        </div>

        {/* Vehicle Selector */}
        <div className="flex bg-gray-50 p-1 rounded-xl border" style={{ borderColor: "var(--border-subtle)" }}>
          {["mini", "tempo", "truck"].map((v) => (
            <button
              key={v}
              onClick={() => setVehicle(v)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
                vehicle === v 
                  ? "shadow-sm" 
                  : "hover:bg-gray-100"
              }`}
              style={{
                background: vehicle === v ? "var(--brand-secondary)" : "transparent",
                color: vehicle === v ? "white" : "var(--text-secondary)"
              }}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Cargo Weight Input */}
        <div className="relative z-0">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Package className="w-4 h-4" />
          </div>
          <input 
            type="number"
            placeholder="Cargo Weight (kg)"
            className="input-field !pl-10 bg-white w-full"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            min="0"
          />
        </div>

        {!showEstimate ? (
          <button 
            onClick={handleEstimate}
            disabled={estimating}
            className="btn-secondary w-full mt-4 justify-between group/btn bg-white disabled:opacity-50"
          >
            {estimating ? "Calculating..." : "Get Fare Estimate"}
            {!estimating && <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
          </button>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 overflow-hidden"
            >
              <div className="text-[10px] text-gray-400 mb-1 px-1">
                Base Fare + Distance + {weight && Number(weight) > 50 ? `₹${(Number(weight) - 50) * 1} Weight Surcharge` : 'No Weight Surcharge'}
              </div>
              <div className="p-4 rounded-xl mb-4 bg-blue-50/50 border border-blue-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Estimated Fare</span>
                  <span className="text-xl font-bold font-mono text-gray-900">₹{fareData?.total}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Navigation className="w-3 h-3" />
                  <span>{fareData?.distanceKm} km</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>~{fareData?.durationMin} min</span>
                </div>
              </div>

              <button 
                onClick={handleBook}
                disabled={loading}
                className="btn-primary w-full relative overflow-hidden"
              >
                {loading ? (
                  <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Book Now <ArrowRight className="w-4 h-4 ml-1" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
                  </>
                )}
              </button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

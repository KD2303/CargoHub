"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Truck, Phone, Star, Navigation, Clock,
  Package, CheckCircle2, ChevronLeft, MessageCircle,
  ArrowRight, IndianRupee,
} from "lucide-react";

const mockBooking = {
  id: "FA-K8X7YT",
  pickup: "Hazratganj, Lucknow",
  drop: "Gomti Nagar, Lucknow",
  vehicle: "Tata Ace",
  status: "IN_TRANSIT",
  fare: 847,
  driver: {
    name: "Suresh Kumar",
    phone: "+91 98123 45001",
    vehicleNo: "UP32AB1234",
    rating: 4.7,
    trips: 156,
    photo: "SK",
  },
};

const statusTimeline = [
  { status: "PENDING", label: "Booking Placed", time: "2:15 PM", done: true },
  { status: "ACCEPTED", label: "Driver Accepted", time: "2:16 PM", done: true },
  { status: "DRIVER_ARRIVING", label: "Driver Arriving", time: "2:17 PM", done: true },
  { status: "PICKED_UP", label: "Cargo Picked Up", time: "2:28 PM", done: true },
  { status: "IN_TRANSIT", label: "In Transit", time: "2:30 PM", done: true, active: true },
  { status: "DELIVERED", label: "Delivered", time: "—", done: false },
];

export default function TrackingPage() {
  const [driverLat, setDriverLat] = useState(26.8550);
  const [driverLng, setDriverLng] = useState(80.9520);

  // Simulate driver movement
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverLat((prev) => prev + (Math.random() * 0.002 - 0.001));
      setDriverLng((prev) => prev + (Math.random() * 0.002 - 0.001));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass" style={{ borderRadius: 0, borderTop: "none", borderLeft: "none", borderRight: "none" }}>
        <div className="container-wide flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <a href="/book" className="btn-icon" style={{ width: 32, height: 32 }}>
              <ChevronLeft className="w-4 h-4" />
            </a>
            <div>
              <span className="font-display text-lg font-bold">Live Tracking</span>
              <span className="font-mono text-xs ml-2" style={{ color: "var(--brand-primary-light)" }}>{mockBooking.id}</span>
            </div>
          </div>
          <div className="badge badge-transit">
            <Navigation className="w-3 h-3" /> In Transit
          </div>
        </div>
      </header>

      <div className="container-wide py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Area */}
          <div className="lg:col-span-2">
            <div className="card overflow-hidden" style={{ padding: 0 }}>
              {/* Mock Map */}
              <div className="relative h-96 flex items-center justify-center" style={{ background: "var(--bg-tertiary)" }}>
                {/* Grid overlay */}
                <div className="absolute inset-0 bg-grid opacity-50" />

                {/* Pickup marker */}
                <motion.div
                  className="absolute top-24 left-1/4 flex flex-col items-center"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--brand-primary)", boxShadow: "0 0 20px rgba(2, 89, 221, 0.4)" }}>
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="mt-1 px-2 py-0.5 rounded text-xs font-medium" style={{ background: "var(--bg-card)", color: "var(--text-primary)" }}>Pickup</div>
                </motion.div>

                {/* Drop marker */}
                <div className="absolute bottom-20 right-1/4 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--brand-success)", boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}>
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="mt-1 px-2 py-0.5 rounded text-xs font-medium" style={{ background: "var(--bg-card)", color: "var(--text-primary)" }}>Drop-off</div>
                </div>

                {/* Driver marker (animated) */}
                <motion.div
                  className="absolute flex flex-col items-center z-10"
                  animate={{
                    top: ["45%", "50%", "55%", "52%"],
                    left: ["40%", "45%", "50%", "48%"],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <div className="relative">
                    {/* Pulse ring */}
                    <div className="absolute inset-0 w-12 h-12 -m-2 rounded-full animate-pulse-ring" style={{ background: "rgba(14, 165, 233, 0.3)" }} />
                    <div className="w-8 h-8 rounded-full flex items-center justify-center relative z-10" style={{ background: "var(--brand-secondary)", boxShadow: "0 0 20px rgba(14, 165, 233, 0.5)" }}>
                      <Truck className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="mt-1 px-2 py-0.5 rounded text-xs font-bold" style={{ background: "var(--brand-secondary)", color: "white" }}>
                    {mockBooking.driver.name.split(" ")[0]}
                  </div>
                </motion.div>

                {/* Route line (dotted) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.3 }}>
                  <line x1="25%" y1="35%" x2="75%" y2="75%" stroke="var(--brand-primary)" strokeWidth="2" strokeDasharray="8 4" />
                </svg>

                {/* ETA badge */}
                <div className="absolute top-4 right-4 p-3 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Estimated Arrival</p>
                  <p className="font-mono text-xl font-bold" style={{ color: "var(--text-primary)" }}>8 min</p>
                </div>

                {/* Coordinates */}
                <div className="absolute bottom-4 left-4 p-2 rounded-lg" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                  <p className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                    {driverLat.toFixed(4)}°N, {driverLng.toFixed(4)}°E
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Driver Card */}
            <div className="card">
              <h3 className="font-display font-bold mb-4" style={{ color: "var(--text-primary)" }}>Your Driver</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold" style={{ background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))", color: "white" }}>
                  {mockBooking.driver.photo}
                </div>
                <div className="flex-1">
                  <p className="font-display font-bold" style={{ color: "var(--text-primary)" }}>{mockBooking.driver.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{mockBooking.vehicle} · {mockBooking.driver.vehicleNo}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{mockBooking.driver.rating}</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>· {mockBooking.driver.trips} trips</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="btn-primary flex-1" style={{ padding: "10px", fontSize: "13px" }}>
                  <Phone className="w-4 h-4" /> Call
                </button>
                <button className="btn-secondary flex-1" style={{ padding: "10px", fontSize: "13px" }}>
                  <MessageCircle className="w-4 h-4" /> Chat
                </button>
              </div>
            </div>

            {/* Trip Timeline */}
            <div className="card">
              <h3 className="font-display font-bold mb-4" style={{ color: "var(--text-primary)" }}>Trip Timeline</h3>
              <div className="space-y-1">
                {statusTimeline.map((item, i) => (
                  <div key={item.status} className="flex items-start gap-3">
                    {/* Line + dot */}
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{
                        background: item.active ? "var(--brand-secondary)" : item.done ? "var(--brand-success)" : "var(--bg-tertiary)",
                        boxShadow: item.active ? "0 0 12px rgba(14, 165, 233, 0.4)" : "none",
                      }}>
                        {item.done ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <div className="w-2 h-2 rounded-full" style={{ background: "var(--text-muted)" }} />
                        )}
                      </div>
                      {i < statusTimeline.length - 1 && (
                        <div className="w-0.5 h-6 my-1" style={{ background: item.done ? "var(--brand-success)" : "var(--border-subtle)" }} />
                      )}
                    </div>

                    <div className="pb-4">
                      <p className="text-sm font-medium" style={{ color: item.active ? "var(--brand-secondary)" : item.done ? "var(--text-primary)" : "var(--text-muted)" }}>
                        {item.label}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fare */}
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>ESTIMATED FARE</p>
                  <p className="font-mono text-2xl font-bold gradient-text">₹{mockBooking.fare}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>PAYMENT</p>
                  <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Pay after delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

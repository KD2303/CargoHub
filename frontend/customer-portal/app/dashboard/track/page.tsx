"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { io } from "socket.io-client";
import { motion } from "framer-motion";
import { Phone, Share2, AlertCircle, Navigation, CheckCircle2, Loader2 } from "lucide-react";
import LiveMap from "@/components/dashboard/LiveMap";
import { useAuthStore } from "@/store/authStore";
import { auth as firebaseAuth } from "@/lib/firebase";
import { useBookingStore } from "@/store/bookingStore";

function TrackingContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const setPickup = useBookingStore(state => state.setPickup);
  const setDropoff = useBookingStore(state => state.setDropoff);
  const setDriverLocation = useBookingStore(state => state.setDriverLocation);

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverLoc, setLocalDriverLoc] = useState<any>(null);

  useEffect(() => {
    if (!id) {
      setError("No booking ID provided.");
      setLoading(false);
      return;
    }

    let socket: any;

    const fetchAndConnect = async () => {
      try {
        // Wait for Firebase auth to be ready (up to 3s)
        let attempts = 0;
        while (!firebaseAuth.currentUser && attempts < 30) {
          await new Promise(r => setTimeout(r, 100));
          attempts++;
        }
        
        const token = await firebaseAuth.currentUser?.getIdToken();
        if (!token) {
          setError("You must be logged in to track a shipment.");
          setLoading(false);
          return;
        }

        // Fetch booking
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success && json.data) {
          const b = json.data;
          setBooking(b);
          setPickup({
            lat: b.pickupLat,
            lng: b.pickupLng,
            address: b.pickupAddress || "Pickup"
          });
          setDropoff({
            lat: b.dropLat,
            lng: b.dropLng,
            address: b.dropAddress || "Dropoff"
          });
          
          // Connect to Socket.IO for real-time driver tracking
          socket = io((`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`));
          socket.on("connect", () => {
            socket.emit("join:booking", { bookingId: id });
          });

          socket.on("driver:location", (loc: any) => {
            setDriverLocation({ lng: loc.lng, lat: loc.lat });
            setLocalDriverLoc(loc);
          });
        } else {
          setError(json.message || "Failed to load booking.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAndConnect();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [id, setPickup, setDropoff, setDriverLocation]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-medium">Locating your shipment...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Tracking Error</h2>
        <p className="text-gray-600">{error || "Booking not found"}</p>
      </div>
    );
  }

  const steps = [
    { title: "Booking Confirmed", time: new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), done: true },
    { title: "Driver Assigned", time: booking.status !== 'PENDING' ? "Updated" : "--", done: booking.status !== 'PENDING' },
    { title: "Arrived at Pickup", time: "--", done: ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(booking.status) },
    { title: "In Transit", time: "--", done: ['IN_TRANSIT', 'DELIVERED'].includes(booking.status) },
    { title: "Delivered", time: "--", done: booking.status === 'DELIVERED' }
  ];

  let currentStepIdx = steps.filter(s => s.done).length - 1;
  if (currentStepIdx < 0) currentStepIdx = 0;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Track Shipment</h1>
          <p className="text-sm font-mono text-gray-500 mt-1">ID: {booking.id}</p>
        </div>
        <div className="badge badge-transit bg-blue-50 text-blue-700 border-blue-100">
          <span className="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse-ring bg-current" />
          {booking.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Column */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden h-[500px] relative glass" style={{ border: "1px solid var(--border-subtle)" }}>
          <LiveMap readonly={true} />
        </div>

        {/* Info Column */}
        <div className="flex flex-col gap-6">
          {/* Timeline */}
          <div className="card glass p-6 rounded-xl border shadow-sm" style={{ borderColor: "var(--border-subtle)" }}>
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Navigation className="w-4 h-4" style={{ color: "var(--brand-primary)" }} /> Journey Status
            </h3>
            
            <div className="relative pl-6 space-y-6">
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5" style={{ background: "var(--border-subtle)" }} />
              
              {steps.map((step, idx) => (
                <div key={idx} className={`relative z-10 flex gap-4 ${step.done ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`absolute -left-6 w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${step.done ? 'border-blue-600' : ''}
                    ${idx === currentStepIdx ? 'ring-4 ring-blue-500/20' : ''}
                  `}
                  style={{ 
                    background: "var(--bg-card)",
                    borderColor: step.done ? "var(--brand-primary)" : "var(--border-subtle)" 
                  }}>
                    {step.done && <div className="w-2 h-2 rounded-full" style={{ background: "var(--brand-primary)" }} />}
                  </div>
                  <div className="flex-1 pb-1">
                    <p className="font-semibold text-sm" style={{ color: step.done ? "var(--text-primary)" : "var(--text-secondary)" }}>{step.title}</p>
                    <p className="text-xs mt-0.5 font-mono" style={{ color: "var(--text-muted)" }}>{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Driver Info */}
          {booking.driver ? (
            <div className="card glass p-6 rounded-xl border shadow-sm" style={{ borderColor: "var(--border-subtle)" }}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>Driver Details</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: "rgba(37,99,235,0.1)", color: "var(--brand-primary)" }}>
                  {booking.driver.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    {booking.driver.name}
                    <span className="text-[10px] px-1.5 py-0.5 rounded border" style={{ background: "rgba(16,185,129,0.1)", color: "var(--brand-success)", borderColor: "rgba(16,185,129,0.2)" }}>Verified</span>
                  </p>
                  <p className="text-xs text-yellow-500 font-bold">★ {booking.driver.rating || '4.8'} <span className="font-normal ml-1" style={{ color: "var(--text-muted)" }}>({booking.driver.vehicleNumber})</span></p>
                </div>
                <button 
                  className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors shadow-sm"
                  style={{ background: "var(--bg-primary)", borderColor: "var(--border-subtle)" }}
                >
                  <Phone className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded border" style={{ background: "var(--bg-primary)", borderColor: "var(--border-subtle)" }}>
                  <p className="font-semibold mb-0.5" style={{ color: "var(--text-muted)" }}>Speed</p>
                  <p className="font-mono font-bold text-sm" style={{ color: "var(--text-primary)" }}>~{driverLoc ? '32 km/h' : '--'}</p>
                </div>
                <div className="p-2 rounded border" style={{ background: "var(--bg-primary)", borderColor: "var(--border-subtle)" }}>
                  <p className="font-semibold mb-0.5" style={{ color: "var(--text-muted)" }}>Fare</p>
                  <p className="font-mono font-bold text-sm" style={{ color: "var(--text-primary)" }}>₹{booking.fareEstimate}</p>
                </div>
              </div>
            </div>
          ) : (
            <div 
              className="glass p-4 rounded-xl mt-4 flex items-center gap-3 transition-all duration-300 hover:shadow-[0_0_20px_rgba(37,99,235,0.25)] border border-gray-200 dark:border-gray-800 hover:border-blue-500/50"
              style={{ background: "transparent" }}
            >
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--brand-primary)" }} />
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Finding nearest driver...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>}>
      <TrackingContent />
    </Suspense>
  );
}

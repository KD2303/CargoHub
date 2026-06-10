"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { io } from "socket.io-client";
import { motion } from "framer-motion";
import { Phone, Share2, AlertCircle, Navigation, CheckCircle2, Loader2 } from "lucide-react";
import LiveMap from "@/components/dashboard/LiveMap";
import { useAuthStore } from "@/store/authStore";
import { auth as firebaseAuth } from "@/lib/firebase";
import { useBookingStore } from "@/store/bookingStore";

export default function TrackingPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { user } = useAuthStore();
  const setPickup = useBookingStore(state => state.setPickup);
  const setDropoff = useBookingStore(state => state.setDropoff);
  const setDriverLocation = useBookingStore(state => state.setDriverLocation);

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverLoc, setLocalDriverLoc] = useState<any>(null);

  useEffect(() => {
    if (!id || !user || !firebaseAuth.currentUser) {
      if (!id) setError("No booking ID provided.");
      setLoading(false);
      return;
    }

    let socket: any;

    const fetchAndConnect = async () => {
      try {
        const token = await firebaseAuth.currentUser?.getIdToken();
        if (!token) return;

        // Fetch booking
        const res = await fetch(`http://localhost:5000/api/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success && json.data) {
          const b = json.data;
          setBooking(b);
          setPickup(b.pickupLocation);
          setDropoff(b.dropoffLocation);
          
          if (b.driver?.currentLat && b.driver?.currentLng) {
            const loc = { lat: b.driver.currentLat, lng: b.driver.currentLng };
            setLocalDriverLoc(loc);
            setDriverLocation(loc);
          }

          // Connect Socket
          socket = io("ws://localhost:5000", {
            auth: { token: user.firebaseUid } // simplified mock auth
          });

          socket.on("connect", () => {
            socket.emit("join:booking", { bookingId: id });
          });

          socket.on("driver:location", (data: any) => {
            const loc = { lat: data.lat, lng: data.lng };
            setLocalDriverLoc(loc);
            setDriverLocation(loc);
          });

          socket.on("booking:status", (data: any) => {
            setBooking((prev: any) => ({ ...prev, status: data.status }));
          });

        } else {
          setError(json.error || "Failed to fetch booking");
        }
      } catch (err) {
        console.error(err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchAndConnect();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [id, user]);

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  if (error) {
    return <div className="flex h-64 items-center justify-center text-red-500">{error}</div>;
  }

  if (!booking) return null;

  const steps = [
    { label: "Booking Confirmed", time: new Date(booking.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), completed: true },
    { label: "Driver Assigned", time: "", completed: booking.driverId !== null },
    { label: "Cargo Picked Up", time: "", completed: ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(booking.status) },
    { label: "In Transit", time: "", completed: ['DELIVERED'].includes(booking.status), active: booking.status === 'IN_TRANSIT' },
    { label: "Delivered", time: "", completed: booking.status === 'DELIVERED' }
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6">
      {/* Map Column */}
      <div className="flex-1 rounded-2xl overflow-hidden shadow-sm relative" style={{ border: "1px solid var(--border-subtle)" }}>
        <LiveMap />
      </div>

      {/* Details Column */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6 overflow-y-auto">
        <div className="card p-6 flex flex-col h-full bg-white">
          <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
            <div>
              <h2 className="font-mono font-bold text-xl text-gray-900 mb-1">{booking.id}</h2>
              <p className="text-sm font-semibold text-gray-500">{booking.pickupLocation?.address?.split(',')[0]} → {booking.dropoffLocation?.address?.split(',')[0]} · {booking.vehicleType}</p>
            </div>
            <div className={`badge ${booking.status === 'IN_TRANSIT' ? 'badge-transit bg-blue-50 text-blue-600 border border-blue-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
              {booking.status === 'IN_TRANSIT' && <span className="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse-ring bg-current" />}
              {booking.status}
            </div>
          </div>

          {/* Progress Stepper */}
          <div className="flex-1 py-4">
            <div className="relative">
              {/* Connector Line */}
              <div className="absolute left-[11px] top-2 bottom-6 w-0.5 bg-gray-100" />
              
              {steps.map((step, i) => (
                <div key={i} className="flex gap-4 mb-6 relative z-10">
                  <div className="flex flex-col items-center">
                    {step.completed ? (
                      <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center border border-green-200">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : step.active ? (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm relative" style={{ background: "var(--brand-primary)" }}>
                        <span className="absolute inset-0 rounded-full animate-pulse-ring" style={{ background: "var(--brand-primary)" }} />
                        <span className="w-2 h-2 rounded-full bg-white relative z-10" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-200" />
                    )}
                  </div>
                  <div className="-mt-1">
                    <p className={`text-sm font-bold ${step.active ? 'text-gray-900' : step.completed ? 'text-gray-700' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    <p className="text-xs font-mono text-gray-500">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Driver Card */}
          {booking.driver ? (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                  {booking.driver.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 flex items-center gap-2">
                    {booking.driver.name}
                    <span className="badge badge-verified bg-green-50 text-green-700 text-[10px] px-1.5 py-0">Verified</span>
                  </p>
                  <p className="text-xs text-yellow-500 font-bold">★ {booking.driver.rating || '4.8'} <span className="text-gray-400 font-normal ml-1">({booking.driver.vehicleNumber})</span></p>
                </div>
                <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-brand-primary text-gray-600 transition-colors shadow-sm">
                  <Phone className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded border border-gray-100">
                  <p className="text-gray-400 font-semibold mb-0.5">Speed</p>
                  <p className="font-mono font-bold text-gray-900 text-sm">~{driverLoc ? '32 km/h' : '--'}</p>
                </div>
                <div className="bg-white p-2 rounded border border-gray-100">
                  <p className="text-gray-400 font-semibold mb-0.5">Fare</p>
                  <p className="font-mono font-bold text-gray-900 text-sm">₹{booking.fareEstimate}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              <p className="text-sm font-semibold text-gray-600">Finding nearest driver...</p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button className="flex-1 btn-secondary text-sm h-11 flex justify-center border-gray-200 bg-white hover:border-gray-300">
              <Share2 className="w-4 h-4 mr-2" /> Share Link
            </button>
            <button className="flex-1 btn-secondary text-sm h-11 flex justify-center text-red-600 border-red-100 bg-red-50 hover:bg-red-100 hover:border-red-200">
              <AlertCircle className="w-4 h-4 mr-2" /> Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

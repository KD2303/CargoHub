"use client";

import { motion } from "framer-motion";
import { Phone, Share2, AlertCircle, Navigation, CheckCircle2 } from "lucide-react";
import LiveMap from "@/components/dashboard/LiveMap";

export default function TrackingPage() {
  const steps = [
    { label: "Booking Confirmed", time: "10:30 AM", completed: true },
    { label: "Driver Assigned", time: "10:32 AM", completed: true },
    { label: "Cargo Picked Up", time: "11:15 AM", completed: true },
    { label: "In Transit", time: "Current", completed: false, active: true },
    { label: "Delivered", time: "Est. 12:00 PM", completed: false }
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
              <h2 className="font-mono font-bold text-xl text-gray-900 mb-1">CH-2024-0821</h2>
              <p className="text-sm font-semibold text-gray-500">Mumbai → Pune · Tempo</p>
            </div>
            <div className="badge badge-transit bg-blue-50 text-blue-600 border border-blue-100">
              <span className="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse-ring bg-current" />
              In Transit
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
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                R
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 flex items-center gap-2">
                  Ramesh Kumar
                  <span className="badge badge-verified bg-green-50 text-green-700 text-[10px] px-1.5 py-0">KYC Verified</span>
                </p>
                <p className="text-xs text-yellow-500 font-bold">★ 4.8 <span className="text-gray-400 font-normal ml-1">rating</span></p>
              </div>
              <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-brand-primary text-gray-600 transition-colors shadow-sm">
                <Phone className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded border border-gray-100">
                <p className="text-gray-400 font-semibold mb-0.5">ETA</p>
                <p className="font-mono font-bold text-gray-900 text-sm">~45 mins</p>
              </div>
              <div className="bg-white p-2 rounded border border-gray-100">
                <p className="text-gray-400 font-semibold mb-0.5">Distance</p>
                <p className="font-mono font-bold text-gray-900 text-sm">17 km</p>
              </div>
            </div>
          </div>

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

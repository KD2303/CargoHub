"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/store/authStore";
import { useDashboardStore } from "@/store/dashboardStore";

export default function WelcomeBanner() {
  const { user } = useAuthStore();
  const { stats } = useDashboardStore();
  const [text, setText] = useState("");
  const [showSubtext, setShowSubtext] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    let greeting = "Good morning";
    if (hour >= 12 && hour < 17) greeting = "Good afternoon";
    else if (hour >= 17) greeting = "Good evening";
    
    const firstName = user?.name ? user.name.split(' ')[0] : 'Guest';
    const fullText = `${greeting}, ${firstName} 👋`;
    
    let i = 0;
    const timer = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(timer);
        setTimeout(() => setShowSubtext(true), 300);
      }
    }, 80);
    return () => clearInterval(timer);
  }, [user]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-2xl p-6 relative overflow-hidden mb-8"
      style={{ 
        background: "linear-gradient(135deg, rgba(255, 102, 72, 0.05), rgba(2, 89, 221, 0.05))",
        border: "1px solid var(--border-subtle)"
      }}
    >
      <div className="flex justify-between items-center relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-2 min-h-[36px]">
            {text}
            <motion.span 
              animate={{ opacity: [1, 0] }} 
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block ml-1 w-2 h-6 bg-brand-primary"
              style={{ background: "var(--brand-primary)" }}
            />
          </h1>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: showSubtext ? 1 : 0, y: showSubtext ? 0 : 10 }}
            className="flex items-center gap-3 text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            <span>{stats?.activeShipments || 0} active shipments</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>₹{stats?.totalSpent || 0} total spent</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-amber-600">All systems operational</span>
          </motion.div>
        </div>

      </div>

      {/* Animated Truck Scene */}
      <div className="absolute right-0 bottom-0 top-0 w-1/2 pointer-events-none opacity-15 overflow-hidden flex items-end">
        <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">

          {/* ── Road Ground Line ─────────────────────────────────────── */}
          <line x1="0" y1="88" x2="400" y2="88" stroke="var(--border-subtle)" strokeWidth="1.5" />

          {/* ── Scrolling Road Dashes ─────────────────────────────────── */}
          <clipPath id="road-clip">
            <rect x="0" y="82" width="400" height="8" />
          </clipPath>
          <motion.g
            clipPath="url(#road-clip)"
            animate={{ x: [0, -40] }}
            transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
          >
            {/* Two copies side-by-side so we can loop seamlessly */}
            {Array.from({ length: 22 }).map((_, i) => (
              <line
                key={i}
                x1={i * 40 + 8}  y1="86"
                x2={i * 40 + 28} y2="86"
                stroke="var(--brand-primary)"
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />
            ))}
          </motion.g>

          {/* ── Exhaust puffs (render BEHIND the truck body) ─────────── */}
          {[0, 0.4, 0.8].map((delay, i) => (
            <motion.circle
              key={`puff-${i}`}
              cx={93}
              cy={28}
              r={3}
              fill="var(--text-muted)"
              animate={{ y: [0, -10, -18], opacity: [0.35, 0.15, 0], scale: [0.5, 1, 1.5] }}
              transition={{ repeat: Infinity, duration: 1.4, delay, ease: "easeOut" }}
            />
          ))}

          {/* ── Truck Body Group — slight vertical bounce ─────────────── */}
          <motion.g
            animate={{ y: [0, -3, -1, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            {/* Cargo body */}
            <rect x="110" y="20" width="185" height="55" rx="4" ry="4"
              fill="var(--brand-primary)" fillOpacity="0.9" />

            {/* Cargo side windows (decorative stripes) */}
            <rect x="128" y="28" width="18" height="20" rx="2"
              fill="rgba(255,255,255,0.15)" />
            <rect x="156" y="28" width="18" height="20" rx="2"
              fill="rgba(255,255,255,0.15)" />
            <rect x="184" y="28" width="18" height="20" rx="2"
              fill="rgba(255,255,255,0.15)" />

            {/* Chassis underline */}
            <line x1="110" y1="74" x2="295" y2="74"
              stroke="var(--brand-primary-dark)" strokeWidth="2" />

            {/* Cab section */}
            <path
              d="M 295 75 L 295 35 Q 295 28 301 28 L 332 28 Q 344 28 352 42 L 358 62 L 358 75 Z"
              fill="var(--brand-primary-light)"
            />

            {/* Windshield */}
            <path
              d="M 299 35 L 299 60 L 352 60 L 348 44 Q 342 32 331 32 L 307 32 Q 299 32 299 35 Z"
              fill="rgba(132,175,251,0.4)"
            />

            {/* Wheel arches */}
            <rect x="120" y="68" width="36" height="10" rx="2" fill="var(--brand-primary-dark)" fillOpacity="0.5" />
            <rect x="316" y="68" width="36" height="10" rx="2" fill="var(--brand-primary-dark)" fillOpacity="0.5" />
          </motion.g>

          {/* ── Rear Wheel (spins independently, no body bounce offset) ── */}
          <motion.g
            style={{ originX: "138px", originY: "80px" }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          >
            <circle cx="138" cy="80" r="12" fill="#0B1C3F" />
            <circle cx="138" cy="80" r="5"  fill="var(--brand-primary-light)" fillOpacity="0.7" />
            {/* hubcap spokes */}
            <line x1="138" y1="70" x2="138" y2="90" stroke="var(--brand-primary)" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="128" y1="80" x2="148" y2="80" stroke="var(--brand-primary)" strokeWidth="1" strokeOpacity="0.6" />
          </motion.g>

          {/* ── Front Wheel ──────────────────────────────────────────── */}
          <motion.g
            style={{ originX: "334px", originY: "80px" }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          >
            <circle cx="334" cy="80" r="12" fill="#0B1C3F" />
            <circle cx="334" cy="80" r="5"  fill="var(--brand-primary-light)" fillOpacity="0.7" />
            <line x1="334" y1="70" x2="334" y2="90" stroke="var(--brand-primary)" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="324" y1="80" x2="344" y2="80" stroke="var(--brand-primary)" strokeWidth="1" strokeOpacity="0.6" />
          </motion.g>

        </svg>
      </div>
    </motion.div>
  );
}

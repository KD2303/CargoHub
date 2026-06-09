"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/store/authStore";

export default function WelcomeBanner() {
  const { user } = useAuthStore();
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
            <span>2 active shipments</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>₹680 pending</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-amber-600">Monsoon surcharge active</span>
          </motion.div>
        </div>

      </div>

      {/* Animated Truck Background Element */}
      <div className="absolute right-0 bottom-0 top-0 w-1/2 pointer-events-none opacity-20 overflow-hidden">
        <svg viewBox="0 0 400 100" className="w-full h-full absolute animate-truck-drive">
          {/* Simple Truck Shape */}
          <path d="M 50 60 L 50 20 Q 50 10 60 10 L 150 10 Q 160 10 160 20 L 160 60 Z" fill="var(--brand-primary)" />
          <path d="M 160 60 L 160 30 Q 160 25 165 25 L 190 25 Q 200 25 205 35 L 210 50 L 210 60 Z" fill="var(--brand-secondary)" />
          {/* Wheels */}
          <circle cx="80" cy="65" r="12" fill="#0B1C3F" />
          <circle cx="180" cy="65" r="12" fill="#0B1C3F" />
        </svg>
      </div>
    </motion.div>
  );
}

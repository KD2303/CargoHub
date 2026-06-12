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
            className="flex flex-col gap-1 text-sm font-medium italic"
            style={{ color: "var(--text-secondary)" }}
          >
            <span className="opacity-90">“The line between disorder and order lies in logistics.”</span>
            <span className="text-xs font-semibold not-italic opacity-70">— Sun Tzu</span>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}

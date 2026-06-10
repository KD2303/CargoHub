"use client";

import React from "react";
import { Navigation } from "lucide-react";

export default function LiveMapMock() {
  return (
    <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center relative min-h-[400px]">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      <Navigation className="w-10 h-10 text-gray-400 mb-3" />
      <p className="text-gray-500 font-semibold text-sm relative z-10">Live Map Mock</p>
    </div>
  );
}

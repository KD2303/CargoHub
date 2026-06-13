"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck, MapPin, Shield, Zap, ChevronRight, Star, Clock,
  ArrowRight, Package, Users, BarChart3, Phone, Globe,
  CheckCircle2, IndianRupee, Navigation, Smartphone, Play, Settings, LogOut
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import Image from "next/image";
import { HeroIllustration } from "../components/HeroIllustration";
import { ThemeToggle } from "../components/ThemeToggle";
import img1 from "./elements/1.png";
import img2 from "./elements/2.png";
import img3 from "./elements/3.png";
import img4 from "./elements/4.png";
import img5 from "./elements/5.png";
import img6 from "./elements/6.png";
import img7 from "./elements/7.png";
import img8 from "./elements/8.png";
import img9 from "./elements/9.png";
import img10 from "./elements/10.png";
import img11 from "./elements/11.png";
import img12 from "./elements/12.png";
import logo from "./icon.jpeg";

// ── Animated Counter ────────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count.toLocaleString("en-IN")}{suffix}</span>;
}

// ── Vehicle Icons ───────────────────────────────────────────────────────────

const TataAceIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={1.5} 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Cabin */}
    <path d="M 9 15 L 9 7 L 6 7 L 3.5 10.5 L 3.5 15 L 9 15" />
    <path d="M 6.5 8.5 L 8.5 8.5 L 8.5 11 L 5 11 Z" />
    {/* Cargo Box */}
    <path d="M 9.5 15 L 9.5 8 L 20.5 8 L 20.5 15 Z" />
    {/* Wheels */}
    <circle cx="6" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

const PickupIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={1.5} 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Cabin */}
    <path d="M 10 15 L 10 8 L 7 8 L 4 11 L 4 15 L 10 15" />
    <path d="M 7 9.5 L 9.5 9.5 L 9.5 12 L 5.5 12 Z" />
    {/* Open Bed */}
    <path d="M 10 15 L 21 15 L 21 11 L 10 11" />
    {/* Cargo box inside bed */}
    <path d="M 12 11 L 12 8 L 17 8 L 17 11 Z" />
    {/* Wheels */}
    <circle cx="6.5" cy="17" r="2" />
    <circle cx="17.5" cy="17" r="2" />
  </svg>
);

const Tempo407Icon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={1.5} 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Cabin */}
    <path d="M 9 15 L 9 7 L 6.5 7 L 5 9 L 4 9 L 4 15 L 9 15" />
    <path d="M 6 8.5 L 8.5 8.5 L 8.5 11 L 5 11 Z" />
    {/* High Cargo Box */}
    <path d="M 9.5 15 L 9.5 5 L 21 5 L 21 15 Z" />
    {/* Wheels */}
    <circle cx="6.5" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

const LargeTruckIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={1.5} 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Cab */}
    <path d="M 3.5 15 L 3.5 6 L 7.5 6 L 7.5 15 L 3.5 15" />
    <path d="M 4.5 7.5 L 7 7.5 L 7 10.5 L 4.5 10.5 Z" />
    {/* Chassis link */}
    <path d="M 7.5 15 L 8.5 15" />
    {/* Container */}
    <path d="M 8.5 15 L 8.5 5 L 22.5 5 L 22.5 15 Z" />
    {/* Container Ridges */}
    <path d="M 12 5 L 12 15" />
    <path d="M 16 5 L 16 15" />
    <path d="M 20 5 L 20 15" />
    {/* Wheels */}
    <circle cx="5" cy="17" r="2" />
    <circle cx="15" cy="17" r="2" />
    <circle cx="19.5" cy="17" r="2" />
  </svg>
);

// ── Vehicle Card ────────────────────────────────────────────────────────────

const vehicles = [
  { type: "Tata Ace", icon: TataAceIcon, capacity: "750 kg", price: "₹299", desc: "Perfect for small moves" },
  { type: "Tempo 407", icon: Tempo407Icon, capacity: "2.5 tons", price: "₹599", desc: "Furniture & appliances" },
  { type: "Pickup Truck", icon: PickupIcon, capacity: "1.5 tons", price: "₹449", desc: "Open-bed for bulk goods" },
  { type: "Large Truck", icon: LargeTruckIcon, capacity: "7 tons", price: "₹999", desc: "Heavy-duty relocations" },
];


// ── Feature Card ────────────────────────────────────────────────────────────

const features = [
  {
    icon: <Navigation className="w-6 h-6" />,
    title: "Real-Time GPS Tracking",
    desc: "Track your cargo every second. Live driver location on map with 3-second updates.",
    color: "var(--brand-primary)",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Verified Drivers Only",
    desc: "Every driver passes KYC — Aadhaar, license, and vehicle registration verified.",
    color: "var(--brand-secondary)",
  },
  {
    icon: <IndianRupee className="w-6 h-6" />,
    title: "Transparent Pricing",
    desc: "See the full fare breakdown before booking. No hidden charges, GST included.",
    color: "var(--brand-primary)",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Instant Matching",
    desc: "AI-powered driver matching finds the nearest verified driver in seconds.",
    color: "var(--brand-primary-light)",
  },
  {
    icon: <Package className="w-6 h-6" />,
    title: "All Cargo Types",
    desc: "Furniture, electronics, fragile goods, bulk materials — we handle it all.",
    color: "var(--brand-secondary)",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Works Everywhere",
    desc: "Android app, iOS app, or web browser. Same account, same bookings, anywhere.",
    color: "var(--brand-primary)",
  },
];

// ── Stats ───────────────────────────────────────────────────────────────────

const stats = [
  { value: 15000, suffix: "+", label: "Bookings Completed" },
  { value: 2500, suffix: "+", label: "Verified Drivers" },
  { value: 50, suffix: "+", label: "Cities Covered" },
  { value: 4.8, suffix: "★", label: "Average Rating" },
];

// ── Steps ───────────────────────────────────────────────────────────────────

const steps = [
  { step: "01", title: "Set Locations", desc: "Enter pickup and drop-off. Our map auto-suggests addresses.", icon: <MapPin className="w-8 h-8" /> },
  { step: "02", title: "Choose Vehicle", desc: "Select the right truck for your cargo type and load size.", icon: <Truck className="w-8 h-8" /> },
  { step: "03", title: "Confirm & Pay", desc: "Review transparent fare. Pay securely via UPI, card, or wallet.", icon: <CheckCircle2 className="w-8 h-8" /> },
  { step: "04", title: "Track Live", desc: "Watch your driver approach in real-time on the live map.", icon: <Navigation className="w-8 h-8" /> },
];

// ── Page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [activeVehicle, setActiveVehicle] = useState(0);
  const { user } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      const { auth } = await import('@/lib/firebase');
      await auth.signOut();
      window.location.href = '/';
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
        style={{ background: "var(--bg-glass)", borderColor: "var(--border-subtle)" }}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between h-[68px] relative">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="CargoHub Logo"
              width={48}
              height={48}
              className="object-contain flex-shrink-0"
            />
            <span className="font-sans text-[17px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              CargoHub
            </span>
          </Link>

          {/* Center Nav Links */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <a href="/"     className="text-[14px] font-semibold transition-colors" style={{ color: "var(--text-secondary)" }}>Home</a>
            <Link href="/download"  className="text-[14px] font-semibold transition-colors" style={{ color: "var(--text-secondary)" }}>Download App</Link>
            <Link href="/developer" className="text-[14px] font-semibold transition-colors" style={{ color: "var(--text-secondary)" }}>Developers</Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
            {user ? (
              <div 
                className="relative"
                onMouseEnter={() => setShowProfileMenu(true)}
                onMouseLeave={() => setShowProfileMenu(false)}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full border cursor-pointer overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-sm" style={{ color: "var(--brand-primary)" }}>
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 bg-[var(--bg-primary)] border shadow-lg rounded-xl overflow-hidden w-48"
                      style={{ borderColor: "var(--border-subtle)", zIndex: 100 }}
                    >
                      <Link 
                        href="/dashboard/settings" 
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-primary)]"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-medium">View Profile</span>
                      </Link>
                      <div className="h-px w-full" style={{ background: "var(--border-subtle)" }} />
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-red-500 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-[13px] md:text-[14px] font-semibold transition-colors px-2 md:px-4 py-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Log In
              </Link>
            )}
            <Link
              href={user ? "/dashboard/book" : "/login"}
              className="text-[13px] md:text-[14px] font-bold text-white px-4 md:px-5 py-2 md:py-2.5 shadow-sm transition-opacity hover:opacity-90 whitespace-nowrap"
              style={{ background: "var(--brand-primary)", borderRadius: "4px" }}
            >
              Book Now
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <section className="relative min-h-[80vh] flex flex-col pt-24 pb-20 overflow-visible items-center text-center">
        <div className="container mx-auto px-6 md:px-12 relative z-10 w-full flex flex-col items-center">
            <motion.div
              className="relative max-w-4xl mx-auto flex flex-col items-center mt-4 mb-4 z-20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <h1 className="text-[40px] sm:text-5xl md:text-7xl lg:text-[80px] font-sans leading-[1.1] md:leading-[1.05] mb-4 md:mb-6 font-semibold tracking-tight px-4 md:px-0 text-center mx-auto" style={{ color: "var(--text-primary)" }}>
                Full Sustainable <br className="hidden sm:block" /> Cargo Solution
              </h1>

              <p className="text-sm sm:text-base md:text-lg mb-8 md:mb-10 max-w-2xl font-medium leading-relaxed px-4 md:px-0 text-center mx-auto" style={{ color: "var(--text-secondary)" }}>
                We Continue To Pursue That Same Vision In Today&apos;s Complex, <br className="hidden md:block" />
                Uncertain World, Working Every Day To Earn Our Customers&apos;
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 w-full sm:w-auto px-6">
                <Link href="/register" className="group flex items-stretch text-[14px] font-bold rounded-xl overflow-hidden transition-all duration-300 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 bg-[var(--bg-glass)] hover:bg-[var(--brand-primary)] hover:border-[var(--brand-primary)] text-[var(--text-primary)] hover:text-white mx-auto sm:mx-0" style={{ backdropFilter: "blur(12px)" }}>
                  <span className="px-6 py-3 flex items-center">Get Started</span>
                  <div className="px-4 flex items-center justify-center border-l border-gray-200 dark:border-gray-800 transition-colors duration-300 bg-black/5 dark:bg-white/5 group-hover:bg-blue-700 group-hover:border-blue-700">
                    <Play className="w-4 h-4 fill-current" />
                  </div>
                </Link>
                <a href="#features" className="relative group flex items-center justify-center gap-2.5 text-[14px] font-bold transition-all duration-300 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 bg-[var(--bg-glass)] hover:border-orange-500/50 hover:text-orange-500 text-[var(--text-primary)] mx-auto sm:mx-0" style={{ backdropFilter: "blur(12px)" }}>
                  {/* Orange Glow */}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-orange-500 to-amber-500 opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500 rounded-xl" />
                  <div className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-800 group-hover:border-orange-500 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                    <Play className="w-3.5 h-3.5 translate-x-[1px] fill-current" />
                  </div>
                  Watch more
                </a>
              </div>
            </motion.div>

            {/* Right: Animated Hero Illustration */}
            <div className="w-full max-w-[900px] mx-auto -mt-12 md:-mt-24 lg:-mt-60 z-10 relative">
              <HeroIllustration
                images={{
                  img1,
                  img2,
                  img3,
                  img4,
                  img5,
                  img6,
                  img7,
                  img8,
                  img9,
                  img10,
                  img11,
                  img12,
                }}
              />
            </div>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────────────────── */}
      <section className="py-16" style={{ background: "var(--bg-secondary)" }}>
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 px-4 md:px-0">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="font-mono text-[28px] sm:text-3xl md:text-4xl font-extrabold gradient-text leading-none mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ──────────────────────────────────────────────── */}
      <section id="features" className="py-24">
        <div className="container-wide">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold mb-3 tracking-widest uppercase" style={{ color: "var(--brand-primary-light)" }}>Why CargoHub</p>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Built for <span className="gradient-text">Modern Logistics</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              From real-time tracking to verified drivers, every feature is designed for reliability.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="relative p-8 rounded-2xl flex flex-col h-full bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-gray-800 transition-all duration-500 hover:-translate-y-2 hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-2xl hover:shadow-[var(--brand-primary)]/20 overflow-hidden group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {/* Hover gradient background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-[var(--brand-primary)]/5 group-hover:to-transparent transition-all duration-500 opacity-0 group-hover:opacity-100" />
                
                {/* Top accent line */}
                <div className="absolute top-0 left-0 w-0 h-1 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-accent)] group-hover:w-full transition-all duration-500 ease-out" />

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" style={{ background: `${feature.color}15`, color: feature.color }}>
                    {feature.icon}
                  </div>
                  <h3 className="font-display text-xl font-bold mb-3 transition-colors duration-300" style={{ color: "var(--text-primary)" }}>{feature.title}</h3>
                  <p className="text-sm leading-relaxed transition-colors duration-300" style={{ color: "var(--text-secondary)" }}>{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vehicle Showcase ───────────────────────────────────────────── */}
      <section id="vehicles" className="py-24" style={{ background: "var(--bg-secondary)" }}>
        <div className="container-wide">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold mb-3 tracking-widest uppercase" style={{ color: "var(--brand-accent)" }}>Our Fleet</p>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Right Vehicle for <span className="gradient-text">Every Load</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0">
            {vehicles.map((v, i) => (
              <motion.div
                key={v.type}
                className="card card-hover cursor-pointer text-center flex flex-col h-full justify-between gap-4 group"
                onClick={() => setActiveVehicle(i)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover="hover"
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{
                  borderColor: activeVehicle === i ? "var(--brand-primary)" : undefined,
                  boxShadow: activeVehicle === i ? "var(--shadow-glow)" : undefined,
                }}
              >
                <div className="flex justify-center mb-2">
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 border text-[var(--text-secondary)] group-hover:text-[var(--brand-primary)] dark:group-hover:text-[var(--brand-primary-light)] group-hover:scale-105 group-hover:border-[var(--brand-primary)]/30 group-hover:bg-[var(--brand-primary)]/5"
                    style={{
                      background: activeVehicle === i 
                        ? "linear-gradient(135deg, rgba(2, 89, 221, 0.15), rgba(132, 175, 251, 0.15))"
                        : "var(--bg-tertiary)",
                      borderColor: activeVehicle === i
                        ? "var(--brand-primary)"
                        : "var(--border-subtle)",
                      color: activeVehicle === i ? "var(--brand-primary)" : undefined
                    }}
                  >
                    <motion.div
                      variants={{
                        hover: {
                          x: [0, 4, -2, 2, 0],
                          y: [0, -2, 0, -1, 0],
                          transition: {
                            duration: 0.5,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "mirror" as const
                          }
                        }
                      }}
                    >
                      <v.icon />
                    </motion.div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>{v.type}</h3>
                    <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>{v.desc}</p>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-auto">
                    <span className="badge badge-delivered">{v.capacity}</span>
                    <span className="font-mono font-bold" style={{ color: "var(--brand-primary-light)" }}>from {v.price}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24">
        <div className="container-wide">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold mb-3 tracking-widest uppercase" style={{ color: "var(--brand-success)" }}>Simple Process</p>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Book in <span className="gradient-text">4 Easy Steps</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 px-4 md:px-0">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                className="relative text-center p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-white/5 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-[var(--brand-primary)]/10 hover:-translate-y-1 group"
                style={{ zIndex: steps.length - i }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" style={{
                  background: "linear-gradient(135deg, rgba(2, 89, 221, 0.1), rgba(132, 175, 251, 0.1))",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--brand-primary-light)",
                }}>
                  {s.icon}
                </div>
                <span className="font-mono text-xs font-bold block mb-2" style={{ color: "var(--brand-primary)" }}>{s.step}</span>
                <h3 className="font-display text-lg font-bold mb-2 transition-colors duration-300" style={{ color: "var(--text-primary)" }}>{s.title}</h3>
                <p className="text-sm transition-colors duration-300" style={{ color: "var(--text-secondary)" }}>{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-6 translate-x-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center bg-[var(--bg-card)] rounded-full border border-gray-200 dark:border-gray-800 shadow-sm" style={{ zIndex: 10 }}>
                    <ChevronRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container-wide">
          <motion.div
            className="glass-card p-12 md:p-16 text-center relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 opacity-30" style={{
              background: "linear-gradient(135deg, rgba(2, 89, 221, 0.2), rgba(132, 175, 251, 0.1), rgba(16, 185, 129, 0.1))",
            }} />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
                Ready to <span className="gradient-text">Ship Smarter?</span>
              </h2>
              <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
                Join thousands of businesses and individuals who trust CargoHub for their cargo needs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 sm:px-0">
                <Link href={user ? "/dashboard/book" : "/login"} className="btn-primary text-base transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex justify-center items-center" style={{ padding: "16px 40px" }}>
                  Start Shipping <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link href="/register" className="flex justify-center items-center gap-2 text-base font-bold rounded-xl transition-all duration-300 border shadow-sm hover:shadow-xl hover:-translate-y-1 bg-[var(--bg-glass)] hover:bg-black/5 dark:hover:bg-white/10" style={{ padding: "16px 40px", backdropFilter: "blur(12px)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
                  <Truck className="w-5 h-5" /> Become a Driver
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="py-16" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="container-wide">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-12 px-4 md:px-0 text-center sm:text-left">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <Image
                  src={logo}
                  alt="CargoHub Logo"
                  width={48}
                  height={48}
                  className="rounded-full object-cover flex-shrink-0 shadow-sm"
                />
                <span className="font-display text-xl font-bold">CargoHub</span>
              </div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                India&apos;s smart cargo logistics platform. Built for speed, transparency, and trust.
              </p>
            </div>
            <div>
              <h4 className="font-display font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Product</h4>
              <div className="space-y-3">
                <Link href={user ? "/dashboard/book" : "/login"} className="block text-sm hover:underline" style={{ color: "var(--text-secondary)" }}>Book a Truck</Link>
                <Link href={user ? "/dashboard/track" : "/login"} className="block text-sm hover:underline" style={{ color: "var(--text-secondary)" }}>Track Shipment</Link>
                <Link href="/b2b-portal" className="block text-sm hover:underline" style={{ color: "var(--text-secondary)" }}>Business Account</Link>
              </div>
            </div>
            <div>
              <h4 className="font-display font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Company</h4>
              <div className="space-y-3">
                <Link href="/developer" className="block text-sm hover:underline" style={{ color: "var(--text-secondary)" }}>Developer</Link>
              </div>
            </div>
            <div>
              <h4 className="font-display font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Download</h4>
              <div className="space-y-3">
                <Link href="/download" className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <Smartphone className="w-4 h-4" /> Android App APK
                </Link>
              </div>
            </div>
          </div>
          <div className="divider mb-8" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              © 2026 CargoHub. All rights reserved. Made with ❤️ in India.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm" style={{ color: "var(--text-muted)" }}>Privacy</a>
              <a href="#" className="text-sm" style={{ color: "var(--text-muted)" }}>Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

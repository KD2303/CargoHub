"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck, MapPin, Shield, Zap, ChevronRight, Star, Clock,
  ArrowRight, Package, Users, BarChart3, Phone, Globe,
  CheckCircle2, IndianRupee, Navigation, Smartphone,
} from "lucide-react";

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

// ── Vehicle Card ────────────────────────────────────────────────────────────

const vehicles = [
  { type: "Tata Ace", icon: "🛻", capacity: "750 kg", price: "₹299", desc: "Perfect for small moves" },
  { type: "Tempo 407", icon: "🚛", capacity: "2.5 tons", price: "₹599", desc: "Furniture & appliances" },
  { type: "Pickup Truck", icon: "🚚", capacity: "1.5 tons", price: "₹449", desc: "Open-bed for bulk goods" },
  { type: "Large Truck", icon: "🚛", capacity: "7 tons", price: "₹999", desc: "Heavy-duty relocations" },
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

  return (
    <div className="min-h-screen bg-mesh bg-grid" style={{ background: "var(--bg-primary)" }}>
      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ borderRadius: 0, borderTop: "none", borderLeft: "none", borderRight: "none" }}>
        <div className="container-wide flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))" }}>
              🚛
            </div>
            <span className="font-display text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              CargoHub
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Features</a>
            <a href="#vehicles" className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Vehicles</a>
            <a href="#how-it-works" className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>How It Works</a>
            <a href="/login" className="btn-secondary text-sm" style={{ padding: "8px 20px" }}>Log In</a>
            <a href="/book" className="btn-primary text-sm" style={{ padding: "8px 20px" }}>Book Now</a>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16" style={{ background: "var(--bg-primary)" }}>
        {/* Background organic blob shapes & layout elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large Royal Blue Blob */}
          <div className="absolute top-[15%] left-[5%] w-[450px] h-[450px] rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob" style={{ background: "var(--brand-primary)" }} />
          {/* Coral Orange Blob */}
          <div className="absolute top-[30%] right-[10%] w-[380px] h-[380px] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" style={{ background: "var(--brand-secondary)" }} />
          {/* Light Blue Blob */}
          <div className="absolute bottom-[10%] left-[25%] w-[400px] h-[400px] rounded-full mix-blend-multiply filter blur-3xl opacity-35 animate-blob animation-delay-4000" style={{ background: "var(--brand-primary-light)" }} />
        </div>

        <div className="container-wide relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div className="badge badge-delivered mb-6" style={{ display: "inline-flex", background: "var(--brand-primary)", color: "white" }}>
                <Zap className="w-3.5 h-3.5" /> Live in 50+ cities
              </div>

              <h1 className="text-6xl md:text-8xl lg:text-9xl font-display leading-[0.9] mb-8" style={{ color: "var(--text-primary)", letterSpacing: "-1px" }}>
                Move Cargo.<br />
                <span className="gradient-text" style={{ background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Track Live.</span><br />
                Pay Smart.
              </h1>

              <p className="text-lg md:text-xl mb-8 max-w-xl" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
                India&apos;s most trusted platform for on-demand cargo transport.
                Book a truck in 30 seconds, track your driver in real-time,
                and pay securely with Razorpay.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-10">
                <a href="/book" className="btn-primary text-base" style={{ padding: "14px 36px" }}>
                  Book a Truck <ArrowRight className="w-5 h-5" />
                </a>
                <a href="#how-it-works" className="btn-secondary text-base" style={{ padding: "14px 36px" }}>
                  See How It Works
                </a>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold" style={{ background: `hsl(${i * 80}, 60%, 50%)`, borderColor: "var(--bg-primary)" }}>
                        {["R", "P", "A", "S"][i - 1]}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>2,500+ drivers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>4.8</span>
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>rating</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="glass-card p-8 relative overflow-hidden">
                {/* Mock booking card */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(2, 89, 221, 0.15)" }}>
                      <MapPin className="w-5 h-5" style={{ color: "var(--brand-primary)" }} />
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>PICKUP</p>
                      <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>Hazratganj, Lucknow</p>
                    </div>
                  </div>
                  <div className="w-px h-8 ml-5" style={{ background: "var(--border-subtle)" }} />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(16, 185, 129, 0.15)" }}>
                      <MapPin className="w-5 h-5" style={{ color: "var(--brand-success)" }} />
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>DROP-OFF</p>
                      <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>Gomti Nagar, Lucknow</p>
                    </div>
                  </div>

                  <div className="divider" />

                  <div className="grid grid-cols-3 gap-3">
                    {["🛻 Tata Ace", "🚛 Tempo", "🚚 Pickup"].map((v, i) => (
                      <div key={v} className="text-center p-3 rounded-xl cursor-pointer transition-all" style={{
                        background: i === 0 ? "rgba(2, 89, 221, 0.1)" : "var(--bg-tertiary)",
                        border: i === 0 ? "1px solid var(--brand-primary)" : "1px solid var(--border-subtle)",
                      }}>
                        <span className="text-xl">{v.split(" ")[0]}</span>
                        <p className="text-xs mt-1 font-medium" style={{ color: i === 0 ? "var(--brand-primary-light)" : "var(--text-muted)" }}>
                          {v.split(" ").slice(1).join(" ")}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "var(--bg-tertiary)" }}>
                    <div>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>ESTIMATED FARE</p>
                      <p className="font-mono text-2xl font-bold" style={{ color: "var(--text-primary)" }}>₹847</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>DISTANCE</p>
                      <p className="font-mono text-lg font-semibold" style={{ color: "var(--text-secondary)" }}>12.4 km</p>
                    </div>
                  </div>

                  <button className="btn-primary w-full" style={{ padding: "16px" }}>
                    Confirm Booking <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Animated truck */}
                <motion.div
                  className="absolute -top-4 -right-4 text-4xl"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  🚛
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────────────────── */}
      <section className="py-16" style={{ background: "var(--bg-secondary)" }}>
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="font-mono text-3xl md:text-4xl font-extrabold gradient-text">
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${feature.color}15`, color: feature.color }}>
                  {feature.icon}
                </div>
                <h3 className="font-display text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{feature.desc}</p>
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

          <div className="grid md:grid-cols-4 gap-6">
            {vehicles.map((v, i) => (
              <motion.div
                key={v.type}
                className="card card-hover cursor-pointer text-center"
                onClick={() => setActiveVehicle(i)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{
                  borderColor: activeVehicle === i ? "var(--brand-primary)" : undefined,
                  boxShadow: activeVehicle === i ? "var(--shadow-glow)" : undefined,
                }}
              >
                <span className="text-5xl mb-4 block">{v.icon}</span>
                <h3 className="font-display text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>{v.type}</h3>
                <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>{v.desc}</p>
                <div className="flex items-center justify-center gap-4">
                  <span className="badge badge-delivered">{v.capacity}</span>
                  <span className="font-mono font-bold" style={{ color: "var(--brand-primary-light)" }}>from {v.price}</span>
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

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                className="relative text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{
                  background: "linear-gradient(135deg, rgba(2, 89, 221, 0.1), rgba(132, 175, 251, 0.1))",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--brand-primary-light)",
                }}>
                  {s.icon}
                </div>
                <span className="font-mono text-xs font-bold block mb-2" style={{ color: "var(--brand-primary)" }}>{s.step}</span>
                <h3 className="font-display text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>{s.title}</h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 right-0 translate-x-1/2">
                    <ChevronRight className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
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
              <div className="flex flex-wrap justify-center gap-4">
                <a href="/book" className="btn-primary text-base" style={{ padding: "16px 40px" }}>
                  Start Shipping <ArrowRight className="w-5 h-5" />
                </a>
                <a href="/driver/onboard" className="btn-secondary text-base" style={{ padding: "16px 40px" }}>
                  <Truck className="w-5 h-5" /> Become a Driver
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="py-16" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="container-wide">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🚛</span>
                <span className="font-display text-xl font-bold">CargoHub</span>
              </div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                India&apos;s smart cargo logistics platform. Built for speed, transparency, and trust.
              </p>
            </div>
            <div>
              <h4 className="font-display font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Product</h4>
              <div className="space-y-3">
                {["Book a Truck", "Track Shipment", "Fare Calculator", "Business Account"].map(l => (
                  <a key={l} href="#" className="block text-sm hover:underline" style={{ color: "var(--text-secondary)" }}>{l}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-display font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Company</h4>
              <div className="space-y-3">
                {["About Us", "Careers", "Blog", "Contact"].map(l => (
                  <a key={l} href="#" className="block text-sm hover:underline" style={{ color: "var(--text-secondary)" }}>{l}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-display font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Download</h4>
              <div className="space-y-3">
                <a href="#" className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <Smartphone className="w-4 h-4" /> Android App
                </a>
                <a href="#" className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <Phone className="w-4 h-4" /> iOS App
                </a>
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

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Linkedin, Github, Globe, Code, Shield, Layers, Award,
  MapPin, Star, Sparkles, Smartphone, ChevronRight, LogOut, Settings
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import Image from "next/image";
import logo from "../icon.jpeg";
import { ThemeToggle } from "@/components/ThemeToggle";

interface TeamMember {
  name: string;
  role: string;
  roleType: string;
  avatarColor: string;
  avatarInitials: string;
  linkedin: string;
  github: string;
  portfolio?: string;
  skills: string[];
  contribution: string;
}

const MemberAvatar = ({ member }: { member: TeamMember }) => {
  const [imgError, setImgError] = useState(false);
  const username = member.github.split("/").pop();
  const avatarUrl = username ? `https://github.com/${username}.png` : "";

  if (avatarUrl && !imgError) {
    return (
      <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-lg border flex-shrink-0" style={{ borderColor: "var(--border-subtle)" }}>
        <img
          src={avatarUrl}
          alt={member.name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${member.avatarColor} flex items-center justify-center text-white font-sans text-xl font-bold shadow-lg flex-shrink-0`}>
      {member.avatarInitials}
    </div>
  );
};

const teamMembers: TeamMember[] = [
  {
    name: "Krish Dargar",
    role: "Team Leader",
    roleType: "Full Stack Developer",
    avatarColor: "from-blue-600 to-indigo-600 shadow-blue-500/30",
    avatarInitials: "KD",
    linkedin: "https://www.linkedin.com/in/krish-dargar-101774324/",
    github: "https://github.com/KD2303",
    portfolio: "https://krishdargar.vercel.app/",
    skills: ["Next.js", "React Native", "TypeScript", "Node.js", "Firebase", "System Arch"],
    contribution: "Project architect. Developed backend API structures, dashboard states, and security layers."
  },
  {
    name: "Prateek Amar Batham",
    role: "Core Developer",
    roleType: "Full Stack Developer",
    avatarColor: "from-emerald-500 to-teal-500 shadow-emerald-500/30",
    avatarInitials: "PB",
    linkedin: "https://www.linkedin.com/in/prateek-amar-batham-827734329/",
    github: "https://github.com/Omyx0",
    skills: ["React", "Express", "Tailwind CSS", "Redux", "PostgreSQL"],
    contribution: "Designed state management, booking containers, and streamlined overall front-to-back integration."
  },
  {
    name: "Palash Rai",
    role: "Core Developer",
    roleType: "Full Stack Developer",
    avatarColor: "from-rose-500 to-orange-500 shadow-rose-500/30",
    avatarInitials: "PR",
    linkedin: "https://www.linkedin.com/in/palash-rai2612",
    github: "https://github.com/Palash-r26",
    portfolio: "https://palashrai.me/",
    skills: ["Next.js", "Tailwind CSS", "Framer Motion", "MongoDB", "REST APIs"],
    contribution: "Engineered tracking screens, interactive UI illustrations, and micro-interaction visual systems."
  },
  {
    name: "Sumit Singh Bhadoria",
    role: "Core Developer",
    roleType: "Full Stack Developer",
    avatarColor: "from-violet-600 to-purple-600 shadow-purple-500/30",
    avatarInitials: "SB",
    linkedin: "https://www.linkedin.com/in/ss-bhadoria-rs2101/",
    github: "https://github.com/SSbhadoria21",
    portfolio: "https://ssb.sumitsbhadoria21.workers.dev/",
    skills: ["Node.js", "Cloudflare Workers", "Supabase", "REST APIs", "Docker"],
    contribution: "Constructed the relational schemas, optimized route algorithms, and deployed serverless webhooks."
  },
  {
    name: "Sarvesh Baghel",
    role: "Core Developer",
    roleType: "App Developer",
    avatarColor: "from-amber-500 to-orange-600 shadow-orange-500/30",
    avatarInitials: "SB",
    linkedin: "https://www.linkedin.com/in/sarvesh-baghel-b3a726274/",
    github: "https://github.com/sarveshbaghel",
    skills: ["Flutter", "Dart", "Firebase", "Google Maps SDK", "State Management"],
    contribution: "Engineered driver and customer mobile shell widgets, GPS broadcast relays, and APK builds."
  }
];

export default function DeveloperPage() {
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
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between h-[68px]">
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
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-[14px] font-semibold transition-colors" style={{ color: "var(--text-secondary)" }}>Home</Link>
            <Link href="/download" className="text-[14px] font-semibold transition-colors" style={{ color: "var(--text-secondary)" }}>Download App</Link>
            <Link href="/developer" className="text-[14px] font-semibold transition-colors" style={{ color: "var(--brand-primary)" }}>Developers</Link>
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
              href={user ? "/dashboard" : "/book"}
              className="text-[13px] md:text-[14px] font-bold text-white px-4 md:px-5 py-2 md:py-2.5 shadow-sm transition-opacity hover:opacity-90 whitespace-nowrap"
              style={{ background: "var(--brand-primary)", borderRadius: "4px" }}
            >
              {user ? "Dashboard" : "Book Now"}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero / Hackathon Details ── */}
      <section className="relative pt-32 pb-16 overflow-hidden bg-mesh bg-grid">
        <div className="container-wide relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <span className="pill" style={{ borderColor: "var(--brand-secondary)", color: "var(--brand-secondary)", background: "rgba(255, 102, 72, 0.05)" }}>
              <Award className="w-4 h-4 mr-2 inline" /> Zuup Hackathon Entry
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Meet Team <span className="gradient-text">Panchayat</span>
            </h1>
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
              We engineered CargoHub for the prestigious <strong>Far Away</strong> Hackathon organized by <strong>Zuup</strong>. A smart, sustainable cargo booking & fleet tracking portal designed to modernize logistics.
            </p>
          </motion.div>

          {/* Hackathon Specs Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 px-4"
          >
            {[
              { label: "TEAM NAME", value: "Panchayat", icon: <Users className="w-5 h-5 text-blue-500" /> },
              { label: "HACKATHON", value: "Far Away", icon: <Sparkles className="w-5 h-5 text-orange-500" /> },
              { label: "ORGANIZER", value: "Zuup", icon: <Award className="w-5 h-5 text-amber-500" /> },
              { label: "MEMBERS", value: "5 Developers", icon: <Code className="w-5 h-5 text-emerald-500" /> }
            ].map((spec, i) => (
              <div key={i} className="glass p-5 rounded-xl border flex flex-col items-center justify-center gap-1.5" style={{ borderColor: "var(--border-subtle)" }}>
                {spec.icon}
                <span className="text-[10px] tracking-wider font-bold text-neutral-400 block uppercase">{spec.label}</span>
                <span className="text-base font-bold text-[var(--text-primary)]">{spec.value}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Team Grid ── */}
      <section className="py-20" style={{ background: "var(--bg-secondary)" }}>
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold">
              The <span className="gradient-text">Builders</span>
            </h2>
            <p className="text-base mt-2" style={{ color: "var(--text-secondary)" }}>
              A collaborative team pooling together full-stack web, database, and app architecture expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-0">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="glass-card flex flex-col h-full justify-between"
              >
                {/* Card Top */}
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-4">
                    {/* Avatar using GitHub Profile Image with Gradient Fallback */}
                    <MemberAvatar member={member} />
                    <div>
                      <h3 className="font-display text-lg font-bold flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                        {member.name}
                        {member.role === "Team Leader" && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold bg-blue-500/20 text-blue-500 border border-blue-500/30">
                            {member.role}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{member.roleType}</p>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    &quot;{member.contribution}&quot;
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {member.skills.map((skill) => (
                      <span key={skill} className="text-[10px] px-2 py-0.5 rounded font-medium bg-black/5 dark:bg-white/5 border" style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Bottom: Social Links */}
                <div className="p-4 bg-black/5 dark:bg-white/5 border-t flex justify-end gap-3 rounded-b-xl" style={{ borderColor: "var(--border-subtle)" }}>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg border flex items-center justify-center transition-colors text-[var(--text-secondary)] hover:text-blue-500 hover:bg-blue-500/10"
                    style={{ borderColor: "var(--border-subtle)" }}
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg border flex items-center justify-center transition-colors text-[var(--text-secondary)] hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10"
                    style={{ borderColor: "var(--border-subtle)" }}
                    aria-label="GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                  {member.portfolio && (
                    <a
                      href={member.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg border flex items-center justify-center transition-colors text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10"
                      style={{ borderColor: "var(--border-subtle)" }}
                      aria-label="Portfolio"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Project Showcase section ── */}
      <section className="py-20">
        <div className="container-narrow">
          <div className="card space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Layers className="w-6 h-6 text-[var(--brand-primary)]" />
              CargoHub Sustainable Architecture
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              CargoHub is built upon a hybrid tech stack carefully chosen for low latency, secure role-based controls, and seamless real-time map tracking updates. We set out to solve the carbon footprint overhead of local carrier deadhead miles using smart matchmaking.
            </p>
            
            <div className="grid sm:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-xl border bg-black/5 dark:bg-white/5" style={{ borderColor: "var(--border-subtle)" }}>
                <span className="text-xs font-bold text-blue-500 block mb-1">FRONTEND</span>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Next.js 14, TailwindCSS styling, Framer Motion graphics, React Context state containers.</p>
              </div>
              <div className="p-4 rounded-xl border bg-black/5 dark:bg-white/5" style={{ borderColor: "var(--border-subtle)" }}>
                <span className="text-xs font-bold text-orange-500 block mb-1">BACKEND</span>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Node.js / Express API gateway, Firebase authentication, REST webhooks, serverless logic.</p>
              </div>
              <div className="p-4 rounded-xl border bg-black/5 dark:bg-white/5" style={{ borderColor: "var(--border-subtle)" }}>
                <span className="text-xs font-bold text-emerald-500 block mb-1">STORAGE</span>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Supabase relational DB, GeoJSON geographical data formats, live GPS update pipelines.</p>
              </div>
            </div>
          </div>
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

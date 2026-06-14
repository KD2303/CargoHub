"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Clock, LogOut, Users, Shield, Car, Server } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface LiveSession {
  uid: string;
  role: string;
  email?: string;
  name?: string;
  startTime: number;
  lastPulse: number;
}

export default function LiveAnalyticsPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const { adminToken } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, '')}/api/admin/live-sessions`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setSessions(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, [adminToken]);

  const handleDisconnect = async (uid: string) => {
    try {
      await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, '')}/api/admin/live-sessions/${uid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      fetchSessions();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDuration = (start: number) => {
    const diff = Math.floor((Date.now() - start) / 1000); // seconds
    if (diff < 60) return `${diff}s`;
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}m ${secs}s`;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "USER": return <Users className="w-4 h-4 text-purple-500" />;
      case "DRIVER": return <Car className="w-4 h-4 text-green-500" />;
      case "ADMIN": return <Shield className="w-4 h-4 text-red-500" />;
      default: return <Server className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "USER": return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800";
      case "DRIVER": return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "ADMIN": return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      default: return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Live Analytics</h1>
          <p style={{ color: "var(--text-secondary)" }}>Real-time monitoring of all active sessions.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-4 py-2 rounded-full font-medium shadow-sm border border-green-200 dark:border-green-800/50">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          {sessions.length} Active Sessions
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[var(--text-muted)] bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)]">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No active sessions detected.</p>
          </div>
        ) : (
          sessions.map((session, i) => (
            <motion.div
              key={session.uid}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full" style={{ 
                backgroundColor: session.role === 'USER' ? '#a855f7' : session.role === 'DRIVER' ? '#22c55e' : '#ef4444' 
              }}></div>
              
              <div className="flex justify-between items-start mb-4 ml-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${getRoleColor(session.role)}`}>
                    {getRoleIcon(session.role)}
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)] leading-none mb-1.5">{session.name || "Anonymous User"}</h3>
                    <p className="text-xs text-[var(--text-muted)]">{session.email || "No email"}</p>
                  </div>
                </div>
                <div className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getRoleColor(session.role)}`}>
                  {session.role}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 ml-2 mt-auto pt-4 border-t border-[var(--border-subtle)]">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Session Time
                  </p>
                  <p className="font-mono text-sm font-medium text-[var(--text-primary)]">
                    {formatDuration(session.startTime)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Status
                  </p>
                  <p className="text-sm font-medium text-green-500">Connected</p>
                </div>
              </div>

              <button
                onClick={() => handleDisconnect(session.uid)}
                className="mt-4 w-full ml-2 py-2 flex items-center justify-center gap-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-xl transition-colors border border-red-100 dark:border-red-900/30"
              >
                <LogOut className="w-4 h-4" />
                Force Disconnect
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

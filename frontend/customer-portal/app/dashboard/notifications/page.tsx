"use client";

import { motion } from "framer-motion";
import { Mail, Smartphone, Bell, Loader2, Check, ChevronLeft } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useLanguageStore } from "@/store/languageStore";

export default function NotificationsPage() {
  const { t } = useLanguageStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Notifications State
  const [notifPreferences, setNotifPreferences] = useState({
    emailAlerts: true,
    smsAlerts: true,
    pushAlerts: false,
  });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Notifications</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Choose when and how you want to be notified.
          </p>
        </div>

        <Link 
          href="/dashboard/settings"
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl border transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
        >
          <ChevronLeft className="w-4 h-4" /> {t('backToSettings')}
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">Notification Channels</h3>
          <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>Configure which channels we can use to send updates about your bookings and deliveries.</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[var(--brand-primary)]">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">Email Alerts</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Receive booking confirmations, receipts, and cargo reports.</p>
                </div>
              </div>
              <button 
                onClick={() => setNotifPreferences({...notifPreferences, emailAlerts: !notifPreferences.emailAlerts})}
                className={`w-11 h-6 rounded-full relative transition-colors ${notifPreferences.emailAlerts ? "bg-blue-600" : "bg-gray-300 dark:bg-neutral-800"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${notifPreferences.emailAlerts ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-[var(--brand-secondary)]">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">SMS & WhatsApp Notifications</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Get instant driver arrival alerts and delivery ETAs directly on your phone.</p>
                </div>
              </div>
              <button 
                onClick={() => setNotifPreferences({...notifPreferences, smsAlerts: !notifPreferences.smsAlerts})}
                className={`w-11 h-6 rounded-full relative transition-colors ${notifPreferences.smsAlerts ? "bg-blue-600" : "bg-gray-300 dark:bg-neutral-800"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${notifPreferences.smsAlerts ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">In-App Push Banners</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Allow live web push banners for active shipment progress.</p>
                </div>
              </div>
              <button 
                onClick={() => setNotifPreferences({...notifPreferences, pushAlerts: !notifPreferences.pushAlerts})}
                className={`w-11 h-6 rounded-full relative transition-colors ${notifPreferences.pushAlerts ? "bg-blue-600" : "bg-gray-300 dark:bg-neutral-800"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${notifPreferences.pushAlerts ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end" style={{ borderColor: "var(--border-subtle)" }}>
            <button 
              onClick={() => {
                setIsSaving(true);
                setTimeout(() => {
                  setIsSaving(false);
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 2000);
                }, 800);
              }}
              className="btn-primary flex items-center gap-2"
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? <Check className="w-4 h-4" /> : null}
              {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Preferences"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

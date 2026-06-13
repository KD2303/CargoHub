"use client";

import { motion } from "framer-motion";
import { User, Bell, Shield, Key, Moon, Globe, Loader2, Check, ChevronLeft, Lock, Mail, Smartphone, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useState, useEffect, useRef } from "react";
import { auth as firebaseAuth } from "@/lib/firebase";

import { useLanguageStore } from "@/store/languageStore";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, setUser } = useAuthStore();
  const { language, setLanguage, t } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<"menu" | "profile" | "notifications" | "security">("menu");
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notifications State
  const [notifPreferences, setNotifPreferences] = useState({
    emailAlerts: true,
    smsAlerts: true,
    pushAlerts: false,
  });

  // Security State
  const [securityData, setSecurityData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Initialize form when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseAuth.currentUser) return;
    
    if (formData.phone && formData.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const idToken = await firebaseAuth.currentUser.getIdToken();
      const res = await fetch((`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`) + "/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        const idToken = await firebaseAuth.currentUser?.getIdToken();
        if (!idToken) return;

        const res = await fetch((`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`) + "/api/auth/upload-avatar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`
          },
          body: JSON.stringify({ base64Image })
        });

        const data = await res.json();
        if (data.success && data.url) {
          setUser({ ...user!, profilePhoto: data.url });
        } else {
          toast.error(data.error || "Failed to upload avatar");
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload failed", error);
      setIsUploading(false);
    }
  };

  const initials = user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "U";

  // Menu cards data
  const menuCards = [
    {
      id: "profile" as const,
      title: "Profile Settings",
      description: "Manage your avatar, name, email address, and personal phone number details.",
      icon: User,
      color: "var(--brand-primary)",
    },
    {
      id: "notifications" as const,
      title: "Notifications",
      description: "Customize your alerts for deliveries, order status changes, and promos.",
      icon: Bell,
      color: "var(--brand-secondary)",
    },
    {
      id: "security" as const,
      title: "Security",
      description: "Update your passwords, session access, and account privacy options.",
      icon: Shield,
      color: "#10B981",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">{t('settings')}</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {activeTab === "menu" && t('manage')}
            {activeTab === "profile" && "Update your account personal information."}
            {activeTab === "notifications" && "Choose when and how you want to be notified."}
            {activeTab === "security" && "Secure your account credentials and monitor active sessions."}
          </p>
        </div>

        {activeTab !== "menu" && (
          <button 
            onClick={() => setActiveTab("menu")}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl border transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
          >
            <ChevronLeft className="w-4 h-4" /> {t('backToSettings')}
          </button>
        )}
      </div>

      {/* Render Main Menu */}
      {activeTab === "menu" && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4"
        >
          {menuCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.id}
                onClick={() => setActiveTab(card.id)}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="glass-card p-6 text-left flex flex-col justify-between h-56 cursor-pointer group"
                style={{ 
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-glass)",
                  borderRadius: "var(--radius-xl)"
                }}
              >
                <div className="space-y-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
                    style={{ 
                      background: `${card.color}15`, 
                      color: card.color 
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg group-hover:text-[var(--brand-primary)] transition-colors" style={{ color: "var(--text-primary)" }}>
                      {t(card.id)}
                    </h3>
                    <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {t(card.id + 'Desc')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold transition-all duration-300 transform translate-x-0 group-hover:translate-x-1" style={{ color: "var(--brand-primary)" }}>
                  {t('configure')} <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {/* Render Profile Tab */}
      {activeTab === "profile" && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="card">
            <h3 className="font-semibold text-lg mb-4">Personal Information</h3>
            <div className="flex items-center gap-6 mb-6">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="w-20 h-20 rounded-full object-cover shadow-sm border border-gray-200" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-2xl" style={{ color: "var(--brand-primary)" }}>
                  {initials}
                </div>
              )}
              <div>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleAvatarChange} 
                />
                <button 
                  type="button" 
                  className="btn-secondary text-xs py-1.5 px-4" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Change Avatar"}
                </button>
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>JPG, GIF or PNG. Max size of 800K</p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSaveProfile}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Full Name</label>
                  <input 
                    type="text" 
                    className="input-field py-2 w-full" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Email Address</label>
                  <input 
                    type="email" 
                    className="input-field py-2 w-full opacity-70 bg-gray-50 dark:bg-gray-800" 
                    value={user?.email || ""} 
                    disabled 
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Phone Number</label>
                  <input 
                    type="tel" 
                    className="input-field py-2 w-full" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10)})}
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button type="submit" className="btn-primary flex items-center gap-2" disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? <Check className="w-4 h-4" /> : null}
                  {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          <div className="card">
            <h3 className="font-semibold text-lg mb-4">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t('language')}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t('languageDesc')}</p>
                  </div>
                </div>
                <select 
                  className="input-field py-1.5 px-3 w-auto text-sm"
                  value={language}
                  onChange={(e) => {
                    const lang = e.target.value as "en" | "hi" | "mr";
                    setLanguage(lang);
                    toast.success(lang === "en" ? "Language set to English" : lang === "hi" ? "भाषा हिंदी में बदली गई" : "भाषा मराठीमध्ये बदलली");
                  }}
                >
                  <option value="en">English (IN)</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="mr">मराठी (Marathi)</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center">
                    <Moon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t('darkMode')}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t('darkModeDesc')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className={`w-11 h-6 rounded-full relative transition-colors ${theme === "dark" ? "bg-blue-600" : "bg-gray-300"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${theme === "dark" ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Render Notifications Tab */}
      {activeTab === "notifications" && (
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
      )}

      {/* Render Security Tab */}
      {activeTab === "security" && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="card">
            <h3 className="font-semibold text-lg mb-4">Reset Password</h3>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (securityData.newPassword !== securityData.confirmPassword) {
                  toast.error("Passwords do not match!");
                  return;
                }
                setIsSaving(true);
                setTimeout(() => {
                  setIsSaving(false);
                  setSaveSuccess(true);
                  setSecurityData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                  setTimeout(() => setSaveSuccess(false), 2000);
                }, 1000);
              }} 
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Current Password</label>
                <input 
                  type="password" 
                  className="input-field py-2 w-full" 
                  value={securityData.oldPassword}
                  onChange={(e) => setSecurityData({...securityData, oldPassword: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>New Password</label>
                  <input 
                    type="password" 
                    className="input-field py-2 w-full" 
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Confirm Password</label>
                  <input 
                    type="password" 
                    className="input-field py-2 w-full" 
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end border-t" style={{ borderColor: "var(--border-subtle)" }}>
                <button type="submit" className="btn-primary flex items-center gap-2" disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? <Check className="w-4 h-4" /> : null}
                  {isSaving ? "Updating..." : saveSuccess ? "Updated!" : "Update Password"}
                </button>
              </div>
            </form>
          </div>

          <div className="card">
            <h3 className="font-semibold text-lg mb-4">Device Sessions</h3>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>You are currently logged in to the portal on these devices.</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Windows Chrome (This Device)</p>
                    <p className="text-[10px] text-green-600 font-semibold">Active Now • IP: 103.45.89.21</p>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-green-500/20 text-green-600 font-bold uppercase tracking-wider">Current</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: "var(--border-subtle)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center text-neutral-500">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">iPhone 15 Pro Max</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Last active: 2 hours ago • New Delhi, India</p>
                  </div>
                </div>
                <button className="text-[10px] px-3 py-1.5 rounded-lg border font-semibold text-red-500 hover:bg-red-500/10 transition-colors" style={{ borderColor: "rgba(239, 68, 68, 0.2)" }}>
                  Revoke
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

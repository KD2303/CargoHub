"use client";

import { motion } from "framer-motion";
import { User, Bell, Shield, Key, Moon, Globe, Loader2, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/authStore";
import { useState, useEffect, useRef } from "react";
import { auth as firebaseAuth } from "@/lib/firebase";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, setUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const idToken = await firebaseAuth.currentUser.getIdToken();
      const res = await fetch("http://localhost:5000/api/auth/me", {
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
        alert(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
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

        const res = await fetch("http://localhost:5000/api/auth/upload-avatar", {
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
          alert(data.error || "Failed to upload avatar");
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload failed", error);
      setIsUploading(false);
    }
  };

  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "U";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Settings</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Manage your profile, notifications, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Nav for Settings */}
        <div className="col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 font-semibold text-sm">
            <User className="w-4 h-4" /> Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 font-medium text-sm transition-colors">
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 font-medium text-sm transition-colors">
            <Shield className="w-4 h-4" /> Security
          </button>
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
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
                    onChange={e => setFormData({...formData, phone: e.target.value})}
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
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <h3 className="font-semibold text-lg mb-4">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Language</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Select your preferred language</p>
                  </div>
                </div>
                <select className="input-field py-1 px-3 w-auto text-sm bg-transparent border-none">
                  <option>English (IN)</option>
                  <option>Hindi</option>
                  <option>Marathi</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Moon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Dark Mode</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Toggle dark appearance</p>
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}

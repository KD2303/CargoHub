"use client";

import { motion } from "framer-motion";
import { User, Loader2, Check, ChevronLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useState, useEffect, useRef } from "react";
import { auth as firebaseAuth } from "@/lib/firebase";
import Link from "next/link";
import { useLanguageStore } from "@/store/languageStore";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { t } = useLanguageStore();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const res = await fetch((`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, '')}`) + "/api/auth/me", {
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

        const res = await fetch((`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, '')}`) + "/api/auth/upload-avatar", {
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

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Profile Settings</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Update your account personal information.
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
      </motion.div>
    </div>
  );
}

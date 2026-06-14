"use client";

import { motion } from "framer-motion";
import { Loader2, Check, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useLanguageStore } from "@/store/languageStore";

export default function SecurityPage() {
  const { t } = useLanguageStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Security State
  const [securityData, setSecurityData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Security</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Secure your account credentials.
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
      </motion.div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { User, Server, Save, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { adminFetch } from "@/lib/admin/api";
import { toast } from '@/store/toastStore';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("platform");
  const { adminUser } = useAuthStore();
  const [baseFare, setBaseFare] = useState(50);
  const [perKmRate, setPerKmRate] = useState(12);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [adminName, setAdminName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (adminUser) {
      setAdminName(adminUser.name || "");
    }
  }, [adminUser]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await adminFetch('/api/admin/settings');
        if (res.data) {
          setBaseFare(res.data.baseFare);
          setPerKmRate(res.data.perKmRate);
        }
      } catch (err) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminFetch('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ baseFare, perKmRate })
      });
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      // Simulate profile saving (you would normally hit an endpoint like /api/admin/profile)
      await new Promise(r => setTimeout(r, 600));
      toast.success("Admin profile updated successfully!");
      setAdminPassword(""); // Clear password field after save
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <PageHeader title="Settings" subtitle="Manage platform configurations and your personal account." />

      <div className="flex border-b border-[var(--border-subtle)] mb-8">
        <button 
          onClick={() => setActiveTab("platform")}
          className={`flex items-center pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === "platform" ? 'border-[var(--admin-primary)] text-[var(--admin-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          <Server className="w-4 h-4 mr-2" /> Platform Settings
        </button>
        <button 
          onClick={() => setActiveTab("personal")}
          className={`flex items-center pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === "personal" ? 'border-[var(--admin-primary)] text-[var(--admin-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          <User className="w-4 h-4 mr-2" /> Personal Settings
        </button>
      </div>

      {activeTab === "platform" && (
        <div className="space-y-6">
          <div className="bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-subtle)] shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Fare Matrix Config</h2>
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-[var(--text-secondary)]" /></div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-2">Base Fare (Mini)</label>
                    <input type="number" value={baseFare} onChange={(e) => setBaseFare(Number(e.target.value))} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--admin-primary-light)] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-2">Per Km Rate</label>
                    <input type="number" value={perKmRate} onChange={(e) => setPerKmRate(Number(e.target.value))} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--admin-primary-light)] outline-none" />
                  </div>
                </div>
                <button disabled={saving} onClick={handleSave} className="mt-4 flex items-center px-4 py-2 bg-[var(--admin-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--admin-primary-mid)] transition-colors disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Fare Config
                </button>
              </>
            )}
          </div>

          <div className="bg-[var(--bg-primary)] p-6 rounded-xl border border-[var(--border-subtle)] shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">API Integrations</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-2">FCM Server Key</label>
                <input type="password" value="************************" readOnly className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-muted)] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-2">Cloudinary URL</label>
                <input type="text" value="cloudinary://api_key..." readOnly className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-muted)] outline-none" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "personal" && (
        <div className="bg-[var(--bg-primary)] p-6 md:p-8 rounded-xl border border-[var(--border-subtle)] shadow-sm">
          <h2 className="text-xl font-bold mb-8 text-[var(--text-primary)]">Admin Profile</h2>
          
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="flex flex-col items-center gap-4 shrink-0">
              <div className="w-28 h-28 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-3xl font-bold shadow-lg border-4 border-[var(--bg-primary)] ring-1 ring-[var(--border-subtle)]">
                {adminName ? adminName.substring(0,2).toUpperCase() : "AD"}
              </div>
              <button className="text-sm font-semibold text-[var(--admin-primary)] hover:text-[var(--admin-primary-mid)] transition-colors">
                Upload New Image
              </button>
            </div>

            <div className="flex-1 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Display Name</label>
                  <input 
                    type="text" 
                    value={adminName} 
                    onChange={e => setAdminName(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--admin-primary)] outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-2">
                    Email Address <span className="text-[10px] bg-gray-200 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">Locked</span>
                  </label>
                  <input 
                    type="email" 
                    value={adminUser?.email || ""} 
                    disabled 
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-[#111] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-muted)] outline-none opacity-60 cursor-not-allowed" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Update Password</label>
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="Enter new password to change..."
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--admin-primary)] outline-none transition-all" 
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-6 border-t border-[var(--border-subtle)]">
            <button 
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="flex items-center px-6 py-2.5 bg-[var(--admin-primary)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--admin-primary-mid)] transition-colors shadow-sm disabled:opacity-50"
            >
              {savingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

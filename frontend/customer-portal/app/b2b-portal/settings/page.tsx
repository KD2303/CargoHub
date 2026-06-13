"use client";

import { useState, useEffect, useRef } from "react";
import { Building, CreditCard, Bell, Shield, CheckCircle2, ChevronLeft, ArrowRight, User, Upload } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

export default function B2BSettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"menu" | "profile" | "company" | "billing" | "notifications" | "security">("menu");
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Read tab from URL query params
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ["menu", "profile", "company", "billing", "notifications", "security"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      toast.success("Profile photo updated successfully!");
    }, 1500);
  };

  const [companyDetails, setCompanyDetails] = useState({
    name: "Acme Logistics Pvt Ltd",
    gstin: "27AADCB2230M1Z2",
    billingEmail: "finance@acme.com",
    address: "101, Business Park, Andheri East, Mumbai 400059"
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved successfully!");
    }, 1000);
  };

  const menuCards = [
    {
      id: "profile" as const,
      title: "My Profile",
      description: "Manage your personal details, email address, and avatar.",
      icon: User,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
      hover: "group-hover:text-purple-600 dark:group-hover:text-purple-400"
    },
    {
      id: "company" as const,
      title: "Company Profile",
      description: "Manage your corporate details, GSTIN, and registered address.",
      icon: Building,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      hover: "group-hover:text-blue-600 dark:group-hover:text-blue-400"
    },
    {
      id: "billing" as const,
      title: "Billing & Payment",
      description: "View your credit limits, outstanding dues, and postpaid terms.",
      icon: CreditCard,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      hover: "group-hover:text-orange-500"
    },
    {
      id: "notifications" as const,
      title: "Notifications",
      description: "Customize alerts for booking approvals, shipments, and budgets.",
      icon: Bell,
      color: "text-indigo-500 dark:text-indigo-400",
      bg: "bg-indigo-500/10",
      hover: "group-hover:text-indigo-500 dark:group-hover:text-indigo-400"
    },
    {
      id: "security" as const,
      title: "Security",
      description: "Enable 2FA and monitor active sessions on your corporate account.",
      icon: Shield,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      hover: "group-hover:text-emerald-500"
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-2">Account Settings</h1>
          <p className="text-[var(--text-secondary)]">
            {activeTab === "menu" && "Manage your corporate profile, billing details, and preferences."}
            {activeTab === "profile" && "Update your personal information."}
            {activeTab === "company" && "Update your company's official information."}
            {activeTab === "billing" && "Review your corporate postpaid credit limits."}
            {activeTab === "notifications" && "Choose when and how you want to be notified."}
            {activeTab === "security" && "Secure your account credentials and monitor active sessions."}
          </p>
        </div>

        {activeTab !== "menu" && (
          <button 
            onClick={() => setActiveTab("menu")}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border border-[var(--border-outline)] transition-colors hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] shrink-0"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Settings
          </button>
        )}
      </div>

      {activeTab === "menu" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 animate-in fade-in slide-in-from-bottom-4">
          {menuCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => setActiveTab(card.id)}
                className="bg-[var(--bg-card)] border border-[var(--border-outline)] p-5 text-left flex flex-col justify-start rounded-2xl cursor-pointer group hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${card.bg} ${card.color} transition-all duration-300`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className={`font-display font-bold text-base ${card.hover} text-[var(--text-primary)] transition-colors`}>
                    {card.title}
                  </h3>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4 flex-1">
                  {card.description}
                </p>
                <div className={`flex items-center gap-1.5 text-xs font-bold ${card.color} transition-all duration-300 transform translate-x-0 group-hover:translate-x-1 mt-auto`}>
                  Configure <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {activeTab !== "menu" && (
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-outline)] p-6 md:p-8 animate-in fade-in slide-in-from-right-4">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 border-b border-[var(--border-outline)] pb-4">Personal Profile</h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-3xl shadow-md overflow-hidden relative group">
                  {(user as any)?.profilePhoto ? (
                    <img src={(user as any).profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0) || 'U'
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--text-primary)]">{user?.name || "User"}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">{user?.role === "USER" ? "B2B Administrator" : user?.role}</p>
                  
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleAvatarChange} 
                  />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-1.5 bg-[var(--bg-tertiary)] hover:bg-[var(--border-outline)] border border-[var(--border-outline)] text-[var(--text-primary)] text-xs font-semibold rounded-lg transition-colors"
                  >
                    {isUploading ? "Uploading..." : "Change Avatar"}
                  </button>
                  <p className="text-xs text-[var(--text-muted)] mt-2">JPG, GIF or PNG. Max 1MB.</p>
                </div>
              </div>

              <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">Full Name</label>
                    <input 
                      type="text" 
                      defaultValue={user?.name || ""}
                      className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue={user?.email || ""}
                      disabled
                      className="w-full px-4 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-outline)] rounded-xl text-sm text-[var(--text-secondary)] opacity-70 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    defaultValue={user?.phone || ""}
                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-[var(--text-primary)]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'company' && (
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 border-b border-[var(--border-outline)] pb-4">Company Profile</h2>
              
              <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">Company Name</label>
                    <input 
                      type="text" 
                      value={companyDetails.name}
                      onChange={(e) => setCompanyDetails({...companyDetails, name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">GSTIN Number</label>
                    <input 
                      type="text" 
                      value={companyDetails.gstin}
                      onChange={(e) => setCompanyDetails({...companyDetails, gstin: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono uppercase text-[var(--text-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">Finance/Billing Email</label>
                  <input 
                    type="email" 
                    value={companyDetails.billingEmail}
                    onChange={(e) => setCompanyDetails({...companyDetails, billingEmail: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-[var(--text-primary)]"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-2">All monthly invoices will be sent to this email address.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">Registered Address</label>
                  <textarea 
                    rows={3}
                    value={companyDetails.address}
                    onChange={(e) => setCompanyDetails({...companyDetails, address: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm resize-none text-[var(--text-primary)]"
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 border-b border-[var(--border-outline)] pb-4">Billing & Payment</h2>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5 mb-8 flex items-start gap-4">
                <CreditCard className="w-6 h-6 text-orange-500 shrink-0" />
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">Postpaid Corporate Account Active</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Your company is on a 30-day net billing cycle. Your current credit limit is ₹2,000,000.</p>
                </div>
              </div>
              <button className="text-sm font-semibold text-orange-500 hover:underline">Request Limit Increase &rarr;</button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 border-b border-[var(--border-outline)] pb-4">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { title: "Booking Confirmations", desc: "Get notified when a fleet is assigned." },
                  { title: "Monthly Statements", desc: "Receive automated account statements." },
                  { title: "Budget Alerts", desc: "Alert when a team member exceeds 80% limit." },
                ].map((item, i) => (
                  <label key={i} className="flex items-start gap-4 p-4 border border-[var(--border-outline)] rounded-xl cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors">
                    <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-[var(--border-input)] bg-[var(--bg-primary)]" />
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">{item.title}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 border-b border-[var(--border-outline)] pb-4">Security Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">Two-Factor Authentication (2FA)</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">Add an extra layer of security to your corporate account.</p>
                  <button className="px-4 py-2 border border-[var(--border-input)] text-[var(--text-primary)] font-semibold rounded-lg hover:bg-[var(--bg-tertiary)] text-sm transition-colors">
                    Enable 2FA
                  </button>
                </div>
                <div className="pt-6 border-t border-[var(--border-outline)]">
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">Active Sessions</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">You are currently logged in from 1 device.</p>
                  <button className="px-4 py-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 font-semibold rounded-lg text-sm transition-colors">
                    Log out of all devices
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-[var(--border-outline)] flex justify-end">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? "Saving..." : <><CheckCircle2 className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { User, Bell, Shield, ArrowRight } from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";
import Link from "next/link";

export default function SettingsPage() {
  const { t } = useLanguageStore();

  // Menu cards data
  const menuCards = [
    {
      id: "profile" as const,
      route: "/dashboard/profile",
      title: "Profile Settings",
      description: "Manage your avatar, name, email address, and personal phone number details.",
      icon: User,
      color: "var(--brand-primary)",
    },
    {
      id: "notifications" as const,
      route: "/dashboard/notifications",
      title: "Notifications",
      description: "Customize your alerts for deliveries, order status changes, and promos.",
      icon: Bell,
      color: "var(--brand-secondary)",
    },
    {
      id: "security" as const,
      route: "/dashboard/security",
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
            {t('manage')}
          </p>
        </div>
      </div>

      {/* Render Main Menu */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4"
      >
        {menuCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.id} href={card.route}>
              <motion.div
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
              </motion.div>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}

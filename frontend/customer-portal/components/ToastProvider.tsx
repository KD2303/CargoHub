"use client";

import { useToastStore } from "@/store/toastStore";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export function ToastProvider() {
  const { toasts, removeToast } = useToastStore();

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />;
      case "error": return <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-orange-500 dark:text-orange-400" />;
      default: return <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
    }
  };

  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 pointer-events-none w-full max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            layout
            className="pointer-events-auto flex items-start gap-4 p-4 rounded-2xl bg-[var(--bg-card-solid)] border border-[var(--border-subtle)] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden"
          >
            {/* Glowing left edge */}
            <div className={`absolute top-0 left-0 w-1.5 h-full ${
              toast.type === "success" ? "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]" :
              toast.type === "error" ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" :
              toast.type === "warning" ? "bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.6)]" : 
              "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]"
            }`} />

            <div className="flex-shrink-0 mt-0.5 ml-1">{getIcon(toast.type)}</div>
            
            <div className="flex-1 min-w-0 pr-2">
              {toast.type === "success" && <p className="text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400 mb-0.5">Success</p>}
              {toast.type === "error" && <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-0.5">Error</p>}
              {toast.type === "warning" && <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400 mb-0.5">Warning</p>}
              {toast.type === "info" && <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-0.5">Notice</p>}
              <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

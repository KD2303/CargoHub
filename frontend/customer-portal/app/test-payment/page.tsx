"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { useTheme } from "next-themes";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, ShieldCheck, CheckCircle2, ChevronRight, Lock, Sun, Moon, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function PremiumCheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<number | "">("");
  const [step, setStep] = useState<"input" | "ready" | "success">("input");
  const [paymentId, setPaymentId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, loading: authLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Prevent hydration mismatch for next-themes
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleProceed = () => {
    if (amount && Number(amount) > 0) {
      setErrorMessage("");
      setStep("ready");
    } else {
      toast.error("Please enter a valid amount greater than 0.");
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch((`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, '')}`) + "/api/payments/test-create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) }),
      });
      
      const resData = await response.json();

      if (!resData.success) {
        toast.error("Server error. Could not create order.");
        setLoading(false);
        return;
      }

      const { data } = resData;

      const options = {
        key: "rzp_test_SzETI5YgX84RSu", 
        amount: data.amount, 
        currency: data.currency,
        name: "CargoHub",
        image: data.logo || "https://dummyimage.com/100x100/2563eb/ffffff&text=CargoHub",
        order_id: data.orderId, 
        handler: function (response: any) {
          setPaymentId(response.razorpay_payment_id);
          setStep("success");
        },
        modal: {
          ondismiss: function () {
            setErrorMessage("Payment was cancelled by the user.");
            setLoading(false);
            setStep("ready");
          }
        },
        prefill: {
          name: "CargoHub Customer",
          email: "customer@cargohub.com",
          contact: "9999999999",
        },
        theme: {
          // Change the theme color of the popup based on the current Next theme
          color: theme === 'dark' ? "#1e293b" : "#2563eb", 
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      
      razorpay.on("payment.failed", function (response: any) {
        setErrorMessage(`Payment Failed: ${response.error.description}`);
        setLoading(false);
        setStep("ready");
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      setErrorMessage("Failed to initiate payment. Ensure your backend is running.");
      setStep("ready");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh" style={{ background: "var(--bg-primary)" }}>
        <div className="w-10 h-10 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin shadow-glow"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-mesh">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      {/* Theme Toggle */}
      {mounted && (
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="btn-icon fixed top-6 right-6 z-[100]"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Glassmorphism Card utilizing CargoHub's global system */}
        <div className="glass-card p-6 sm:p-8 md:p-10 relative overflow-hidden">
          
          {/* Header */}
          <div className="flex flex-col items-center justify-center text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white dark:bg-slate-800 border border-[var(--border-subtle)] rounded-2xl flex items-center justify-center shadow-sm mb-4">
              <img src="/logo.jpeg" alt="CargoHub Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain mix-blend-multiply dark:mix-blend-normal" />
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-[var(--text-primary)]">
              CargoHub <span className="gradient-text">Checkout</span>
            </h1>
            <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5 mt-2 font-medium bg-[var(--bg-secondary)] px-3 py-1 rounded-full border border-[var(--border-subtle)]">
              <Lock className="w-3.5 h-3.5 text-green-500" /> End-to-End Encrypted
            </p>
          </div>

          {/* Dynamic Content */}
          <AnimatePresence mode="wait">
            {step === "input" && (
              <motion.div
                key="input"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider text-xs">
                      Payment Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-mono text-xl font-medium">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                        placeholder="0.00"
                        className="input-field pl-10 py-4 text-xl font-bold font-mono shadow-inner"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleProceed}
                    className="btn-primary w-full py-4 text-base"
                  >
                    Proceed Securely
                    <ChevronRight className="w-4 h-4 ml-1 opacity-80" />
                  </button>

                  <div className="flex justify-center mt-4">
                    <button 
                      onClick={() => router.push('/dashboard')}
                      className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === "ready" && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="mb-6 sm:mb-8">
                  <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider font-semibold mb-2">Amount to Pay</p>
                  <h2 className="text-4xl sm:text-5xl font-mono font-bold text-[var(--text-primary)] tracking-tight break-all">
                    ₹{amount}
                  </h2>
                </div>

                {errorMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[var(--bg-secondary)] border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3 text-left"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      {errorMessage}
                    </p>
                  </motion.div>
                )}

                <div className="bg-[var(--bg-secondary)] rounded-xl p-4 mb-8 border border-[var(--border-subtle)] flex items-start gap-4 text-left">
                  <ShieldCheck className="w-6 h-6 text-[var(--brand-success)] shrink-0 mt-0.5" />
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Powered by Razorpay. Use UPI, Credit/Debit Card, or NetBanking on the next screen.
                  </p>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="btn-primary w-full py-4 text-base flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-wait"
                >
                  <CreditCard className="w-5 h-5 opacity-80" />
                  {loading ? "Initializing..." : "Pay Now"}
                </button>

                <div className="mt-6 flex flex-col items-center gap-4">
                  <button 
                    onClick={() => setStep("input")}
                    className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors"
                  >
                    Modify Amount
                  </button>
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, type: "spring" }}
                className="text-center py-4"
              >
                <div className="w-20 h-20 bg-[var(--bg-secondary)] border border-[var(--brand-success)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <CheckCircle2 className="w-10 h-10 text-[var(--brand-success)]" />
                </div>
                <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-2">Payment Successful!</h2>
                <p className="text-[var(--text-secondary)] mb-8 text-sm">Thank you for testing the CargoHub checkout.</p>
                
                <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-subtle)] mb-8 text-left">
                  <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wider font-semibold">Transaction ID</p>
                  <p className="font-mono text-sm text-[var(--text-primary)] break-all font-semibold">{paymentId}</p>
                </div>

                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-secondary w-full py-4"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <p className="text-center text-[var(--text-muted)] font-medium text-xs mt-6 flex items-center justify-center gap-1.5 opacity-80">
          <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Test Environment
        </p>
      </motion.div>
    </div>
  );
}

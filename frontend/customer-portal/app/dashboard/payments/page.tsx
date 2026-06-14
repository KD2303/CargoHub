"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Wallet, ArrowUpRight, ArrowDownRight, CreditCard, Plus, Receipt } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import { useTheme } from "next-themes";
import Script from "next/script";

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleAddFunds = async () => {
    try {
      const response = await fetch((`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, '')}`) + "/api/payments/test-create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 500 }), // default 500 for test
      });
      
      const resData = await response.json();

      if (!resData.success) {
        toast.error("Server error. Could not create order.");
        return;
      }

      const { data } = resData;

      const options = {
        key: "rzp_test_SzETI5YgX84RSu", 
        amount: data.amount, 
        currency: data.currency,
        name: "CargoHub",
        description: "Add funds to wallet",
        image: data.logo || "https://dummyimage.com/100x100/2563eb/ffffff&text=CargoHub",
        order_id: data.orderId, 
        handler: async function (response: any) {
          toast.success("Successfully added funds to wallet! (Test Mode)");
          // API call to actually update wallet balance would go here
        },
        modal: {
          ondismiss: function () {
            toast.error("Payment was cancelled by the user.");
          }
        },
        prefill: {
          name: user?.name || "CargoHub Customer",
          email: user?.email || "customer@cargohub.com",
          contact: user?.phone || "9999999999",
        },
        theme: {
          color: theme === 'dark' ? "#1e293b" : "#2563eb", 
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      
      razorpay.on("payment.failed", function (response: any) {
        toast.error(`Payment Failed: ${response.error.description}`);
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initiate payment. Ensure your backend is running.");
    }
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { auth } = await import("@/lib/firebase");
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) return;

        const res = await fetch((`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, '')}`) + "/api/bookings", {
          headers: { "Authorization": `Bearer ${idToken}` }
        });
        const data = await res.json();
        
        if (data.success && data.data) {
          // Map bookings to transactions
          const txns = data.data.map((b: any) => ({
            id: b.id,
            displayId: b.bookingRef || b.id.substring(0, 8),
            date: new Date(b.createdAt).toLocaleDateString(),
            description: `Payment for ${b.bookingRef || "Booking"}`,
            amount: `-₹${b.finalFare || b.fareEstimate || 0}`,
            amountValue: b.finalFare || b.fareEstimate || 0,
            type: "debit"
          }));
          setTransactions(txns);
        }
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const totalSpent = transactions.reduce((acc, txn) => txn.type === 'debit' ? acc + txn.amountValue : acc, 0);
  const totalAdded = transactions.reduce((acc, txn) => txn.type === 'credit' ? acc + txn.amountValue : acc, 0) + (user?.walletBalance || 0);

  return (
    <div className="space-y-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div>
        <h1 className="text-2xl font-display font-bold">Payments & Wallet</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Manage your wallet balance and view transaction history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-1 md:col-span-1 rounded-2xl p-6 relative overflow-hidden shadow-lg"
          style={{ background: "linear-gradient(135deg, var(--brand-primary), var(--brand-primary-dark))", color: "white" }}
        >
          <div className="absolute right-0 top-0 opacity-10">
            <Wallet className="w-48 h-48 -mr-10 -mt-10" />
          </div>
          <div className="relative z-10">
            <p className="text-blue-100 font-medium mb-1">Available Balance</p>
            <h2 className="text-4xl font-mono font-bold mb-6">₹{user?.walletBalance || 0}</h2>
            <div className="flex gap-3">
              <button onClick={handleAddFunds} className="flex-1 bg-white text-blue-900 font-semibold py-2.5 rounded-xl text-sm transition-transform hover:scale-105 active:scale-95 shadow-sm">
                Add Funds
              </button>
              <button className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md transition-colors hover:bg-white/30">
                <CreditCard className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="stat-card"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="stat-label">Total Spent</p>
                <h3 className="stat-value mt-2">₹{totalSpent.toLocaleString()}</h3>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 dark:bg-red-900/30">
                <ArrowUpRight className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="stat-change text-neutral-500 mt-2">Based on bookings</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="stat-card"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="stat-label">Total Added</p>
                <h3 className="stat-value mt-2">₹{totalAdded.toLocaleString()}</h3>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/30">
                <ArrowDownRight className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="stat-change text-neutral-500 mt-2">Wallet history</p>
          </motion.div>
        </div>
      </div>

      {/* Transaction History */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-0 overflow-hidden"
      >
        <div className="p-5 border-b" style={{ borderColor: "var(--border-subtle)" }}>
          <h3 className="font-semibold text-lg">Transaction History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Description</th>
                <th>Date</th>
                <th>Amount</th>
                <th className="text-right">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, i) => (
                <motion.tr 
                  key={txn.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                >
                  <td className="font-medium" style={{ color: "var(--text-primary)" }}>{txn.displayId}</td>
                  <td>{txn.description}</td>
                  <td style={{ color: "var(--text-muted)" }}>{txn.date}</td>
                  <td>
                    <span className={`font-mono font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.amount}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="btn-icon">
                      <Receipt className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {transactions.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Download, Navigation, ArrowRight } from "lucide-react";
import Link from "next/link";

interface OrderProps {
  id: string;
  route: string;
  vehicle: string;
  date: string;
  amount: string;
  status: string;
}

export default function RecentOrdersTable({ orders }: { orders: OrderProps[] }) {
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -8 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="card col-span-1 lg:col-span-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>Recent Orders</h2>
          <span className="badge bg-gray-100 text-gray-600 border-none">{orders.length} Total</span>
        </div>
        
        {/* Filter Pills */}
        <div className="flex bg-gray-50 p-1 rounded-xl border w-full sm:w-auto overflow-x-auto" style={{ borderColor: "var(--border-subtle)" }}>
          {["All", "Active", "Delivered", "Cancelled"].map((f, i) => (
            <button
              key={f}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                i === 0 
                  ? "shadow-sm text-white" 
                  : "hover:bg-gray-100 text-gray-500"
              }`}
              style={{ background: i === 0 ? "var(--brand-secondary)" : "transparent" }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Route</th>
              <th>Vehicle</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <motion.tbody
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {orders.map((order) => {
              let badgeClass = "badge-pending";
              if (order.status === "Delivered") badgeClass = "badge-delivered";
              if (order.status === "In Transit") badgeClass = "badge-transit";
              if (order.status === "Cancelled") badgeClass = "badge-cancelled";

              return (
                <motion.tr key={order.id} variants={item} className="group">
                  <td className="font-mono font-bold text-gray-900">{order.id}</td>
                  <td className="font-medium text-gray-700">{order.route}</td>
                  <td>{order.vehicle}</td>
                  <td>{order.date}</td>
                  <td className="font-mono font-semibold">{order.amount}</td>
                  <td>
                    <span className={`badge ${badgeClass}`}>
                      {order.status === "In Transit" && <span className="w-1.5 h-1.5 rounded-full mr-1 bg-current animate-pulse-ring" />}
                      {order.status}
                    </span>
                  </td>
                  <td>
                    {order.status === "In Transit" ? (
                      <Link href={`/dashboard/track?id=${order.id}`} className="flex items-center gap-1 text-xs font-bold transition-all group-hover:translate-x-1" style={{ color: "var(--brand-secondary)" }}>
                        <Navigation className="w-3 h-3" /> Track
                      </Link>
                    ) : order.status === "Delivered" ? (
                      <button className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                        <Download className="w-3 h-3" /> Receipt
                      </button>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-500 font-medium">Showing 1–4 of 24 bookings</span>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-50 text-gray-400 cursor-not-allowed">
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm" style={{ background: "var(--brand-secondary)" }}>1</button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-gray-600 hover:bg-gray-50">2</button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-gray-600 hover:bg-gray-50">3</button>
          </div>
          <button className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-50 text-gray-600">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

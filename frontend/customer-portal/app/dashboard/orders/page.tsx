"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Search, ExternalLink, Calendar, MapPin, CheckCircle2, Clock, Truck, XCircle, Star, X, Download } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { auth as firebaseAuth } from "@/lib/firebase";
import { generateInvoicePDF } from "@/lib/pdf";import { toast } from '@/store/toastStore';


export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [ratingModal, setRatingModal] = useState<{ isOpen: boolean, orderId: string }>({ isOpen: false, orderId: "" });
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { auth } = await import("@/lib/firebase");
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) return;

        let url = (`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`) + "/api/bookings";
        if (statusFilter !== "ALL") {
          url += `?status=${statusFilter}`;
        }

        const res = await fetch(url, {
          headers: { "Authorization": `Bearer ${idToken}` }
        });
        const data = await res.json();
        
        if (data.success && data.data) {
          setOrders(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter]);

  const filteredOrders = orders.filter(order => {
    const term = searchQuery.toLowerCase();
    const idMatch = (order.bookingRef || order.id).toLowerCase().includes(term);
    const fromMatch = (order.pickupAddress || "").toLowerCase().includes(term);
    const toMatch = (order.dropAddress || "").toLowerCase().includes(term);
    return idMatch || fromMatch || toMatch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED': return <span className="badge badge-delivered"><CheckCircle2 className="w-3 h-3" /> Delivered</span>;
      case 'CANCELLED': return <span className="badge badge-cancelled bg-red-100 text-red-700"><XCircle className="w-3 h-3" /> Cancelled</span>;
      case 'PENDING': return <span className="badge badge-pending"><Clock className="w-3 h-3" /> Pending</span>;
      default: return <span className="badge badge-transit"><Truck className="w-3 h-3" /> {status.replace('_', ' ')}</span>;
    }
  };

  const submitRating = async () => {
    if (!ratingModal.orderId) return;
    setRatingSubmitting(true);
    try {
      const idToken = await firebaseAuth.currentUser?.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/ratings/${ratingModal.orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ rating: ratingScore, comment: ratingComment })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Thank you for your rating!");
      } else {
        toast.error(json.error === "ALREADY_RATED" ? "You have already rated this trip." : json.message || "Failed to submit rating.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setRatingSubmitting(false);
      setRatingModal({ isOpen: false, orderId: "" });
      setRatingScore(5);
      setRatingComment("");
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Rating Modal */}
      {ratingModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Rate Your Trip</h2>
              <button onClick={() => setRatingModal({ isOpen: false, orderId: "" })} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => setRatingScore(star)}
                  className={`p-2 transition-all hover:scale-110 ${star <= ratingScore ? 'text-yellow-400' : 'text-gray-200'}`}
                >
                  <Star className={`w-10 h-10 ${star <= ratingScore ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>

            <textarea 
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Leave a comment (optional)..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mb-6"
              rows={3}
            />

            <button 
              onClick={submitRating}
              disabled={ratingSubmitting}
              className="btn-primary w-full flex justify-center disabled:opacity-50"
            >
              {ratingSubmitting ? "Submitting..." : "Submit Rating"}
            </button>
          </motion.div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">My Orders</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>View and manage all your past and current shipments.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search ID or Address..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 text-sm rounded-xl outline-none transition-all focus:ring-2"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
            />
          </div>
          <select 
            className="btn-secondary whitespace-nowrap outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-0 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Route</th>
                <th>Vehicle Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, i) => (
                <motion.tr 
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(2, 89, 221, 0.08)" }}>
                        <Package className="w-5 h-5" style={{ color: "var(--brand-primary)" }} />
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{order.bookingRef || order.id.substring(0,8)}</p>
                        <p className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                          <Calendar className="w-3 h-3" /> {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="font-medium truncate max-w-[150px]" title={order.pickupAddress}>{order.pickupAddress?.split(',')[0]}</span>
                      <span className="font-medium truncate max-w-[150px] text-gray-500" title={order.dropAddress}>{order.dropAddress?.split(',')[0]}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <Truck className="w-4 h-4" /> {order.vehicleType.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="font-mono font-semibold">₹{order.finalFare || order.fareEstimate}</td>
                  <td>
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {order.status === 'DELIVERED' && (
                        <>
                          <button 
                            onClick={() => setRatingModal({ isOpen: true, orderId: order.id })}
                            className="btn-secondary text-xs h-9 px-3 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300"
                            title="Rate Trip"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button 
                            onClick={() => generateInvoicePDF(order)}
                            className="btn-secondary text-xs h-9 px-3 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
                            title="Download Invoice"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <Link href={`/dashboard/track?id=${order.id}`} className="btn-icon inline-flex h-9 w-9" title="Track">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredOrders.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

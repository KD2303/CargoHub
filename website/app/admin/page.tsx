"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Truck, Package, IndianRupee, Users, Shield,
  Search, Bell, ChevronDown, TrendingUp, TrendingDown, Clock,
  CheckCircle2, XCircle, AlertTriangle, Eye, MoreVertical,
  ArrowUpRight, ArrowDownRight, MapPin, Star, Filter,
  Activity, BarChart3, Calendar,
} from "lucide-react";

// ── Mock Data ───────────────────────────────────────────────────────────────

const recentBookings = [
  { id: "FA-K8X7YT", user: "Rahul Sharma", driver: "Suresh Kumar", pickup: "Hazratganj", drop: "Gomti Nagar", vehicle: "Tata Ace", status: "DELIVERED", fare: 847, time: "12 min ago" },
  { id: "FA-L9M2AB", user: "Priya Logistics", driver: "Ramesh Yadav", pickup: "Alambagh", drop: "Chinhat", vehicle: "Tempo 407", fare: 1523, status: "IN_TRANSIT", time: "28 min ago" },
  { id: "FA-N3P5CD", user: "Amit Verma", driver: "—", pickup: "Charbagh", drop: "Aliganj", vehicle: "Pickup Truck", fare: 623, status: "PENDING", time: "2 min ago" },
  { id: "FA-Q7R1EF", user: "Sneha Gupta", driver: "Ajay Singh", pickup: "Indira Nagar", drop: "Mahanagar", vehicle: "Tata Ace", fare: 432, status: "ACCEPTED", time: "5 min ago" },
  { id: "FA-T2U8GH", user: "Vikram Corp", driver: "Manoj Tiwari", pickup: "Vikas Nagar", drop: "Jankipuram", vehicle: "Large Truck", fare: 2890, status: "DRIVER_ARRIVING", time: "8 min ago" },
  { id: "FA-W4X6IJ", user: "Deepa Mills", driver: "Suresh Kumar", pickup: "Lalbagh", drop: "Daliganj", vehicle: "Tempo 407", fare: 1190, status: "CANCELLED", time: "1 hr ago" },
];

const pendingKyc = [
  { id: "DRV-004", name: "Vijay Patel", vehicle: "Large Truck", vehicleNo: "UP32GH3456", docs: 4, submitted: "2 hours ago" },
  { id: "DRV-006", name: "Ravi Mishra", vehicle: "Tata Ace", vehicleNo: "UP32KL1234", docs: 3, submitted: "5 hours ago" },
  { id: "DRV-007", name: "Sanjay Dubey", vehicle: "Tempo 407", vehicleNo: "UP32MN5678", docs: 4, submitted: "1 day ago" },
];

const statusColors: Record<string, string> = {
  PENDING: "badge-pending",
  ACCEPTED: "badge-accepted",
  DRIVER_ARRIVING: "badge-arriving",
  PICKED_UP: "badge-arriving",
  IN_TRANSIT: "badge-transit",
  DELIVERED: "badge-delivered",
  CANCELLED: "badge-cancelled",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  DRIVER_ARRIVING: "Arriving",
  PICKED_UP: "Picked Up",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

// ── Sidebar Nav ─────────────────────────────────────────────────────────────

const sidebarItems = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", active: true },
  { icon: <Package className="w-5 h-5" />, label: "Bookings" },
  { icon: <Truck className="w-5 h-5" />, label: "Drivers" },
  { icon: <IndianRupee className="w-5 h-5" />, label: "Payments" },
  { icon: <Shield className="w-5 h-5" />, label: "KYC Queue" },
  { icon: <BarChart3 className="w-5 h-5" />, label: "Analytics" },
  { icon: <Users className="w-5 h-5" />, label: "Users" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-primary)" }}>
      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen p-4" style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border-subtle)" }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))" }}>
            🚛
          </div>
          <div>
            <span className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>CargoHub</span>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Admin Panel</p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                color: activeTab === item.label ? "var(--text-primary)" : "var(--text-muted)",
                background: activeTab === item.label ? "rgba(2, 89, 221, 0.1)" : "transparent",
                borderLeft: activeTab === item.label ? "3px solid var(--brand-primary)" : "3px solid transparent",
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Admin profile */}
        <div className="p-3 rounded-xl mt-4" style={{ background: "var(--bg-tertiary)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))", color: "white" }}>
              FA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>CargoHub Admin</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-6 h-16" style={{ background: "var(--bg-primary)", borderBottom: "1px solid var(--border-subtle)" }}>
          <div className="flex items-center gap-4">
            <h1 className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>Dashboard</h1>
            <span className="badge badge-delivered" style={{ fontSize: "10px" }}>
              <Activity className="w-3 h-3" /> Live
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
              <input type="text" placeholder="Search bookings, drivers..." className="input-field pl-10" style={{ width: 280, padding: "8px 12px 8px 36px", fontSize: "13px" }} />
            </div>
            <button className="btn-icon relative">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold" style={{ background: "var(--brand-danger)", color: "white", fontSize: "9px" }}>3</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* ── Stats Grid ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Today's Bookings", value: "127", change: "+12%", positive: true, icon: <Package className="w-5 h-5" /> },
              { label: "Revenue Today", value: "₹1,84,200", change: "+8.3%", positive: true, icon: <IndianRupee className="w-5 h-5" /> },
              { label: "Active Drivers", value: "48", change: "-2", positive: false, icon: <Truck className="w-5 h-5" /> },
              { label: "Pending KYC", value: "3", change: "review", positive: false, icon: <Shield className="w-5 h-5" /> },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <span className="stat-label">{stat.label}</span>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(2, 89, 221, 0.1)", color: "var(--brand-primary-light)" }}>
                    {stat.icon}
                  </div>
                </div>
                <span className="stat-value">{stat.value}</span>
                <span className={`stat-change ${stat.positive ? "positive" : "negative"}`}>
                  {stat.positive ? <ArrowUpRight className="w-3.5 h-3.5 inline" /> : stat.change === "review" ? <AlertTriangle className="w-3.5 h-3.5 inline" /> : <ArrowDownRight className="w-3.5 h-3.5 inline" />}
                  {" "}{stat.change}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* ── Recent Bookings Table ─────────────────────────────────── */}
            <motion.div
              className="lg:col-span-2 card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>Recent Bookings</h2>
                <div className="flex items-center gap-2">
                  <button className="btn-icon" style={{ width: 32, height: 32 }}>
                    <Filter className="w-3.5 h-3.5" />
                  </button>
                  <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: "12px" }}>View All</button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>User</th>
                      <th>Driver</th>
                      <th>Route</th>
                      <th>Vehicle</th>
                      <th>Status</th>
                      <th>Fare</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <span className="font-mono text-xs font-semibold" style={{ color: "var(--brand-primary-light)" }}>{b.id}</span>
                        </td>
                        <td>
                          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{b.user}</span>
                        </td>
                        <td>
                          <span className="text-sm" style={{ color: b.driver === "—" ? "var(--text-muted)" : "var(--text-secondary)" }}>{b.driver}</span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" style={{ color: "var(--brand-primary)" }} />
                            <span className="text-xs">{b.pickup}</span>
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>→</span>
                            <span className="text-xs">{b.drop}</span>
                          </div>
                        </td>
                        <td><span className="text-xs">{b.vehicle}</span></td>
                        <td>
                          <span className={`badge ${statusColors[b.status]}`}>
                            {statusLabels[b.status]}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>₹{b.fare.toLocaleString()}</span>
                        </td>
                        <td>
                          <button className="btn-icon" style={{ width: 28, height: 28 }}>
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* ── KYC Queue + Quick Stats ───────────────────────────────── */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {/* KYC Queue */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>KYC Queue</h2>
                  <span className="badge badge-pending">{pendingKyc.length} pending</span>
                </div>

                <div className="space-y-3">
                  {pendingKyc.map((driver) => (
                    <div key={driver.id} className="p-3 rounded-xl flex items-center gap-3" style={{ background: "var(--bg-tertiary)" }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#FBBF24" }}>
                        {driver.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{driver.name}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{driver.vehicle} · {driver.vehicleNo}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-all" style={{ background: "rgba(16, 185, 129, 0.1)" }} title="Approve">
                          <CheckCircle2 className="w-4 h-4" style={{ color: "var(--brand-success)" }} />
                        </button>
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-all" style={{ background: "rgba(239, 68, 68, 0.1)" }} title="Reject">
                          <XCircle className="w-4 h-4" style={{ color: "var(--brand-danger)" }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking Status Distribution */}
              <div className="card">
                <h2 className="font-display text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>Status Breakdown</h2>
                <div className="space-y-3">
                  {[
                    { status: "Delivered", count: 89, total: 127, color: "#10B981" },
                    { status: "In Transit", count: 15, total: 127, color: "#0EA5E9" },
                    { status: "Accepted", count: 12, total: 127, color: "#3B82F6" },
                    { status: "Pending", count: 8, total: 127, color: "#F59E0B" },
                    { status: "Cancelled", count: 3, total: 127, color: "#EF4444" },
                  ].map((item) => (
                    <div key={item.status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.status}</span>
                        <span className="font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{item.count}</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: item.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.count / item.total) * 100}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Drivers */}
              <div className="card">
                <h2 className="font-display text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>Top Drivers Today</h2>
                <div className="space-y-3">
                  {[
                    { name: "Suresh Kumar", trips: 12, earnings: 8450, rating: 4.9 },
                    { name: "Ajay Singh", trips: 10, earnings: 7200, rating: 4.8 },
                    { name: "Ramesh Yadav", trips: 8, earnings: 6100, rating: 4.7 },
                  ].map((d, i) => (
                    <div key={d.name} className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold w-6" style={{ color: i === 0 ? "#FBBF24" : i === 1 ? "#94A3B8" : "#CD7F32" }}>
                        #{i + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `hsl(${i * 120}, 50%, 40%)`, color: "white" }}>
                        {d.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{d.name}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{d.trips} trips · ₹{d.earnings.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{d.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

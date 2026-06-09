"use client";

import { motion } from "framer-motion";
import { PackageOpen, Truck, IndianRupee, MapPin } from "lucide-react";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import StatCard from "@/components/dashboard/StatCard";
import LiveMap from "@/components/dashboard/LiveMap";
import QuickBookCard from "@/components/dashboard/QuickBookCard";
import ActiveShipmentCard from "@/components/dashboard/ActiveShipmentCard";
import RecentOrdersTable from "@/components/dashboard/RecentOrdersTable";
import AIDrawer from "@/components/dashboard/AIDrawer";
import { staggerGrid } from "@/lib/animations";
import { mockActiveShipments, mockRecentOrders } from "@/lib/mockData";

export default function DashboardOverview() {
  return (
    <>
      <WelcomeBanner />

      <motion.div 
        variants={staggerGrid}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <StatCard 
            label="Total Bookings" 
            value={24} 
            change="+3 this month" 
            isPositive={true} 
            icon={<PackageOpen className="w-6 h-6" />} 
            color="var(--brand-primary)" 
          />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <StatCard 
            label="Active Shipments" 
            value={2} 
            change="Same as last week" 
            isPositive={true} 
            icon={<Truck className="w-6 h-6" />} 
            color="var(--brand-secondary)" 
          />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <StatCard 
            label="Total Spent" 
            value={12480} 
            prefix="₹"
            change="+12% vs last month" 
            isPositive={false} 
            icon={<IndianRupee className="w-6 h-6" />} 
            color="#10B981" 
          />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <StatCard 
            label="Saved Addresses" 
            value={5} 
            change="+1 new" 
            isPositive={true} 
            icon={<MapPin className="w-6 h-6" />} 
            color="#8B5CF6" 
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <LiveMap />
        <QuickBookCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <ActiveShipmentCard shipments={mockActiveShipments} />
        </div>
        <div className="lg:col-span-2">
          <RecentOrdersTable orders={mockRecentOrders} />
        </div>
      </div>

      <AIDrawer />
    </>
  );
}

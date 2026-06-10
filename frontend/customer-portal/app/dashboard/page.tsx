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
import { useEffect } from "react";
import { useDashboardStore } from "@/store/dashboardStore";

export default function DashboardOverview() {
  const { stats, recentBookings, fetchDashboardData } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const activeShipmentsData = recentBookings
    .filter(b => ['PENDING', 'ACCEPTED', 'DRIVER_ARRIVING', 'PICKED_UP', 'IN_TRANSIT'].includes(b.status))
    .map(b => ({
      id: b.bookingRef || b.id.substring(0, 8),
      status: b.status.replace('_', ' '),
      pickup: b.pickupAddress || 'Unknown',
      drop: b.dropAddress || 'Unknown',
      vehicle: b.vehicleType.replace('_', ' '),
      driver: {
        name: b.driver?.name || 'Unassigned',
        rating: b.driver?.rating || 0,
        phone: b.driver?.phone || 'N/A'
      },
      eta: 'TBD',
      progress: b.status === 'PENDING' ? 10 : b.status === 'ACCEPTED' ? 20 : b.status === 'DRIVER_ARRIVING' ? 30 : b.status === 'PICKED_UP' ? 50 : 75
    }));

  const recentOrdersData = recentBookings.map(b => ({
    id: b.bookingRef || b.id.substring(0, 8),
    route: `${b.pickupAddress?.split(',')[0] || 'Unknown'} → ${b.dropAddress?.split(',')[0] || 'Unknown'}`,
    vehicle: b.vehicleType.replace('_', ' '),
    date: new Date(b.createdAt).toLocaleDateString(),
    amount: `₹${b.finalFare || b.fareEstimate}`,
    status: b.status === 'IN_TRANSIT' ? 'In Transit' : b.status.replace('_', ' ')
  }));

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
            value={stats?.totalBookings || 0} 
            change="Lifetime bookings" 
            isPositive={true} 
            icon={<PackageOpen className="w-6 h-6" />} 
            color="var(--brand-primary)" 
          />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <StatCard 
            label="Active Shipments" 
            value={stats?.activeShipments || 0} 
            change="Currently active" 
            isPositive={true} 
            icon={<Truck className="w-6 h-6" />} 
            color="var(--brand-secondary)" 
          />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <StatCard 
            label="Total Spent" 
            value={stats?.totalSpent || 0} 
            prefix="₹"
            change="Lifetime spending" 
            isPositive={true} 
            icon={<IndianRupee className="w-6 h-6" />} 
            color="#10B981" 
          />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <StatCard 
            label="Saved Addresses" 
            value={stats?.savedAddresses || 0} 
            change="In address book" 
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
          <ActiveShipmentCard shipments={activeShipmentsData} />
        </div>
        <div className="lg:col-span-2">
          <RecentOrdersTable orders={recentOrdersData} />
        </div>
      </div>

      <AIDrawer />
    </>
  );
}

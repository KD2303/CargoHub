"use client";

import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { MetricChart } from "@/components/dashboard/MetricChart";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { DASHBOARD_STATS, LIVE_EVENTS, BOOKING_TRENDS, RECENT_BOOKINGS } from "@/lib/mockData";
import { Package, Truck, IndianRupee, FileText } from "lucide-react";

export default function DashboardPage() {
  const icons = [
    <Package key="1" className="w-6 h-6" />,
    <Truck key="2" className="w-6 h-6" />,
    <IndianRupee key="3" className="w-6 h-6" />,
    <FileText key="4" className="w-6 h-6" />,
  ];

  const columns = [
    { key: "id", label: "Booking ID" },
    { key: "customer", label: "Customer" },
    { key: "route", label: "Pickup → Drop" },
    { key: "driver", label: "Driver" },
    { key: "amount", label: "Amount" },
    { 
      key: "status", 
      label: "Status",
      render: (row: any) => {
        let variant: any = "default";
        if (row.status === "Ongoing") variant = "info";
        if (row.status === "Completed") variant = "success";
        if (row.status === "Cancelled") variant = "error";
        if (row.status === "Finding Driver") variant = "warning";
        return <Badge label={row.status} variant={variant} />;
      }
    },
    { key: "time", label: "Time" }
  ];

  return (
    <div>
      <PageHeader title="Overview Dashboard" subtitle="Welcome back, Sumit" />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {DASHBOARD_STATS.map((stat, i) => (
          <StatCard
            key={i}
            {...stat}
            changeType={stat.changeType as any}
            accentColor={stat.accentColor as any}
            icon={icons[i]}
          />
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-6 mb-8">
        {/* Main Content Area */}
        <div className="flex-1 space-y-8">
          {/* Chart Section */}
          <div className="bg-[var(--bg-surface)] p-6 rounded-lg border border-gray-100 shadow-sm">
            <h2 className="text-[16px] font-semibold mb-6 text-[var(--text-primary)] tracking-tight">Booking Trends (Last 7 Days)</h2>
            <MetricChart data={BOOKING_TRENDS} />
          </div>

          {/* Recent Bookings Table */}
          <div>
            <h2 className="text-[16px] font-semibold mb-4 text-[var(--text-primary)] tracking-tight">Recent Bookings</h2>
            <DataTable columns={columns} rows={RECENT_BOOKINGS} />
          </div>
        </div>

        {/* Live Feed Sidebar */}
        <div className="w-full xl:w-[320px] bg-[var(--bg-surface)] rounded-lg border border-gray-100 shadow-sm flex flex-col shrink-0">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)] flex items-center tracking-tight">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              Live Activity
            </h2>
          </div>
          <div className="p-5 flex-1 overflow-y-auto">
            <div className="space-y-6">
              {LIVE_EVENTS.map((event) => {
                const colors = {
                  purple: "bg-[var(--admin-primary-mid)]",
                  green: "bg-[var(--green-text)]",
                  blue: "bg-[var(--blue-text)]",
                  red: "bg-[var(--red-text)]",
                  warning: "bg-[var(--amber-text)]",
                };

                return (
                  <div key={event.id} className="relative pl-6">
                    <span 
                      className={`absolute left-0 top-1.5 w-2 h-2 rounded-full ${colors[event.type as keyof typeof colors]}`}
                    />
                    <p className="text-[13px] text-[var(--text-primary)] leading-relaxed font-medium">
                      {event.text}
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-1 uppercase tracking-wider font-semibold">
                      {event.time}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

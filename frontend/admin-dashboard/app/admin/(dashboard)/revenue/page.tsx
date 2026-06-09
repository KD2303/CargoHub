"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { REVENUE_TRANSACTIONS } from "@/lib/mockData";
import { Badge } from "@/components/ui/Badge";
import { Download, Filter } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { MetricChart } from "@/components/dashboard/MetricChart";

const REVENUE_TRENDS = [
  { day: "Jan", bookings: 120000 },
  { day: "Feb", bookings: 145000 },
  { day: "Mar", bookings: 130000 },
  { day: "Apr", bookings: 170000 },
  { day: "May", bookings: 190000 },
  { day: "Jun", bookings: 210000 },
];

const BREAKDOWN_DATA = [
  { name: "Driver Payout (85%)", value: 85 },
  { name: "Platform Fee (15%)", value: 15 },
];
const COLORS = ["#0F6E56", "#3C3489"];

export default function RevenuePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const columns = [
    { key: "id", label: "Transaction ID" },
    { key: "booking", label: "Booking #" },
    { key: "customer", label: "Customer" },
    { key: "amount", label: "Amount" },
    { key: "fee", label: "Platform Fee" },
    { key: "payout", label: "Driver Payout" },
    { 
      key: "mode", 
      label: "Mode",
      render: (row: any) => {
        let variant: any = "default";
        if (row.mode === "UPI") variant = "success";
        if (row.mode === "Card") variant = "info";
        if (row.mode === "Cash") variant = "warning";
        return <Badge label={row.mode} variant={variant} />;
      }
    },
    { key: "date", label: "Date" }
  ];

  return (
    <div>
      <PageHeader 
        title="Revenue Analytics" 
        action={
          <button className="flex items-center px-4 py-2 bg-white border border-[var(--admin-border)] text-[var(--admin-primary)] font-semibold rounded-lg text-sm hover:bg-[var(--bg-secondary)] transition-colors shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[var(--admin-primary)] text-white p-5 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-white/80">Total Revenue (All Time)</p>
          <p className="text-2xl font-bold mt-1">₹45,82,400</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm border-l-4 border-l-[var(--blue-text)]">
          <p className="text-sm font-medium text-[var(--text-secondary)]">This Month</p>
          <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">₹2,10,000</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm border-l-4 border-l-[var(--amber-text)]">
          <p className="text-sm font-medium text-[var(--text-secondary)]">This Week</p>
          <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">₹45,200</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm border-l-4 border-l-[var(--green-text)]">
          <p className="text-sm font-medium text-[var(--text-secondary)]">Today</p>
          <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">₹12,400</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)] tracking-tight">Revenue Over Time</h2>
            <select className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium text-[var(--text-primary)] outline-none">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <MetricChart data={REVENUE_TRENDS} />
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-[16px] font-semibold text-[var(--text-primary)] tracking-tight mb-2">Revenue Breakdown</h2>
          <div className="flex-1 flex items-center justify-center min-h-[250px]">
            {mounted ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={BREAKDOWN_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {BREAKDOWN_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-[160px] h-[160px] rounded-full border-8 border-gray-100 animate-pulse" />
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold text-[var(--text-primary)] tracking-tight">Recent Transactions</h2>
          <button className="flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 text-[var(--text-secondary)]">
            <Filter className="w-3.5 h-3.5 mr-2" /> Filter
          </button>
        </div>
        <DataTable columns={columns} rows={REVENUE_TRANSACTIONS} />
      </div>
    </div>
  );
}

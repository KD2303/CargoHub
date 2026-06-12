"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { DataTable } from "@/components/admin/ui/DataTable";
import { Badge } from "@/components/admin/ui/Badge";
import { Download, Filter, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { MetricChart } from "@/components/admin/dashboard/MetricChart";
import { adminFetch } from "@/lib/admin/api";
import { exportToCsv } from "@/lib/admin/exportToCsv";

const BREAKDOWN_DATA = [
  { name: "Driver Payout (85%)", value: 85 },
  { name: "Platform Fee (15%)", value: 15 },
];
const COLORS = ["#0F6E56", "#3C3489"];

export default function RevenuePage() {
  const [mounted, setMounted] = useState(false);
  const [revenueStats, setRevenueStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    async function loadData() {
      try {
        const [revRes, bookRes] = await Promise.all([
          adminFetch("/api/admin/analytics/revenue"),
          adminFetch("/api/admin/bookings?limit=20")
        ]);
        setRevenueStats(revRes.data);
        setTransactions(bookRes.data || []);
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleExport = () => {
    exportToCsv('cargohub-revenue-report', transactions, [
      { key: "id", label: "Booking ID" },
      { key: "status", label: "Status" },
      { key: "fareEstimate", label: "Total Amount" },
      { key: "platformFee", label: "Platform Fee" },
      { key: "driverPayout", label: "Driver Payout" },
      { key: "createdAt", label: "Date" }
    ]);
  };

  const columns = [
    { key: "id", label: "Booking ID" },
    { 
      key: "amount", 
      label: "Total Amount",
      render: (row: any) => `₹${row.fareEstimate || 0}`
    },
    { 
      key: "fee", 
      label: "Platform Fee",
      render: (row: any) => `₹${Math.round((row.fareEstimate || 0) * 0.15)}`
    },
    { 
      key: "payout", 
      label: "Driver Payout",
      render: (row: any) => `₹${Math.round((row.fareEstimate || 0) * 0.85)}`
    },
    { 
      key: "status", 
      label: "Status",
      render: (row: any) => {
        let variant: any = "default";
        if (row.status === "DELIVERED") variant = "success";
        if (row.status === "CANCELLED") variant = "error";
        return <Badge label={row.status} variant={variant} />;
      }
    },
    { 
      key: "date", 
      label: "Date",
      render: (row: any) => new Date(row.createdAt).toLocaleDateString()
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Revenue Analytics" 
        action={
          <button onClick={handleExport} className="flex items-center px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--admin-primary)] font-semibold rounded-lg text-sm hover:bg-[var(--bg-secondary)] transition-colors shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </button>
        }
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[var(--admin-primary)] text-white p-5 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-white/80">Total Revenue (All Time)</p>
              <p className="text-2xl font-bold mt-1">₹{revenueStats?.total || 0}</p>
            </div>
            <div className="bg-[var(--bg-primary)] p-5 rounded-lg border border-[var(--border-subtle)] shadow-sm border-l-4 border-l-[var(--blue-text)]">
              <p className="text-sm font-medium text-[var(--text-secondary)]">This Month</p>
              <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">₹0</p>
            </div>
            <div className="bg-[var(--bg-primary)] p-5 rounded-lg border border-[var(--border-subtle)] shadow-sm border-l-4 border-l-[var(--amber-text)]">
              <p className="text-sm font-medium text-[var(--text-secondary)]">This Week</p>
              <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">₹0</p>
            </div>
            <div className="bg-[var(--bg-primary)] p-5 rounded-lg border border-[var(--border-subtle)] shadow-sm border-l-4 border-l-[var(--green-text)]">
              <p className="text-sm font-medium text-[var(--text-secondary)]">Today</p>
              <p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">₹0</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Line Chart */}
            <div className="lg:col-span-2 bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[16px] font-semibold text-[var(--text-primary)] tracking-tight">Revenue Over Time</h2>
                <select className="px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-md text-xs font-medium text-[var(--text-primary)] outline-none">
                  <option>Last 6 Months</option>
                  <option>This Year</option>
                </select>
              </div>
              <MetricChart data={revenueStats?.monthly || []} />
            </div>

            {/* Pie Chart */}
            <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm flex flex-col">
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
              <button className="flex items-center px-3 py-1.5 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-md text-sm font-medium hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                <Filter className="w-3.5 h-3.5 mr-2" /> Filter
              </button>
            </div>
            <DataTable columns={columns} rows={transactions} />
          </div>
        </>
      )}
    </div>
  );
}

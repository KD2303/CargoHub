"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { auth as firebaseAuth } from "@/lib/firebase";
import { Download, Loader2, TrendingUp, BarChart3, PieChart, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { toast } from "react-hot-toast";

export default function B2BReportsPage() {
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user || !firebaseAuth.currentUser) return;
      try {
        const token = await firebaseAuth.currentUser.getIdToken();
        const res = await fetch((`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, '')}`) + "/api/business/invoices", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success && json.data) {
          setInvoices(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [user]);

  // Aggregate data by month
  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    const currentDate = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = d.toLocaleDateString('default', { month: 'short', year: '2-digit' });
      months[monthStr] = 0;
    }

    invoices.forEach(inv => {
      const d = new Date(inv.date);
      const monthStr = d.toLocaleDateString('default', { month: 'short', year: '2-digit' });
      if (months[monthStr] !== undefined) {
        months[monthStr] += inv.amount || 0;
      }
    });

    return Object.keys(months).map(key => ({
      name: key,
      amount: months[key]
    }));
  }, [invoices]);

  // Aggregate data by vehicle type
  const vehicleData = useMemo(() => {
    const vehicles: Record<string, number> = {};
    invoices.forEach(inv => {
      const v = inv.vehicleType || 'Unknown';
      vehicles[v] = (vehicles[v] || 0) + (inv.amount || 0);
    });
    return Object.keys(vehicles).map(key => ({
      name: key,
      amount: vehicles[key]
    }));
  }, [invoices]);

  const totalSpent = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const averageTripCost = invoices.length > 0 ? totalSpent / invoices.length : 0;

  const exportReportCSV = () => {
    if (monthlyData.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = ['Month', 'Total Spent (INR)'];
    const rows = monthlyData.map(d => [d.name, d.amount]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `cargohub_spending_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-2">Reports & Analytics</h1>
          <p className="text-[var(--text-secondary)]">Visualize your logistics expenditure and booking trends.</p>
        </div>
        <button 
          onClick={exportReportCSV}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Export Full Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg shadow-blue-500/20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <p className="text-blue-100 font-medium mb-1">Total Expenditure (YTD)</p>
          <p className="text-3xl font-bold">₹{totalSpent.toLocaleString()}</p>
        </div>
        
        <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-outline)] shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-sm text-[var(--text-secondary)] font-medium">Avg. Trip Cost</p>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">₹{averageTripCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>

        <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-outline)] shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-sm text-[var(--text-secondary)] font-medium">Total Bookings</p>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{invoices.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Spending Area Chart */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-outline)] shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-[var(--text-primary)]">Monthly Expenditure</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-outline)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-outline)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Spent']}
                />
                <Area type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Spending Bar Chart */}
        <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-outline)] shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-[var(--text-primary)]">Spend by Vehicle</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-outline)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  cursor={{fill: 'var(--bg-tertiary)'}}
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-outline)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Spent']}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

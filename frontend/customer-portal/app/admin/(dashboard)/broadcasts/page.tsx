"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Badge } from "@/components/admin/ui/Badge";
import { Send, Bell, Loader2, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/admin/api";
import { toast } from '@/store/toastStore';

export default function BroadcastsPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("All Users");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchBroadcasts = async () => {
    try {
      const res = await adminFetch("/api/admin/broadcasts");
      setHistory(res.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleSend = async () => {
    if (!title || !message) {
      toast.error("Please enter title and message");
      return;
    }
    try {
      setSending(true);
      await adminFetch("/api/admin/broadcasts", {
        method: "POST",
        body: JSON.stringify({ 
          title, 
          message, 
          target, 
          startDate: startDate ? new Date(startDate).toISOString() : null,
          endDate: endDate ? new Date(endDate).toISOString() : null 
        })
      });
      setTitle("");
      setMessage("");
      setStartDate("");
      setEndDate("");
      fetchBroadcasts();
      toast.success(startDate ? "Broadcast scheduled!" : "Broadcast sent via FCM!");
    } catch (err: any) {
      toast.error("Failed to send broadcast: " + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this broadcast from history?")) return;
    try {
      await adminFetch(`/api/admin/broadcasts/${id}`, { method: "DELETE" });
      fetchBroadcasts();
    } catch (err: any) {
      toast.error("Failed to delete: " + err.message);
    }
  };

  return (
    <div>
      <PageHeader title="Send Broadcasts" subtitle="Push notifications via FCM" />

      {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Forms */}
        <div className="flex-1 space-y-6">
          
          {/* Push Notification */}
          <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-[var(--admin-primary-light)] text-[var(--admin-primary)] rounded-lg flex items-center justify-center mr-3">
                <Bell className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Push Notification</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Target Audience</label>
                <div className="flex flex-wrap gap-2">
                  {["All Users", "Drivers Only", "Customers Only"].map(t => (
                    <label key={t} className={`flex items-center px-4 py-2 border rounded-full text-sm font-medium cursor-pointer transition-colors ${target === t ? 'bg-[var(--admin-primary-light)] border-[var(--admin-primary)] text-[var(--admin-primary)]' : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] brightness-95 dark:brightness-110'}`}>
                      <input 
                        type="radio" 
                        name="push-target" 
                        className="mr-2" 
                        checked={target === t}
                        onChange={() => setTarget(t)}
                      /> 
                      {t}
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Heavy Rain Alert" 
                  className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]" 
                />
              </div>
              
              <div>
                <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Message</label>
                <textarea 
                  rows={3} 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..." 
                  className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] resize-none" 
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Start Date</label>
                  <input 
                    type="datetime-local" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]" 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">End Date</label>
                  <input 
                    type="datetime-local" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]" 
                  />
                </div>
              </div>
              
              <button 
                onClick={handleSend}
                disabled={sending}
                className="w-full flex items-center justify-center py-2.5 bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-mid)] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />} 
                {sending ? "Sending..." : "Send FCM Push Notification"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - History */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-subtle)] shadow-sm sticky top-24">
            <div className="p-5 border-b border-[var(--border-subtle)] flex justify-between items-center">
              <h2 className="text-[16px] font-semibold text-[var(--text-primary)] tracking-tight">Recent Broadcasts</h2>
            </div>
            <div className="p-5 space-y-6 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
              ) : history.length === 0 ? (
                <p className="text-sm text-gray-500 text-center">No broadcasts sent yet.</p>
              ) : (
                history.map((item: any) => (
                  <div key={item.id} className="relative pl-4 border-l-2 border-[var(--border-subtle)] pb-2 group">
                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[var(--admin-primary-mid)]" />
                    <div className="flex justify-between items-start mb-1">
                      <Badge 
                        label={item.status === 'SCHEDULED' ? 'Scheduled' : 'Push'} 
                        variant={item.status === 'SCHEDULED' ? 'warning' : 'purple'} 
                        className="mb-1"
                      />
                      <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase">
                        {new Date(item.startDate || item.scheduledAt || item.sentAt || item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-snug">{item.title}</h3>
                        <p className="text-[12px] text-[var(--text-secondary)] mt-1">{item.message}</p>
                        <p className="text-[12px] font-medium mt-1">Target: {item.target}</p>
                      </div>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

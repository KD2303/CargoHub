import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Send, Bell, Mail, Globe } from "lucide-react";

export default function BroadcastsPage() {
  const history = [
    { type: "Push", title: "Heavy Rain Alert - Mumbai", target: "Drivers Only", time: "2h ago", delivered: "4,231" },
    { type: "Email", title: "New B2B Rates Available", target: "B2B Clients", time: "1d ago", delivered: "850" },
    { type: "Push", title: "Weekend Bonus Active!", target: "Drivers Only", time: "3d ago", delivered: "5,102" },
    { type: "Web", title: "Scheduled Maintenance Notification", target: "All Users", time: "1w ago", delivered: "12,450" },
    { type: "Email", title: "Your CargoHub Monthly Digest", target: "All", time: "2w ago", delivered: "28,900" },
  ];

  return (
    <div>
      <PageHeader title="Send Broadcasts" subtitle="Reach your drivers, customers, and website visitors" />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Forms */}
        <div className="flex-1 space-y-6">
          
          {/* Push Notification */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
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
                  <label className="flex items-center px-4 py-2 bg-[var(--admin-primary-light)] border border-[var(--admin-primary)] rounded-full text-sm font-medium text-[var(--admin-primary)] cursor-pointer">
                    <input type="radio" name="push-target" className="mr-2" defaultChecked /> All Users
                  </label>
                  <label className="flex items-center px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-[var(--text-secondary)] cursor-pointer hover:bg-gray-100">
                    <input type="radio" name="push-target" className="mr-2" /> Drivers Only
                  </label>
                  <label className="flex items-center px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-[var(--text-secondary)] cursor-pointer hover:bg-gray-100">
                    <input type="radio" name="push-target" className="mr-2" /> Customers Only
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Title</label>
                <input type="text" placeholder="e.g., Heavy Rain Alert" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary-light)]" />
              </div>
              
              <div>
                <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Message</label>
                <textarea rows={3} placeholder="Type your message here..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary-light)] resize-none" />
              </div>
              
              <button className="w-full flex items-center justify-center py-2.5 bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-mid)] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
                <Send className="w-4 h-4 mr-2" /> Send Push Notification
              </button>
            </div>
          </div>

          {/* Email Campaign */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Mail className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Email Campaign</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Target Segment</label>
                <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary-light)]">
                  <option>All Registered Users</option>
                  <option>Inactive Users (30d+)</option>
                  <option>B2B Clients</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Subject</label>
                <input type="text" placeholder="Email subject line" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary-light)]" />
              </div>
              
              <div>
                <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Body (HTML allowed)</label>
                <textarea rows={5} placeholder="Compose your email..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary-light)] resize-none" />
              </div>
              
              <button className="w-full flex items-center justify-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
                <Send className="w-4 h-4 mr-2" /> Send Email Campaign
              </button>
            </div>
          </div>

          {/* Web Push */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mr-3">
                <Globe className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Web Push (OneSignal)</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Message</label>
                <input type="text" placeholder="Announcement for website visitors..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary-light)]" />
              </div>
              <button className="w-full flex items-center justify-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
                <Send className="w-4 h-4 mr-2" /> Broadcast to Website Visitors
              </button>
            </div>
          </div>
          
        </div>

        {/* Right Column - History */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-24">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-[16px] font-semibold text-[var(--text-primary)] tracking-tight">Recent Broadcasts</h2>
            </div>
            <div className="p-5 space-y-6">
              {history.map((item, idx) => (
                <div key={idx} className="relative pl-4 border-l-2 border-gray-100 pb-2">
                  <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[var(--admin-primary-mid)]" />
                  <div className="flex justify-between items-start mb-1">
                    <Badge 
                      label={item.type} 
                      variant={item.type === 'Push' ? 'purple' : item.type === 'Email' ? 'info' : 'success'} 
                      className="mb-1"
                    />
                    <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase">{item.time}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-snug">{item.title}</h3>
                  <p className="text-[12px] text-[var(--text-secondary)] mt-1">Target: {item.target}</p>
                  <p className="text-[12px] text-green-600 font-medium mt-1">Delivered to {item.delivered} users</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

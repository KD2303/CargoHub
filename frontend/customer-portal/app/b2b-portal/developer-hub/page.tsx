"use client";

import { useState, useEffect, useRef } from "react";
import { Code2, Key, Webhook, TerminalSquare, Copy, Eye, EyeOff, Plus, RefreshCw, CheckCircle2, Zap } from "lucide-react";
import { toast } from "react-hot-toast";
import { auth as firebaseAuth } from "@/lib/firebase";

export default function DeveloperHubPage() {
  const [activeTab, setActiveTab] = useState<"keys" | "webhooks" | "docs" | "logs">("keys");
  const [showKey, setShowKey] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [activeEndpoint, setActiveEndpoint] = useState("Create Bulk Booking");
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");

  const fetchDeveloperData = async () => {
    try {
      const currentUser = firebaseAuth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      
      const [keysRes, hooksRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/business/developer/keys`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/business/developer/webhooks`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      const keysData = await keysRes.json();
      const hooksData = await hooksRes.json();
      
      if (keysData.success) setApiKeys(keysData.data);
      if (hooksData.success) setWebhooks(hooksData.data);
    } catch (error) {
      console.error("Failed to fetch developer data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      if (user) fetchDeveloperData();
      else setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const generateKey = async () => {
    try {
      const currentUser = firebaseAuth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/business/developer/keys`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name: "ERP Integration" })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("API Key Generated!");
        fetchDeveloperData();
      }
    } catch (error) {
      toast.error("Failed to generate key");
    }
  };

  const revokeKey = async (id: string) => {
    try {
      const currentUser = firebaseAuth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/business/developer/keys/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("API Key Revoked!");
        fetchDeveloperData();
      }
    } catch (error) {
      toast.error("Failed to revoke key");
    }
  };

  const addWebhook = async () => {
    if (!newWebhookUrl) return toast.error("Please enter a URL");
    try {
      const currentUser = firebaseAuth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/business/developer/webhooks`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ endpointUrl: newWebhookUrl, events: ["booking.created"] })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Webhook Added!");
        setNewWebhookUrl("");
        fetchDeveloperData();
      }
    } catch (error) {
      toast.error("Failed to add webhook");
    }
  };

  const endpointsData: Record<string, any> = {
    "Create Bulk Booking": {
      method: "POST",
      url: "https://api.cargohub.com/v1/bookings",
      curl: `-H "Authorization: Bearer sk_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"{"}
    <span className="text-blue-300">"origin"</span>: <span className="text-orange-300">"Mumbai"</span>,
    <span className="text-blue-300">"destination"</span>: <span className="text-orange-300">"Delhi"</span>,
    <span className="text-blue-300">"truckType"</span>: <span className="text-orange-300">"Heavy Load"</span>,
    <span className="text-blue-300">"scheduleDate"</span>: <span className="text-orange-300">"2023-11-01T10:00:00Z"</span>
  {"}"}'`,
      responseTitle: "Response (201 Created)",
      responseDesc: "The API responds with the booking ID and estimated pricing immediately.",
    },
    "Get Shipment Status": {
      method: "GET",
      url: "https://api.cargohub.com/v1/shipments/{id}",
      curl: `-H "Authorization: Bearer sk_live_YOUR_KEY"`,
      responseTitle: "Response (200 OK)",
      responseDesc: "Returns the current GPS coordinates, status, and ETA of the specified shipment.",
    },
    "List Invoices": {
      method: "GET",
      url: "https://api.cargohub.com/v1/invoices?status=unpaid",
      curl: `-H "Authorization: Bearer sk_live_YOUR_KEY"`,
      responseTitle: "Response (200 OK)",
      responseDesc: "Returns a paginated list of invoices matching the query parameters.",
    },
    "Get Rate Card": {
      method: "GET",
      url: "https://api.cargohub.com/v1/rates?origin=Mumbai&destination=Delhi",
      curl: `-H "Authorization: Bearer sk_live_YOUR_KEY"`,
      responseTitle: "Response (200 OK)",
      responseDesc: "Returns the current standard pricing for the requested route.",
    }
  };

  // Mock Live Logs Simulation
  useEffect(() => {
    if (activeTab !== "logs") return;
    
    const interval = setInterval(() => {
      const endpoints = ["POST /api/v1/bookings", "GET /api/v1/shipments/TRK-001", "POST /api/v1/webhooks/trigger"];
      const statuses = ["[200 OK]", "[201 Created]", "[200 OK]", "[429 Too Many Requests]"];
      const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      
      const newLog = `${timestamp} - ${randomStatus} ${randomEndpoint}`;
      setLogs(prev => [...prev.slice(-19), newLog]);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const tabs = [
    { id: "keys" as const, label: "API Keys", icon: Key },
    { id: "webhooks" as const, label: "Webhooks", icon: Webhook },
    { id: "docs" as const, label: "Documentation", icon: Code2 },
    { id: "logs" as const, label: "Live Logs", icon: TerminalSquare },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-6xl mx-auto">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-display font-bold text-[var(--text-primary)] flex items-center gap-3">
          Developer Hub <span className="bg-blue-500/10 text-blue-600 text-xs px-2 py-1 rounded-md uppercase tracking-wider font-bold">Beta</span>
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">Integrate CargoHub seamlessly into your ERP and automated workflows.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-outline)] mb-6 shrink-0 overflow-x-auto hide-scrollbar">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${isActive ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'}`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pb-8">
        {activeTab === "keys" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center bg-blue-500/5 border border-blue-500/20 p-5 rounded-2xl">
              <div>
                <h3 className="font-bold text-[var(--text-primary)] text-lg">Production API Keys</h3>
                <p className="text-sm text-[var(--text-secondary)]">Use these keys to authenticate your API requests.</p>
              </div>
              <button onClick={generateKey} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" /> Generate New Key
              </button>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-outline)] rounded-2xl overflow-hidden">
              <table className="w-full text-sm text-left text-[var(--text-secondary)]">
                <thead className="text-xs text-[var(--text-muted)] uppercase bg-[var(--bg-tertiary)]/50">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Key Name</th>
                    <th className="px-6 py-4 font-semibold">Secret Key</th>
                    <th className="px-6 py-4 font-semibold">Created</th>
                    <th className="px-6 py-4 font-semibold">Last Used</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-outline)]">
                  {apiKeys.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-[var(--text-muted)]">No API keys generated yet.</td>
                    </tr>
                  ) : apiKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div> {key.name}
                      </td>
                      <td className="px-6 py-4 font-mono">
                        <div className="flex items-center gap-2">
                          {showKey ? key.key : "sk_live_••••••••••••••••••••"}
                          <button onClick={() => setShowKey(!showKey)} className="text-[var(--text-muted)] hover:text-blue-600 transition-colors"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => copyToClipboard(key.key)} className="text-[var(--text-muted)] hover:text-blue-600 transition-colors"><Copy className="w-4 h-4" /></button>
                        </div>
                      </td>
                      <td className="px-6 py-4">{new Date(key.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => revokeKey(key.id)} className="text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg font-semibold transition-colors">Revoke</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex items-start gap-3">
               <Zap className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
               <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                 <strong className="text-orange-500">Security Notice:</strong> Never expose your secret keys in client-side code (like frontend JavaScript). Your account will be temporarily suspended if we detect your keys committed to public repositories like GitHub.
               </p>
            </div>
          </div>
        )}

        {activeTab === "webhooks" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-outline)] p-6 rounded-2xl">
              <h3 className="font-bold text-[var(--text-primary)] text-lg mb-1">Add Webhook Endpoint</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">Receive real-time HTTP POST payloads when specific events happen.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input 
                  type="url" 
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  placeholder="https://your-domain.com/webhooks/cargohub" 
                  className="flex-1 px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-[var(--text-primary)] font-mono"
                />
                <button onClick={addWebhook} className="px-6 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold rounded-xl hover:opacity-90 transition-opacity">
                  Add Endpoint
                </button>
              </div>

              <h4 className="font-semibold text-[var(--text-primary)] mb-3 text-sm">Events to send</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {["booking.created", "shipment.in_transit", "shipment.delayed", "shipment.delivered", "invoice.generated", "payment.failed"].map(event => (
                  <label key={event} className="flex items-center gap-3 p-3 border border-[var(--border-outline)] rounded-xl cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-[var(--border-input)] bg-[var(--bg-primary)]" />
                    <span className="text-sm font-mono text-[var(--text-primary)]">{event}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "docs" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="lg:col-span-1 space-y-2">
              <h3 className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-xs mb-4">Endpoints</h3>
              {Object.keys(endpointsData).map(endpoint => (
                <button 
                  key={endpoint}
                  onClick={() => setActiveEndpoint(endpoint)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeEndpoint === endpoint ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}
                >
                  {endpoint}
                </button>
              ))}
            </div>
            
            <div className="lg:col-span-2">
              <div className="bg-[var(--bg-card)] border border-[var(--border-outline)] rounded-2xl overflow-hidden">
                <div className="bg-[#1e1e1e] border-b border-gray-800 px-4 py-3 flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  </div>
                  <div className="flex gap-4 text-xs font-mono font-semibold text-gray-400">
                    <button className="text-white hover:text-white transition-colors">cURL</button>
                    <button className="hover:text-white transition-colors">Node.js</button>
                    <button className="hover:text-white transition-colors">Python</button>
                  </div>
                </div>
                <div className="p-6 bg-[#1e1e1e] relative group">
                  <button onClick={() => copyToClipboard('curl -X POST...')} className="absolute top-4 right-4 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all bg-gray-800 p-2 rounded-lg">
                    <Copy className="w-4 h-4" />
                  </button>
                  <pre className="text-sm font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap">
<span className="text-blue-400">curl</span> -X {endpointsData[activeEndpoint].method} {endpointsData[activeEndpoint].url} \
  <span dangerouslySetInnerHTML={{ __html: endpointsData[activeEndpoint].curl }} />
                  </pre>
                </div>
              </div>
              <div className="mt-6 prose dark:prose-invert max-w-none">
                <h4 className="text-[var(--text-primary)] font-bold">{endpointsData[activeEndpoint].responseTitle}</h4>
                <p className="text-sm text-[var(--text-secondary)]">{endpointsData[activeEndpoint].responseDesc}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[var(--text-primary)]">Real-time Activity Stream</h3>
              <button className="text-xs font-semibold px-3 py-1.5 border border-[var(--border-outline)] rounded-lg hover:bg-[var(--bg-tertiary)] flex items-center gap-2 transition-colors">
                <RefreshCw className="w-3 h-3" /> Clear Logs
              </button>
            </div>
            
            <div className="flex-1 bg-[#0d1117] border border-gray-800 rounded-2xl p-4 font-mono text-xs md:text-sm overflow-y-auto font-medium h-[400px]">
              <div className="text-green-500 mb-4">Listening for API requests on project "Acme Logistics"...</div>
              {logs.map((log, index) => {
                const isError = log.includes("429") || log.includes("500") || log.includes("400");
                const isWarning = log.includes("404");
                const colorClass = isError ? "text-red-400" : isWarning ? "text-yellow-400" : "text-gray-300";
                return (
                  <div key={index} className={`mb-1 ${colorClass} hover:bg-gray-800/50 px-2 py-0.5 rounded transition-colors`}>
                    <span className="text-gray-500 mr-2">{'>'}</span> {log}
                  </div>
                );
              })}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

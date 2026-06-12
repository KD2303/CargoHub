"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { DataTable } from "@/components/admin/ui/DataTable";
import { adminFetch } from "@/lib/admin/api";
import { Loader2 } from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await adminFetch("/api/admin/audit-logs");
        setLogs(res.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();

    import("socket.io-client").then(({ io }) => {
      import("@/lib/firebase").then(({ auth }) => {
        auth.currentUser?.getIdToken().then(token => {
          const socket = io("http://localhost:5000", {
            auth: { token }
          });
          
          socket.on('audit_log:new', (newLog: any) => {
            setLogs(prev => [newLog, ...prev]);
          });

          return () => {
            socket.disconnect();
          };
        });
      });
    });
  }, []);

  const columns = [
    { key: "adminUid", label: "Actor UID" },
    { key: "action", label: "Action", render: (row: any) => <span className="font-semibold text-gray-800">{row.action}</span> },
    { key: "targetType", label: "Context", render: (row: any) => <span className="uppercase text-xs">{row.targetType}</span> },
    { key: "targetId", label: "Target ID", render: (row: any) => <span className="font-mono text-xs">{row.targetId}</span> },
    { key: "createdAt", label: "Timestamp", render: (row: any) => new Date(row.createdAt).toLocaleString() },
  ];

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Chronological ledger of all system and user actions" />

      {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <DataTable columns={columns} rows={logs} />
        )}
      </div>
    </div>
  );
}

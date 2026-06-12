import React from "react";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { AdminClientLayout } from "@/components/admin/layout/AdminClientLayout";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <AdminClientLayout>
        {children}
      </AdminClientLayout>
    </AdminGuard>
  );
}

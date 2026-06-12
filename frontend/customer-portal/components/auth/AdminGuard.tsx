"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { adminToken, adminUser, verifyAdminSession } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verify = async () => {
      await verifyAdminSession();
      setIsVerifying(false);
    };
    verify();
  }, [verifyAdminSession]);

  useEffect(() => {
    if (!isVerifying) {
      if (!adminToken || adminUser?.role !== "ADMIN") {
        router.replace("/admin/login");
      }
    }
  }, [adminToken, adminUser, isVerifying, router]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-8 h-8 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Only render children if authenticated as ADMIN via custom JWT
  if (adminToken && adminUser?.role === "ADMIN") {
    return <>{children}</>;
  }

  return null;
}

"use client";

import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import RouteGuardLogin from "@/components/auth/RouteGuardLogin";
import { toast } from '@/store/toastStore';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading, setUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isDriverAuthorized = isAuthenticated && user?.role === "DRIVER";

  const handleDemoLogin = (email: string, pass: string) => {
    if (email === "driver@demo.com" && pass === "password") {
      setUser({
        id: "driver-demo-123",
        firebaseUid: "driver-demo-123",
        name: "Demo Driver",
        email: "driver@demo.com",
        phone: "+910000000000",
        role: "DRIVER",
        accountType: "STANDARD",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      toast.error("Invalid credentials. Please use the demo credentials provided.");
    }
  };

  if (!isDriverAuthorized) {
    return (
      <RouteGuardLogin
        title="Driver Portal Access"
        subtitle="Please log in with your verified driver account to view incoming trips."
        demoEmail="driver@demo.com"
        demoPass="password"
        onLogin={handleDemoLogin}
      />
    );
  }

  return <>{children}</>;
}

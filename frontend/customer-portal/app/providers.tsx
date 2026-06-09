"use client";

import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function Providers({ children }: { children: React.ReactNode }) {
  const initializeAuthListener = useAuthStore((state) => state.initializeAuthListener);

  useEffect(() => {
    const unsubscribe = initializeAuthListener();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [initializeAuthListener]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children as any}
    </ThemeProvider>
  );
}

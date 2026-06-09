import React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  initials: string;
  src?: string;
  className?: string;
}

export function Avatar({ initials, src, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-[var(--admin-primary-light)] text-[var(--admin-primary)] font-bold text-sm shrink-0 overflow-hidden",
        "w-10 h-10 border-2 border-white shadow-sm",
        className
      )}
    >
      {src ? (
        <img src={src} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

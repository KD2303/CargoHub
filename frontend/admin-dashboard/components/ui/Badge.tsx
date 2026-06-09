import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "error" | "info" | "purple" | "default";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ label, variant = "default", className }: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    success: "bg-[var(--green-bg)] text-[var(--green-text)] border-[var(--green-border)]",
    warning: "bg-[var(--amber-bg)] text-[var(--amber-text)] border-[var(--amber-border)]",
    error: "bg-[var(--red-bg)] text-[var(--red-text)] border-[var(--red-border)]",
    info: "bg-[var(--blue-bg)] text-[var(--blue-text)] border-[var(--blue-border)]",
    purple: "bg-[var(--admin-primary-light)] text-[var(--admin-primary)] border-[var(--admin-border)]",
    default: "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-gray-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium tracking-wide uppercase border",
        variantStyles[variant],
        className
      )}
    >
      {label}
    </span>
  );
}

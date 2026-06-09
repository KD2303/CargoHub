import React from "react";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down";
  accentColor: "blue" | "green" | "purple" | "red";
  icon?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  change,
  changeType,
  accentColor,
  icon,
}: StatCardProps) {
  const accentColors = {
    blue: "border-l-[#185FA5]",
    green: "border-l-[#0F6E56]",
    purple: "border-l-[var(--admin-primary-mid)]",
    red: "border-l-[#A32D2D]",
  };

  return (
    <div
      className={cn(
        "bg-[var(--bg-surface)] p-5 rounded-lg border border-gray-100 shadow-sm border-l-4 relative",
        accentColors[accentColor]
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wide">
            {label}
          </p>
          <h3 className="text-[28px] font-bold text-[var(--text-primary)] mt-1 tracking-tight">
            {value}
          </h3>
        </div>
        {icon && (
          <div className="text-[var(--text-secondary)] opacity-80">
            {icon}
          </div>
        )}
      </div>

      {change && (
        <div className="mt-4 flex items-center">
          <span
            className={cn(
              "inline-flex items-center text-[12px] font-medium px-1.5 py-0.5 rounded-full mr-2",
              changeType === "up"
                ? "bg-[var(--green-bg)] text-[var(--green-text)]"
                : "bg-[var(--red-bg)] text-[var(--red-text)]"
            )}
          >
            {changeType === "up" ? (
              <ArrowUp className="w-3 h-3 mr-0.5" />
            ) : (
              <ArrowDown className="w-3 h-3 mr-0.5" />
            )}
            {change}
          </span>
          {/* We might add "vs yesterday" here if passed as part of the change or another prop, but per spec, change prop handles it */}
        </div>
      )}
    </div>
  );
}

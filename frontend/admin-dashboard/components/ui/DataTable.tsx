"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: keyof T | string;
  label: string;
  width?: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  rows,
  onRowClick,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("w-full overflow-x-auto bg-[var(--bg-surface)] rounded-lg border border-[var(--admin-border)] shadow-sm", className)}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[var(--bg-secondary)] border-b border-[var(--admin-border)] text-[12px] uppercase text-[var(--text-secondary)] tracking-wider">
            {columns.map((col, index) => (
              <th
                key={String(col.key)}
                className={cn("px-4 py-3 font-medium whitespace-nowrap sticky top-0 bg-[var(--bg-secondary)] z-10")}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm">
          {rows.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "border-b border-gray-100 last:border-b-0 transition-colors",
                rowIndex % 2 === 0 ? "bg-[var(--bg-surface)]" : "bg-[#F7F7FB]",
                onRowClick ? "cursor-pointer hover:bg-[var(--admin-primary-light)]" : "hover:bg-[var(--admin-primary-light)]/50"
              )}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-3 whitespace-nowrap text-[var(--text-primary)]">
                  {col.render ? col.render(row) : (row as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

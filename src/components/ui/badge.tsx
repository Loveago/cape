import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "danger" | "info" | "muted" | "brand";

const variants: Record<Variant, string> = {
  default:
    "bg-[#F3F1EC] text-[#111318] border-[#E5E2DC] dark:bg-[#1C1F26] dark:text-[#F4F4F6] dark:border-[#262A34]",
  success:
    "bg-[#15803D]/10 text-[#15803D] border-[#15803D]/25 dark:text-[#22C55E] dark:bg-[#22C55E]/15 dark:border-[#22C55E]/30",
  warning:
    "bg-[#B45309]/10 text-[#B45309] border-[#B45309]/25 dark:text-[#F59E0B] dark:bg-[#F59E0B]/15 dark:border-[#F59E0B]/30",
  danger:
    "bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/25 dark:text-[#EF4444] dark:bg-[#EF4444]/15 dark:border-[#EF4444]/30",
  info:
    "bg-[#1D4ED8]/10 text-[#1D4ED8] border-[#1D4ED8]/25 dark:text-[#3B82F6] dark:bg-[#3B82F6]/15 dark:border-[#3B82F6]/30",
  muted:
    "bg-[#F3F1EC] text-[#5A606B] border-[#E5E2DC] dark:bg-[#1C1F26] dark:text-[#949AA6] dark:border-[#262A34]",
  brand:
    "bg-[#1D4ED8]/10 text-[#1D4ED8] border-[#1D4ED8]/25 dark:text-[#3B82F6] dark:bg-[#3B82F6]/15 dark:border-[#3B82F6]/30",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-tight transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

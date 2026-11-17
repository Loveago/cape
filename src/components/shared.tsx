import * as React from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  className,
}: {
  title: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-[#E5E2DC] bg-white p-5 transition-colors hover:border-[#D4CFC7] dark:border-[#262A34] dark:bg-[#14161B] dark:hover:border-[#343A47]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">
            {title}
          </p>
          <div className="mt-2 break-all font-mono text-2xl sm:text-3xl font-bold tracking-tight text-[#111318] dark:text-[#F4F4F6] tabular-nums">
            {value}
          </div>
          {hint && (
            <div className="mt-2 flex items-center text-xs font-medium text-[#5A606B] dark:text-[#949AA6]">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#F3F1EC] px-2 py-0.5 text-[11px] font-medium text-[#5A606B] dark:bg-[#1C1F26] dark:text-[#949AA6]">
                {hint}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E5E2DC] bg-[#F3F1EC] text-[#1D4ED8] dark:border-[#262A34] dark:bg-[#1C1F26] dark:text-[#3B82F6]">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center rounded-xl border border-dashed border-[#E5E2DC] bg-[#FAF9F6] p-6 dark:border-[#262A34] dark:bg-[#14161B]/60">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E5E2DC] bg-[#F3F1EC] text-[#5A606B] dark:border-[#262A34] dark:bg-[#1C1F26] dark:text-[#949AA6]">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <p className="text-base font-bold text-[#111318] dark:text-[#F4F4F6]">{title}</p>
      {description && (
        <p className="max-w-sm text-xs sm:text-sm text-[#5A606B] dark:text-[#949AA6] leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-1">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111318] dark:text-[#F4F4F6]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-xs sm:text-sm font-medium text-[#5A606B] dark:text-[#949AA6]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
    </div>
  );
}

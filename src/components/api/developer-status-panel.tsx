"use client";

import * as React from "react";
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Activity, Radio, Server, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared";

export function DeveloperStatusPanel() {
  const [statusData, setStatusData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/v1/status");
      const json = await res.json();
      if (json.success && json.data) {
        setStatusData(json.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-8 w-8 text-[#1D4ED8] dark:text-[#3B82F6]" />
      </div>
    );
  }

  const components = statusData?.components || {};

  const getStatusIcon = (status: string) => {
    if (status === "OPERATIONAL") return <CheckCircle2 className="h-5 w-5 text-[#15803D] dark:text-[#22C55E]" />;
    if (status === "DEGRADED" || status === "MAINTENANCE") return <AlertTriangle className="h-5 w-5 text-[#D97706] dark:text-[#F59E0B]" />;
    return <XCircle className="h-5 w-5 text-[#DC2626] dark:text-[#EF4444]" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === "OPERATIONAL") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-[#15803D]/30 dark:border-[#22C55E]/30 bg-[#15803D]/10 dark:bg-[#22C55E]/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#15803D] dark:text-[#22C55E]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#15803D] dark:bg-[#22C55E] animate-pulse" /> Operational
        </span>
      );
    }
    if (status === "MAINTENANCE") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-[#D97706]/30 dark:border-[#F59E0B]/30 bg-[#D97706]/10 dark:bg-[#F59E0B]/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#D97706] dark:text-[#F59E0B]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D97706] dark:bg-[#F59E0B]" /> Maintenance
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-[#DC2626]/30 dark:border-[#EF4444]/30 bg-[#DC2626]/10 dark:bg-[#EF4444]/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#DC2626] dark:text-[#EF4444]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626] dark:bg-[#EF4444]" /> Degraded
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-[#1D4ED8]/25 dark:border-[#3B82F6]/30 bg-[#1D4ED8]/10 dark:bg-[#3B82F6]/10 p-2.5 text-[#1D4ED8] dark:text-[#3B82F6]">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-[#111318] dark:text-[#F4F4F6]">Carrier Telemetry &amp; System Health</h2>
            <p className="mt-0.5 text-xs text-[#5A606B] dark:text-[#949AA6]">
              Live operational health across carrier baseband gateways, order ingestion pipelines, and auth services.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={load}
          className="gap-2 border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] text-xs font-semibold text-[#111318] dark:text-[#F4F4F6] hover:border-[#1D4ED8]/40 dark:hover:border-[#3B82F6]/40 hover:text-[#1D4ED8] dark:hover:text-[#3B82F6]"
        >
          <RefreshCw className="h-3.5 w-3.5 text-[#1D4ED8] dark:text-[#3B82F6]" /> Polling Status
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(components).map(([key, comp]: [string, any]) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-5 transition-colors hover:border-[#1D4ED8]/30 dark:hover:border-[#3B82F6]/30"
          >
            <div className="flex items-center gap-3.5">
              <div className="rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] p-2.5">
                {getStatusIcon(comp.status)}
              </div>
              <div>
                <p className="text-sm font-bold text-[#111318] dark:text-[#F4F4F6]">{comp.name}</p>
                <p className="text-[10px] uppercase tracking-wider font-mono text-[#5A606B] dark:text-[#949AA6]">ID: {key}</p>
              </div>
            </div>
            <div>{getStatusBadge(comp.status)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

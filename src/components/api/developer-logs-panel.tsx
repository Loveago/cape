"use client";

import * as React from "react";
import { Search, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner, EmptyState } from "@/components/shared";
import { formatDateTime } from "@/lib/types";

export function DeveloperLogsPanel() {
  const [logs, setLogs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [search, setSearch] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "25");
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/developer/logs?${params.toString()}`);
      const json = await res.json();
      setLogs(json.logs ?? []);
      setTotalPages(json.totalPages || 1);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5A606B] dark:text-[#949AA6]" />
          <input
            type="text"
            placeholder="Search request ID, endpoint, or error..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-9 w-full rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] pl-8 pr-3 text-xs text-[#111318] dark:text-[#F4F4F6] placeholder:text-[#5A606B]/60 dark:placeholder:text-[#949AA6]/60 focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] focus:outline-none"
          />
        </div>

        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 h-9 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-3 py-1 text-xs font-semibold text-[#111318] dark:text-[#F4F4F6] hover:border-[#1D4ED8]/40 dark:hover:border-[#3B82F6]/40 hover:text-[#1D4ED8] dark:hover:text-[#3B82F6]"
        >
          <RefreshCw className="h-3.5 w-3.5 text-[#1D4ED8] dark:text-[#3B82F6]" /> Refresh
        </button>
      </div>

      <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-8 w-8 text-[#1D4ED8] dark:text-[#3B82F6]" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-xl bg-[#1D4ED8]/10 dark:bg-[#3B82F6]/10 border border-[#1D4ED8]/20 dark:border-[#3B82F6]/20 text-[#1D4ED8] dark:text-[#3B82F6] flex items-center justify-center mx-auto">
              <Clock className="h-6 w-6" />
            </div>
            <p className="text-base font-bold text-[#111318] dark:text-[#F4F4F6]">No API traffic recorded yet</p>
            <p className="text-xs text-[#5A606B] dark:text-[#949AA6] max-w-sm mx-auto">
              Live API calls will be logged here with HTTP codes, latency, and debug Request IDs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] text-[#5A606B] dark:text-[#949AA6] uppercase tracking-wider text-[11px] font-bold font-sans">
                <tr>
                  <th className="px-5 py-3.5">Method &amp; Status</th>
                  <th className="px-4 py-3.5">Endpoint</th>
                  <th className="px-4 py-3.5">Duration</th>
                  <th className="px-4 py-3.5">Request ID</th>
                  <th className="hidden px-4 py-3.5 md:table-cell">Client IP</th>
                  <th className="px-5 py-3.5 text-right font-sans">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2DC] dark:divide-[#262A34]">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-[#F3F1EC]/60 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="px-5 py-3.5">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                          l.success
                            ? "bg-[#15803D]/10 dark:bg-[#22C55E]/10 text-[#15803D] dark:text-[#22C55E] border-[#15803D]/30 dark:border-[#22C55E]/30"
                            : "bg-[#DC2626]/10 dark:bg-[#EF4444]/10 text-[#DC2626] dark:text-[#EF4444] border-[#DC2626]/30 dark:border-[#EF4444]/30"
                        }`}
                      >
                        {l.method} {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#111318] dark:text-[#F4F4F6]">
                      {l.endpoint}
                      {l.errorCode && (
                        <span className="ml-2 font-mono text-[10px] text-[#DC2626] dark:text-[#EF4444]">
                          ({l.errorCode})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-[#5A606B] dark:text-[#949AA6] font-sans">
                      {l.responseTimeMs ? `${l.responseTimeMs}ms` : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-[#5A606B] dark:text-[#949AA6] text-[11px]">
                      {l.requestId || "—"}
                    </td>
                    <td className="hidden px-4 py-3.5 text-[#5A606B] dark:text-[#949AA6] md:table-cell">
                      {l.ip || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right text-[#5A606B] dark:text-[#949AA6] text-[11px] font-sans">
                      {formatDateTime(l.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E5E2DC] dark:border-[#262A34] p-4 text-xs font-sans">
            <p className="text-[#5A606B] dark:text-[#949AA6] font-mono">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] font-semibold text-[#111318] dark:text-[#F4F4F6] disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] font-semibold text-[#111318] dark:text-[#F4F4F6] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

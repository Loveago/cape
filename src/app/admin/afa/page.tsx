"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Save, ShieldCheck, RefreshCw, Copy, Download } from "lucide-react";
import { useToast } from "@/components/toast";
import { PageHeader } from "@/components/shared";
import { formatGHS } from "@/lib/types";

interface AdminAfaItem {
  id: string;
  fullName: string;
  phone: string;
  ghanaCard: string;
  location: string;
  feePesewas: number;
  commissionPesewas: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string } | null;
  storefront?: { id: string; name: string; slug: string } | null;
}

export default function AdminAfaPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [afaEnabled, setAfaEnabled] = useState(true);
  const [afaFee, setAfaFee] = useState("11.00");
  const [registrations, setRegistrations] = useState<AdminAfaItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = async (filter = statusFilter) => {
    try {
      const res = await fetch(`/api/admin/afa?status=${encodeURIComponent(filter)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setAfaEnabled(Boolean(data.settings?.enabled));
        setAfaFee(
          typeof data.settings?.feeGHS === "number" ? data.settings.feeGHS.toFixed(2) : "11.00"
        );
        setRegistrations(Array.isArray(data.registrations) ? data.registrations : []);
      }
    } catch {
      toast("Failed to load AFA registrations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveAfaSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          afa_enabled: afaEnabled ? "true" : "false",
          afa_registration_fee: afaFee,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Failed to save AFA settings", "error");
        return;
      }
      toast("AFA settings updated!", "success");
      loadData();
    } catch {
      toast("Network error saving settings", "error");
    } finally {
      setSavingSettings(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/afa", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        toast("Failed to update status", "error");
        return;
      }
      toast(`Marked as ${status}`, "success");
      loadData();
    } catch {
      toast("Network error", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AFA Registrations & Pricing"
        description="Configure the global AFA registration fee and process customer submissions"
      />

      {/* Admin AFA Settings Card */}
      <form
        onSubmit={saveAfaSettings}
        className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-5 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-[#1D4ED8] dark:text-[#3B82F6]" />
            <div>
              <h2 className="text-sm font-bold text-[#111318] dark:text-[#F4F4F6]">
                AFA Registration Service
              </h2>
              <p className="text-xs text-[#5A606B] dark:text-[#949AA6]">
                Enable or disable AFA registration across user dashboards and storefronts, and set the base registration fee.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={afaEnabled}
            onClick={() => setAfaEnabled((v) => !v)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              afaEnabled ? "bg-[#1D4ED8]" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                afaEnabled ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 items-end pt-2 border-t border-[#E5E2DC] dark:border-[#262A34]">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#5A606B] dark:text-[#949AA6]">
              Registration Fee (GHS)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={afaFee}
              onChange={(e) => setAfaFee(e.target.value)}
              className="w-full h-10 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-3 text-sm font-mono text-[#111318] dark:text-[#F4F4F6]"
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-2 justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] px-4 text-xs font-semibold text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Save AFA Settings</span>
            </button>
          </div>
        </div>
      </form>

      {/* Filter & Table */}
      <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E5E2DC] dark:border-[#262A34] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {["ALL", "PENDING", "PROCESSING", "COMPLETED", "REJECTED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  loadData(st);
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#1D4ED8] text-white"
                    : "bg-[#F3F1EC] dark:bg-[#1C1F26] text-[#5A606B] dark:text-[#949AA6]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (registrations.length === 0) return;
                const headers = ["Full Name", "Phone", "Ghana Card", "Location", "Source", "Fee (GHS)", "Commission (GHS)", "Payment", "Status", "Created At"];
                const rows = registrations.map((r) => [
                  `"${r.fullName.replace(/"/g, '""')}"`,
                  r.phone,
                  r.ghanaCard,
                  `"${r.location.replace(/"/g, '""')}"`,
                  `"${(r.storefront ? `Store: ${r.storefront.name}` : r.user?.email || "Direct").replace(/"/g, '""')}"`,
                  (r.feePesewas / 100).toFixed(2),
                  (r.commissionPesewas / 100).toFixed(2),
                  r.paymentStatus,
                  r.status,
                  r.createdAt,
                ]);
                const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `pycbundles-afa-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] px-2.5 py-1 text-xs font-medium text-[#5A606B] dark:text-[#949AA6] hover:text-[#111318] dark:hover:text-white cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => loadData(statusFilter)}
              className="inline-flex items-center gap-1 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] px-2.5 py-1 text-xs font-medium text-[#5A606B] dark:text-[#949AA6] hover:text-[#111318] dark:hover:text-white cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-14">
            <Loader2 className="h-6 w-6 animate-spin text-[#1D4ED8]" />
          </div>
        ) : registrations.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#5A606B] dark:text-[#949AA6]">
            No AFA registrations found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] text-[10px] uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">
                <tr>
                  <th className="px-4 py-2.5">Applicant</th>
                  <th className="px-4 py-2.5">Phone</th>
                  <th className="px-4 py-2.5">Ghana Card</th>
                  <th className="px-4 py-2.5">Location</th>
                  <th className="px-4 py-2.5">Source</th>
                  <th className="px-4 py-2.5">Fee / Payment</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2DC]/60 dark:divide-[#262A34]">
                {registrations.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2.5 font-medium text-[#111318] dark:text-[#F4F4F6]">
                      {r.fullName}
                    </td>
                    <td className="px-4 py-2.5 font-mono">{r.phone}</td>
                    <td className="px-4 py-2.5 font-mono">{r.ghanaCard}</td>
                    <td className="px-4 py-2.5">{r.location}</td>
                    <td className="px-4 py-2.5 text-[11px] text-[#5A606B] dark:text-[#949AA6]">
                      {r.storefront ? `Store: ${r.storefront.name}` : r.user?.email || "Direct"}
                    </td>
                    <td className="px-4 py-2.5 font-mono">
                      {formatGHS(r.feePesewas / 100)} ({r.paymentStatus})
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                          r.status === "COMPLETED"
                            ? "bg-[#15803D]/10 text-[#15803D] dark:text-[#22C55E]"
                            : r.status === "REJECTED"
                            ? "bg-[#DC2626]/10 text-[#DC2626] dark:text-[#EF4444]"
                            : "bg-[#D97706]/10 text-[#D97706] dark:text-[#F59E0B]"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={async () => {
                            const text = `${r.fullName}\n${r.phone}\n${r.ghanaCard}\n${r.location}`;
                            try {
                              await navigator.clipboard.writeText(text);
                              toast("Copied registration details", "success");
                            } catch {
                              toast("Copy failed", "error");
                            }
                          }}
                          title="Copy registration details"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] text-[#5A606B] hover:text-[#111318] dark:text-[#949AA6] dark:hover:text-white cursor-pointer"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <select
                          value={r.status}
                          disabled={updatingId === r.id}
                          onChange={(e) => updateStatus(r.id, e.target.value)}
                          className="h-8 rounded-md border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-2 text-xs text-[#111318] dark:text-[#F4F4F6]"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

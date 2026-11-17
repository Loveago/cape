"use client";

import * as React from "react";
import { Plus, Copy, Check, Key, Power, RefreshCw, Trash2, ShieldAlert, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner, EmptyState } from "@/components/shared";
import { StatusBadge } from "@/components/status-badge";
import { useToast } from "@/components/toast";
import { formatDateTime } from "@/lib/types";

interface CredentialRow {
  id: string;
  name: string;
  environment: string;
  keyPrefix: string;
  status: string;
  scopes: string;
  rateLimitPerMin: number;
  dailyLimit: number;
  requestCount: number;
  lastUsedAt: string | null;
  createdAt: string;
}

export function DeveloperCredentials({
  isApprovedForProduction,
  applicationStatus,
}: {
  isApprovedForProduction: boolean;
  applicationStatus: string;
}) {
  const { toast } = useToast();
  const [credentials, setCredentials] = React.useState<CredentialRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [createName, setCreateName] = React.useState("");
  const [createEnv, setCreateEnv] = React.useState<"PRODUCTION" | "SANDBOX">(
    isApprovedForProduction ? "PRODUCTION" : "SANDBOX"
  );
  const [creating, setCreating] = React.useState(false);
  const [newKeyModal, setNewKeyModal] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/developer/credentials");
      const json = await res.json();
      setCredentials(json.credentials ?? []);
    } catch {
      toast("Failed to load API credentials", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;

    if (createEnv === "PRODUCTION" && !isApprovedForProduction) {
      toast("Production credentials require an approved API application", "error");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/developer/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName.trim(), environment: createEnv }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast(json.error ?? "Failed to generate key", "error");
        return;
      }
      setShowCreateModal(false);
      setCreateName("");
      setNewKeyModal(json.apiKey);
      try {
        localStorage.setItem("pycbundles_playground_api_key", json.apiKey);
      } catch {}
      toast("Credential created successfully", "success");
      load();
    } catch {
      toast("Failed to create credential", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleAction = async (id: string, action: "DISABLE" | "ENABLE" | "REVOKE" | "ROTATE") => {
    if (action === "REVOKE" && !confirm("Are you sure you want to permanently revoke this credential? Any system using it will immediately fail.")) {
      return;
    }

    try {
      const res = await fetch(`/api/developer/credentials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast(json.error ?? "Action failed", "error");
        return;
      }

      if (action === "ROTATE" && json.newApiKey) {
        setNewKeyModal(json.newApiKey);
        try {
          localStorage.setItem("pycbundles_playground_api_key", json.newApiKey);
        } catch {}
        toast("Key rotated successfully. Save your new key.", "success");
      } else {
        toast(`Credential ${action.toLowerCase()}d`, "success");
      }
      load();
    } catch {
      toast("Failed to update credential", "error");
    }
  };

  const copyKey = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast("API key copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E2DC] dark:border-[#262A34] pb-4">
        <div>
          <h2 className="text-base font-bold text-[#111318] dark:text-[#F4F4F6] tracking-tight">API Authentication Credentials</h2>
          <p className="text-xs text-[#5A606B] dark:text-[#949AA6]">
            Generate and rotate cryptographic access keys for your automated telecom endpoints.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1D4ED8] dark:bg-[#3B82F6] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1E40AF] dark:hover:bg-[#2563EB] transition cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Generate New Key
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-8 w-8 text-[#1D4ED8] dark:text-[#3B82F6]" />
          </div>
        ) : credentials.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-xl bg-[#1D4ED8]/10 dark:bg-[#3B82F6]/10 border border-[#1D4ED8]/20 dark:border-[#3B82F6]/20 text-[#1D4ED8] dark:text-[#3B82F6] flex items-center justify-center mx-auto">
              <Key className="h-6 w-6" />
            </div>
            <p className="text-base font-bold text-[#111318] dark:text-[#F4F4F6]">No API credentials generated yet</p>
            <p className="text-xs text-[#5A606B] dark:text-[#949AA6] max-w-sm mx-auto">
              Create your first credential to authorize REST requests against the pycbundles gateway.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#1D4ED8] dark:bg-[#3B82F6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E40AF] dark:hover:bg-[#2563EB]"
            >
              <Plus className="h-4 w-4" /> Create Key
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] text-[#5A606B] dark:text-[#949AA6] uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Credential &amp; Key Prefix</th>
                  <th className="px-4 py-3.5 font-bold">Environment</th>
                  <th className="px-4 py-3.5 font-bold">Status</th>
                  <th className="px-4 py-3.5 font-bold">Requests</th>
                  <th className="px-4 py-3.5 font-bold">Rate Limit</th>
                  <th className="hidden px-4 py-3.5 font-bold md:table-cell">Last Used</th>
                  <th className="px-5 py-3.5 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2DC] dark:divide-[#262A34]">
                {credentials.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F3F1EC]/60 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-[#111318] dark:text-[#F4F4F6]">{c.name}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-[#1D4ED8] dark:text-[#3B82F6]">{c.keyPrefix}••••••••••••</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                          c.environment === "PRODUCTION"
                            ? "bg-[#1D4ED8]/10 dark:bg-[#3B82F6]/10 text-[#1D4ED8] dark:text-[#3B82F6] border-[#1D4ED8]/30 dark:border-[#3B82F6]/30"
                            : "bg-[#D97706]/10 dark:bg-[#F59E0B]/10 text-[#D97706] dark:text-[#F59E0B] border-[#D97706]/30 dark:border-[#F59E0B]/30"
                        }`}
                      >
                        {c.environment}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[#111318] dark:text-[#F4F4F6]">
                      {c.requestCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-[#5A606B] dark:text-[#949AA6] font-mono">
                      {c.rateLimitPerMin}/min
                    </td>
                    <td className="hidden px-4 py-3.5 text-[#5A606B] dark:text-[#949AA6] font-mono md:table-cell">
                      {c.lastUsedAt ? formatDateTime(c.lastUsedAt) : "Never"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.status === "ACTIVE" ? (
                          <button
                            onClick={() => handleAction(c.id, "DISABLE")}
                            title="Disable Key"
                            className="inline-flex items-center gap-1 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-2.5 py-1 text-xs font-semibold text-[#111318] dark:text-[#F4F4F6] hover:border-[#D97706]/40"
                          >
                            <Power className="h-3 w-3" /> Disable
                          </button>
                        ) : c.status === "DISABLED" ? (
                          <button
                            onClick={() => handleAction(c.id, "ENABLE")}
                            title="Enable Key"
                            className="inline-flex items-center gap-1 rounded-lg border border-[#15803D]/30 dark:border-[#22C55E]/30 bg-[#15803D]/10 dark:bg-[#22C55E]/10 px-2.5 py-1 text-xs font-semibold text-[#15803D] dark:text-[#22C55E]"
                          >
                            <Power className="h-3 w-3" /> Enable
                          </button>
                        ) : null}

                        {c.status !== "REVOKED" && (
                          <>
                            <button
                              onClick={() => handleAction(c.id, "ROTATE")}
                              title="Rotate Key"
                              className="inline-flex items-center gap-1 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-2.5 py-1 text-xs font-semibold text-[#1D4ED8] dark:text-[#3B82F6] hover:border-[#1D4ED8]/40 dark:hover:border-[#3B82F6]/40"
                            >
                              <RefreshCw className="h-3 w-3" /> Rotate
                            </button>
                            <button
                              onClick={() => handleAction(c.id, "REVOKE")}
                              title="Revoke Key"
                              className="inline-flex items-center gap-1 rounded-lg border border-[#DC2626]/20 dark:border-[#EF4444]/20 bg-[#DC2626]/10 dark:bg-[#EF4444]/10 px-2.5 py-1 text-xs font-semibold text-[#DC2626] dark:text-[#EF4444] hover:border-[#DC2626]/40"
                            >
                              <Trash2 className="h-3 w-3" /> Revoke
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#14161B] p-6 shadow-xl border border-[#E5E2DC] dark:border-[#262A34]">
            <h3 className="text-base font-bold text-[#111318] dark:text-[#F4F4F6] tracking-tight">Generate API Credential</h3>
            <p className="mt-1 text-xs text-[#5A606B] dark:text-[#949AA6]">
              Create a cryptographic Bearer token to authorize automated requests from your application.
            </p>

            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">
                  Credential Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Webhook Server, Mobile App"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-3.5 py-2.5 text-xs text-[#111318] dark:text-[#F4F4F6] placeholder:text-[#5A606B]/60 dark:placeholder:text-[#949AA6]/60 focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">
                  Environment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => isApprovedForProduction && setCreateEnv("PRODUCTION")}
                    disabled={!isApprovedForProduction}
                    className={`rounded-lg border p-3 text-left transition ${
                      createEnv === "PRODUCTION"
                        ? "border-[#1D4ED8] dark:border-[#3B82F6] bg-[#1D4ED8]/10 dark:bg-[#3B82F6]/10 text-[#111318] dark:text-[#F4F4F6]"
                        : "border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] text-[#5A606B] dark:text-[#949AA6]"
                    } ${!isApprovedForProduction ? "cursor-not-allowed opacity-40" : ""}`}
                  >
                    <p className="text-xs font-bold">Production</p>
                    <p className="mt-0.5 text-[11px] text-[#5A606B] dark:text-[#949AA6]">Live money &amp; dispatches</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateEnv("SANDBOX")}
                    className={`rounded-lg border p-3 text-left transition ${
                      createEnv === "SANDBOX"
                        ? "border-[#D97706] dark:border-[#F59E0B] bg-[#D97706]/10 dark:bg-[#F59E0B]/10 text-[#111318] dark:text-[#F4F4F6]"
                        : "border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] text-[#5A606B] dark:text-[#949AA6]"
                    }`}
                  >
                    <p className="text-xs font-bold">Sandbox (Test)</p>
                    <p className="mt-0.5 text-[11px] text-[#5A606B] dark:text-[#949AA6]">Mock responses &amp; testing</p>
                  </button>
                </div>

                {!isApprovedForProduction && (
                  <p className="flex items-center gap-1.5 text-[11px] text-[#D97706] dark:text-[#F59E0B] pt-1">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Production keys require approved access (Status: {applicationStatus}).
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E2DC] dark:border-[#262A34]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-4 py-2 text-xs font-semibold text-[#111318] dark:text-[#F4F4F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-[#1D4ED8] dark:bg-[#3B82F6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E40AF] dark:hover:bg-[#2563EB] disabled:opacity-50"
                >
                  {creating ? <Spinner className="h-4 w-4" /> : "Authorize & Generate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Secret Shown Once Modal */}
      {newKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-[#14161B] p-6 shadow-xl border border-[#E5E2DC] dark:border-[#262A34]">
            <div className="flex items-center gap-2.5 text-[#D97706] dark:text-[#F59E0B]">
              <ShieldAlert className="h-5 w-5" />
              <h3 className="text-base font-bold text-[#111318] dark:text-[#F4F4F6] tracking-tight">
                Store Your API Key Immediately
              </h3>
            </div>
            <p className="mt-2 text-xs text-[#5A606B] dark:text-[#949AA6]">
              This token is displayed <strong>only once</strong> for cryptographic safety. Store it in your secure environment variables.
            </p>

            <div className="mt-4 rounded-xl bg-[#0C0D10] p-4 border border-[#262A34]">
              <div className="flex items-center justify-between gap-3">
                <code className="break-all font-mono text-xs font-semibold text-[#3B82F6]">
                  {newKeyModal}
                </code>
                <button
                  onClick={() => copyKey(newKeyModal)}
                  className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#262A34] bg-[#14161B] px-3 py-1.5 text-xs font-semibold text-white hover:border-[#3B82F6]/40"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-[#22C55E]" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setNewKeyModal(null)}
                className="rounded-lg bg-[#1D4ED8] dark:bg-[#3B82F6] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#1E40AF] dark:hover:bg-[#2563EB]"
              >
                I Have Stored My Key Safely
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

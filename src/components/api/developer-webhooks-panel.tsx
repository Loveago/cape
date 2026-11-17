"use client";

import * as React from "react";
import { Send, RefreshCw, Key, ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle, Play, Radio, Globe, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner, EmptyState } from "@/components/shared";
import { StatusBadge } from "@/components/status-badge";
import { useToast } from "@/components/toast";
import { formatDateTime } from "@/lib/types";

export function DeveloperWebhooksPanel() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [webhook, setWebhook] = React.useState<any>(null);
  const [url, setUrl] = React.useState("");
  const [active, setActive] = React.useState(true);
  const [selectedEvents, setSelectedEvents] = React.useState<string[]>([
    "order.created",
    "order.processing",
    "order.completed",
    "order.failed",
    "order.cancelled",
  ]);
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [retryingId, setRetryingId] = React.useState<string | null>(null);
  const [newSecretAlert, setNewSecretAlert] = React.useState<string | null>(null);

  const ALL_EVENTS = [
    { id: "order.created", label: "order.created", desc: "Dispatched immediately upon order ingestion" },
    { id: "order.processing", label: "order.processing", desc: "Fulfillment routed to carrier gateway" },
    { id: "order.completed", label: "order.completed", desc: "Data bundle verified delivered to MSISDN" },
    { id: "order.failed", label: "order.failed", desc: "Carrier rejected or delivery failed" },
    { id: "order.cancelled", label: "order.cancelled", desc: "Order voided and credits restored" },
  ];

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/developer/webhooks");
      const json = await res.json();
      if (json.webhook) {
        setWebhook(json.webhook);
        setUrl(json.webhook.url || "");
        setActive(json.webhook.active);
        setSelectedEvents(json.webhook.events || []);
      }
    } catch {
      toast("Failed to load webhook settings", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (rotateSecret = false) => {
    if (!url.trim() || (!url.startsWith("http://") && !url.startsWith("https://"))) {
      toast("Please enter a valid http:// or https:// URL", "error");
      return;
    }

    if (rotateSecret && !confirm("Rotating your secret will invalidate your current webhook secret immediately. Continue?")) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/developer/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          events: selectedEvents,
          active,
          rotateSecret,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast(json.error ?? "Failed to save webhook", "error");
        return;
      }

      if (json.newSecret) {
        setNewSecretAlert(json.newSecret);
      }

      toast("Webhook configuration saved", "success");
      load();
    } catch {
      toast("Error saving webhook configuration", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/developer/webhooks/test", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        toast(json.error ?? "Test delivery failed", "error");
        return;
      }

      if (json.success) {
        toast("Test webhook delivered successfully!", "success");
      } else {
        toast(`Test delivery returned HTTP ${json.delivery?.statusCode || "error"}: ${json.delivery?.error || "failed"}`, "error");
      }
      load();
    } catch {
      toast("Error sending test webhook", "error");
    } finally {
      setTesting(false);
    }
  };

  const handleRetry = async (deliveryId: string) => {
    setRetryingId(deliveryId);
    try {
      const res = await fetch("/api/developer/webhooks/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryId }),
      });
      const json = await res.json();
      if (json.success) {
        toast("Webhook delivery succeeded on retry!", "success");
      } else {
        toast(`Retry failed: ${json.delivery?.error || "HTTP error"}`, "error");
      }
      load();
    } catch {
      toast("Failed to retry webhook", "error");
    } finally {
      setRetryingId(null);
    }
  };

  const toggleEvent = (eventId: string) => {
    if (selectedEvents.includes(eventId)) {
      setSelectedEvents(selectedEvents.filter((e) => e !== eventId));
    } else {
      setSelectedEvents([...selectedEvents, eventId]);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-8 w-8 text-[#1D4ED8] dark:text-[#3B82F6]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Secret notice banner if just generated */}
      {newSecretAlert && (
        <div className="rounded-xl border border-[#1D4ED8]/30 dark:border-[#3B82F6]/30 bg-[#1D4ED8]/10 dark:bg-[#3B82F6]/10 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#1D4ED8] dark:text-[#3B82F6]" />
                <p className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8] dark:text-[#3B82F6]">
                  New Signing Secret Generated
                </p>
              </div>
              <p className="mt-1 text-xs text-[#5A606B] dark:text-[#949AA6]">
                Verify inbound dispatches with the <code className="font-mono text-[#1D4ED8] dark:text-[#3B82F6]">X-CommonTech-Signature</code> HMAC SHA-256 header:
              </p>
              <div className="mt-3 flex items-center gap-3">
                <code className="rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#0C0D10] px-4 py-2.5 font-mono text-xs font-bold text-[#1D4ED8] dark:text-[#3B82F6] select-all">
                  {newSecretAlert}
                </code>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setNewSecretAlert(null)}
              className="border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#0C0D10] text-xs font-semibold text-[#111318] dark:text-[#F4F4F6]"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Configuration Card */}
      <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E2DC] dark:border-[#262A34] pb-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-[#1D4ED8]/25 dark:border-[#3B82F6]/30 bg-[#1D4ED8]/10 dark:bg-[#3B82F6]/10 p-2.5 text-[#1D4ED8] dark:text-[#3B82F6]">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-[#111318] dark:text-[#F4F4F6]">Webhook Telemetry Relay</h2>
              <p className="text-xs text-[#5A606B] dark:text-[#949AA6]">
                Receive real-time signed HTTP POST payloads whenever order state mutations occur.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {webhook?.url && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={testing}
                className="gap-1.5 border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] text-xs font-semibold text-[#111318] dark:text-[#F4F4F6] hover:border-[#1D4ED8]/40 dark:hover:border-[#3B82F6]/40 hover:text-[#1D4ED8] dark:hover:text-[#3B82F6]"
              >
                {testing ? <Spinner className="h-3.5 w-3.5 text-[#1D4ED8] dark:text-[#3B82F6]" /> : <Play className="h-3.5 w-3.5 text-[#1D4ED8] dark:text-[#3B82F6]" />}
                Ping Test Payload
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="bg-[#1D4ED8] dark:bg-[#3B82F6] text-xs font-semibold text-white hover:bg-[#1E40AF] dark:hover:bg-[#2563EB]"
            >
              {saving ? <Spinner className="h-4 w-4" /> : "Deploy Configuration"}
            </Button>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#111318] dark:text-[#F4F4F6] flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
                Target Endpoint URL
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-[#111318] dark:text-[#F4F4F6] cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] text-[#1D4ED8] dark:text-[#3B82F6] focus:ring-0 focus:ring-offset-0"
                />
                <span className={active ? "text-[#15803D] dark:text-[#22C55E]" : "text-[#5A606B] dark:text-[#949AA6]"}>
                  {active ? "RELAY ACTIVE" : "RELAY PAUSED"}
                </span>
              </label>
            </div>
            <input
              type="url"
              placeholder="https://yourdomain.com/api/webhooks/telecom"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] px-4 py-3 font-mono text-xs text-[#111318] dark:text-[#F4F4F6] placeholder:text-[#5A606B]/60 dark:placeholder:text-[#949AA6]/60 focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] focus:outline-none"
            />
          </div>

          {/* Subscribed events */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">
              Subscribed Event Triggers
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ALL_EVENTS.map((ev) => {
                const checked = selectedEvents.includes(ev.id);
                return (
                  <label
                    key={ev.id}
                    onClick={() => toggleEvent(ev.id)}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                      checked
                        ? "border-[#1D4ED8]/50 dark:border-[#3B82F6]/50 bg-[#1D4ED8]/10 dark:bg-[#3B82F6]/10"
                        : "border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] hover:border-[#1D4ED8]/30 dark:hover:border-[#3B82F6]/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="mt-0.5 rounded border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] text-[#1D4ED8] dark:text-[#3B82F6] focus:ring-0"
                    />
                    <div>
                      <p className="font-mono text-xs font-bold text-[#111318] dark:text-[#F4F4F6]">{ev.label}</p>
                      <p className="mt-1 text-[11px] text-[#5A606B] dark:text-[#949AA6] leading-relaxed">{ev.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Secret & Rotation */}
          {webhook && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-2.5 text-[#1D4ED8] dark:text-[#3B82F6]">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#111318] dark:text-[#F4F4F6]">Payload Signature Secret</p>
                  <p className="mt-1 font-mono text-xs font-semibold text-[#1D4ED8] dark:text-[#3B82F6]">
                    {webhook.secretMasked || "whsec_••••••••••••••••••••••••"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave(true)}
                disabled={saving}
                className="border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] text-xs font-semibold text-[#111318] dark:text-[#F4F4F6] hover:border-[#DC2626]/50 hover:text-[#DC2626] dark:hover:text-[#EF4444]"
              >
                Rotate Secret
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#E5E2DC] dark:border-[#262A34] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] p-2 text-[#1D4ED8] dark:text-[#3B82F6]">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-[#111318] dark:text-[#F4F4F6]">Recent Webhook Dispatch Log</h3>
              <p className="text-xs text-[#5A606B] dark:text-[#949AA6]">Live ledger of outgoing HTTP notification dispatches and carrier handshakes.</p>
            </div>
          </div>
        </div>

        {!webhook?.deliveries || webhook.deliveries.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#5A606B] dark:text-[#949AA6]">
            No webhook dispatches logged yet. Trigger a test dispatch above to verify your endpoint.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] text-[11px] font-bold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">
                  <th className="px-5 py-3.5">Trigger Event</th>
                  <th className="px-5 py-3.5">Delivery Status</th>
                  <th className="px-5 py-3.5">HTTP Response</th>
                  <th className="px-5 py-3.5">Latency</th>
                  <th className="px-5 py-3.5">Retry Attempt</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2DC] dark:divide-[#262A34] font-mono">
                {webhook.deliveries.map((d: any) => (
                  <tr key={d.id} className="hover:bg-[#F3F1EC]/60 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-[#111318] dark:text-[#F4F4F6]">{d.event}</span>
                      {d.orderId && (
                        <span className="ml-2 rounded bg-[#FAF9F6] dark:bg-[#0C0D10] px-2 py-0.5 text-[10px] text-[#1D4ED8] dark:text-[#3B82F6] border border-[#E5E2DC] dark:border-[#262A34]">
                          {d.orderId}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[10px] font-bold ${
                          d.status === "SUCCESS"
                            ? "border border-[#15803D]/30 dark:border-[#22C55E]/30 bg-[#15803D]/10 dark:bg-[#22C55E]/10 text-[#15803D] dark:text-[#22C55E]"
                            : "border border-[#DC2626]/30 dark:border-[#EF4444]/30 bg-[#DC2626]/10 dark:bg-[#EF4444]/10 text-[#DC2626] dark:text-[#EF4444]"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${d.status === "SUCCESS" ? "bg-[#15803D] dark:bg-[#22C55E]" : "bg-[#DC2626] dark:bg-[#EF4444]"}`} />
                        {d.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#111318] dark:text-[#F4F4F6]">
                      {d.statusCode ? (
                        <span className={d.statusCode >= 200 && d.statusCode < 300 ? "text-[#15803D] dark:text-[#22C55E]" : "text-[#D97706] dark:text-[#F59E0B]"}>
                          HTTP {d.statusCode}
                        </span>
                      ) : (
                        <span className="text-[#5A606B] dark:text-[#949AA6]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[#5A606B] dark:text-[#949AA6]">
                      {d.responseTimeMs ? `${d.responseTimeMs}ms` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-[#5A606B] dark:text-[#949AA6]">
                      {d.attempt} / {d.maxAttempts}
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-[#5A606B] dark:text-[#949AA6] font-sans">
                      {formatDateTime(d.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {d.status !== "SUCCESS" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetry(d.id)}
                          disabled={retryingId === d.id}
                          className="h-7 border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-2.5 text-[11px] font-semibold text-[#111318] dark:text-[#F4F4F6] hover:border-[#1D4ED8]/40 dark:hover:border-[#3B82F6]/40 hover:text-[#1D4ED8] dark:hover:text-[#3B82F6] gap-1"
                        >
                          {retryingId === d.id ? <Spinner className="h-3 w-3 text-[#1D4ED8] dark:text-[#3B82F6]" /> : <RefreshCw className="h-3 w-3" />}
                          Re-dispatch
                        </Button>
                      )}
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

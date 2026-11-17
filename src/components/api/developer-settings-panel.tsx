"use client";

import * as React from "react";
import { Settings, Shield, Sliders, Lock, Key, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";

interface DeveloperSettingsProps {
  application: any | null;
  onNavigateTab: (tab: string) => void;
}

export function DeveloperSettingsPanel({ application, onNavigateTab }: DeveloperSettingsProps) {
  const isApproved = application?.status === "APPROVED";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-6">
        <div className="flex items-center gap-3 border-b border-[#E5E2DC] dark:border-[#262A34] pb-4">
          <div className="rounded-lg bg-[#1D4ED8]/10 dark:bg-[#3B82F6]/10 border border-[#1D4ED8]/25 dark:border-[#3B82F6]/30 p-2.5 text-[#1D4ED8] dark:text-[#3B82F6]">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#111318] dark:text-[#F4F4F6] tracking-tight">Developer API Settings &amp; Gateway Quotas</h3>
            <p className="text-xs text-[#5A606B] dark:text-[#949AA6]">
              Overview of authorized telecom scopes, production rate limits, and environment policies.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] p-4.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">Access Status</span>
              <StatusBadge status={application?.status || "NOT_APPLIED"} />
            </div>
            <p className="mt-2 text-xs text-[#5A606B] dark:text-[#949AA6]">
              {isApproved
                ? "Your account is authorized to issue live production requests to carrier gateways."
                : "Submit or await review of your developer access application."}
            </p>
          </div>

          <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] p-4.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">Rate Limit</span>
              <span className="font-mono text-xs font-bold text-[#1D4ED8] dark:text-[#3B82F6]">
                {application?.rateLimitPerMin || 60} req/min
              </span>
            </div>
            <p className="mt-2 text-xs text-[#5A606B] dark:text-[#949AA6]">
              Applies across active API keys. Requests exceeding this threshold receive HTTP 429.
            </p>
          </div>

          <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] p-4.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">Daily Order Quota</span>
              <span className="font-mono text-xs font-bold text-[#D97706] dark:text-[#F59E0B]">
                {(application?.dailyRequestLimit || 5000).toLocaleString()} req/day
              </span>
            </div>
            <p className="mt-2 text-xs text-[#5A606B] dark:text-[#949AA6]">
              Standard daily throughput cap. Contact administration to request custom wholesale limits.
            </p>
          </div>
        </div>

        {/* Granted Scopes */}
        <div className="mt-6 rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] p-5">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111318] dark:text-[#F4F4F6]">
              Assigned Security Scopes
            </h4>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(application?.allowedScopes || "networks:read,packages:read,orders:create,orders:read,orders:status,balance:read,webhooks:read,webhooks:manage,numbers:verify")
              .split(",")
              .map((s: string) => (
                <span
                  key={s.trim()}
                  className="rounded-md bg-white dark:bg-[#14161B] border border-[#E5E2DC] dark:border-[#262A34] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#111318] dark:text-[#F4F4F6]"
                >
                  {s.trim()}
                </span>
              ))}
          </div>
        </div>

        {/* IP Restrictions */}
        <div className="mt-4 rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] p-5">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#D97706] dark:text-[#F59E0B]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111318] dark:text-[#F4F4F6]">
              Server IP Whitelist
            </h4>
          </div>
          <p className="mt-2 text-xs text-[#5A606B] dark:text-[#949AA6] font-mono">
            {application?.ipRestrictions
              ? `Restricted to originating IP addresses: ${application.ipRestrictions}`
              : "No IP restrictions currently enforced. Any server bearing your secret key can submit requests."}
          </p>
        </div>

        {/* Quick links */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#E5E2DC] dark:border-[#262A34] pt-5">
          <button
            onClick={() => onNavigateTab("credentials")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-3.5 py-2 text-xs font-semibold text-[#111318] dark:text-[#F4F4F6] hover:border-[#1D4ED8]/40 dark:hover:border-[#3B82F6]/40 hover:text-[#1D4ED8] dark:hover:text-[#3B82F6]"
          >
            <Key className="h-3.5 w-3.5 text-[#1D4ED8] dark:text-[#3B82F6]" /> Manage API Keys
          </button>
          <button
            onClick={() => onNavigateTab("webhooks")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-3.5 py-2 text-xs font-semibold text-[#111318] dark:text-[#F4F4F6] hover:border-[#1D4ED8]/40 dark:hover:border-[#3B82F6]/40 hover:text-[#1D4ED8] dark:hover:text-[#3B82F6]"
          >
            Configure Webhook URL
          </button>
          <button
            onClick={() => onNavigateTab("docs")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-3.5 py-2 text-xs font-semibold text-[#111318] dark:text-[#F4F4F6] hover:border-[#1D4ED8]/40 dark:hover:border-[#3B82F6]/40 hover:text-[#1D4ED8] dark:hover:text-[#3B82F6]"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[#1D4ED8] dark:text-[#3B82F6]" /> Read Documentation
          </button>
        </div>
      </div>
    </div>
  );
}

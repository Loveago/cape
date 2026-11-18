"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Wallet,
  CreditCard,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { useToast } from "@/components/toast";
import { formatGHS } from "@/lib/types";

interface AfaRegistrationItem {
  id: string;
  fullName: string;
  phone: string;
  ghanaCard: string;
  location: string;
  feePesewas: number;
  status: string;
  adminNote: string | null;
  createdAt: string;
}

export default function DashboardAfaPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [feeGHS, setFeeGHS] = useState<number>(11);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [registrations, setRegistrations] = useState<AfaRegistrationItem[]>([]);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [ghanaCard, setGhanaCard] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await fetch("/api/afa", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setEnabled(Boolean(data.enabled));
        setFeeGHS(typeof data.feeGHS === "number" ? data.feeGHS : 11);
        setWalletBalance(typeof data.walletBalance === "number" ? data.walletBalance : 0);
        setRegistrations(Array.isArray(data.registrations) ? data.registrations : []);
      }
    } catch {
      toast("Failed to load AFA registration details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!enabled) {
      setErrorMsg("AFA Registration is currently disabled by administrator.");
      return;
    }

    if (walletBalance < feeGHS) {
      setErrorMsg(
        `Insufficient wallet balance. Requires ${formatGHS(feeGHS)}, available ${formatGHS(walletBalance)}.`
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/afa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim().replace(/\D/g, "").slice(0, 10),
          ghanaCard: ghanaCard.trim().toUpperCase(),
          location: location.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to submit AFA registration.");
        return;
      }

      toast("AFA registration submitted!", "success");
      setSuccessMsg(`Registration submitted for ${fullName.trim()} (${phone.trim()}).`);
      setFullName("");
      setPhone("");
      setGhanaCard("");
      setLocation("");
      loadData();
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const insufficientBalance = walletBalance < feeGHS;

  return (
    <div className="space-y-6">
      <div className="max-w-xl mx-auto rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] overflow-hidden">
        {/* Header */}
        <div className="bg-[#1D4ED8] dark:bg-[#1E3A8A] px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <h1 className="text-lg font-bold tracking-tight">AFA Registration</h1>
          </div>
          <p className="mt-1 text-xs text-white/85">
            Submit customer details and pay the registration fee from your wallet.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#1D4ED8] dark:text-[#3B82F6]" />
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Wallet Balance & Registration Fee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] p-3.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">
                  <Wallet className="h-3.5 w-3.5 text-[#1D4ED8] dark:text-[#3B82F6]" />
                  <span>Wallet Balance</span>
                </div>
                <p className="mt-1 text-lg font-bold font-mono tabular-nums text-[#111318] dark:text-[#F4F4F6]">
                  {formatGHS(walletBalance)}
                </p>
              </div>

              <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] p-3.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">
                  <CreditCard className="h-3.5 w-3.5 text-[#D97706] dark:text-[#F59E0B]" />
                  <span>Registration Fee</span>
                </div>
                <p className="mt-1 text-lg font-bold font-mono tabular-nums text-[#111318] dark:text-[#F4F4F6]">
                  {formatGHS(feeGHS)}
                </p>
              </div>
            </div>

            {!enabled && (
              <div className="flex items-center gap-2.5 rounded-lg border border-[#D97706]/30 bg-[#D97706]/10 px-3.5 py-2.5 text-xs text-[#92400E] dark:text-[#FBBF24]">
                <Clock className="h-4 w-4 shrink-0" />
                <span>AFA Registration is currently disabled by administrator.</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2.5 rounded-lg border border-[#15803D]/30 bg-[#15803D]/10 px-3.5 py-2.5 text-xs text-[#15803D] dark:text-[#22C55E]">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2.5 rounded-lg border border-[#DC2626]/30 bg-[#DC2626]/10 px-3.5 py-2.5 text-xs text-[#DC2626] dark:text-[#EF4444]">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter customer full name"
                  className="w-full h-11 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-3 text-sm text-[#111318] dark:text-[#F4F4F6] focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">
                  Phone
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0241234567"
                  className="w-full h-11 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-3 text-sm font-mono text-[#111318] dark:text-[#F4F4F6] focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">
                  Ghana Card (GHA-#########-&#35;)
                </label>
                <input
                  type="text"
                  required
                  value={ghanaCard}
                  onChange={(e) => setGhanaCard(e.target.value.toUpperCase())}
                  placeholder="GHA-123456789-0"
                  className="w-full h-11 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-3 text-sm font-mono text-[#111318] dark:text-[#F4F4F6] focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City / Town / Region"
                  className="w-full h-11 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-3 text-sm text-[#111318] dark:text-[#F4F4F6] focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] focus:outline-none"
                />
              </div>

              {insufficientBalance ? (
                <Link
                  href="/dashboard/billing"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-xs font-semibold text-white transition-colors"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Top Up Wallet (Requires {formatGHS(feeGHS)})</span>
                </Link>
              ) : (
                <button
                  type="submit"
                  disabled={submitting || !enabled}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-xs font-semibold text-white transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Pay {formatGHS(feeGHS)} &amp; Register</span>
                  )}
                </button>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Submitted History */}
      {registrations.length > 0 && (
        <div className="max-w-4xl mx-auto rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E5E2DC] dark:border-[#262A34]">
            <h2 className="text-sm font-bold text-[#111318] dark:text-[#F4F4F6]">
              Your AFA Registrations
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] text-[10px] uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">
                <tr>
                  <th className="px-4 py-2.5">Full Name</th>
                  <th className="px-4 py-2.5">Phone</th>
                  <th className="px-4 py-2.5">Ghana Card</th>
                  <th className="px-4 py-2.5">Location</th>
                  <th className="px-4 py-2.5">Fee</th>
                  <th className="px-4 py-2.5">Status</th>
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
                    <td className="px-4 py-2.5 text-[#5A606B] dark:text-[#949AA6]">{r.location}</td>
                    <td className="px-4 py-2.5 font-mono">{formatGHS(r.feePesewas / 100)}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

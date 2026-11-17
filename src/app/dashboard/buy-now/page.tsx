"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Phone,
  CheckCircle2,
  AlertCircle,
  WifiOff,
  CreditCard,
  Loader2,
  ArrowRight,
  ShieldCheck,
  X,
  Wallet,
} from "lucide-react";
import { useToast } from "@/components/toast";
import { formatGHS } from "@/lib/types";

type Network = "MTN" | "TELECEL" | "AIRTELTIGO";

interface DataPackage {
  id: string;
  network: string;
  name: string;
  gbAmount: number;
  description: string | null;
  price: number | null;
  retailPriceGHS: number | null;
}

const NETWORK_TABS: Array<{ id: Network; label: string; dot: string; arrowPill: string }> = [
  {
    id: "MTN",
    label: "MTN",
    dot: "bg-[#FFCB05]",
    arrowPill: "bg-[#FFCB05] text-[#111318]",
  },
  {
    id: "TELECEL",
    label: "Telecel",
    dot: "bg-[#E4002B]",
    arrowPill: "bg-[#E4002B] text-white",
  },
  {
    id: "AIRTELTIGO",
    label: "AirtelTigo",
    dot: "bg-[#0284C7]",
    arrowPill: "bg-[#0284C7] text-white",
  },
];

function getCarrierMeta(network: string) {
  return (
    NETWORK_TABS.find((n) => n.id === network) ?? {
      id: "MTN" as Network,
      label: network,
      dot: "bg-[#1D4ED8]",
      arrowPill: "bg-[#1D4ED8] text-white",
    }
  );
}

function detectCarrier(phone: string): Network | null {
  const clean = phone.trim().replace(/\D/g, "");
  if (clean.length < 3) return null;
  let prefix = clean;
  if (prefix.startsWith("233")) prefix = "0" + prefix.slice(3);
  const sub = prefix.slice(0, 3);
  if (["024", "054", "055", "059", "053", "025"].includes(sub)) return "MTN";
  if (["020", "050"].includes(sub)) return "TELECEL";
  if (["027", "057", "026", "056"].includes(sub)) return "AIRTELTIGO";
  return null;
}

export default function BuyNowPage() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<DataPackage[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionEnabled, setSubmissionEnabled] = useState(true);

  const [selectedNetwork, setSelectedNetwork] = useState<Network>("MTN");
  const [sizeFilter, setSizeFilter] = useState<"ALL" | "MICRO" | "STANDARD" | "HEAVY">("ALL");

  // Modal state
  const [modalPkg, setModalPkg] = useState<DataPackage | null>(null);
  const [phone, setPhone] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [lastSuccess, setLastSuccess] = useState<{
    phone: string;
    gbAmount: number;
    network: string;
    price: number;
  } | null>(null);

  const loadPackages = async () => {
    try {
      const res = await fetch("/api/packages", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const pkgs: DataPackage[] = data.packages || [];
        setPackages(pkgs);
        setBalance(typeof data.userBalance === "number" ? data.userBalance : 0);
        if (data.submissionEnabled === false) setSubmissionEnabled(false);
      }
    } catch {
      toast("Failed to load bundle catalog", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const filteredPackages = useMemo(() => {
    return packages
      .filter((p) => p.network === selectedNetwork)
      .filter((p) => {
        if (sizeFilter === "MICRO") return p.gbAmount <= 2;
        if (sizeFilter === "STANDARD") return p.gbAmount > 2 && p.gbAmount <= 10;
        if (sizeFilter === "HEAVY") return p.gbAmount > 10;
        return true;
      })
      .sort((a, b) => a.gbAmount - b.gbAmount);
  }, [packages, selectedNetwork, sizeFilter]);

  const detectedCarrier = useMemo(() => detectCarrier(phone), [phone]);

  const handleOpenModal = (pkg: DataPackage) => {
    setModalPkg(pkg);
    setModalError(null);
    setLastSuccess(null);
  };

  const handleCloseModal = () => {
    if (submitting) return;
    setModalPkg(null);
    setModalError(null);
  };

  const handleBuyNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalPkg) return;
    setModalError(null);

    const cleanPhone = phone.trim().replace(/\D/g, "").slice(0, 10);
    if (!cleanPhone || cleanPhone.length !== 10 || !cleanPhone.startsWith("0")) {
      setModalError("Enter a valid 10-digit Ghanaian phone number (e.g. 0241234567).");
      return;
    }

    const cost = modalPkg.price ?? modalPkg.retailPriceGHS ?? 0;
    if (balance < cost) {
      setModalError(
        `Insufficient wallet balance. Requires ${formatGHS(cost)}, available ${formatGHS(balance)}.`
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orders: [
            {
              phoneNumber: cleanPhone,
              network: modalPkg.network,
              gbAmount: modalPkg.gbAmount,
              packageId: modalPkg.id,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || "Order dispatch failed.");
        return;
      }

      toast(`Order placed for ${cleanPhone}!`, "success");
      setLastSuccess({
        phone: cleanPhone,
        gbAmount: modalPkg.gbAmount,
        network: modalPkg.network,
        price: cost,
      });
      setPhone("");
      setModalPkg(null);
      loadPackages();
    } catch {
      setModalError("Network connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const modalPrice = modalPkg ? modalPkg.price ?? modalPkg.retailPriceGHS ?? 0 : 0;
  const insufficientBalance = modalPkg ? balance < modalPrice : false;
  const remainingAfter = Math.max(0, balance - modalPrice);
  const modalMeta = modalPkg ? getCarrierMeta(modalPkg.network) : getCarrierMeta(selectedNetwork);

  return (
    <div className="space-y-5">
      {/* ── CLEAN HEADER BAR ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-4 sm:p-5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#111318] dark:text-[#F4F4F6]">
            Buy Data Bundle
          </h1>
          <p className="mt-0.5 text-xs text-[#5A606B] dark:text-[#949AA6]">
            Tap any package below to enter a recipient number and dispatch instantly from your wallet.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center gap-2.5 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-3.5 py-2">
            <Wallet className="h-4 w-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">
                Wallet Balance
              </p>
              <p className="text-sm font-bold font-mono tabular-nums text-[#111318] dark:text-[#F4F4F6]">
                {formatGHS(balance)}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/billing"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] px-3.5 text-xs font-semibold text-white transition-colors"
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Top Up</span>
          </Link>
        </div>
      </div>

      {/* Submission Disabled Banner */}
      {!submissionEnabled && (
        <div className="flex items-center gap-3 rounded-xl border border-[#DC2626]/30 bg-[#DC2626]/10 px-4 py-3 text-xs font-medium text-[#DC2626] dark:text-[#EF4444]">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>Order placement is currently paused by administrator. Please check back shortly.</span>
        </div>
      )}

      {/* Last Successful Order Banner */}
      {lastSuccess && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#15803D]/30 bg-[#15803D]/10 px-4 py-3 text-xs text-[#15803D] dark:border-[#22C55E]/30 dark:text-[#22C55E]">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>
              Dispatched <strong>{lastSuccess.gbAmount} GB</strong> ({lastSuccess.network}) to{" "}
              <strong className="font-mono">{lastSuccess.phone}</strong> for{" "}
              <strong className="font-mono">{formatGHS(lastSuccess.price)}</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setLastSuccess(null)}
            className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── NETWORK TABS & SIZE FILTERS ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Carrier Tabs */}
        <div className="inline-flex flex-wrap items-center gap-2">
          {NETWORK_TABS.map((net) => {
            const active = selectedNetwork === net.id;
            const count = packages.filter((p) => p.network === net.id).length;
            return (
              <button
                key={net.id}
                type="button"
                onClick={() => setSelectedNetwork(net.id)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? "border-[#1D4ED8] bg-[#1D4ED8] text-white dark:border-[#3B82F6] dark:bg-[#3B82F6]"
                    : "border-[#E5E2DC] bg-white text-[#111318] hover:bg-[#F3F1EC] dark:border-[#262A34] dark:bg-[#14161B] dark:text-[#F4F4F6] dark:hover:bg-[#1C1F26]"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${net.dot}`} />
                <span>{net.label}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-[#F3F1EC] text-[#5A606B] dark:bg-[#1C1F26] dark:text-[#949AA6]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Size Filter Pills */}
        <div className="inline-flex items-center gap-1 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-1 self-start sm:self-auto">
          {(
            [
              { id: "ALL", label: "All" },
              { id: "MICRO", label: "1–2 GB" },
              { id: "STANDARD", label: "3–10 GB" },
              { id: "HEAVY", label: "12+ GB" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSizeFilter(f.id)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                sizeFilter === f.id
                  ? "bg-[#111318] text-white dark:bg-[#F4F4F6] dark:text-[#111318]"
                  : "text-[#5A606B] hover:text-[#111318] dark:text-[#949AA6] dark:hover:text-[#F4F4F6]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── FULL-CLICK COMPACT BUNDLE TILES (STOREFRONT FLOW) ──────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[#1D4ED8] dark:text-[#3B82F6]" />
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-10 text-center text-xs text-[#5A606B] dark:text-[#949AA6]">
          No packages available for this selection. Try another network or size filter.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredPackages.map((pkg) => {
            const meta = getCarrierMeta(pkg.network);
            const price = pkg.price ?? pkg.retailPriceGHS ?? 0;

            return (
              <button
                key={pkg.id}
                type="button"
                disabled={!submissionEnabled}
                onClick={() => handleOpenModal(pkg)}
                className="group flex flex-col justify-between rounded-xl bg-white dark:bg-[#14161B] border border-[#E5E2DC] dark:border-[#262A34] p-3.5 text-left transition-all hover:border-[#1D4ED8]/50 dark:hover:border-[#3B82F6]/60 hover:bg-[#FAF9F6] dark:hover:bg-[#1C1F26] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {/* Top Row: Validity + Status Dot */}
                <div className="flex items-center justify-between gap-2 w-full">
                  <span className="text-[11px] font-medium text-[#5A606B] dark:text-[#949AA6] truncate">
                    {pkg.description || "Non-Expiry"}
                  </span>
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#15803D] dark:bg-[#22C55E]" />
                </div>

                {/* Center: Bold Centered GB Size */}
                <div className="my-4 text-center">
                  <span className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-[#111318] dark:text-[#F4F4F6]">
                    {pkg.gbAmount}
                  </span>
                  <span className="ml-0.5 text-xs sm:text-sm font-bold text-[#111318] dark:text-[#F4F4F6]">
                    GB
                  </span>
                </div>

                {/* Bottom Row: Price + Circular Arrow CTA */}
                <div className="flex items-center justify-between gap-2 w-full pt-2.5 border-t border-[#E5E2DC]/80 dark:border-[#262A34]">
                  <span className="text-sm sm:text-base font-bold font-mono tabular-nums text-[#111318] dark:text-[#F4F4F6]">
                    ₵{price.toFixed(2)}
                  </span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5 ${meta.arrowPill}`}
                  >
                    <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── CHECKOUT POP-UP MODAL ──────────────────────────────────────────── */}
      {modalPkg && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4"
          onClick={handleCloseModal}
        >
          <div
            className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E2DC] dark:border-[#262A34]">
              <div className="flex items-center gap-2.5">
                <span className={`h-2.5 w-2.5 rounded-full ${modalMeta.dot}`} />
                <div>
                  <h2 className="text-sm font-bold text-[#111318] dark:text-[#F4F4F6]">
                    {modalMeta.label} · {modalPkg.gbAmount} GB
                  </h2>
                  <p className="text-[11px] text-[#5A606B] dark:text-[#949AA6]">
                    {modalPkg.description || "Non-Expiry"} · Instant Wallet Dispatch
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg p-1.5 text-[#5A606B] hover:bg-[#F3F1EC] dark:text-[#949AA6] dark:hover:bg-[#1C1F26]"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleBuyNow} className="p-5 space-y-4">
              {/* Recipient Phone */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#111318] dark:text-[#F4F4F6]">
                    Recipient Phone Number
                  </label>
                  {detectedCarrier && (
                    <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-[#F3F1EC] text-[#111318] dark:bg-[#1C1F26] dark:text-[#F4F4F6]">
                      Detected: {detectedCarrier}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A606B] dark:text-[#949AA6]" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoFocus
                    placeholder="0241234567"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (modalError) setModalError(null);
                    }}
                    className="w-full h-11 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] pl-9 pr-3 text-sm font-mono text-[#111318] dark:text-[#F4F4F6] placeholder:text-[#5A606B]/50 dark:placeholder:text-[#949AA6]/50 focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>
                {detectedCarrier && detectedCarrier !== modalPkg.network && (
                  <p className="text-[11px] text-[#D97706] dark:text-[#F59E0B]">
                    Prefix looks like {detectedCarrier}, but you selected {modalMeta.label} (ok if ported).
                  </p>
                )}
              </div>

              {/* Wallet Breakdown */}
              <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#5A606B] dark:text-[#949AA6]">Bundle Price</span>
                  <span className="font-bold font-mono tabular-nums text-[#111318] dark:text-[#F4F4F6]">
                    {formatGHS(modalPrice)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5A606B] dark:text-[#949AA6]">Wallet Balance</span>
                  <span className="font-mono tabular-nums text-[#111318] dark:text-[#F4F4F6]">
                    {formatGHS(balance)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#E5E2DC] dark:border-[#262A34] flex items-center justify-between">
                  <span className="font-semibold text-[#111318] dark:text-[#F4F4F6]">
                    Balance After Order
                  </span>
                  <span
                    className={`font-bold font-mono tabular-nums ${
                      insufficientBalance
                        ? "text-[#DC2626] dark:text-[#EF4444]"
                        : "text-[#15803D] dark:text-[#22C55E]"
                    }`}
                  >
                    {insufficientBalance ? "Insufficient" : formatGHS(remainingAfter)}
                  </span>
                </div>
              </div>

              {/* Inline Error */}
              {modalError && (
                <div className="flex items-start gap-2 rounded-lg border border-[#DC2626]/30 bg-[#DC2626]/10 px-3 py-2.5 text-xs text-[#DC2626] dark:text-[#EF4444]">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Actions */}
              {insufficientBalance ? (
                <Link
                  href="/dashboard/billing"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-xs font-semibold text-white transition-colors"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Top Up Wallet to Continue</span>
                </Link>
              ) : (
                <button
                  type="submit"
                  disabled={submitting || !submissionEnabled}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-xs font-semibold text-white transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Dispatching Bundle...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Pay {formatGHS(modalPrice)} &amp; Dispatch</span>
                    </>
                  )}
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

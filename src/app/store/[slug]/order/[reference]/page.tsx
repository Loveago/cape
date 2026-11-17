import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Search,
  Zap,
  Smartphone,
  ShieldCheck,
  Radio,
  ExternalLink,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { fromPesewas } from "@/lib/storefront";
import { buildWhatsAppLink } from "@/lib/storefront-utils";
import { NETWORK_BRANDS, storeHref } from "@/components/store/brands";
import { NetworkLogo } from "@/components/store/network-logo";
import type { NetworkProvider } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_CONFIG: Record<
  string,
  {
    icon: React.ElementType;
    iconCls: string;
    cardCls: string;
    badgeCls: string;
    label: string;
    message: string;
    step: number;
  }
> = {
  PENDING: {
    icon: Clock,
    iconCls: "text-[#D97706] dark:text-[#F59E0B]",
    cardCls: "bg-amber-50/70 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/25 text-amber-950 dark:text-amber-200",
    badgeCls: "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
    label: "Order Queued",
    message: "Payment received. Your order is queued on the telecom switch for SIM crediting.",
    step: 1,
  },
  PROCESSING: {
    icon: Clock,
    iconCls: "text-[#1D4ED8] dark:text-[#60A5FA]",
    cardCls: "bg-blue-50/70 dark:bg-[#3B82F6]/10 border-blue-200 dark:border-[#3B82F6]/25 text-blue-950 dark:text-blue-200",
    badgeCls: "bg-blue-100 dark:bg-[#3B82F6]/20 text-[#1D4ED8] dark:text-[#60A5FA] border-blue-200 dark:border-[#3B82F6]/30",
    label: "Dispatching to SIM",
    message: "Packet is actively routing through the telecom USSD pipeline. Crediting takes ~1-3 mins.",
    step: 2,
  },
  COMPLETED: {
    icon: CheckCircle2,
    iconCls: "text-emerald-700 dark:text-emerald-400",
    cardCls: "bg-emerald-50/70 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/25 text-emerald-950 dark:text-emerald-200",
    badgeCls: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30",
    label: "Delivered to SIM",
    message: "Your non-expiry data package has been credited to your SIM line. Enjoy!",
    step: 3,
  },
  SUCCESS: {
    icon: CheckCircle2,
    iconCls: "text-emerald-700 dark:text-emerald-400",
    cardCls: "bg-emerald-50/70 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/25 text-emerald-950 dark:text-emerald-200",
    badgeCls: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30",
    label: "Delivered to SIM",
    message: "Your non-expiry data package has been credited to your SIM line. Enjoy!",
    step: 3,
  },
  FAILED: {
    icon: XCircle,
    iconCls: "text-rose-600 dark:text-rose-400",
    cardCls: "bg-rose-50/70 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/25 text-rose-950 dark:text-rose-200",
    badgeCls: "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/30",
    label: "Delivery Failed",
    message: "Delivery could not complete automatically. Please contact the store with your reference number.",
    step: 2,
  },
  CANCELLED: {
    icon: XCircle,
    iconCls: "text-[#5A606B] dark:text-[#949AA6]",
    cardCls: "bg-[#F3F1EC] dark:bg-[#1C1F26] border-[#E5E2DC] dark:border-[#262A34] text-[#111318] dark:text-[#F4F4F6]",
    badgeCls: "bg-white dark:bg-[#14161B] text-[#5A606B] dark:text-[#949AA6] border-[#E5E2DC] dark:border-[#262A34]",
    label: "Order Cancelled",
    message: "This order was cancelled. Please contact the store if you have questions.",
    step: 1,
  },
  REFUNDED: {
    icon: AlertCircle,
    iconCls: "text-purple-600 dark:text-purple-400",
    cardCls: "bg-purple-50/70 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/25 text-purple-950 dark:text-purple-200",
    badgeCls: "bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-500/30",
    label: "Refunded",
    message: "This order has been refunded. Please contact the store if you have questions.",
    step: 1,
  },
};

export default async function OrderReferencePage({
  params,
}: {
  params: Promise<{ slug: string; reference: string }>;
}) {
  const { slug, reference } = await params;

  let order = await prisma.storefrontOrder.findFirst({
    where: {
      paymentReference: reference,
      storefront: { slug },
    },
    include: {
      product: { include: { dataPackage: true } },
      storefront: true,
      underlyingOrder: true,
    },
  });

  if (!order && /^\d+$/.test(reference)) {
    order = await prisma.storefrontOrder.findFirst({
      where: {
        seq: parseInt(reference, 10),
        storefront: { slug },
      },
      include: {
        product: { include: { dataPackage: true } },
        storefront: true,
        underlyingOrder: true,
      },
    });
  }

  if (!order) notFound();

  // Active status sync
  if (order.status === "PENDING" && order.paymentReference) {
    try {
      const { verifyAndSettleStorefrontOrder } = await import("@/lib/storefront");
      const updated = await verifyAndSettleStorefrontOrder(order.paymentReference);
      if (updated?.settled) {
        order.status = "PROCESSING";
      }
    } catch (err) {
      console.error("Storefront order verify error:", err);
    }
  }

  if (order.underlyingOrder && (order.underlyingOrder.status === "PENDING" || order.underlyingOrder.status === "PROCESSING")) {
    try {
      const { syncTskconnectOrder } = await import("@/lib/provider-apis/router");
      const syncRes = await syncTskconnectOrder(order.underlyingOrder, "Storefront Order Page Sync");
      if (syncRes.changed && syncRes.newStatus) {
        order.underlyingOrder.status = syncRes.newStatus;
      }
    } catch (syncErr) {
      console.error("Storefront order sync error:", syncErr);
    }
  }

  let effectiveStatus = order.status;
  if (order.underlyingOrder) {
    effectiveStatus = order.underlyingOrder.status === "SUCCESS" ? "COMPLETED" : order.underlyingOrder.status;
  }

  const cfg = STATUS_CONFIG[effectiveStatus] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = cfg.icon;
  const network = order.product.dataPackage.network as NetworkProvider;
  const brand = NETWORK_BRANDS[network] || NETWORK_BRANDS.MTN;
  const gbAmount = order.product.dataPackage.gbAmount;
  const amountGhs = fromPesewas(order.sellingPrice);
  const paystackFee = Math.round(amountGhs * 0.02 * 100) / 100;
  const totalPaid = Math.round((amountGhs + paystackFee) * 100) / 100;

  const isDelivered = effectiveStatus === "COMPLETED" || effectiveStatus === "SUCCESS";
  const isFailed = effectiveStatus === "FAILED" || effectiveStatus === "CANCELLED";

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      {/* Back link */}
      <div className="mb-6 flex items-center justify-between font-mono text-xs">
        <Link
          href={storeHref(slug)}
          className="inline-flex items-center gap-1.5 font-semibold text-[#5A606B] dark:text-[#949AA6] hover:text-[#1D4ED8] dark:hover:text-[#3B82F6] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#1D4ED8] dark:text-[#3B82F6]" />
          Back to {order.storefront.name}
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-[#1D4ED8]/25 dark:border-[#3B82F6]/30 bg-[#1D4ED8]/10 dark:bg-[#3B82F6]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#1D4ED8] dark:text-[#60A5FA]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Telecom Switch Active
        </span>
      </div>

      {/* Main Elevated Receipt Container */}
      <div className="relative overflow-hidden rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] shadow-sm">
        {/* Hero Status Banner */}
        <div className={`border-b border-[#E5E2DC] dark:border-[#262A34] p-6 sm:p-8 ${cfg.cardCls}`}>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#14161B] border border-[#E5E2DC] dark:border-[#262A34]">
              <StatusIcon className={`h-6 w-6 ${cfg.iconCls}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cfg.badgeCls}`}>
                  {cfg.label}
                </span>
              </div>
              <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed opacity-90">
                {cfg.message}
              </p>
            </div>
          </div>

          {/* Visual 3-Stage Progress Timeline */}
          <div className="mt-6 pt-5 border-t border-current/15">
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold font-mono">
              {/* Step 1: Payment */}
              <div className="flex flex-col items-center gap-1.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
                <span className="text-[#111318] dark:text-[#F4F4F6]">1. MoMo Cleared</span>
              </div>

              {/* Step 2: Gateway */}
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    isDelivered
                      ? "bg-emerald-600 text-white"
                      : isFailed
                      ? "bg-rose-600 text-white"
                      : "bg-[#1D4ED8] dark:bg-[#3B82F6] text-white animate-pulse"
                  }`}
                >
                  <Radio className="h-3 w-3" />
                </span>
                <span className="text-[#111318] dark:text-[#F4F4F6]">2. USSD Routing</span>
              </div>

              {/* Step 3: Credited */}
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    isDelivered
                      ? "bg-emerald-600 text-white"
                      : "bg-white dark:bg-[#14161B] border border-[#E5E2DC] dark:border-[#262A34] text-[#5A606B] dark:text-[#949AA6]"
                  }`}
                >
                  <Smartphone className="h-3 w-3" />
                </span>
                <span className="text-[#111318] dark:text-[#F4F4F6]">3. SIM Credited</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5E2DC] dark:border-[#262A34] pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6] font-mono">
                Dispatched Package
              </span>
              <div className="mt-1 flex items-center gap-2.5">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center p-1.5 border border-[#E5E2DC] dark:border-[#262A34] ${brand.tile}`}>
                  <NetworkLogo network={network} className="h-full w-full object-contain" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-[#111318] dark:text-[#F4F4F6]">
                    {gbAmount} GB {brand.label}
                  </h2>
                  <span className="text-[11px] font-mono text-[#1D4ED8] dark:text-[#60A5FA]">
                    Non-Expiry Telecom Data
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6] font-mono">
                Amount Paid
              </span>
              <p className="mt-0.5 text-2xl font-bold font-mono tabular-nums text-[#111318] dark:text-[#F4F4F6]">
                ₵{totalPaid.toFixed(2)}
              </p>
              <span className="text-[10px] text-[#5A606B] dark:text-[#949AA6] font-mono block">incl. 2% MoMo fee</span>
            </div>
          </div>

          {/* Breakdown Rows */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-[#FAF9F6] dark:bg-[#0C0D10] p-3 border border-[#E5E2DC] dark:border-[#262A34]">
              <span className="font-semibold text-[#5A606B] dark:text-[#949AA6]">Recipient Phone Line</span>
              <span className="font-mono tabular-nums text-sm font-bold text-[#111318] dark:text-[#F4F4F6] tracking-wide">
                {order.customerPhone}
              </span>
            </div>

            {order.customerEmail && (
              <div className="flex items-center justify-between px-3">
                <span className="text-[#5A606B] dark:text-[#949AA6]">Receipt Email</span>
                <span className="font-mono text-[#111318] dark:text-[#F4F4F6]">{order.customerEmail}</span>
              </div>
            )}

            <div className="flex items-center justify-between px-3">
              <span className="text-[#5A606B] dark:text-[#949AA6]">Bundle Price</span>
              <span className="font-mono tabular-nums text-[#111318] dark:text-[#F4F4F6]">₵{amountGhs.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between px-3">
              <span className="text-[#5A606B] dark:text-[#949AA6]">Paystack MoMo Processing Fee</span>
              <span className="font-mono tabular-nums text-[#D97706] dark:text-[#F59E0B]">+₵{paystackFee.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-[#FAF9F6] dark:bg-[#0C0D10] p-3 border border-[#E5E2DC] dark:border-[#262A34]">
              <span className="font-semibold text-[#5A606B] dark:text-[#949AA6]">Payment Reference</span>
              <span className="font-mono text-[11px] font-bold text-[#111318] dark:text-[#F4F4F6] select-all">
                {reference}
              </span>
            </div>

            <div className="flex items-center justify-between px-3">
              <span className="text-[#5A606B] dark:text-[#949AA6]">Order Placed</span>
              <span className="font-mono text-[#5A606B] dark:text-[#949AA6]">
                {new Date(order.createdAt).toLocaleString("en-GH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
          </div>

          {/* Action Button Row */}
          <div className="flex flex-col gap-2.5 sm:flex-row pt-2">
            <Link
              href={storeHref(slug, "track")}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#F3F1EC] dark:bg-[#1C1F26] py-3 text-xs font-semibold text-[#111318] dark:text-[#F4F4F6] transition-colors hover:bg-[#E5E2DC]/60 dark:hover:bg-[#262A34] cursor-pointer"
            >
              <Search className="h-3.5 w-3.5 text-[#1D4ED8] dark:text-[#3B82F6]" />
              <span>Track SIM Status</span>
            </Link>
            <Link
              href={storeHref(slug)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] py-3 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Buy Another Bundle</span>
            </Link>
          </div>

          {/* WhatsApp Support Link if store has WhatsApp or phone */}
          {(() => {
            const waNumber = order.storefront.whatsapp || order.storefront.phone;
            const waLink = buildWhatsAppLink(
              waNumber,
              `Hello, I have a question about order ${reference} for ${order.customerPhone}`
            );
            if (!waLink) return null;
            return (
              <div className="text-center pt-1">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] dark:text-[#60A5FA] hover:underline"
                >
                  <span>Need help? Chat with {order.storefront.name} on WhatsApp</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

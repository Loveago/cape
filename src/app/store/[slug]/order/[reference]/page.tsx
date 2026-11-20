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
    <div className="mx-auto max-w-md px-4 py-6 sm:py-10 space-y-4">
      {/* Compact Status Banner */}
      <div className={`rounded-xl border px-4 py-3 flex items-start gap-2.5 text-xs ${cfg.cardCls}`}>
        <StatusIcon className={`h-4 w-4 shrink-0 mt-0.5 ${cfg.iconCls}`} />
        <div className="min-w-0">
          <span className="font-bold">{cfg.label}.</span>{" "}
          <span className="opacity-90">{cfg.message}</span>
        </div>
      </div>

      {/* Order Details Receipt Card */}
      <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-5 sm:p-6 space-y-5 shadow-xs">
        <h1 className="text-lg font-bold tracking-tight text-[#111318] dark:text-[#F4F4F6]">
          Order Details
        </h1>

        <div className="space-y-3 text-xs sm:text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#5A606B] dark:text-[#949AA6]">Store</span>
            <span className="font-semibold text-[#111318] dark:text-[#F4F4F6] text-right">
              {order.storefront.name}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-[#5A606B] dark:text-[#949AA6]">Network</span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                network === "MTN"
                  ? "bg-[#FFCB05]/20 text-[#92400E] dark:text-[#FBBF24] border border-[#FFCB05]/40"
                  : network === "TELECEL"
                  ? "bg-[#E4002B]/15 text-[#B91C1C] dark:text-[#F87171] border border-[#E4002B]/30"
                  : "bg-[#0284C7]/15 text-[#0369A1] dark:text-[#38BDF8] border border-[#0284C7]/30"
              }`}
            >
              {brand.label}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-[#5A606B] dark:text-[#949AA6]">Bundle</span>
            <span className="font-bold text-[#111318] dark:text-[#F4F4F6]">
              {gbAmount} GB
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-[#5A606B] dark:text-[#949AA6]">Recipient number</span>
            <span className="font-mono tabular-nums font-semibold text-[#111318] dark:text-[#F4F4F6]">
              {order.customerPhone}
            </span>
          </div>

          {order.customerEmail && !order.customerEmail.endsWith("@pycbundles.com") && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#5A606B] dark:text-[#949AA6] shrink-0">Receipt email</span>
              <span className="font-mono text-xs text-[#111318] dark:text-[#F4F4F6] truncate">
                {order.customerEmail}
              </span>
            </div>
          )}

          <div className="border-t border-[#E5E2DC] dark:border-[#262A34] pt-3 space-y-2.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#5A606B] dark:text-[#949AA6]">Bundle price</span>
              <span className="font-mono tabular-nums font-semibold text-[#111318] dark:text-[#F4F4F6]">
                ₵{amountGhs.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-[#5A606B] dark:text-[#949AA6]">Paystack fee (2%)</span>
              <span className="font-mono tabular-nums font-semibold text-[#D97706] dark:text-[#F59E0B]">
                +₵{paystackFee.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 font-bold text-[#111318] dark:text-[#F4F4F6]">
              <span>Total paid</span>
              <span className="font-mono tabular-nums text-base">
                ₵{totalPaid.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="border-t border-[#E5E2DC] dark:border-[#262A34] pt-3 space-y-2.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#5A606B] dark:text-[#949AA6]">Reference</span>
              <span className="font-mono text-xs font-semibold text-[#111318] dark:text-[#F4F4F6] select-all">
                {reference}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-[#5A606B] dark:text-[#949AA6]">Date</span>
              <span className="font-mono text-xs text-[#5A606B] dark:text-[#949AA6]">
                {new Date(order.createdAt).toLocaleString("en-GH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stacked Action Buttons */}
      <div className="space-y-2.5">
        <Link
          href={storeHref(slug, "track")}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] hover:bg-[#F3F1EC] dark:hover:bg-[#1C1F26] text-xs font-semibold text-[#111318] dark:text-[#F4F4F6] transition-colors"
        >
          <Search className="h-3.5 w-3.5 text-[#1D4ED8] dark:text-[#3B82F6]" />
          <span>Track Order</span>
        </Link>

        <Link
          href={storeHref(slug)}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-xs font-semibold text-white transition-colors"
        >
          <span>Buy Another Bundle</span>
        </Link>
      </div>

      {/* WhatsApp Support Link */}
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
  );
}

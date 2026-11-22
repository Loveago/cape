import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TrackForm } from "./track-form";
import { ArrowLeft, Clock, ShieldCheck, Zap, HelpCircle } from "lucide-react";
import { storeHref } from "@/components/store/brands";

export const dynamic = "force-dynamic";

export default async function TrackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const storefront = await prisma.storefront.findUnique({
    where: { slug },
    select: { name: true, status: true },
  });
  const enabled = storefront?.status === "ENABLED";

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16">
      {/* Breadcrumb Navigation */}
      <div className="py-4 text-xs font-mono">
        <Link
          href={storeHref(slug)}
          className="inline-flex items-center gap-1.5 font-semibold text-[#5A606B] dark:text-[#949AA6] hover:text-[#1D4ED8] dark:hover:text-[#3B82F6] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#1D4ED8] dark:text-[#3B82F6]" />
          Back to {storefront?.name || "Store"}
        </Link>
      </div>

      {/* Hero Tracking Terminal Header */}
      <div className="text-center pt-4 pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-md border border-[#1D4ED8]/25 dark:border-[#3B82F6]/30 bg-[#1D4ED8]/10 dark:bg-[#3B82F6]/10 px-3 py-1 text-xs font-semibold text-[#1D4ED8] dark:text-[#60A5FA]">
          <Clock className="h-3.5 w-3.5 text-[#1D4ED8] dark:text-[#3B82F6]" />
          Carrier Dispatch Verification Console
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111318] dark:text-[#F4F4F6]">
          Track Your Bundle Delivery
        </h1>
        <p className="mx-auto max-w-lg text-xs sm:text-sm text-[#5A606B] dark:text-[#949AA6]">
          Check real-time SIM crediting status using your recipient phone number, order ID, or Paystack payment reference.
        </p>
      </div>

      {/* Main Terminal Frame */}
      {enabled ? (
        <div className="relative overflow-hidden rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-6 sm:p-8 shadow-sm">
          <TrackForm slug={slug} />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-12 text-center text-sm text-[#5A606B] dark:text-[#949AA6]">
          This store is not accepting orders at this time.
        </div>
      )}

      {/* USSD Network Verification Guidelines */}
      <div className="mt-6 rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="h-4 w-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111318] dark:text-[#F4F4F6]">
            How to verify non-expiry data on your handset
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#F3F1EC] dark:bg-[#1C1F26] p-3.5">
            <span className="font-bold text-[#D97706] dark:text-[#F59E0B] block mb-1">MTN Ghana</span>
            <span className="text-[#5A606B] dark:text-[#949AA6]">Dial <code className="font-mono font-semibold text-[#111318] dark:text-[#F4F4F6] bg-white dark:bg-[#14161B] border border-[#E5E2DC] dark:border-[#262A34] px-1.5 py-0.5 rounded">*124#</code> to inspect bundle balance.</span>
          </div>
          <div className="rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#F3F1EC] dark:bg-[#1C1F26] p-3.5">
            <span className="font-bold text-rose-600 dark:text-rose-400 block mb-1">Telecel Ghana</span>
            <span className="text-[#5A606B] dark:text-[#949AA6]">Dial <code className="font-mono font-semibold text-[#111318] dark:text-[#F4F4F6] bg-white dark:bg-[#14161B] border border-[#E5E2DC] dark:border-[#262A34] px-1.5 py-0.5 rounded">*126#</code> or check the Telecel Play app.</span>
          </div>
          <div className="rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#F3F1EC] dark:bg-[#1C1F26] p-3.5">
            <span className="font-bold text-[#1D4ED8] dark:text-[#60A5FA] block mb-1">AT Ghana</span>
            <span className="text-[#5A606B] dark:text-[#949AA6]">Dial <code className="font-mono font-semibold text-[#111318] dark:text-[#F4F4F6] bg-white dark:bg-[#14161B] border border-[#E5E2DC] dark:border-[#262A34] px-1.5 py-0.5 rounded">*504#</code> to inspect bundle balance.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

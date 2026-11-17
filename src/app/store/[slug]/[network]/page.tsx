import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fromPesewas, syncStorefrontProducts } from "@/lib/storefront";
import { getOrderAvailabilityStatus } from "@/lib/orders";
import { NetworkLogo } from "@/components/store/network-logo";
import { NETWORK_BRANDS, NETWORK_ORDER, ghs, networkBySlug, networkHref, storeHref } from "@/components/store/brands";
import { NetworkBuyForm } from "./buy-form";
import { Zap, ShieldCheck, CheckCircle2, ArrowLeft, Radio, Activity, Signal } from "lucide-react";
import type { NetworkProvider } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NetworkPage({
  params,
}: {
  params: Promise<{ slug: string; network: string }>;
}) {
  const { slug, network: networkSlug } = await params;
  const network = networkBySlug(networkSlug);
  if (!network) notFound();

  const [storefront, featureSetting, availability] = await Promise.all([
    prisma.storefront.findUnique({ where: { slug } }),
    prisma.systemSetting.findUnique({ where: { key: "storefront_feature_enabled" } }),
    getOrderAvailabilityStatus(),
  ]);
  if (!storefront || storefront.status !== "ENABLED") notFound();
  if (!availability.available) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#111318] dark:text-[#F4F4F6]">
            {availability.reason === "scheduled_offline" ? "Scheduled Off-Hours (GMT+0)" : "Ordering Temporarily Paused"}
          </h2>
          <p className="mt-2 text-xs text-[#5A606B] dark:text-[#949AA6]">
            {availability.message}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href={storeHref(slug)}
              className="inline-flex h-10 items-center rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] px-5 text-xs font-semibold text-white transition-colors"
            >
              Back to store
            </Link>
            <Link
              href={storeHref(slug, "track")}
              className="inline-flex h-10 items-center rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#F3F1EC] dark:bg-[#1C1F26] px-5 text-xs font-semibold text-[#111318] dark:text-[#F4F4F6] transition-colors hover:bg-[#E5E2DC]/60 dark:hover:bg-[#262A34]"
            >
              Track order
            </Link>
          </div>
        </div>
      </div>
    );
  }
  if (featureSetting?.value === "false") {
    return (
      <div className="mx-auto mt-20 max-w-md p-8 text-center bg-white dark:bg-[#14161B] rounded-xl border border-[#E5E2DC] dark:border-[#262A34] shadow-sm">
        <h2 className="text-xl font-bold text-[#111318] dark:text-[#F4F4F6]">Storefronts Temporarily Paused</h2>
        <p className="mt-2 text-xs text-[#5A606B] dark:text-[#949AA6]">
          Reseller storefront orders are currently paused by administration for scheduled maintenance. Please check back soon.
        </p>
      </div>
    );
  }

  if (!storefront.isActive) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[#111318] dark:text-[#F4F4F6]">Store Temporarily Paused</h2>
          <p className="mt-2 text-xs text-[#5A606B] dark:text-[#949AA6]">
            {storefront.name} is not accepting new orders at this time.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href={storeHref(slug)}
              className="inline-flex h-10 items-center rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] px-5 text-xs font-semibold text-white transition-colors"
            >
              Back to store
            </Link>
            <Link
              href={storeHref(slug, "track")}
              className="inline-flex h-10 items-center rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#F3F1EC] dark:bg-[#1C1F26] px-5 text-xs font-semibold text-[#111318] dark:text-[#F4F4F6] transition-colors hover:bg-[#E5E2DC]/60 dark:hover:bg-[#262A34]"
            >
              Track order
            </Link>
          </div>
        </div>
      </div>
    );
  }

  await syncStorefrontProducts(storefront.id);

  const allActiveProducts = await prisma.storefrontProduct.findMany({
    where: { storefrontId: storefront.id, isActive: true, dataPackage: { active: true } },
    include: { dataPackage: true },
  });

  const availableNetworks = NETWORK_ORDER.filter((n) =>
    allActiveProducts.some((p) => p.dataPackage.network === n)
  );

  const products = allActiveProducts.filter((p) => p.dataPackage.network === network);
  if (products.length === 0) notFound();

  products.sort(
    (a, b) => a.dataPackage.gbAmount - b.dataPackage.gbAmount || a.sellingPrice - b.sellingPrice
  );
  const prices = products.map((p) => fromPesewas(p.sellingPrice));
  const brand = NETWORK_BRANDS[network];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      {/* Navigation Breadcrumb & Carrier Quick Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-4 text-xs">
        <nav className="flex items-center gap-2 text-[#5A606B] dark:text-[#949AA6] font-mono">
          <Link
            href={storeHref(slug)}
            className="flex items-center gap-1.5 font-semibold hover:text-[#1D4ED8] dark:hover:text-[#3B82F6] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#1D4ED8] dark:text-[#3B82F6]" />
            <span>{storefront.name}</span>
          </Link>
          <span>/</span>
          <span className="font-bold text-[#111318] dark:text-[#F4F4F6]">{brand.label} Bundles</span>
        </nav>

        {/* Carrier Quick Switcher Tabs */}
        {availableNetworks.length > 1 && (
          <div className="flex items-center gap-1 bg-white dark:bg-[#14161B] p-1 rounded-lg border border-[#E5E2DC] dark:border-[#262A34]">
            {availableNetworks.map((net) => {
              const b = NETWORK_BRANDS[net];
              const isCurrent = net === network;
              return (
                <Link
                  key={net}
                  href={networkHref(slug, net)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    isCurrent
                      ? "bg-[#1D4ED8] text-white dark:bg-[#3B82F6]"
                      : "text-[#5A606B] dark:text-[#949AA6] hover:text-[#111318] dark:hover:text-[#F4F4F6] hover:bg-[#F3F1EC] dark:hover:bg-[#1C1F26]"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${b.tile}`} />
                  <span>{b.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Carrier Showcase Banner */}
      <div className="relative overflow-hidden rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl flex items-center justify-center p-3 border border-[#E5E2DC] dark:border-[#262A34] ${brand.tile}`}>
              <NetworkLogo network={network} className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  USSD Switch Active
                </span>
                <span className="text-xs font-mono text-[#5A606B] dark:text-[#949AA6]">
                  {products.length} packages online
                </span>
              </div>
              <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-[#111318] dark:text-[#F4F4F6]">
                {brand.label} Non-Expiry Bundles
              </h1>
              <p className="mt-1 text-xs text-[#5A606B] dark:text-[#949AA6]">
                Direct SIM crediting across Ghana with automated Mobile Money confirmation.
              </p>
            </div>
          </div>

          {/* Pricing Highlight Pill */}
          <div className="sm:text-right shrink-0 bg-[#FAF9F6] dark:bg-[#0C0D10] p-4 rounded-xl border border-[#E5E2DC] dark:border-[#262A34]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6] block font-mono">
              Package Range
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#111318] dark:text-[#F4F4F6]">
              {ghs(Math.min(...prices))} <span className="text-sm font-normal text-[#5A606B] dark:text-[#949AA6]">–</span> {ghs(Math.max(...prices))}
            </div>
            <span className="text-[11px] font-mono text-[#1D4ED8] dark:text-[#60A5FA] flex items-center gap-1 sm:justify-end mt-0.5">
              <Zap className="h-3 w-3" /> Sub-2s Delivery
            </span>
          </div>
        </div>
      </div>

      {/* Main Packages & Buy Form */}
      <div className="mt-6">
        <NetworkBuyForm
          slug={slug}
          network={network}
          storeName={storefront.name}
          products={products.map((p) => ({
            packageId: p.packageId,
            gbAmount: p.dataPackage.gbAmount,
            name: p.dataPackage.name,
            price: fromPesewas(p.sellingPrice),
          }))}
        />
      </div>
    </div>
  );
}

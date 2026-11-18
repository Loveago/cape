import { requireUser } from "@/lib/auth";
import { requireActiveStorefront, fromPesewas } from "@/lib/storefront";
import { getAfaSettings } from "@/lib/afa";
import { StorefrontSettingsForm } from "./settings-form";
import { StoreStatusToggle } from "@/components/storefront/store-status-toggle";
import { cleanDomain } from "@/lib/storefront-utils";
import { Settings, ShieldCheck } from "lucide-react";

export default async function StorefrontSettingsPage() {
  const user = await requireUser();
  const [storefront, afaSettings] = await Promise.all([
    requireActiveStorefront(user.id),
    getAfaSettings(),
  ]);
  const storefrontDomain = cleanDomain(process.env.NEXT_PUBLIC_STOREFRONT_DOMAIN, "localhost:3000");

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-[#162740] bg-white dark:bg-[#0b1322] p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-600/25 dark:border-blue-500/30 bg-blue-600/10 dark:bg-blue-500/15 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                Store Identity &amp; Settlement
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">· MoMo Direct Routing</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Storefront Settings &amp; Configuration
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Configure your public storefront web slug, support channels, marquee announcement text, and default Mobile Money payout settlement coordinates.
            </p>
          </div>
        </div>
      </div>

      <StoreStatusToggle
        initialActive={storefront.isActive}
        storeStatus={storefront.status}
        variant="card"
      />

      <StorefrontSettingsForm
        storefrontDomain={storefrontDomain}
        initial={{
          slug: storefront.slug,
          name: storefront.name,
          description: storefront.description ?? "",
          whatsapp: storefront.whatsapp ?? "",
          phone: storefront.phone ?? "",
          whatsappGroupLink: storefront.whatsappGroupLink ?? "",
          location: storefront.location ?? "",
          contactText: storefront.contactText ?? "",
          whatsappLabel: storefront.whatsappLabel ?? "",
          notice: storefront.notice ?? "",
          reviewsEnabled: storefront.reviewsEnabled ?? true,
          logoUrl: storefront.logoUrl ?? "",
          afaEnabled: storefront.afaEnabled ?? false,
          afaPriceGHS: storefront.afaPricePesewas
            ? String(fromPesewas(storefront.afaPricePesewas).toFixed(2))
            : String(afaSettings.feeGHS.toFixed(2)),
          payoutNetwork: storefront.payoutNetwork ?? "MTN",
          payoutNumber: storefront.payoutNumber ?? "",
          payoutAccountName: storefront.payoutAccountName ?? "",
        }}
        afaBaseFeeGHS={afaSettings.feeGHS}
        globalAfaEnabled={afaSettings.enabled}
      />
    </div>
  );
}

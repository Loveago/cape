import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Search, ShieldCheck, Store, Zap, Radio } from "lucide-react";

export const metadata: Metadata = {
  title: "Storefront Directory | pycbundles",
  description:
    "Look up a verified pycbundles merchant storefront to purchase instant MTN, Telecel, and AirtelTigo data bundles.",
  icons: {
    icon: [
      { url: "/store/icon.svg", type: "image/svg+xml" },
      { url: "/store/favicon.ico", sizes: "any" },
      { url: "/store/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/store/apple-icon.svg", type: "image/svg+xml" },
      { url: "/store/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default async function StorefrontIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const params = await searchParams;
  const rawSlug = typeof params.slug === "string" ? params.slug.trim().toLowerCase() : "";
  const cleanSlug = rawSlug.replace(/[^a-z0-9-]/g, "");

  if (cleanSlug) {
    redirect(`/store/${cleanSlug}`);
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] dark:bg-[#0C0D10] text-[#111318] dark:text-[#F4F4F6] flex flex-col justify-between px-4 py-8 sm:px-6 selection:bg-[#1D4ED8] selection:text-white">
      {/* Top Bar */}
      <header className="mx-auto w-full max-w-2xl flex items-center justify-between pb-6 border-b border-[#E5E2DC] dark:border-[#262A34]">
        <Link href="/store" className="inline-flex items-center gap-2.5 group">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D4ED8] text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
              <path d="M12 3L4 19h16L12 3z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
              <circle cx="12" cy="14" r="2.2" fill="#F59E0B" />
            </svg>
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-[#111318] dark:text-[#F4F4F6]">
              pycbundles
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">
              Storefront Directory
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] px-3 py-1.5 text-xs font-semibold text-[#111318] dark:text-[#F4F4F6] hover:bg-[#F3F1EC] dark:hover:bg-[#1C1F26] transition-colors"
          >
            Merchant Login
          </Link>
        </div>
      </header>

      {/* Main Directory Lookup Card */}
      <div className="mx-auto w-full max-w-2xl py-10 sm:py-14 space-y-8">
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] px-2.5 py-1 text-[11px] font-semibold text-[#1D4ED8] dark:text-[#3B82F6]">
            <Store className="h-3.5 w-3.5" />
            <span>Merchant Portal Lookup</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111318] dark:text-[#F4F4F6]">
            Find a pycbundles Storefront
          </h1>
          <p className="text-sm text-[#5A606B] dark:text-[#949AA6] max-w-lg leading-relaxed">
            Enter a merchant&apos;s store handle below to browse non-expiry MTN, Telecel, and AirtelTigo data bundles or track an existing order.
          </p>
        </div>

        {/* Lookup Form */}
        <section className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-5 sm:p-6 space-y-4">
          <form method="GET" action="/store" className="space-y-3">
            <label
              htmlFor="store-slug-input"
              className="block text-xs font-semibold text-[#111318] dark:text-[#F4F4F6]"
            >
              Storefront Handle / Slug
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex flex-1 items-center rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] focus-within:border-[#1D4ED8] dark:focus-within:border-[#3B82F6] transition-colors">
                <span className="pl-3 pr-1.5 text-xs font-mono text-[#5A606B] dark:text-[#949AA6] select-none shrink-0">
                  /store/
                </span>
                <input
                  id="store-slug-input"
                  name="slug"
                  type="text"
                  required
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="merchant-name"
                  className="w-full bg-transparent py-2.5 pr-3 text-sm font-mono text-[#111318] dark:text-[#F4F4F6] placeholder:text-[#5A606B]/60 dark:placeholder:text-[#949AA6]/50 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer shrink-0"
              >
                <Search className="h-4 w-4" />
                <span>Visit Storefront</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[11px] text-[#5A606B] dark:text-[#949AA6]">
              Use lowercase letters, numbers, and hyphens (for example: <span className="font-mono text-[#111318] dark:text-[#F4F4F6]">accra-data</span>).
            </p>
          </form>
        </section>

        {/* Platform Highlights */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-4 space-y-1.5">
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#1D4ED8]/10 text-[#1D4ED8] dark:bg-[#3B82F6]/15 dark:text-[#3B82F6]">
              <Zap className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-bold text-[#111318] dark:text-[#F4F4F6]">
              Automated Dispatch
            </h2>
            <p className="text-xs text-[#5A606B] dark:text-[#949AA6] leading-relaxed">
              Direct SIM crediting across MTN, Telecel, and AirtelTigo networks.
            </p>
          </div>

          <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-4 space-y-1.5">
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#D97706]/10 text-[#D97706] dark:bg-[#F59E0B]/15 dark:text-[#F59E0B]">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-bold text-[#111318] dark:text-[#F4F4F6]">
              Verified Mobile Money
            </h2>
            <p className="text-xs text-[#5A606B] dark:text-[#949AA6] leading-relaxed">
              Instant Paystack MoMo clearing with 256-bit encrypted checkout.
            </p>
          </div>

          <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-4 space-y-1.5">
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#15803D]/10 text-[#15803D] dark:bg-[#22C55E]/15 dark:text-[#22C55E]">
              <Radio className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-bold text-[#111318] dark:text-[#F4F4F6]">
              Live Order Telemetry
            </h2>
            <p className="text-xs text-[#5A606B] dark:text-[#949AA6] leading-relaxed">
              Track every bundle delivery in real time by phone or reference ID.
            </p>
          </div>
        </section>

        {/* Merchant CTA */}
        <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-[#F3F1EC] dark:bg-[#1C1F26] px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <p className="text-xs font-bold text-[#111318] dark:text-[#F4F4F6]">
              Want to launch your own data storefront?
            </p>
            <p className="text-[11px] text-[#5A606B] dark:text-[#949AA6]">
              Create a pycbundles merchant account and start selling in minutes.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] px-3.5 py-2 text-xs font-semibold text-[#1D4ED8] dark:text-[#3B82F6] hover:bg-[#FAF9F6] dark:hover:bg-[#14161B]/80 transition-colors shrink-0"
          >
            <span>Open a Storefront</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-2xl pt-6 border-t border-[#E5E2DC] dark:border-[#262A34] text-xs text-[#5A606B] dark:text-[#949AA6]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <span className="font-medium">
            pycbundles Storefronts © {new Date().getFullYear()}
          </span>
          <div className="flex items-center gap-3">
            <Link href="/terms" className="hover:text-[#111318] dark:hover:text-[#F4F4F6] transition-colors">
              Terms
            </Link>
            <span>·</span>
            <Link href="/refund-policy" className="hover:text-[#111318] dark:hover:text-[#F4F4F6] transition-colors">
              Refunds
            </Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-[#111318] dark:hover:text-[#F4F4F6] transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ShieldCheck, Activity, Zap, Lock } from "lucide-react";

const CARRIER_HEALTH = [
  {
    name: "MTN Ghana",
    code: "MTN",
    status: "Operational",
    uptime: "99.9%",
    accentClass: "bg-amber-500",
  },
  {
    name: "Telecel",
    code: "TLC",
    status: "Operational",
    uptime: "99.8%",
    accentClass: "bg-red-600",
  },
  {
    name: "AT Ghana",
    code: "AT",
    status: "Operational",
    uptime: "99.7%",
    accentClass: "bg-blue-700 dark:bg-blue-500",
  },
];

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0C0D10] text-[#111318] dark:text-[#F4F4F6] flex flex-col selection:bg-blue-700 selection:text-white">
      {/* Main 50/50 Architectural Split */}
      <div className="flex-1 grid lg:grid-cols-2">
        {/* Left Panel: Architectural Grid + CapeCoast Value Prop + Carrier Dispatch Health */}
        <div className="relative hidden lg:flex flex-col justify-between border-r border-[#E5E2DC] dark:border-[#262A34] bg-[#F3F1EC]/60 dark:bg-[#14161B]/60 p-10 xl:p-14 overflow-hidden">
          {/* Crisp geometric hairline grid */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.45] dark:opacity-[0.25]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(148, 154, 166, 0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 154, 166, 0.18) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Top Brand */}
          <div className="relative z-10 flex items-center justify-between">
            <BrandLogo size="md" href="/store" showTagline={true} />
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] px-2.5 py-1 text-[11px] font-medium text-[#5A606B] dark:text-[#949AA6]">
              <span className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-500" />
              Gateway Online
            </span>
          </div>

          {/* Center Value Proposition & Carrier Health Card */}
          <div className="relative z-10 my-auto max-w-lg space-y-8 py-8">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-400">
                Telecom &amp; Reseller Infrastructure
              </p>
              <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-[#111318] dark:text-[#F4F4F6] leading-[1.15]">
                Precision data dispatch for modern resellers.
              </h1>
              <p className="text-sm text-[#5A606B] dark:text-[#949AA6] leading-relaxed">
                Route non-expiry data bundles directly across Ghana&apos;s major carriers with automated MoMo reconciliation, sub-account controls, and branded storefronts.
              </p>
            </div>

            {/* Carrier Dispatch Health Card */}
            <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E5E2DC] dark:border-[#262A34] pb-3.5">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                  <span className="text-xs font-semibold text-[#111318] dark:text-[#F4F4F6]">
                    Carrier Dispatch Health
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 px-2 py-0.5 text-[11px] font-medium text-green-700 dark:text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400" />
                  All Systems Nominal
                </span>
              </div>

              <div className="divide-y divide-[#E5E2DC] dark:divide-[#262A34]">
                {CARRIER_HEALTH.map((carrier) => (
                  <div
                    key={carrier.code}
                    className="flex items-center justify-between py-3 first:pt-3.5 last:pb-0.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${carrier.accentClass}`} />
                      <span className="text-xs font-medium text-[#111318] dark:text-[#F4F4F6]">
                        {carrier.name}
                      </span>
                      <span className="rounded-md bg-[#F3F1EC] dark:bg-[#1C1F26] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#5A606B] dark:text-[#949AA6]">
                        {carrier.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-[#5A606B] dark:text-[#949AA6]">
                        {carrier.status}
                      </span>
                      <span className="font-mono tabular-nums text-xs font-semibold text-[#111318] dark:text-[#F4F4F6]">
                        {carrier.uptime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtle Key Capabilities */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="flex items-start gap-2.5">
                <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-[#111318] dark:text-[#F4F4F6]">
                    Automated Fulfillment
                  </p>
                  <p className="text-[11px] text-[#5A606B] dark:text-[#949AA6] mt-0.5">
                    Instant USSD &amp; API switch routing.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Lock className="h-4 w-4 text-blue-700 dark:text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-[#111318] dark:text-[#F4F4F6]">
                    Verified Settlements
                  </p>
                  <p className="text-[11px] text-[#5A606B] dark:text-[#949AA6] mt-0.5">
                    Paystack &amp; MoMo wallet ledgering.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Left Panel Bottom Note */}
          <div className="relative z-10 flex items-center justify-between text-xs text-[#5A606B] dark:text-[#949AA6]">
            <span>CapeCoast Reseller Platform</span>
            <span className="font-mono tabular-nums">GHS · Direct Switch</span>
          </div>
        </div>

        {/* Right Panel: Centered max-w-[400px] Form Card */}
        <div className="flex flex-col justify-between p-5 sm:p-8 lg:p-12">
          {/* Mobile Brand Header */}
          <div className="flex items-center justify-between lg:hidden mb-6">
            <BrandLogo size="sm" href="/store" showTagline={true} />
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] px-2 py-1 text-[10px] font-medium text-[#5A606B] dark:text-[#949AA6]">
              <span className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-500" />
              Live
            </span>
          </div>

          {/* Centered Form Card */}
          <div className="my-auto mx-auto w-full max-w-[400px]">
            <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-6 sm:p-7 shadow-xs">
              <div className="mb-6">
                <h2 className="text-xl font-bold tracking-tight text-[#111318] dark:text-[#F4F4F6]">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-1 text-xs text-[#5A606B] dark:text-[#949AA6]">
                    {subtitle}
                  </p>
                )}
              </div>

              {children}
            </div>
          </div>

          {/* Footer Bar */}
          <footer className="mt-8 pt-4 border-t border-[#E5E2DC] dark:border-[#262A34] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#5A606B] dark:text-[#949AA6]">
            <a
              href="https://wa.me/233507904981"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1D4ED8] dark:hover:text-[#3B82F6] transition-colors"
            >
              Powered by <span className="font-semibold text-[#111318] dark:text-[#F4F4F6]">Crazy Tech Enterprise</span>
            </a>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/terms" className="hover:text-[#111318] dark:hover:text-[#F4F4F6] transition-colors">
                Terms
              </Link>
              <Link href="/refund-policy" className="hover:text-[#111318] dark:hover:text-[#F4F4F6] transition-colors">
                Refunds
              </Link>
              <Link href="/privacy" className="hover:text-[#111318] dark:hover:text-[#F4F4F6] transition-colors">
                Privacy
              </Link>
              <Link href="/store" className="hover:text-[#111318] dark:hover:text-[#F4F4F6] transition-colors">
                Storefront Directory
              </Link>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                Paystack Secured
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export function AuthFooterLink({
  href,
  prompt,
  cta,
}: {
  href: string;
  prompt: string;
  cta: string;
}) {
  return (
    <p className="mt-6 border-t border-[#E5E2DC] dark:border-[#262A34] pt-4 text-center text-xs text-[#5A606B] dark:text-[#949AA6]">
      {prompt}{" "}
      <Link
        href={href}
        className="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline-offset-4 hover:underline transition-colors"
      >
        {cta}
      </Link>
    </p>
  );
}

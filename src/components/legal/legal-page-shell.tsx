"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import {
  FileText,
  ShieldCheck,
  RotateCcw,
  Printer,
  ChevronRight,
  Mail,
  Phone,
  Clock,
  ArrowRight,
  ArrowLeft,
  Store,
} from "lucide-react";

interface LegalPageShellProps {
  currentSlug: "terms" | "refund-policy" | "privacy";
  title: string;
  badge: string;
  lastUpdated: string;
  description: string;
  children: React.ReactNode;
}

const LEGAL_TABS = [
  {
    slug: "terms" as const,
    href: "/terms",
    label: "Terms of Service",
    icon: FileText,
  },
  {
    slug: "refund-policy" as const,
    href: "/refund-policy",
    label: "Refund Policy",
    icon: RotateCcw,
  },
  {
    slug: "privacy" as const,
    href: "/privacy",
    label: "Privacy Policy",
    icon: ShieldCheck,
  },
];

function OriginStorefrontHeader() {
  const searchParams = useSearchParams();
  const fromSlug = searchParams?.get("from");
  const storeName = searchParams?.get("name");

  if (!fromSlug) {
    return (
      <Link
        href="/store"
        className="rounded-lg border border-[#E5E2DC] bg-white px-3 py-1.5 text-xs font-semibold text-[#111318] hover:bg-[#F3F1EC] dark:border-[#262A34] dark:bg-[#14161B] dark:text-[#F4F4F6] dark:hover:bg-[#1C1F26] transition-colors"
      >
        Storefront Directory
      </Link>
    );
  }

  const returnUrl = `/${fromSlug}`;

  return (
    <Link
      href={returnUrl}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[#1D4ED8]/30 bg-[#1D4ED8]/10 px-3.5 py-1.5 text-xs font-semibold text-[#1D4ED8] hover:bg-[#1D4ED8]/15 dark:text-[#3B82F6] dark:border-[#3B82F6]/30 dark:bg-[#3B82F6]/10 transition-colors"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      <span>Back to {storeName || fromSlug}</span>
    </Link>
  );
}

function OriginStorefrontBanner() {
  const searchParams = useSearchParams();
  const fromSlug = searchParams?.get("from");
  const storeName = searchParams?.get("name");

  if (!fromSlug) return null;
  const returnUrl = `/${fromSlug}`;

  return (
    <div className="border-b border-[#1D4ED8]/20 bg-[#1D4ED8]/5 px-4 py-2.5 text-xs text-[#111318] dark:border-[#3B82F6]/20 dark:bg-[#3B82F6]/10 dark:text-[#F4F4F6]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-[#1D4ED8] dark:text-[#3B82F6] shrink-0" />
          <span>
            Viewing customer terms &amp; conditions for <strong>{storeName || fromSlug}</strong> storefront.
          </span>
        </div>
        <Link
          href={returnUrl}
          className="inline-flex items-center gap-1 font-semibold text-[#1D4ED8] hover:underline dark:text-[#3B82F6] shrink-0"
        >
          <span>Return to Storefront</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function OriginStorefrontTabs({ currentSlug }: { currentSlug: "terms" | "refund-policy" | "privacy" }) {
  const searchParams = useSearchParams();
  const fromSlug = searchParams?.get("from");
  const storeName = searchParams?.get("name");

  const querySuffix = fromSlug
    ? `?from=${encodeURIComponent(fromSlug)}${storeName ? `&name=${encodeURIComponent(storeName)}` : ""}`
    : "";

  return (
    <div className="border-t border-[#E5E2DC] bg-[#F3F1EC]/70 dark:border-[#262A34] dark:bg-[#0C0D10]/70">
      <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8 no-scrollbar">
        {LEGAL_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentSlug === tab.slug;
          return (
            <Link
              key={tab.slug}
              href={`${tab.href}${querySuffix}`}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-[#1D4ED8]/10 text-[#1D4ED8] ring-1 ring-[#1D4ED8]/25 dark:bg-[#3B82F6]/15 dark:text-[#3B82F6] dark:ring-[#3B82F6]/30"
                  : "text-[#5A606B] hover:bg-[#E5E2DC]/60 hover:text-[#111318] dark:text-[#949AA6] dark:hover:bg-[#1C1F26] dark:hover:text-[#F4F4F6]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function OriginStorefrontCtaCard() {
  const searchParams = useSearchParams();
  const fromSlug = searchParams?.get("from");
  const storeName = searchParams?.get("name");

  if (!fromSlug) return null;
  const returnUrl = `/${fromSlug}`;

  return (
    <div className="mt-8 rounded-xl border border-[#1D4ED8]/25 bg-white p-6 sm:p-8 text-center space-y-3 dark:border-[#3B82F6]/25 dark:bg-[#14161B]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#1D4ED8]/10 text-[#1D4ED8] dark:bg-[#3B82F6]/15 dark:text-[#3B82F6] border border-[#1D4ED8]/20 dark:border-[#3B82F6]/25">
        <Store className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-[#111318] dark:text-[#F4F4F6]">
          Ready to purchase from {storeName || fromSlug}?
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-[#5A606B] dark:text-[#949AA6] max-w-md mx-auto">
          Return to the storefront anytime to pick your data package and complete your instant Mobile Money checkout.
        </p>
      </div>
      <div className="pt-2 flex justify-center">
        <Link
          href={returnUrl}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1D4ED8] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#1E40AF] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to {storeName || fromSlug} Storefront</span>
        </Link>
      </div>
    </div>
  );
}

export function LegalPageShell({
  currentSlug,
  title,
  badge,
  lastUpdated,
  description,
  children,
}: LegalPageShellProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111318] dark:bg-[#0C0D10] dark:text-[#F4F4F6] flex flex-col justify-between">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 border-b border-[#E5E2DC] bg-white/95 backdrop-blur-md dark:border-[#262A34] dark:bg-[#14161B]/95 print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/store"
              className="flex items-center gap-2 group transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <BrandLogo size="sm" showTagline={true} />
            </Link>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#5A606B] dark:text-[#949AA6]">
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-semibold text-[#111318] dark:text-[#F4F4F6]">
                Legal &amp; Compliance
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handlePrint}
              type="button"
              className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-[#E5E2DC] bg-white px-3 py-1.5 text-xs font-semibold text-[#111318] hover:bg-[#F3F1EC] dark:border-[#262A34] dark:bg-[#14161B] dark:text-[#F4F4F6] dark:hover:bg-[#1C1F26] transition-colors"
              title="Print document"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
            <Suspense fallback={null}>
              <OriginStorefrontHeader />
            </Suspense>
            <Link
              href="/login"
              className="rounded-lg border border-[#E5E2DC] bg-[#F3F1EC] px-3 py-1.5 text-xs font-semibold text-[#111318] hover:bg-[#E5E2DC] dark:border-[#262A34] dark:bg-[#1C1F26] dark:text-[#F4F4F6] dark:hover:bg-[#262A34] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="hidden sm:inline-flex rounded-lg bg-[#1D4ED8] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1E40AF] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] transition-colors"
            >
              Register
            </Link>
          </div>
        </div>

        {/* Policy Tab Switcher */}
        <Suspense fallback={null}>
          <OriginStorefrontTabs currentSlug={currentSlug} />
        </Suspense>
      </header>

      {/* Origin Storefront Banner if navigated from a storefront */}
      <Suspense fallback={null}>
        <OriginStorefrontBanner />
      </Suspense>

      {/* Hero Header */}
      <div className="relative z-10 border-b border-[#E5E2DC] bg-white px-4 py-10 sm:px-6 lg:px-8 dark:border-[#262A34] dark:bg-[#14161B]">
        <div className="mx-auto max-w-4xl text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#1D4ED8]/25 bg-[#1D4ED8]/10 px-2.5 py-1 text-xs font-semibold text-[#1D4ED8] dark:border-[#3B82F6]/30 dark:bg-[#3B82F6]/15 dark:text-[#3B82F6]">
              <ShieldCheck className="h-3.5 w-3.5" />
              {badge}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E2DC] bg-[#F3F1EC] px-2.5 py-1 text-xs font-medium text-[#5A606B] dark:border-[#262A34] dark:bg-[#1C1F26] dark:text-[#949AA6]">
              <Clock className="h-3 w-3 text-[#D97706] dark:text-[#F59E0B]" />
              {lastUpdated}
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#111318] sm:text-4xl lg:text-5xl dark:text-[#F4F4F6]">
            {title}
          </h1>

          <p className="mt-3 text-sm sm:text-base text-[#5A606B] leading-relaxed max-w-3xl dark:text-[#949AA6]">
            {description}
          </p>
        </div>
      </div>

      {/* Document Content */}
      <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-[#E5E2DC] bg-white p-6 sm:p-10 dark:border-[#262A34] dark:bg-[#14161B]">
          {children}
        </div>

        {/* Quick Contact & Escalation Box */}
        <div className="mt-8 rounded-xl border border-[#E5E2DC] bg-white p-6 sm:p-8 dark:border-[#262A34] dark:bg-[#14161B]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#111318] dark:text-[#F4F4F6] flex items-center gap-2">
                <span>Need Assistance or Legal Clarification?</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#5A606B] dark:text-[#949AA6]">
                Our support team is active daily from 5:00 AM to 11:59 PM GMT (Monday – Sunday).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="mailto:dzrahfelix@gmail.com"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1E40AF] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>dzrahfelix@gmail.com</span>
              </a>
              <a
                href="https://wa.me/233242319697"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E2DC] bg-[#F3F1EC] px-3.5 py-2 text-xs font-semibold text-[#111318] hover:bg-[#E5E2DC] dark:border-[#262A34] dark:bg-[#1C1F26] dark:text-[#F4F4F6] dark:hover:bg-[#262A34] transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-[#D97706] dark:text-[#F59E0B]" />
                <span className="font-mono">0242319697</span>
              </a>
            </div>
          </div>
        </div>

        {/* Return to Origin Storefront CTA Card */}
        <Suspense fallback={null}>
          <OriginStorefrontCtaCard />
        </Suspense>
      </main>

      {/* Global Footer */}
      <footer className="relative z-10 border-t border-[#E5E2DC] bg-white px-4 py-8 sm:px-6 lg:px-8 text-xs text-[#5A606B] dark:border-[#262A34] dark:bg-[#14161B] dark:text-[#949AA6] print:hidden">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="font-semibold text-[#111318] dark:text-[#F4F4F6]">
              CapeCoast © 2026
            </span>
            <span>·</span>
            <span>All Rights Reserved</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs">
            <Link
              href="/terms"
              className={`hover:text-[#1D4ED8] dark:hover:text-[#3B82F6] transition-colors ${
                currentSlug === "terms" ? "font-semibold text-[#1D4ED8] dark:text-[#3B82F6]" : ""
              }`}
            >
              Terms of Service
            </Link>
            <span>·</span>
            <Link
              href="/refund-policy"
              className={`hover:text-[#1D4ED8] dark:hover:text-[#3B82F6] transition-colors ${
                currentSlug === "refund-policy" ? "font-semibold text-[#1D4ED8] dark:text-[#3B82F6]" : ""
              }`}
            >
              Refund Policy
            </Link>
            <span>·</span>
            <Link
              href="/privacy"
              className={`hover:text-[#1D4ED8] dark:hover:text-[#3B82F6] transition-colors ${
                currentSlug === "privacy" ? "font-semibold text-[#1D4ED8] dark:text-[#3B82F6]" : ""
              }`}
            >
              Privacy Policy
            </Link>
            <span>·</span>
            <span className="inline-flex items-center gap-1 font-medium text-[#15803D] dark:text-[#22C55E]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Paystack PCI-DSS Secured
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

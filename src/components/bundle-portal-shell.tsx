"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  ShoppingCart,
  ClipboardList,
  Users,
  Package,
  Wallet,
  ArrowLeftRight,
  ShieldCheck,
  Code2,
  Store,
  BarChart3,
  Shield,
  Search,
  Sun,
  Moon,
  Headphones,
  Menu,
  X,
  LogOut,
  Share2,
  Plus,
  Clock,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { useTheme } from "next-themes";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { AnnouncementBar } from "@/components/announcement-bar";
import { PopupAnnouncementModal, type PopupAnnouncementData } from "@/components/popup-announcement-modal";
import { SystemChatWidget } from "@/components/chat/system-chat-widget";
import { cn } from "@/lib/utils";
import { formatGHS } from "@/lib/types";
import type { AuthUser } from "@/lib/types";

interface BundlePortalShellProps {
  user: AuthUser;
  children: React.ReactNode;
  announcement?: string | null;
  offlineNotice?: string | null;
  popupAnnouncement?: PopupAnnouncementData | null;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/buy-now", label: "Buy Bundle", icon: Zap },
  { href: "/dashboard/send", label: "Bulk Order", icon: ShoppingCart },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/packages", label: "Products", icon: Package },
  { href: "/dashboard/billing", label: "Wallet & Billing", icon: Wallet },
  { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/dashboard/mtn-verification", label: "MTN Verification", icon: ShieldCheck },
  { href: "/dashboard/afa", label: "AFA Registration", icon: ShieldCheck },
  { href: "/dashboard/api", label: "API", icon: Code2 },
  { href: "/dashboard/storefront", label: "Storefront", icon: Store },
  { href: "/dashboard/affiliate", label: "Affiliate Network", icon: Share2 },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin", label: "Admin Center", icon: Shield, adminOnly: true },
];

const BOTTOM_NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/send", label: "Bulk", icon: ShoppingCart },
  { href: "/dashboard/buy-now", label: "Buy", icon: Zap },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/billing", label: "Wallet", icon: Wallet },
];

export function BundlePortalShell({ user, announcement, offlineNotice, popupAnnouncement, children }: BundlePortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = user.role === "ADMIN" || user.role === "MANAGER";
  const isSubAgent = Boolean(user.referredById);

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    // Sub-agents do not have access to Affiliate Network or Developer API
    if (isSubAgent && (item.href === "/dashboard/affiliate" || item.href === "/dashboard/api")) {
      return false;
    }
    return true;
  });

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return "CC";
  };

  const isDarkMode = mounted && (resolvedTheme === "dark" || theme === "dark");

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0C0D10] text-[#111318] dark:text-[#F4F4F6] flex flex-col font-sans transition-colors duration-200 antialiased selection:bg-[#1D4ED8] selection:text-white">
      {/* ── GLOBAL ANNOUNCEMENT BAR ───────────────────────────────────────── */}
      {announcement && <AnnouncementBar text={announcement} />}
      <PopupAnnouncementModal announcement={popupAnnouncement} />

      {/* ── 56px STICKY TOPBAR ────────────────────────────────────────────── */}
      <header className="h-14 border-b border-[#E5E2DC] dark:border-[#262A34] bg-white/95 dark:bg-[#14161B]/95 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-2 px-2.5 sm:px-4 lg:px-5 w-full max-w-full">
        {/* Left: Mobile trigger & Brand */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 overflow-hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 -ml-1 rounded-lg text-[#5A606B] dark:text-[#949AA6] hover:text-[#111318] dark:hover:text-[#F4F4F6] hover:bg-[#F3F1EC] dark:hover:bg-[#1C1F26] shrink-0 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <BrandLogo
            size="sm"
            showTagline={true}
            taglineClassName="hidden sm:block"
            className="shrink min-w-0"
            href="/dashboard"
          />
        </div>

        {/* Center: ⌘K Search Bar */}
        <div className="hidden md:flex items-center max-w-md w-full mx-6">
          <div className="relative w-full">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A606B] dark:text-[#949AA6] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bundles, orders, or customers..."
              className="w-full h-9 bg-[#F3F1EC] dark:bg-[#1C1F26] border border-[#E5E2DC] dark:border-[#262A34] rounded-lg pl-8 pr-11 text-xs text-[#111318] dark:text-[#F4F4F6] placeholder:text-[#5A606B] dark:placeholder:text-[#949AA6] outline-none focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] transition-colors"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-white dark:bg-[#14161B] border border-[#E5E2DC] dark:border-[#262A34] text-[#5A606B] dark:text-[#949AA6] px-1.5 py-0.5 rounded font-mono pointer-events-none">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Balance + Top Up, Notifications, Theme, User Menu */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Monospace Balance Pill + Top Up */}
          <div className="flex items-center rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#F3F1EC] dark:bg-[#1C1F26] overflow-hidden shrink-0">
            <Link
              href="/dashboard/billing"
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-mono font-semibold tabular-nums text-[#111318] dark:text-[#F4F4F6] hover:bg-black/5 dark:hover:bg-white/5 transition-colors whitespace-nowrap"
              title="Wallet Balance"
            >
              <Wallet className="h-3.5 w-3.5 text-[#1D4ED8] dark:text-[#3B82F6] shrink-0 hidden xs:inline-block sm:inline-block" />
              <span>{formatGHS(user.balance || 0)}</span>
            </Link>
            <Link
              href="/dashboard/billing"
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white text-[11px] font-semibold transition-colors whitespace-nowrap"
              title="Top Up Wallet"
            >
              <Plus className="h-3 w-3 shrink-0" />
              <span className="hidden sm:inline">Top Up</span>
            </Link>
          </div>

          {/* Notification Center */}
          <NotificationCenter user={user} admin={isAdmin} announcement={announcement} />

          {/* Theme Toggle (Sun / Moon) */}
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(isDarkMode ? "light" : "dark")}
              className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#1C1F26] text-[#5A606B] dark:text-[#949AA6] hover:text-[#111318] dark:hover:text-[#F4F4F6] hover:border-[#1D4ED8]/40 dark:hover:border-[#3B82F6]/40 transition-colors"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5 text-[#D97706]" />}
            </button>
          )}

          {/* User Profile Menu */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E5E2DC] dark:border-[#262A34]">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:pointer-events-none shrink-0"
              title="View account"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1D4ED8] dark:bg-[#3B82F6] text-white font-bold text-xs">
                {getUserInitials(user.name, user.email)}
              </div>
            </button>

            <div className="hidden sm:flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[#111318] dark:text-[#F4F4F6] leading-tight max-w-[110px] truncate">
                  {user.name || "Account"}
                </span>
                <span className="rounded-md bg-[#1D4ED8]/10 dark:bg-[#3B82F6]/15 text-[#1D4ED8] dark:text-[#3B82F6] border border-[#1D4ED8]/20 dark:border-[#3B82F6]/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="hidden sm:flex p-1.5 rounded-lg text-[#5A606B] dark:text-[#949AA6] hover:text-[#DC2626] dark:hover:text-[#EF4444] hover:bg-[#DC2626]/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── BODY: 240px SIDEBAR + CONTENT ─────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* DESKTOP SIDEBAR (240px / w-60) */}
        <aside className="hidden lg:flex flex-col w-60 border-r border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] shrink-0 overflow-y-auto p-3 space-y-5">
          {/* Main Navigation List */}
          <nav className="space-y-0.5">
            {visibleNavItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors group",
                    isActive
                      ? "bg-[#1D4ED8]/8 dark:bg-[#3B82F6]/12 text-[#1D4ED8] dark:text-[#3B82F6] font-semibold"
                      : "text-[#5A606B] dark:text-[#949AA6] hover:text-[#111318] dark:hover:text-[#F4F4F6] hover:bg-[#F3F1EC] dark:hover:bg-[#1C1F26]"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-[#1D4ED8] dark:bg-[#3B82F6]" />
                  )}
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-[#1D4ED8] dark:text-[#3B82F6]"
                        : "text-[#5A606B] dark:text-[#949AA6] group-hover:text-[#111318] dark:group-hover:text-[#F4F4F6]"
                    )}
                  />
                  <span className="truncate flex-1">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* pycbundles Support & Status Footer */}
          <div className="mt-auto pt-3 space-y-2.5 border-t border-[#E5E2DC] dark:border-[#262A34]">
            <Link
              href="/admin/chat"
              className="group flex items-center justify-between p-3 rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#1C1F26] hover:border-[#1D4ED8]/40 dark:hover:border-[#3B82F6]/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1D4ED8]/10 dark:bg-[#3B82F6]/15 text-[#1D4ED8] dark:text-[#3B82F6]">
                  <Headphones className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#111318] dark:text-[#F4F4F6]">pycbundles Support</div>
                  <div className="text-[10px] text-[#5A606B] dark:text-[#949AA6]">24/7 Dispatch Desk</div>
                </div>
              </div>
              <span className="text-xs text-[#5A606B] dark:text-[#949AA6] group-hover:text-[#1D4ED8] dark:group-hover:text-[#3B82F6] group-hover:translate-x-0.5 transition-all">
                →
              </span>
            </Link>

            <div className="flex items-center justify-between px-2 py-1 text-[10px] text-[#5A606B] dark:text-[#949AA6]">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#15803D] dark:bg-[#22C55E]" />
                <span>All Networks Operational</span>
              </span>
              <span className="font-mono">GMT</span>
            </div>
          </div>
        </aside>

        {/* MOBILE DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex flex-col w-[85%] max-w-xs bg-white dark:bg-[#14161B] border-r border-[#E5E2DC] dark:border-[#262A34] p-4 space-y-4 z-10 overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DC] dark:border-[#262A34]">
                <BrandLogo size="sm" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#5A606B] dark:text-[#949AA6] hover:text-[#111318] dark:hover:text-[#F4F4F6] p-1 rounded-lg"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User Account Brief */}
              <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#1C1F26] p-3 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1D4ED8] dark:bg-[#3B82F6] text-white font-bold text-xs">
                  {getUserInitials(user.name, user.email)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-[#111318] dark:text-[#F4F4F6] truncate">
                      {user.name || "Account"}
                    </p>
                    <span className="rounded-md bg-[#1D4ED8]/10 dark:bg-[#3B82F6]/15 text-[#1D4ED8] dark:text-[#3B82F6] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono tabular-nums text-[#1D4ED8] dark:text-[#3B82F6] font-semibold mt-0.5">
                    {formatGHS(user.balance || 0)}
                  </p>
                </div>
              </div>

              <nav className="space-y-0.5">
                {visibleNavItems.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium min-h-[42px]",
                        isActive
                          ? "bg-[#1D4ED8]/8 dark:bg-[#3B82F6]/12 text-[#1D4ED8] dark:text-[#3B82F6] font-semibold"
                          : "text-[#5A606B] dark:text-[#949AA6] hover:text-[#111318] dark:hover:text-[#F4F4F6] hover:bg-[#F3F1EC] dark:hover:bg-[#1C1F26]"
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-[#1D4ED8] dark:bg-[#3B82F6]" />
                      )}
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-2 border-t border-[#E5E2DC] dark:border-[#262A34] mt-auto space-y-1">
                {mounted && (
                  <button
                    type="button"
                    onClick={() => setTheme(isDarkMode ? "light" : "dark")}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-[#111318] dark:text-[#F4F4F6] hover:bg-[#F3F1EC] dark:hover:bg-[#1C1F26] transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      {isDarkMode ? <Moon className="h-4 w-4 text-[#3B82F6]" /> : <Sun className="h-4 w-4 text-[#D97706]" />}
                      <span>{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
                    </span>
                    <span className="text-[10px] text-[#5A606B] dark:text-[#949AA6]">Switch</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-[#DC2626] dark:text-[#EF4444] hover:bg-[#DC2626]/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
                <div className="pt-2 text-center text-[11px] text-[#5A606B] dark:text-[#949AA6]">
                  pycbundles Telecom Platform
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAIN PAGE VIEWPORT */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 lg:p-6 pb-28 lg:pb-6 flex flex-col justify-between w-full max-w-full">
          <div className="max-w-7xl mx-auto space-y-5 w-full">
            {offlineNotice && (
              <div className="flex items-start gap-3 rounded-xl border border-[#D97706]/35 bg-[#D97706]/10 px-4 py-3 text-xs text-[#92400E] dark:border-[#F59E0B]/30 dark:bg-[#F59E0B]/10 dark:text-[#FBBF24]">
                <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Data Packages Currently Switched Off</p>
                  <p className="mt-0.5 opacity-90">{offlineNotice}</p>
                </div>
              </div>
            )}
            {children}
          </div>

          {/* Global Bottom Footer */}
          <footer className="mt-10 border-t border-[#E5E2DC] dark:border-[#262A34] pt-4 text-xs text-[#5A606B] dark:text-[#949AA6] w-full max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <span>pycbundles © {new Date().getFullYear()} · All Rights Reserved</span>
                <span>·</span>
                <Link href="/terms" target="_blank" className="hover:text-[#1D4ED8] dark:hover:text-[#3B82F6] transition-colors">
                  Terms
                </Link>
                <span>·</span>
                <Link href="/refund-policy" target="_blank" className="hover:text-[#1D4ED8] dark:hover:text-[#3B82F6] transition-colors">
                  Refunds
                </Link>
                <span>·</span>
                <Link href="/privacy" target="_blank" className="hover:text-[#1D4ED8] dark:hover:text-[#3B82F6] transition-colors">
                  Privacy
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[11px]">
                <a
                  href="https://wa.me/233507904981"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#1D4ED8] dark:hover:text-[#3B82F6] transition-colors"
                >
                  Powered by <span className="font-semibold text-[#111318] dark:text-[#F4F4F6]">Crazy Tech Enterprise</span>
                </a>
                <span>·</span>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#15803D] dark:bg-[#22C55E]" />
                  <span>Network Status: Operational</span>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION BAR ──────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#14161B]/95 backdrop-blur-xl border-t border-[#E5E2DC] dark:border-[#262A34] px-1 pt-1.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] flex items-center justify-around">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-0.5 px-1 rounded-lg transition-colors min-w-[52px] text-center",
                isActive
                  ? "text-[#1D4ED8] dark:text-[#3B82F6]"
                  : "text-[#5A606B] dark:text-[#949AA6] hover:text-[#111318] dark:hover:text-[#F4F4F6]"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-lg transition-colors",
                  isActive && "bg-[#1D4ED8]/10 dark:bg-[#3B82F6]/15 text-[#1D4ED8] dark:text-[#3B82F6]"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  "text-[10px] mt-0.5 tracking-tight leading-none truncate max-w-[62px]",
                  isActive ? "font-semibold text-[#1D4ED8] dark:text-[#3B82F6]" : "font-medium"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Floating System Support Chat Bubble */}
      <SystemChatWidget user={user} />
    </div>
  );
}

export { BundlePortalShell as CommonTechShell };
export type { BundlePortalShellProps as CommonTechShellProps };

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  Users,
  Wallet,
  Banknote,
  MessageSquare,
  Ticket,
  Store,
  Package,
  Receipt,
  CreditCard,
  FileBarChart,
  Code2,
  Settings,
  ScrollText,
  Activity,
  Menu,
  X,
  LogOut,
  ExternalLink,
  Bell,
  ChevronRight,
  PlusCircle,
  Clock,
  ShieldAlert,
  Search,
  Sun,
  Moon,
  Share2,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { useToast } from "@/components/toast";
import { useNavBadges } from "@/components/app-nav";
import { ManualCreditDialog } from "@/components/admin/manual-credit-dialog";
import { SystemChatWidget } from "@/components/chat/system-chat-widget";
import { useTheme } from "next-themes";
import { AnnouncementBar } from "@/components/announcement-bar";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/lib/types";

interface AdminShellProps {
  user: AuthUser;
  children: React.ReactNode;
  allowedNavHrefs?: string[];
  supportWhatsapp?: string;
  announcement?: string;
}

interface NavLinkItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: string;
  highlight?: boolean;
}

interface NavGroup {
  title: string;
  items: NavLinkItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "COMMAND HUB",
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/notifications", label: "Broadcast Desk", icon: Bell },
      { href: "/admin/reports", label: "Analytics & Reports", icon: FileBarChart },
      { href: "/admin/audit-logs", label: "Audit Trails", icon: ScrollText },
    ],
  },
  {
    title: "TELECOM & DISPATCH",
    items: [
      { href: "/admin/orders", label: "Live Orders Desk", icon: Layers, badgeKey: "/admin/orders" },
      { href: "/admin/order-api-logs", label: "Provider API Logs", icon: Activity },
      { href: "/admin/mtn-verification", label: "MTN Verification", icon: ShieldCheck, badgeKey: "/admin/mtn-verification" },
      { href: "/admin/delivery-reports", label: "Disputes & Reports", icon: AlertTriangle, badgeKey: "/admin/delivery-reports" },
      { href: "/admin/exports", label: "Batch Data Exports", icon: FileSpreadsheet },
    ],
  },
  {
    title: "FINANCE & SETTLEMENTS",
    items: [
      { href: "/admin/billing", label: "Billing & MoMo", icon: CreditCard },
      { href: "/admin/wallets", label: "Reseller Wallets", icon: Wallet },
      { href: "/admin/storefronts/withdrawals", label: "Storefront Payouts", icon: Banknote, badgeKey: "/admin/storefronts/withdrawals" },
    ],
  },
  {
    title: "CATALOGUE & RATES",
    items: [
      { href: "/admin/packages", label: "Data Packages", icon: Package },
      { href: "/admin/pricing", label: "Pricing Profiles", icon: Receipt },
    ],
  },
  {
    title: "MERCHANTS & USERS",
    items: [
      { href: "/admin/users", label: "User Management", icon: Users },
      { href: "/admin/affiliates", label: "Affiliate Network", icon: Share2 },
      { href: "/admin/users/signup-codes", label: "Invitation Codes", icon: Ticket },
      { href: "/admin/storefronts", label: "Storefront Directory", icon: Store },
      { href: "/admin/chat", label: "Support Live Desk", icon: MessageSquare },
    ],
  },
  {
    title: "SYSTEM & ENGINE",
    items: [
      { href: "/admin/settings", label: "Platform Settings", icon: Settings },
      { href: "/admin/api", label: "Developer API Keys", icon: Code2 },
    ],
  },
];

export function AdminShell({ user, children, allowedNavHrefs, announcement }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const badges = useNavBadges(true);
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [mounted, setMounted] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [creditDialogOpen, setCreditDialogOpen] = React.useState(false);
  const [alertsDropdownOpen, setAlertsDropdownOpen] = React.useState(false);
  const [gmtTime, setGmtTime] = React.useState<string>("");
  const [halted, setHalted] = React.useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Live GMT Clock
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setGmtTime(
        now.toLocaleTimeString("en-GB", {
          timeZone: "UTC",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " GMT"
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check Killswitch / Halt status
  React.useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings?.order_processing_halted === "true") {
          setHalted(true);
        }
      })
      .catch(() => {});
  }, []);

  // Close mobile drawer on navigation
  React.useEffect(() => {
    setMobileMenuOpen(false);
    setAlertsDropdownOpen(false);
  }, [pathname]);

  const totalAlertsCount =
    (badges["/admin/orders"]?.count ?? 0) +
    (badges["/admin/delivery-reports"]?.count ?? 0) +
    (badges["/admin/storefronts/withdrawals"]?.count ?? 0) +
    (badges["/admin/mtn-verification"]?.count ?? 0);

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
      {/* Top Banner if Emergency Halt is Active */}
      {halted && (
        <div className="bg-[#DC2626] text-white border-b border-red-700 px-4 py-2 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>CRITICAL ALERT: Order processing is currently HALTED across all telecom providers.</span>
          </div>
          <Link
            href="/admin/settings"
            className="rounded-md bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-white/25 transition-colors"
          >
            Manage Halt Switch →
          </Link>
        </div>
      )}

      {/* Global Announcement Bar */}
      {announcement && <AnnouncementBar text={announcement} />}

      {/* ── 56px TOP BAR ───────────────────────────────────────────────────── */}
      <header className="h-14 border-b border-[#E5E2DC] dark:border-[#262A34] bg-white/95 dark:bg-[#14161B]/95 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-3 sm:px-4 lg:px-5 w-full max-w-full">
        {/* Left: Mobile trigger & Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 -ml-1 rounded-lg text-[#5A606B] dark:text-[#949AA6] hover:text-[#111318] dark:hover:text-[#F4F4F6] hover:bg-[#F3F1EC] dark:hover:bg-[#1C1F26] shrink-0"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <BrandLogo size="sm" showTagline={true} href="/admin" />
            <span className="hidden sm:inline-flex rounded-md bg-[#D97706]/10 dark:bg-[#F59E0B]/15 text-[#B45309] dark:text-[#F59E0B] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-[#D97706]/25 dark:border-[#F59E0B]/30 shrink-0">
              ADMIN
            </span>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#5A606B] dark:text-[#949AA6]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders, users, providers, or logs..."
              className="w-full h-9 pl-8 pr-11 rounded-lg text-xs bg-[#F3F1EC] dark:bg-[#1C1F26] border border-[#E5E2DC] dark:border-[#262A34] text-[#111318] dark:text-[#F4F4F6] placeholder-[#5A606B] dark:placeholder-[#949AA6] focus:outline-none focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] transition-colors"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-white dark:bg-[#14161B] border border-[#E5E2DC] dark:border-[#262A34] text-[#5A606B] dark:text-[#949AA6] px-1.5 py-0.5 rounded font-mono pointer-events-none">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Actions, Live Clock, Notifications, Theme Toggle, User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Live GMT Clock */}
          {gmtTime && (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F3F1EC] dark:bg-[#1C1F26] border border-[#E5E2DC] dark:border-[#262A34] text-[#111318] dark:text-[#F4F4F6] text-[11px] font-mono tabular-nums">
              <Clock className="h-3.5 w-3.5 text-[#1D4ED8] dark:text-[#3B82F6]" />
              <span>{gmtTime}</span>
            </div>
          )}

          {/* Quick Manual Credit Shortcut */}
          <button
            type="button"
            onClick={() => setCreditDialogOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white text-xs font-semibold transition-colors active:scale-95"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Manual Credit</span>
          </button>

          {/* Alerts Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setAlertsDropdownOpen(!alertsDropdownOpen)}
              className="relative h-8 w-8 flex items-center justify-center rounded-lg text-[#5A606B] dark:text-[#949AA6] hover:text-[#111318] dark:hover:text-[#F4F4F6] bg-[#F3F1EC] dark:bg-[#1C1F26] border border-[#E5E2DC] dark:border-[#262A34] transition-colors"
              title="Operational Alerts"
            >
              <Bell className="h-4 w-4" />
              {totalAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#DC2626] px-1 text-[9px] font-bold text-white ring-2 ring-white dark:ring-[#14161B]">
                  {totalAlertsCount}
                </span>
              )}
            </button>

            {alertsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] shadow-lg p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E2DC] dark:border-[#262A34] text-xs font-semibold text-[#111318] dark:text-[#F4F4F6]">
                  <span>Operational Alerts</span>
                  <span className="text-[10px] text-[#D97706] dark:text-[#F59E0B] font-mono tabular-nums">
                    {totalAlertsCount} pending
                  </span>
                </div>
                <div className="divide-y divide-[#E5E2DC] dark:divide-[#262A34] py-1 text-xs">
                  <Link
                    href="/admin/orders"
                    className="flex items-center justify-between py-2.5 px-2 hover:bg-[#F3F1EC] dark:hover:bg-[#1C1F26] rounded-lg text-[#111318] dark:text-[#F4F4F6]"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-[#D97706] dark:text-[#F59E0B]" />
                      <span>Pending Orders</span>
                    </div>
                    <span className="font-bold text-[#D97706] dark:text-[#F59E0B] font-mono tabular-nums">
                      {badges["/admin/orders"]?.count ?? 0}
                    </span>
                  </Link>
                  <Link
                    href="/admin/delivery-reports"
                    className="flex items-center justify-between py-2.5 px-2 hover:bg-[#F3F1EC] dark:hover:bg-[#1C1F26] rounded-lg text-[#111318] dark:text-[#F4F4F6]"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-[#DC2626] dark:text-[#EF4444]" />
                      <span>Disputes Under Review</span>
                    </div>
                    <span className="font-bold text-[#DC2626] dark:text-[#EF4444] font-mono tabular-nums">
                      {badges["/admin/delivery-reports"]?.count ?? 0}
                    </span>
                  </Link>
                  <Link
                    href="/admin/storefronts/withdrawals"
                    className="flex items-center justify-between py-2.5 px-2 hover:bg-[#F3F1EC] dark:hover:bg-[#1C1F26] rounded-lg text-[#111318] dark:text-[#F4F4F6]"
                  >
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
                      <span>Pending Payouts</span>
                    </div>
                    <span className="font-bold text-[#1D4ED8] dark:text-[#3B82F6] font-mono tabular-nums">
                      {badges["/admin/storefronts/withdrawals"]?.count ?? 0}
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(isDarkMode ? "light" : "dark")}
              className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-[#5A606B] dark:text-[#949AA6] hover:text-[#111318] dark:hover:text-[#F4F4F6] bg-[#F3F1EC] dark:bg-[#1C1F26] border border-[#E5E2DC] dark:border-[#262A34] transition-colors"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5 text-[#D97706]" />}
            </button>
          )}

          {/* Switch to Reseller Portal Link */}
          <Link
            href="/dashboard"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F3F1EC] dark:bg-[#1C1F26] border border-[#E5E2DC] dark:border-[#262A34] text-[#111318] dark:text-[#F4F4F6] hover:border-[#1D4ED8]/40 dark:hover:border-[#3B82F6]/40 text-xs font-medium transition-colors"
            title="Switch to Reseller Portal"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[#1D4ED8] dark:text-[#3B82F6]" />
            <span>Portal</span>
          </Link>

          {/* User Profile Card */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E5E2DC] dark:border-[#262A34]">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:pointer-events-none shrink-0"
              title="Open Admin Navigation"
            >
              <div className="h-8 w-8 rounded-lg bg-[#1D4ED8] dark:bg-[#3B82F6] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {getUserInitials(user.name, user.email)}
              </div>
            </button>
            <div className="hidden lg:flex flex-col">
              <span className="text-xs font-semibold text-[#111318] dark:text-[#F4F4F6] leading-tight truncate max-w-[120px]">
                {user.name || "Admin"}
              </span>
              <span className="text-[10px] text-[#D97706] dark:text-[#F59E0B] font-semibold uppercase tracking-wider">
                {user.role}
              </span>
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

      {/* ── MAIN BODY CONTAINER ───────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* DESKTOP SIDEBAR */}
        <aside
          className={cn(
            "hidden md:flex flex-col border-r border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] transition-all duration-300 z-20 shrink-0",
            sidebarCollapsed ? "w-18" : "w-60"
          )}
        >
          {/* Sidebar Toggle & Header */}
          <div className="h-11 flex items-center justify-between px-4 border-b border-[#E5E2DC] dark:border-[#262A34]">
            {!sidebarCollapsed && (
              <span className="text-[10px] font-bold text-[#5A606B] dark:text-[#949AA6] uppercase tracking-wider">
                Navigation
              </span>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-[#5A606B] dark:text-[#949AA6] hover:text-[#111318] dark:hover:text-[#F4F4F6] p-1 rounded-lg hover:bg-[#F3F1EC] dark:hover:bg-[#1C1F26] transition-colors ml-auto"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronRight
                className={cn("h-4 w-4 transition-transform duration-200", !sidebarCollapsed && "rotate-180")}
              />
            </button>
          </div>

          {/* Navigation Groups */}
          <div className="flex-1 overflow-y-auto px-2.5 py-3.5 space-y-5">
            {NAV_GROUPS.map((group) => {
              const items = group.items.filter((item) => {
                if (!allowedNavHrefs) return true;
                return allowedNavHrefs.includes(item.href);
              });
              if (items.length === 0) return null;

              return (
                <div key={group.title} className="space-y-1">
                  {!sidebarCollapsed && (
                    <div className="px-2.5 text-[10px] font-bold tracking-wider text-[#5A606B] dark:text-[#949AA6] uppercase">
                      {group.title}
                    </div>
                  )}
                  <div className="space-y-0.5">
                    {items.map((item) => {
                      const isActive =
                        item.href === "/admin"
                          ? pathname === "/admin"
                          : pathname.startsWith(item.href);
                      const badge = item.badgeKey ? badges[item.badgeKey] : undefined;
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          title={sidebarCollapsed ? item.label : undefined}
                          className={cn(
                            "relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors group",
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

                          {!sidebarCollapsed && (
                            <span className="truncate flex-1">{item.label}</span>
                          )}

                          {badge && badge.count > 0 && (
                            <span
                              className={cn(
                                "flex items-center justify-center rounded-md text-[10px] font-mono font-bold h-4 min-w-[18px] px-1 text-white",
                                sidebarCollapsed
                                  ? "absolute top-1 right-1 h-3 min-w-[12px] text-[8px]"
                                  : "",
                                badge.variant === "danger"
                                  ? "bg-[#DC2626] dark:bg-[#EF4444]"
                                  : badge.variant === "warning"
                                  ? "bg-[#D97706] dark:bg-[#F59E0B]"
                                  : "bg-[#1D4ED8] dark:bg-[#3B82F6]"
                              )}
                            >
                              {badge.count > 99 ? "99+" : badge.count}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#14161B]">
            {!sidebarCollapsed && (
              <div className="flex items-center justify-between px-1 text-[10px] text-[#5A606B] dark:text-[#949AA6]">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#15803D] dark:bg-[#22C55E]" />
                  <span>pycbundles Core</span>
                </div>
                <span className="font-mono">v2.0</span>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN BODY AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden w-full max-w-full">
          {/* PAGE CONTENT */}
          <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 flex flex-col justify-between overflow-x-hidden">
            <div className="space-y-6">
              {children}
            </div>

            {/* Global Bottom Footer */}
            <footer className="mt-10 border-t border-[#E5E2DC] dark:border-[#262A34] pt-4 text-xs text-[#5A606B] dark:text-[#949AA6]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <span>pycbundles Admin © {new Date().getFullYear()} · All Rights Reserved</span>
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
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#15803D] dark:bg-[#22C55E]" />
                  <span>pycbundles Operations Desk</span>
                </div>
              </div>
            </footer>
          </main>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-4/5 max-w-xs bg-white dark:bg-[#14161B] border-r border-[#E5E2DC] dark:border-[#262A34] p-4 space-y-4 z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DC] dark:border-[#262A34]">
              <div className="flex items-center gap-2">
                <BrandLogo size="sm" showTagline={true} href="/admin" />
                <span className="text-[10px] font-bold uppercase text-[#B45309] dark:text-[#F59E0B] tracking-wider px-1.5 py-0.5 rounded-md bg-[#D97706]/10 dark:bg-[#F59E0B]/15 border border-[#D97706]/25">
                  ADMIN
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#5A606B] dark:text-[#949AA6] hover:text-[#111318] dark:hover:text-[#F4F4F6] p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {NAV_GROUPS.map((group) => (
                <div key={group.title} className="space-y-1">
                  <div className="text-[10px] font-bold text-[#5A606B] dark:text-[#949AA6] uppercase px-2">
                    {group.title}
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive =
                        item.href === "/admin"
                          ? pathname === "/admin"
                          : pathname.startsWith(item.href);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium",
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
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#E5E2DC] dark:border-[#262A34]">
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 w-full rounded-lg bg-[#F3F1EC] dark:bg-[#1C1F26] border border-[#E5E2DC] dark:border-[#262A34] px-3 py-2 text-xs font-semibold text-[#111318] dark:text-[#F4F4F6]"
              >
                <ExternalLink className="h-3.5 w-3.5 text-[#1D4ED8] dark:text-[#3B82F6]" />
                <span>Reseller Portal</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Manual Credit Dialog */}
      {creditDialogOpen && (
        <ManualCreditDialog
          open={creditDialogOpen}
          user={null}
          onClose={() => setCreditDialogOpen(false)}
          onCredited={() => {
            setCreditDialogOpen(false);
            toast("Manual credit applied successfully", "success");
            router.refresh();
          }}
        />
      )}

      {/* Floating System Support Chat Bubble */}
      <SystemChatWidget user={user} />
    </div>
  );
}

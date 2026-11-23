import * as React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatGHS } from "@/lib/types";
import {
  Zap,
  ShoppingCart,
  ShieldCheck,
  BarChart3,
  Plus,
  ChevronRight,
  Headphones,
  Wallet,
  CheckCircle2,
  ArrowUpRight,
  Clock,
  RotateCcw,
} from "lucide-react";
import { DashboardSalesChart } from "@/components/dashboard/dashboard-sales-chart";

export const dynamic = "force-dynamic";

function getStatusPillClass(status: string) {
  switch (status) {
    case "SUCCESS":
    case "COMPLETED":
      return "bg-[#15803D]/10 text-[#15803D] dark:bg-[#22C55E]/15 dark:text-[#22C55E] border-[#15803D]/20 dark:border-[#22C55E]/30";
    case "PENDING":
    case "PROCESSING":
      return "bg-[#B45309]/10 text-[#B45309] dark:bg-[#F59E0B]/15 dark:text-[#F59E0B] border-[#B45309]/20 dark:border-[#F59E0B]/30";
    case "FAILED":
    case "CANCELLED":
    case "REFUNDED":
      return "bg-[#DC2626]/10 text-[#DC2626] dark:bg-[#EF4444]/15 dark:text-[#EF4444] border-[#DC2626]/20 dark:border-[#EF4444]/30";
    default:
      return "bg-[#F3F1EC] text-[#5A606B] dark:bg-[#1C1F26] dark:text-[#949AA6] border-[#E5E2DC] dark:border-[#262A34]";
  }
}

function getNetworkAccent(network: string) {
  switch (network) {
    case "MTN":
      return "bg-[#F59E0B]/15 text-[#B45309] dark:text-[#F59E0B] border-[#F59E0B]/30";
    case "TELECEL":
      return "bg-[#DC2626]/10 text-[#DC2626] dark:text-[#EF4444] border-[#DC2626]/25";
    case "AIRTELTIGO":
      return "bg-[#1D4ED8]/10 text-[#1D4ED8] dark:text-[#3B82F6] border-[#1D4ED8]/25";
    default:
      return "bg-[#F3F1EC] text-[#5A606B] dark:bg-[#1C1F26] dark:text-[#949AA6] border-[#E5E2DC] dark:border-[#262A34]";
  }
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const orderScope =
    user.role === "ADMIN" || user.role === "MANAGER" ? {} : { userId: user.id };

  const [
    totalOrders,
    completedOrders,
    processingOrders,
    refundedOrders,
    userBalance,
    recentOrders,
    popularPackages,
  ] = await Promise.all([
    prisma.order.count({ where: orderScope }),
    prisma.order.count({
      where: { ...orderScope, status: { in: ["SUCCESS", "COMPLETED"] } },
    }),
    prisma.order.count({
      where: { ...orderScope, status: "PROCESSING" },
    }),
    prisma.order.count({
      where: { ...orderScope, status: "REFUNDED" },
    }),
    user.balance,
    prisma.order.findMany({
      where: orderScope,
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.dataPackage.findMany({
      where: { active: true, network: "MTN" },
      orderBy: { gbAmount: "asc" },
      take: 4,
    }),
  ]);

  return (
    <div className="space-y-5">
      {/* ── COMPACT HEADER BAR ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111318] dark:text-[#F4F4F6]">
              Welcome back, {user.name || "Partner"}
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#15803D]/25 dark:border-[#22C55E]/30 bg-[#15803D]/8 dark:bg-[#22C55E]/12 px-2 py-0.5 text-[10px] font-semibold text-[#15803D] dark:text-[#22C55E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#15803D] dark:bg-[#22C55E]" />
              Live
            </span>
          </div>
          <p className="text-xs text-[#5A606B] dark:text-[#949AA6] mt-0.5">
            Monitor bundle dispatches, wallet liquidity, and carrier throughput on pycbundles.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/dashboard/send"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] hover:bg-[#F3F1EC] dark:hover:bg-[#1C1F26] px-3 py-2 text-xs font-semibold text-[#111318] dark:text-[#F4F4F6] transition-colors"
          >
            <ShoppingCart className="h-3.5 w-3.5 text-[#5A606B] dark:text-[#949AA6]" />
            <span>Bulk Order</span>
          </Link>
          <Link
            href="/dashboard/buy-now"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white transition-colors"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Buy Bundle</span>
          </Link>
        </div>
      </div>

      {/* ── FINTECH KPI STRIP (4 METRICS) ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-4 space-y-2">
          <div className="flex items-center justify-between text-[#5A606B] dark:text-[#949AA6]">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Orders</span>
            <ShoppingCart className="h-4 w-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#111318] dark:text-[#F4F4F6]">
            {totalOrders.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#5A606B] dark:text-[#949AA6]">
            All-time dispatched bundles
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-4 space-y-2">
          <div className="flex items-center justify-between text-[#5A606B] dark:text-[#949AA6]">
            <span className="text-[11px] font-medium uppercase tracking-wider">Delivered Orders</span>
            <CheckCircle2 className="h-4 w-4 text-[#15803D] dark:text-[#22C55E]" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#111318] dark:text-[#F4F4F6]">
            {completedOrders.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#15803D] dark:text-[#22C55E] font-medium">
            Completed dispatches
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-4 space-y-2">
          <div className="flex items-center justify-between text-[#5A606B] dark:text-[#949AA6]">
            <span className="text-[11px] font-medium uppercase tracking-wider">Processing</span>
            <Clock className="h-4 w-4 text-[#D97706] dark:text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#111318] dark:text-[#F4F4F6]">
            {processingOrders.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#B45309] dark:text-[#F59E0B] font-medium">
            In-flight dispatches
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-4 space-y-2">
          <div className="flex items-center justify-between text-[#5A606B] dark:text-[#949AA6]">
            <span className="text-[11px] font-medium uppercase tracking-wider">Refunded</span>
            <RotateCcw className="h-4 w-4 text-[#DC2626] dark:text-[#EF4444]" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#111318] dark:text-[#F4F4F6]">
            {refundedOrders.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#DC2626] dark:text-[#EF4444] font-medium">
            Credited back to wallet
          </div>
        </div>
      </div>

      {/* ── MAIN 12-COL GRID ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN (8 COLS): CHART + RECENT ORDERS + POPULAR BUNDLES */}
        <div className="lg:col-span-8 space-y-5">
          {/* Sales / Dispatch Chart Card */}
          <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-5">
            <DashboardSalesChart />
          </div>

          {/* Denser Recent Orders Table */}
          <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E2DC] dark:border-[#262A34]">
              <div>
                <h2 className="text-sm font-semibold text-[#111318] dark:text-[#F4F4F6]">
                  Recent Orders
                </h2>
                <p className="text-[11px] text-[#5A606B] dark:text-[#949AA6]">
                  Latest bundle dispatches and settlement statuses
                </p>
              </div>
              <Link
                href="/dashboard/orders"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] dark:text-[#3B82F6] hover:underline"
              >
                <span>View all</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#1C1F26]/60 text-[10px] font-semibold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">
                      <th className="py-2.5 px-4">Order</th>
                      <th className="py-2.5 px-3">Recipient</th>
                      <th className="py-2.5 px-3">Network</th>
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E2DC] dark:divide-[#262A34] text-xs">
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-[#FAF9F6] dark:hover:bg-[#1C1F26]/50 transition-colors"
                      >
                        <td className="py-2.5 px-4 font-mono tabular-nums text-[11px] text-[#5A606B] dark:text-[#949AA6]">
                          #{order.id}
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums font-medium text-[#111318] dark:text-[#F4F4F6]">
                          {order.phoneNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${getNetworkAccent(order.network)}`}
                          >
                            {order.network}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums text-[#111318] dark:text-[#F4F4F6]">
                          {order.gbAmount}GB
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-medium text-[#111318] dark:text-[#F4F4F6]">
                          {formatGHS(order.amount)}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${getStatusPillClass(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-xs text-[#5A606B] dark:text-[#949AA6]">
                No orders dispatched yet.{" "}
                <Link
                  href="/dashboard/buy-now"
                  className="font-semibold text-[#1D4ED8] dark:text-[#3B82F6] hover:underline"
                >
                  Place your first order
                </Link>
              </div>
            )}
          </div>

          {/* Popular Bundles Row */}
          <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#111318] dark:text-[#F4F4F6]">
                  Popular MTN Bundles
                </h3>
                <p className="text-[11px] text-[#5A606B] dark:text-[#949AA6]">
                  Fastest-moving data packages
                </p>
              </div>
              <Link
                href="/dashboard/packages"
                className="text-xs font-semibold text-[#1D4ED8] dark:text-[#3B82F6] hover:underline flex items-center gap-1"
              >
                <span>All packages</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {popularPackages.length > 0 ? (
                popularPackages.map((pkg) => (
                  <Link
                    key={pkg.id}
                    href={`/dashboard/buy-now?packageId=${pkg.id}&network=${pkg.network}`}
                    className="group rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#1C1F26] p-3 flex items-center justify-between hover:border-[#1D4ED8]/50 dark:hover:border-[#3B82F6]/50 transition-colors"
                  >
                    <div>
                      <div className="inline-flex items-center rounded-md bg-[#F59E0B]/15 text-[#B45309] dark:text-[#F59E0B] px-1.5 py-0.5 text-[10px] font-mono font-bold">
                        {pkg.gbAmount}GB
                      </div>
                      <div className="text-xs font-mono font-bold tabular-nums text-[#111318] dark:text-[#F4F4F6] mt-1.5">
                        {formatGHS(pkg.retailPriceGHS ?? 10)}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#5A606B] dark:text-[#949AA6] group-hover:text-[#1D4ED8] dark:group-hover:text-[#3B82F6] group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))
              ) : (
                <>
                  {[
                    { gb: 1, price: "GHS 10.00" },
                    { gb: 2, price: "GHS 20.00" },
                    { gb: 5, price: "GHS 50.00" },
                    { gb: 10, price: "GHS 80.00" },
                  ].map((item) => (
                    <Link
                      key={item.gb}
                      href="/dashboard/buy-now?network=MTN"
                      className="group rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#1C1F26] p-3 flex items-center justify-between hover:border-[#1D4ED8]/50 dark:hover:border-[#3B82F6]/50 transition-colors"
                    >
                      <div>
                        <div className="inline-flex items-center rounded-md bg-[#F59E0B]/15 text-[#B45309] dark:text-[#F59E0B] px-1.5 py-0.5 text-[10px] font-mono font-bold">
                          {item.gb}GB
                        </div>
                        <div className="text-xs font-mono font-bold tabular-nums text-[#111318] dark:text-[#F4F4F6] mt-1.5">
                          {item.price}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#5A606B] dark:text-[#949AA6] group-hover:text-[#1D4ED8] dark:group-hover:text-[#3B82F6]" />
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 COLS): COMPACT WALLET ACTION CARD + QUICK ACTIONS + SUPPORT */}
        <div className="lg:col-span-4 space-y-5">
          {/* Compact Wallet Action Card */}
          <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-[#5A606B] dark:text-[#949AA6]">
                <Wallet className="h-4 w-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
                <span>Available Balance</span>
              </div>
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center gap-1 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Top Up</span>
              </Link>
            </div>

            <div className="text-3xl font-bold font-mono tabular-nums tracking-tight text-[#111318] dark:text-[#F4F4F6]">
              {formatGHS(userBalance)}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#E5E2DC] dark:border-[#262A34]">
              <Link
                href="/dashboard/billing"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#1C1F26] py-2 text-xs font-medium text-[#111318] dark:text-[#F4F4F6] hover:border-[#1D4ED8]/40 dark:hover:border-[#3B82F6]/40 transition-colors"
              >
                <span>Deposit MoMo</span>
              </Link>
              <Link
                href="/dashboard/transactions"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#1C1F26] py-2 text-xs font-medium text-[#111318] dark:text-[#F4F4F6] hover:border-[#1D4ED8]/40 dark:hover:border-[#3B82F6]/40 transition-colors"
              >
                <Clock className="h-3.5 w-3.5 text-[#5A606B] dark:text-[#949AA6]" />
                <span>Ledger</span>
              </Link>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-5 space-y-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">
                Quick Actions
              </h3>
            </div>

            <div className="space-y-2">
              <Link
                href="/dashboard/buy-now"
                className="group flex items-center justify-between p-3 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#1C1F26] hover:border-[#1D4ED8]/50 dark:hover:border-[#3B82F6]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D4ED8]/10 dark:bg-[#3B82F6]/15 text-[#1D4ED8] dark:text-[#3B82F6]">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#111318] dark:text-[#F4F4F6]">
                      Buy Bundle
                    </div>
                    <div className="text-[11px] text-[#5A606B] dark:text-[#949AA6]">
                      Single recipient dispatch
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#5A606B] dark:text-[#949AA6] group-hover:text-[#1D4ED8] dark:group-hover:text-[#3B82F6] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/dashboard/send"
                className="group flex items-center justify-between p-3 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#1C1F26] hover:border-[#1D4ED8]/50 dark:hover:border-[#3B82F6]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D4ED8]/10 dark:bg-[#3B82F6]/15 text-[#1D4ED8] dark:text-[#3B82F6]">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#111318] dark:text-[#F4F4F6]">
                      Bulk Order
                    </div>
                    <div className="text-[11px] text-[#5A606B] dark:text-[#949AA6]">
                      Paste numbers or CSV upload
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#5A606B] dark:text-[#949AA6] group-hover:text-[#1D4ED8] dark:group-hover:text-[#3B82F6] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/dashboard/mtn-verification"
                className="group flex items-center justify-between p-3 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#1C1F26] hover:border-[#D97706]/50 dark:hover:border-[#F59E0B]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D97706]/10 dark:bg-[#F59E0B]/15 text-[#D97706] dark:text-[#F59E0B]">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#111318] dark:text-[#F4F4F6]">
                      MTN Verification
                    </div>
                    <div className="text-[11px] text-[#5A606B] dark:text-[#949AA6]">
                      Check subscriber eligibility
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#5A606B] dark:text-[#949AA6] group-hover:text-[#D97706] dark:group-hover:text-[#F59E0B] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/dashboard/reports"
                className="group flex items-center justify-between p-3 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#1C1F26] hover:border-[#1D4ED8]/50 dark:hover:border-[#3B82F6]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F1EC] dark:bg-[#14161B] text-[#111318] dark:text-[#F4F4F6] border border-[#E5E2DC] dark:border-[#262A34]">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#111318] dark:text-[#F4F4F6]">
                      Analytics &amp; Reports
                    </div>
                    <div className="text-[11px] text-[#5A606B] dark:text-[#949AA6]">
                      Export &amp; track settlement
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#5A606B] dark:text-[#949AA6] group-hover:text-[#1D4ED8] dark:group-hover:text-[#3B82F6] group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          {/* Carrier Dispatch Card */}
          <div className="rounded-xl border border-[#D97706]/30 dark:border-[#F59E0B]/30 bg-[#D97706]/5 dark:bg-[#F59E0B]/10 p-5 space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B45309] dark:text-[#F59E0B]">
                Direct Carrier Route
              </span>
              <h4 className="text-base font-bold text-[#111318] dark:text-[#F4F4F6]">
                MTN Data Bundles
              </h4>
              <p className="text-xs text-[#5A606B] dark:text-[#949AA6]">
                Wholesale rates with automated delivery confirmation.
              </p>
            </div>

            <Link
              href="/dashboard/buy-now?network=MTN"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#D97706] hover:bg-[#B45309] dark:bg-[#F59E0B] dark:hover:bg-[#D97706] text-white dark:text-[#0C0D10] font-semibold text-xs px-3.5 py-2 transition-colors"
            >
              <span>Order MTN</span>
              <span>→</span>
            </Link>
          </div>

          {/* Support Card */}
          <Link
            href="/admin/chat"
            className="group flex items-center justify-between p-4 rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] hover:border-[#1D4ED8]/40 dark:hover:border-[#3B82F6]/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1D4ED8]/10 dark:bg-[#3B82F6]/15 text-[#1D4ED8] dark:text-[#3B82F6]">
                <Headphones className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#111318] dark:text-[#F4F4F6]">
                  Need assistance?
                </div>
                <div className="text-[11px] text-[#5A606B] dark:text-[#949AA6]">
                  Contact pycbundles Support Desk
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[#5A606B] dark:text-[#949AA6] group-hover:text-[#1D4ED8] dark:group-hover:text-[#3B82F6] group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
}

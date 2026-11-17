"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";

const DATA_7D = [
  { name: "Mon", sales: 1200 },
  { name: "Tue", sales: 900 },
  { name: "Wed", sales: 3200 },
  { name: "Thu", sales: 3000 },
  { name: "Fri", sales: 5500 },
  { name: "Sat", sales: 6800 },
  { name: "Sun", sales: 8500 },
];

const DATA_30D = [
  { name: "W1", sales: 4500 },
  { name: "W2", sales: 8200 },
  { name: "W3", sales: 14000 },
  { name: "W4", sales: 22000 },
];

const DATA_90D = [
  { name: "Month 1", sales: 15000 },
  { name: "Month 2", sales: 38000 },
  { name: "Month 3", sales: 62000 },
];

const DATA_1Y = [
  { name: "Q1", sales: 42000 },
  { name: "Q2", sales: 85000 },
  { name: "Q3", sales: 120000 },
  { name: "Q4", sales: 195000 },
];

export function DashboardSalesChart() {
  const [period, setPeriod] = React.useState<"7D" | "30D" | "90D" | "1Y">("7D");
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const primaryColor = isDark ? "#3B82F6" : "#1D4ED8";
  const accentColor = isDark ? "#F59E0B" : "#D97706";
  const gridColor = isDark ? "#262A34" : "#E5E2DC";
  const tickColor = isDark ? "#949AA6" : "#5A606B";

  const data = React.useMemo(() => {
    switch (period) {
      case "30D":
        return DATA_30D;
      case "90D":
        return DATA_90D;
      case "1Y":
        return DATA_1Y;
      default:
        return DATA_7D;
    }
  }, [period]);

  return (
    <div className="space-y-4">
      {/* Header + Time range filter pills */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[#111318] dark:text-[#F4F4F6]">
            Dispatch Volume
          </h3>
          <p className="text-[11px] text-[#5A606B] dark:text-[#949AA6]">
            Bundle volume across MTN, Telecel &amp; AT
          </p>
        </div>

        <div className="flex items-center gap-0.5 p-1 rounded-lg bg-[#F3F1EC] dark:bg-[#1C1F26] border border-[#E5E2DC] dark:border-[#262A34]">
          {(["7D", "30D", "90D", "1Y"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                period === p
                  ? "bg-[#1D4ED8] dark:bg-[#3B82F6] text-white"
                  : "text-[#5A606B] dark:text-[#949AA6] hover:text-[#111318] dark:hover:text-[#F4F4F6]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Area Chart (Cobalt + Amber) */}
      <div className="h-56 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="cobaltSalesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={primaryColor} stopOpacity={0.22} />
                <stop offset="100%" stopColor={primaryColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="name"
              stroke={tickColor}
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: gridColor, strokeWidth: 1 }}
            />
            <YAxis
              stroke={tickColor}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#14161B" : "#FFFFFF",
                borderColor: gridColor,
                borderRadius: "8px",
                color: isDark ? "#F4F4F6" : "#111318",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              }}
              formatter={(value: unknown) => [`GHS ${Number(value).toLocaleString()}`, "Volume"]}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke={primaryColor}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#cobaltSalesGrad)"
              dot={{ r: 3, fill: primaryColor, stroke: isDark ? "#14161B" : "#FFFFFF", strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: accentColor, stroke: isDark ? "#14161B" : "#FFFFFF", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

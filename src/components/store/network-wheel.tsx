"use client";

import Link from "next/link";
import { NetworkLogo } from "./network-logo";
import { NETWORK_BRANDS, networkHref, storeHref } from "./brands";
import type { NetworkProvider } from "@/lib/types";

/**
 * Modern circular telecom network logo carousel. The orbit rotates smoothly via
 * CSS while each carrier badge counter-rotates to stay upright. Badges are clickable
 * links directly into each network's bundle page. Pauses on hover and respects
 * prefers-reduced-motion.
 */
export function NetworkWheel({
  slug,
  storeName,
  networks,
}: {
  slug: string;
  storeName: string;
  networks: NetworkProvider[];
}) {
  const count = networks.length;
  if (count === 0) return null;

  return (
    <div className="wheel-wrap relative mx-auto aspect-square w-[88%] max-w-[320px] md:w-full md:max-w-md">
      {/* Decorative orbit rings */}
      <div className="pointer-events-none absolute inset-0 rounded-full border border-[#1D4ED8]/20 dark:border-[#3B82F6]/20" />
      <div className="pointer-events-none absolute inset-8 rounded-full border border-dashed border-[#D97706]/25 dark:border-[#F59E0B]/20" />
      <div className="pointer-events-none absolute inset-16 rounded-full border border-[#E5E2DC] dark:border-[#262A34]" />

      {/* Rotating orbit of clickable carrier nodes */}
      <div className="wheel-spin pointer-events-none absolute inset-4 md:inset-5">
        {networks.map((network, i) => {
          const angle = (360 / count) * i;
          return (
            <div
              key={network}
              className="pointer-events-none absolute inset-0"
              style={{ transform: `rotate(${angle}deg)` }}
            >
              <Link
                href={networkHref(slug, network)}
                aria-label={`Shop ${NETWORK_BRANDS[network].label} bundles`}
                className="pointer-events-auto absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
              >
                <span
                  className="block"
                  style={{ transform: `rotate(${-angle}deg)` }}
                >
                  <span className="wheel-counter block">
                    <span
                      className={`block h-12 w-12 md:h-14 md:w-14 overflow-hidden rounded-xl shadow-sm ring-1 ring-[#E5E2DC] dark:ring-[#262A34] transition-transform hover:scale-110 ${NETWORK_BRANDS[network].tile}`}
                    >
                      <NetworkLogo network={network} className="h-full w-full" />
                    </span>
                  </span>
                </span>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Center Store Brand Hub */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Link
          href={storeHref(slug)}
          className="pointer-events-auto flex flex-col items-center gap-1 rounded-2xl bg-white/95 px-8 py-5 text-center shadow-sm border border-[#E5E2DC] backdrop-blur-md transition-transform hover:scale-105 dark:bg-[#14161B]/95 dark:border-[#262A34] md:px-10 md:py-7"
        >
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#1D4ED8] dark:bg-[#3B82F6]" />
            <span className="font-bold text-base text-[#111318] dark:text-[#F4F4F6] md:text-xl truncate max-w-[180px]">
              {storeName}
            </span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#1D4ED8] dark:text-[#3B82F6] md:text-xs">
            Tap a carrier to shop
          </span>
        </Link>
      </div>
    </div>
  );
}

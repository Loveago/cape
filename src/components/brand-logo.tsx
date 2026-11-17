"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BrandProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  href?: string;
  variant?: "default" | "dark" | "light";
  taglineClassName?: string;
}

/**
 * pycbundles Geometric Signal-Prism Mark
 * Crisp 2-color geometric prism (Cobalt + Amber), zero glow.
 */
export function BrandMark({
  className,
  size = "md",
  variant = "default",
}: {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "dark" | "light";
}) {
  const sizeMap = {
    xs: "h-6 w-6",
    sm: "h-8 w-8 sm:h-9 sm:w-9",
    md: "h-9 w-9 sm:h-10 sm:w-10",
    lg: "h-11 w-11 sm:h-12 sm:w-12",
    xl: "h-14 w-14 sm:h-16 sm:w-16",
  };

  const sizePixels = {
    xs: 24,
    sm: 34,
    md: 38,
    lg: 46,
    xl: 60,
  };

  const px = sizePixels[size];

  const cobaltClass =
    variant === "dark"
      ? "fill-[#3B82F6]"
      : variant === "light"
      ? "fill-[#1D4ED8]"
      : "fill-[#1D4ED8] dark:fill-[#3B82F6]";

  const amberClass =
    variant === "dark"
      ? "fill-[#F59E0B]"
      : variant === "light"
      ? "fill-[#D97706]"
      : "fill-[#D97706] dark:fill-[#F59E0B]";

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center transition-transform hover:scale-105 active:scale-95",
        sizeMap[size],
        className
      )}
      style={{ width: px, height: px, maxWidth: "100%" }}
      aria-label="pycbundles"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        width={px}
        height={px}
        style={{ width: px, height: px, maxWidth: "100%" }}
      >
        {/* Outer Cobalt Signal-Prism Facet */}
        <path
          d="M 54 12 L 14 35 L 14 65 L 54 88 L 54 70 L 30 56 L 30 44 L 54 30 Z"
          className={cobaltClass}
        />
        {/* Inner Amber Beacon Prism */}
        <path
          d="M 60 32 L 88 50 L 60 68 Z"
          className={amberClass}
        />
      </svg>
    </div>
  );
}

/**
 * Full Horizontal Brand Logo (Signal-Prism Mark + "pycbundles" + "TELECOM & DATA DISTRIBUTION")
 */
export function BrandLogo({
  className,
  size = "md",
  showTagline = true,
  href,
  variant = "default",
  taglineClassName,
}: BrandProps) {
  const textSize =
    size === "xl"
      ? "text-2xl sm:text-3xl"
      : size === "lg"
      ? "text-xl sm:text-2xl"
      : size === "md"
      ? "text-lg sm:text-xl"
      : size === "xs"
      ? "text-xs sm:text-sm"
      : "text-lg sm:text-xl";

  const taglineSize =
    size === "xl"
      ? "text-[10.5px]"
      : size === "lg"
      ? "text-[9.5px]"
      : size === "md"
      ? "text-[8.5px]"
      : size === "xs"
      ? "text-[6.5px]"
      : "text-[6.5px] sm:text-[8px]";

  const primaryWordClass =
    variant === "dark"
      ? "text-[#F4F4F6]"
      : variant === "light"
      ? "text-[#111318]"
      : "text-[#111318] dark:text-[#F4F4F6]";

  const accentWordClass =
    variant === "dark"
      ? "text-[#3B82F6]"
      : variant === "light"
      ? "text-[#1D4ED8]"
      : "text-[#1D4ED8] dark:text-[#3B82F6]";

  const taglineColorClass =
    variant === "dark"
      ? "text-[#949AA6]"
      : variant === "light"
      ? "text-[#5A606B]"
      : "text-[#5A606B] dark:text-[#949AA6]";

  const content = (
    <div
      className={cn(
        "inline-flex shrink-0 items-center gap-2 sm:gap-2.5 select-none",
        className
      )}
    >
      <BrandMark size={size} variant={variant} />
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center leading-none">
          <span className={cn("font-extrabold tracking-[-0.03em]", primaryWordClass, textSize)}>
            pyc
          </span>
          <span className={cn("font-extrabold tracking-[-0.03em]", accentWordClass, textSize)}>
            bundles
          </span>
        </div>
        {showTagline && (
          <span
            className={cn(
              "mt-0.5 font-semibold uppercase tracking-[0.06em] sm:tracking-[0.14em] block truncate max-w-[140px] xs:max-w-[170px] sm:max-w-none leading-none",
              taglineColorClass,
              taglineSize,
              taglineClassName
            )}
          >
            Telecom &amp; Data Distribution
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex transition-transform hover:scale-[1.01] active:scale-[0.99]">
        {content}
      </Link>
    );
  }

  return content;
}

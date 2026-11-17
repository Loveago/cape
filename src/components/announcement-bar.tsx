"use client";

import * as React from "react";
import { Megaphone, X } from "lucide-react";

interface AnnouncementBarProps {
  text?: string | null;
  className?: string;
}

export function AnnouncementBar({ text, className }: AnnouncementBarProps) {
  const [content, setContent] = React.useState<string | null>(text ?? null);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    setContent(text ?? null);
    if (text) {
      try {
        const isDismissed = sessionStorage.getItem(`announcement_dismissed_${encodeURIComponent(text)}`);
        if (isDismissed === "true") {
          setDismissed(true);
        } else {
          setDismissed(false);
        }
      } catch {
        // ignore
      }
    }
  }, [text]);

  // Listen for custom announcement update events if dispatched dynamically
  React.useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.announcement !== undefined) {
        setContent(e.detail.announcement);
        setDismissed(false);
      }
    };
    window.addEventListener("site-announcement-update", handleUpdate);
    return () => window.removeEventListener("site-announcement-update", handleUpdate);
  }, []);

  if (!content || !content.trim() || dismissed) {
    return null;
  }

  const trimmed = content.trim();

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(`announcement_dismissed_${encodeURIComponent(trimmed)}`, "true");
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={`banner-container relative z-40 overflow-hidden bg-[#1D4ED8] dark:bg-[#14161B] text-white border-b border-blue-800/40 dark:border-[#262A34] select-none ${className || ""}`}
      role="region"
      aria-label="Site announcement"
    >
      <div className="relative flex w-full items-center py-1.5 sm:py-2 px-3 overflow-hidden">
        {/* Left Notice Badge */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0 pr-3 border-r border-white/20 dark:border-[#262A34] z-10 bg-[#1D4ED8] dark:bg-[#14161B] pl-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 dark:text-[#F59E0B]">
            <Megaphone className="h-3 w-3" />
            <span>Notice</span>
          </span>
        </div>

        {/* Continuous sliding marquee text */}
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-banner-slide py-0.5 text-xs sm:text-sm font-semibold tracking-wide text-white flex items-center">
            <span className="inline-flex items-center gap-3 px-6 text-blue-50 dark:text-slate-200">
              <span className="text-amber-300 dark:text-[#F59E0B]">⚡</span>
              <span>{trimmed}</span>
              <span className="text-white/40 font-bold">·</span>
              <span className="text-amber-300 dark:text-[#F59E0B]">📢</span>
              <span>{trimmed}</span>
              <span className="text-white/40 font-bold">·</span>
              <span className="text-amber-300 dark:text-[#F59E0B]">⚡</span>
              <span>{trimmed}</span>
            </span>
          </div>
        </div>

        {/* Dismiss button */}
        <div className="shrink-0 pl-2 z-10 bg-gradient-to-l from-[#1D4ED8] via-[#1D4ED8]/95 dark:from-[#14161B] dark:via-[#14161B]/95 to-transparent flex items-center">
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss announcement"
            className="p-1 rounded-lg text-blue-200 dark:text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss announcement"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { Megaphone, X, Eye, Ban, Check } from "lucide-react";

export interface PopupAnnouncementData {
  id: string;
  title: string;
  message: string;
  maxViews: number;
  updatedAt?: string;
}

export function PopupAnnouncementModal({
  announcement,
}: {
  announcement?: PopupAnnouncementData | null;
}) {
  const [open, setOpen] = React.useState(false);
  const [seenCount, setSeenCount] = React.useState(0);

  React.useEffect(() => {
    if (!announcement || !announcement.message.trim()) return;
    const storageKey = `pycbundles_popup_${announcement.id || "default"}`;
    const maxViews = Math.max(1, announcement.maxViews || 1);

    try {
      const raw = localStorage.getItem(storageKey);
      const parsed: { views: number; dismissed: boolean } = raw
        ? JSON.parse(raw)
        : { views: 0, dismissed: false };

      if (parsed.dismissed || parsed.views >= maxViews) {
        return;
      }

      setSeenCount(parsed.views);
      setOpen(true);

      localStorage.setItem(
        storageKey,
        JSON.stringify({ views: parsed.views + 1, dismissed: false })
      );
    } catch {
      // ignore storage errors
    }
  }, [announcement]);

  if (!open || !announcement) return null;

  const maxViews = Math.max(1, announcement.maxViews || 1);
  const storageKey = `pycbundles_popup_${announcement.id || "default"}`;

  const handleClose = () => setOpen(false);

  const handleDontShowAgain = () => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ views: maxViews, dismissed: true })
      );
    } catch {
      // ignore
    }
    setOpen(false);
  };

  const dateLabel = announcement.updatedAt
    ? new Date(announcement.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-label={announcement.title || "Announcement"}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1D4ED8] dark:bg-[#1E3A8A] px-5 py-4 text-white flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 border border-white/20">
              <Megaphone className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold leading-tight truncate">
                  {announcement.title || "Platform Update"}
                </h2>
                <span className="rounded-full bg-[#D97706] dark:bg-[#F59E0B] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white dark:text-[#111318]">
                  NEW
                </span>
              </div>
              <p className="mt-0.5 text-xs text-white/80">{dateLabel}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close announcement"
            className="rounded-lg p-1 text-white/80 hover:bg-white/15 hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="text-sm text-[#111318] dark:text-[#F4F4F6] whitespace-pre-line leading-relaxed">
            {announcement.message}
          </div>

          {/* View Counter Row */}
          <div className="pt-3 border-t border-[#E5E2DC] dark:border-[#262A34] flex items-center justify-between gap-3 text-xs text-[#5A606B] dark:text-[#949AA6]">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 shrink-0 text-[#5A606B] dark:text-[#949AA6]" />
              <span>
                You&apos;ve seen this announcement{" "}
                <strong className="font-mono text-[#111318] dark:text-[#F4F4F6]">{seenCount}</strong>{" "}
                {seenCount === 1 ? "time" : "times"}
              </span>
            </div>
            <span className="font-mono font-semibold text-[#1D4ED8] dark:text-[#3B82F6] shrink-0">
              Max views: {maxViews}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleDontShowAgain}
              className="flex-1 inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#F3F1EC] dark:bg-[#1C1F26] hover:bg-[#E5E2DC]/60 dark:hover:bg-[#262A34] text-xs font-semibold text-[#111318] dark:text-[#F4F4F6] transition-colors cursor-pointer"
            >
              <Ban className="h-3.5 w-3.5" />
              <span>Don&apos;t show again</span>
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

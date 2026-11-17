"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0C0D10] text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-6 selection:bg-[#1D4ED8] selection:text-white">
      <div className="w-full max-w-md rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-white dark:bg-[#14161B] p-8 text-center space-y-6">
        <div className="h-14 w-14 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#D97706] dark:text-[#F59E0B]">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Something went wrong</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {error?.message || "An unexpected error occurred while rendering this page."}
          </p>
          {error?.digest && (
            <p className="text-[10px] font-mono text-slate-500">Error Digest: {error.digest}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#1D4ED8] dark:bg-[#3B82F6] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#1E40AF] dark:hover:bg-[#2563EB] transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#F3F1EC] dark:bg-[#1C1F26] px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Go to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

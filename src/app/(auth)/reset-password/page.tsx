"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPasswordSchema } from "@/lib/validation";
import { AuthShell, AuthFooterLink } from "@/components/auth/auth-shell";
import { useToast } from "@/components/toast";
import { Spinner } from "@/components/shared";
import { Lock, ArrowRight } from "lucide-react";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "" },
  });

  const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    setServerError(null);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: data.password }),
    });
    const json = await res.json();
    if (!res.ok) {
      setServerError(json.error ?? "Reset failed");
      return;
    }
    toast("Password reset. Please sign in.", "success");
    router.push("/login");
  };

  if (!token) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
        Invalid or missing reset token.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {serverError}
        </div>
      )}
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-xs font-medium text-[#111318] dark:text-[#F4F4F6]"
        >
          New password
        </label>
        <div className="relative">
          <Lock className="h-4 w-4 text-[#5A606B] dark:text-[#949AA6] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••••••"
            className="w-full h-10 rounded-lg bg-[#FAF9F6] dark:bg-[#0C0D10] border border-[#E5E2DC] dark:border-[#262A34] pl-9 pr-3 text-sm text-[#111318] dark:text-[#F4F4F6] placeholder:text-[#5A606B]/60 dark:placeholder:text-[#949AA6]/60 outline-none focus:border-blue-700 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-700/15 dark:focus:ring-blue-500/20 transition-colors"
            {...register("password")}
          />
        </div>
        {errors.password && (
          <p className="text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-10 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? (
          <Spinner className="h-4 w-4 text-white" />
        ) : (
          <>
            <span>Reset password</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter a new password for your CapeCoast account"
    >
      <Suspense fallback={<Spinner className="mx-auto" />}>
        <ResetForm />
      </Suspense>
      <AuthFooterLink href="/login" prompt="Remember your password?" cta="Sign in" />
    </AuthShell>
  );
}

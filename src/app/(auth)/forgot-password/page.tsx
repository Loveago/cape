"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validation";
import { AuthShell, AuthFooterLink } from "@/components/auth/auth-shell";
import { useToast } from "@/components/toast";
import { Spinner } from "@/components/shared";
import { Mail, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);
  const [resetPath, setResetPath] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: { email: string }) => {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    setSent(true);
    if (json.resetPath) setResetPath(json.resetPath);
    toast("If that email exists, a reset link has been sent.", "success");
  };

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email address and we'll send you a reset link"
    >
      {sent ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-xs font-medium text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400">
            Check your inbox for the reset link.
          </div>
          {resetPath && (
            <a
              href={resetPath}
              className="block text-center text-xs font-semibold text-blue-700 hover:underline underline-offset-4 dark:text-blue-400"
            >
              Open reset link (dev)
            </a>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-medium text-[#111318] dark:text-[#F4F4F6]"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 text-[#5A606B] dark:text-[#949AA6] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full h-10 rounded-lg bg-[#FAF9F6] dark:bg-[#0C0D10] border border-[#E5E2DC] dark:border-[#262A34] pl-9 pr-3 text-sm text-[#111318] dark:text-[#F4F4F6] placeholder:text-[#5A606B]/60 dark:placeholder:text-[#949AA6]/60 outline-none focus:border-blue-700 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-700/15 dark:focus:ring-blue-500/20 transition-colors"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>
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
                <span>Send Reset Link</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}
      <AuthFooterLink href="/login" prompt="Remember your password?" cta="Sign in" />
    </AuthShell>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validation";
import { AuthShell, AuthFooterLink } from "@/components/auth/auth-shell";
import { useToast } from "@/components/toast";
import { Spinner } from "@/components/shared";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [otpTicket, setOtpTicket] = useState<string>("");
  const [otpEmail, setOtpEmail] = useState<string>("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState<string>("");
  const [verifyingOtp, setVerifyingOtp] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "Login failed");
        return;
      }

      if (json.requireOtp) {
        setStep("otp");
        setOtpTicket(json.otpTicket);
        setOtpEmail(json.email);
        if (json.devOtp) setDevOtp(json.devOtp);
        toast("One-Time Passcode sent to your email", "info");
        return;
      }

      toast("Signed in successfully", "success");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setServerError("An unexpected connection error occurred. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast("Please enter the 6-digit code", "error");
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpTicket, code: otpCode }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast(json.error ?? "OTP verification failed", "error");
        return;
      }
      toast("Signed in successfully", "success");
      router.push("/dashboard");
      router.refresh();
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <AuthShell
      title={step === "credentials" ? "Sign in to your account" : "Enter security code"}
      subtitle={
        step === "credentials"
          ? "Access your pycbundles reseller console and wallet"
          : `Check ${otpEmail} for your 6-digit passcode`
      }
    >
      <div className="space-y-4">
        {serverError && (
          <div className="rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2.5 text-xs text-red-700 dark:text-red-400">
            {serverError}
          </div>
        )}

        {step === "credentials" ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Input */}
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
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full h-10 rounded-lg bg-[#FAF9F6] dark:bg-[#0C0D10] border border-[#E5E2DC] dark:border-[#262A34] pl-9 pr-3 text-sm text-[#111318] dark:text-[#F4F4F6] placeholder:text-[#5A606B]/60 dark:placeholder:text-[#949AA6]/60 outline-none focus:border-blue-700 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-700/15 dark:focus:ring-blue-500/20 transition-colors"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-[#111318] dark:text-[#F4F4F6]"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline underline-offset-4"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 text-[#5A606B] dark:text-[#949AA6] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  className="w-full h-10 rounded-lg bg-[#FAF9F6] dark:bg-[#0C0D10] border border-[#E5E2DC] dark:border-[#262A34] pl-9 pr-10 text-sm text-[#111318] dark:text-[#F4F4F6] placeholder:text-[#5A606B]/60 dark:placeholder:text-[#949AA6]/60 outline-none focus:border-blue-700 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-700/15 dark:focus:ring-blue-500/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A606B] hover:text-[#111318] dark:text-[#949AA6] dark:hover:text-[#F4F4F6]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="h-4 w-4 text-white" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2 text-center">
              <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#F3F1EC] dark:bg-[#1C1F26] text-blue-700 dark:text-blue-400">
                <KeyRound className="h-5 w-5" />
              </div>
              {devOtp && (
                <div className="rounded-lg border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 text-xs font-mono text-amber-800 dark:text-amber-300">
                  Development OTP: <strong>{devOtp}</strong>
                </div>
              )}
            </div>

            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-full h-11 text-center text-lg font-mono tabular-nums tracking-[0.3em] rounded-lg bg-[#FAF9F6] dark:bg-[#0C0D10] border border-[#E5E2DC] dark:border-[#262A34] text-[#111318] dark:text-[#F4F4F6] outline-none focus:border-blue-700 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-700/15 dark:focus:ring-blue-500/20"
            />

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={verifyingOtp || otpCode.length !== 6}
              className="w-full h-10 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {verifyingOtp ? (
                <Spinner className="h-4 w-4 text-white" />
              ) : (
                <span>Verify &amp; Enter Dashboard</span>
              )}
            </button>
          </div>
        )}
      </div>

      <AuthFooterLink
        href="/register"
        prompt="Don't have an account?"
        cta="Create an account"
      />
    </AuthShell>
  );
}

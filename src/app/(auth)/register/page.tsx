"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { registerSchema, type RegisterInput } from "@/lib/validation";
import { AuthShell, AuthFooterLink } from "@/components/auth/auth-shell";
import { useToast } from "@/components/toast";
import { Spinner } from "@/components/shared";
import {
  User,
  Mail,
  Lock,
  Ticket,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  CreditCard,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

interface SignupFeeInfo {
  enabled: boolean;
  amount: number;
  currency: string;
  description: string;
  paystackConfigured: boolean;
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [signupCodeMode, setSignupCodeMode] = useState<"DISABLED" | "OPTIONAL" | "REQUIRED">("OPTIONAL");
  const [codeStatus, setCodeStatus] = useState<{ checked: boolean; valid: boolean; message?: string } | null>(null);
  const [validatingCode, setValidatingCode] = useState(false);
  const [signupFee, setSignupFee] = useState<SignupFeeInfo | null>(null);
  const [registrationClosed, setRegistrationClosed] = useState(false);
  const [redirectingPayment, setRedirectingPayment] = useState<{ url: string; amount: number } | null>(null);

  // Check for affiliate referral link parameters
  const rawRef =
    searchParams.get("ref") ||
    searchParams.get("code") ||
    searchParams.get("aff") ||
    searchParams.get("affiliate") ||
    searchParams.get("invite") ||
    "";
  const refParam = rawRef.trim();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      signupCode: refParam,
      ref: refParam,
    },
  });

  // Autofill signupCode and ref when an affiliate / invite code is in URL
  useEffect(() => {
    if (refParam) {
      setValue("ref", refParam);
      setValue("signupCode", refParam);
    }
  }, [refParam, setValue]);

  const enteredCode = watch("signupCode");

  // Load registration settings
  useEffect(() => {
    fetch("/api/auth/registration-settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.signupCodeMode) setSignupCodeMode(data.signupCodeMode);
        if (data.allowRegistration === false) setRegistrationClosed(true);
        if (data.signupFee) setSignupFee(data.signupFee);
      })
      .catch(() => {
        fetch("/api/auth/signup-code-mode")
          .then((r) => r.json())
          .then((data) => {
            if (data.mode) setSignupCodeMode(data.mode);
          })
          .catch(() => {});
      });
  }, []);

  // Handle URL errors (e.g. redirected from Paystack callback on cancel/failure)
  useEffect(() => {
    const error = searchParams.get("error");
    const reason = searchParams.get("reason");
    const message = searchParams.get("message");
    if (error === "payment_failed") {
      setServerError(
        reason
          ? `Payment failed: ${reason}. Please try signing up again to complete activation.`
          : "Payment was not completed. Please try again to activate your account."
      );
    } else if (error === "verification_error") {
      setServerError(message || "An error occurred while verifying your payment. Please try again.");
    } else if (error === "transaction_not_found") {
      setServerError("Registration transaction record not found. Please try submitting again.");
    }
  }, [searchParams]);

  // Validate signup / affiliate code with debounce
  useEffect(() => {
    const codeToValidate = enteredCode?.trim();
    if (!codeToValidate) {
      setCodeStatus(null);
      return;
    }

    const timer = setTimeout(async () => {
      setValidatingCode(true);
      try {
        const res = await fetch(`/api/auth/validate-code?code=${encodeURIComponent(codeToValidate)}`);
        const data = await res.json();
        setCodeStatus({
          checked: true,
          valid: !!data.valid,
          message: data.valid
            ? data.message || "Valid signup code"
            : data.message || "Invalid or expired signup code",
        });
      } catch {
        setCodeStatus(null);
      } finally {
        setValidatingCode(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [enteredCode]);

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "Registration failed");
        return;
      }

      // Check if account monetization fee payment is required
      if (json.requiresPayment && json.authorizationUrl) {
        setRedirectingPayment({
          url: json.authorizationUrl,
          amount: json.amount || signupFee?.amount || 0,
        });
        toast("Account registered! Redirecting to Paystack for activation...", "info");
        setTimeout(() => {
          window.location.href = json.authorizationUrl;
        }, 1000);
        return;
      }

      toast("Account created. Welcome to CapeCoast!", "success");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setServerError("An unexpected connection error occurred. Please try again.");
    }
  };

  const hasFee = signupFee?.enabled && signupFee.amount > 0;

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start dispatching data bundles on CapeCoast"
    >
      {/* Payment Redirecting Modal / Prompt */}
      {redirectingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-[#14161B] p-6 shadow-xl border border-[#E5E2DC] dark:border-[#262A34] text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
              <Spinner className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111318] dark:text-[#F4F4F6]">
                Redirecting to Paystack…
              </h3>
              <p className="text-xs text-[#5A606B] dark:text-[#949AA6] mt-2 leading-relaxed">
                Complete the activation fee of{" "}
                <strong className="text-[#111318] dark:text-[#F4F4F6] font-semibold font-mono tabular-nums">
                  GHS {redirectingPayment.amount.toFixed(2)}
                </strong>{" "}
                to activate your account and access your dashboard.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                window.location.href = redirectingPayment.url;
              }}
              className="w-full h-10 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Proceed to Paystack</span>
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {registrationClosed ? (
        <div className="rounded-xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-5 text-center text-xs text-amber-900 dark:text-amber-200 space-y-2">
          <AlertTriangle className="mx-auto h-6 w-6 text-amber-600 dark:text-amber-400" />
          <p className="font-semibold text-sm text-[#111318] dark:text-[#F4F4F6]">
            Registrations are currently closed
          </p>
          <p className="text-[#5A606B] dark:text-[#949AA6]">
            New user sign-ups are temporarily paused by the administrator. Please check back later.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("ref")} />

          {/* Server Error Alert */}
          {serverError && (
            <div className="rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2.5 text-xs text-red-700 dark:text-red-400">
              {serverError}
            </div>
          )}

          {/* Affiliate Referral Indicator */}
          {refParam && (
            <div className="flex items-center justify-between rounded-lg border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-3 py-2 text-xs">
              <span className="font-medium text-[#111318] dark:text-[#F4F4F6]">
                Referred by Partner Agent
              </span>
              <span className="font-mono font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-white dark:bg-[#14161B] border border-blue-200 dark:border-blue-500/30 px-2 py-0.5 rounded-md">
                {refParam}
              </span>
            </div>
          )}

          {/* Activation Fee Banner */}
          {hasFee && (
            <div className="rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#F3F1EC] dark:bg-[#1C1F26] p-3 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold flex items-center gap-1.5 text-[#111318] dark:text-[#F4F4F6]">
                  <CreditCard className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                  {signupFee.description || "Account Activation Fee"}
                </span>
                <span className="rounded-md bg-white dark:bg-[#14161B] border border-[#E5E2DC] dark:border-[#262A34] px-2 py-0.5 text-xs font-semibold text-[#111318] dark:text-[#F4F4F6] font-mono tabular-nums">
                  GHS {signupFee.amount.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-[#5A606B] dark:text-[#949AA6] leading-relaxed">
                A one-time activation fee is required. You will be redirected to Paystack after submission.
              </p>
            </div>
          )}

          {/* Full Name Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="block text-xs font-medium text-[#111318] dark:text-[#F4F4F6]"
            >
              Full name
            </label>
            <div className="relative">
              <User className="h-4 w-4 text-[#5A606B] dark:text-[#949AA6] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="name"
                {...register("name")}
                type="text"
                autoComplete="name"
                placeholder="e.g. Kwame Mensah"
                className="w-full h-10 rounded-lg bg-[#FAF9F6] dark:bg-[#0C0D10] border border-[#E5E2DC] dark:border-[#262A34] pl-9 pr-3 text-sm text-[#111318] dark:text-[#F4F4F6] placeholder:text-[#5A606B]/60 dark:placeholder:text-[#949AA6]/60 outline-none focus:border-blue-700 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-700/15 dark:focus:ring-blue-500/20 transition-colors"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-600 dark:text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Email Address Input */}
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
            <label
              htmlFor="password"
              className="block text-xs font-medium text-[#111318] dark:text-[#F4F4F6]"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="h-4 w-4 text-[#5A606B] dark:text-[#949AA6] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                {...register("password")}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••••••"
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

          {/* Signup / Affiliate Invite Code Input */}
          {signupCodeMode !== "DISABLED" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="signupCode"
                  className="block text-xs font-medium text-[#111318] dark:text-[#F4F4F6]"
                >
                  {signupCodeMode === "REQUIRED" ? (
                    <span>
                      Signup / Invite code <span className="text-red-600 dark:text-red-400">*</span>
                    </span>
                  ) : (
                    <span>
                      Signup / Invite code{" "}
                      <span className="text-[#5A606B] dark:text-[#949AA6] font-normal">(Optional)</span>
                    </span>
                  )}
                </label>
                {validatingCode && <Spinner className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />}
              </div>
              <div className="relative">
                <Ticket className="h-4 w-4 text-[#5A606B] dark:text-[#949AA6] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="signupCode"
                  {...register("signupCode")}
                  type="text"
                  placeholder="e.g. AGENT-123"
                  className="w-full h-10 rounded-lg bg-[#FAF9F6] dark:bg-[#0C0D10] border border-[#E5E2DC] dark:border-[#262A34] pl-9 pr-3 uppercase tracking-wider font-mono text-xs text-[#111318] dark:text-[#F4F4F6] placeholder:text-[#5A606B]/60 dark:placeholder:text-[#949AA6]/60 outline-none focus:border-blue-700 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-700/15 dark:focus:ring-blue-500/20 transition-colors"
                />
              </div>
              {codeStatus?.checked && (
                <p
                  className={`flex items-center gap-1.5 text-xs font-medium ${
                    codeStatus.valid
                      ? "text-green-700 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {codeStatus.valid ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>{codeStatus.message}</span>
                </p>
              )}
              {errors.signupCode && (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.signupCode.message}</p>
              )}
            </div>
          )}

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4 text-white" />
                <span>Creating account...</span>
              </>
            ) : hasFee ? (
              <>
                <span>Create Account &amp; Pay GHS {signupFee.amount.toFixed(2)}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          {/* Terms & Conditions Notice */}
          <p className="text-center text-[11px] text-[#5A606B] dark:text-[#949AA6] leading-relaxed pt-1">
            By registering, you agree to our{" "}
            <Link
              href="/terms"
              target="_blank"
              className="text-blue-700 dark:text-blue-400 hover:underline underline-offset-4"
            >
              Terms
            </Link>
            ,{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="text-blue-700 dark:text-blue-400 hover:underline underline-offset-4"
            >
              Privacy
            </Link>
            , and{" "}
            <Link
              href="/refund-policy"
              target="_blank"
              className="text-blue-700 dark:text-blue-400 hover:underline underline-offset-4"
            >
              Refunds
            </Link>
            .
          </p>
        </form>
      )}

      <AuthFooterLink
        href="/login"
        prompt="Already have an account?"
        cta="Sign in"
      />
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0C0D10] flex justify-center items-center">
          <Spinner className="h-7 w-7 text-blue-700 dark:text-blue-400" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

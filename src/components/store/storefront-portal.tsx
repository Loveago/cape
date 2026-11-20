"use client";

import * as React from "react";
import {
  Signal,
  ClipboardList,
  Star,
  Phone,
  MessageCircle,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Lock,
  Loader2,
  X,
  ShieldCheck,
  Sparkles,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { buildWhatsAppLink } from "@/lib/storefront-utils";
import type { NetworkProvider } from "@/lib/types";

export interface StorefrontProductItem {
  packageId: string;
  gbAmount: number;
  name: string;
  price: number; // in GHS
  network: NetworkProvider;
  validity?: string;
}

interface StorefrontPortalProps {
  storefront: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    whatsappGroupLink?: string | null;
    logoUrl?: string | null;
    reviewsEnabled?: boolean;
    afaEnabled?: boolean;
    afaPriceGHS?: number;
  };
  products: StorefrontProductItem[];
  availableNetworks: NetworkProvider[];
}

// Carrier prefix detection helper for Ghana
function detectCarrier(phone: string): { network: string; label: string; color: string } | null {
  const clean = phone.replace(/\D/g, "");
  if (clean.length < 3) return null;
  const prefix = clean.slice(0, 3);

  if (["024", "025", "053", "054", "055", "059"].includes(prefix)) {
    return { network: "MTN", label: "MTN Ghana", color: "#D97706" };
  }
  if (["020", "050"].includes(prefix)) {
    return { network: "TELECEL", label: "Telecel", color: "#DC2626" };
  }
  if (["027", "057", "026", "056"].includes(prefix)) {
    return { network: "AIRTELTIGO", label: "AirtelTigo", color: "#1D4ED8" };
  }
  return null;
}

function whatsappDirectLink(phone: string | null | undefined): string {
  const link = buildWhatsAppLink(phone);
  return link || "#";
}

function carrierMeta(network: NetworkProvider) {
  switch (network) {
    case "MTN":
      return {
        label: "MTN",
        barColor: "bg-[#FFCB05]",
        dotColor: "bg-[#FFCB05]",
        badgeBg: "bg-[#FFCB05]/15 text-[#92400E] dark:text-[#FBBF24]",
        arrowPill: "bg-[#FFCB05] text-[#111318]",
      };
    case "TELECEL":
      return {
        label: "Telecel",
        barColor: "bg-[#E4002B]",
        dotColor: "bg-[#E4002B]",
        badgeBg: "bg-[#E4002B]/10 text-[#B91C1C] dark:text-[#F87171]",
        arrowPill: "bg-[#E4002B] text-white",
      };
    case "AIRTELTIGO_BIGTIME":
      return {
        label: "AT Big Time",
        barColor: "bg-[#0284C7]",
        dotColor: "bg-[#0284C7]",
        badgeBg: "bg-[#0284C7]/10 text-[#0369A1] dark:text-[#38BDF8]",
        arrowPill: "bg-[#0284C7] text-white",
      };
    default:
      return {
        label: "AT iShare",
        barColor: "bg-[#005FB8]",
        dotColor: "bg-[#005FB8]",
        badgeBg: "bg-[#005FB8]/10 text-[#1D4ED8] dark:text-[#60A5FA]",
        arrowPill: "bg-[#005FB8] text-white",
      };
  }
}

export function StorefrontPortal({
  storefront,
  products,
  availableNetworks,
}: StorefrontPortalProps) {
  // Navigation tabs: data | track | afa | reviews
  const isReviewsEnabled = storefront.reviewsEnabled ?? true;
  const isAfaEnabled = Boolean(storefront.afaEnabled);
  const [activeTab, setActiveTab] = React.useState<"data" | "track" | "afa" | "reviews">("data");

  // Storefront AFA form state
  const [afaFullName, setAfaFullName] = React.useState("");
  const [afaPhone, setAfaPhone] = React.useState("");
  const [afaGhanaCard, setAfaGhanaCard] = React.useState("");
  const [afaLocation, setAfaLocation] = React.useState("");
  const [afaSubmitting, setAfaSubmitting] = React.useState(false);
  const [afaError, setAfaError] = React.useState("");

  React.useEffect(() => {
    if (!isReviewsEnabled && activeTab === "reviews") {
      setActiveTab("data");
    }
  }, [isReviewsEnabled, activeTab]);

  // Carrier filter: default to MTN if available, else first network
  const defaultNetwork = availableNetworks.includes("MTN")
    ? "MTN"
    : availableNetworks[0] || "MTN";
  const [activeNetwork, setActiveNetwork] = React.useState<string>(defaultNetwork);

  // Buy checkout modal state
  const [selectedProduct, setSelectedProduct] = React.useState<StorefrontProductItem | null>(null);
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [checkingOut, setCheckingOut] = React.useState(false);
  const [checkoutError, setCheckoutError] = React.useState("");

  // Tracking query & date filter state
  const [trackQuery, setTrackQuery] = React.useState("");
  const [trackDate, setTrackDate] = React.useState<string>("");
  const [trackDateMode, setTrackDateMode] = React.useState<"all" | "today" | "yesterday" | "past7" | "custom">("all");
  const [trackStartDate, setTrackStartDate] = React.useState<string>("");
  const [trackEndDate, setTrackEndDate] = React.useState<string>("");
  const [trackLoading, setTrackLoading] = React.useState(false);
  const [trackResult, setTrackResult] = React.useState<any[] | null>(null);
  const [trackError, setTrackError] = React.useState("");

  // Review states (real approved reviews)
  const [reviewsList, setReviewsList] = React.useState<any[]>([]);
  const [reviewsStats, setReviewsStats] = React.useState<{ averageRating: number; totalCount: number }>({
    averageRating: 5.0,
    totalCount: 0,
  });
  const [reviewsLoading, setReviewsLoading] = React.useState(false);
  const [reviewModalOpen, setReviewModalOpen] = React.useState(false);
  const [reviewRating, setReviewRating] = React.useState(5);
  const [reviewName, setReviewName] = React.useState("");
  const [reviewComment, setReviewComment] = React.useState("");
  const [submittingReview, setSubmittingReview] = React.useState(false);
  const [reviewSubmitted, setReviewSubmitted] = React.useState(false);
  const [reviewSubmitFeedback, setReviewSubmitFeedback] = React.useState<string>("");

  // Filter products by selected network
  const filteredProducts = React.useMemo(() => {
    return products
      .filter((p) => {
        if (activeNetwork === "ALL") return true;
        if (activeNetwork === "AIRTELTIGO_ISHARE" || activeNetwork === "AIRTELTIGO") {
          return p.network === "AIRTELTIGO";
        }
        return p.network === activeNetwork;
      })
      .sort((a, b) => a.gbAmount - b.gbAmount || a.price - b.price);
  }, [products, activeNetwork]);

  // Customer contact details
  const rawContact = storefront.whatsapp || storefront.phone || "";
  const displayPhone = rawContact || "0240000000";
  const waChatUrl = whatsappDirectLink(rawContact);
  const waGroupUrl = storefront.whatsappGroupLink || waChatUrl;

  // Real-time phone carrier check
  const carrierInfo = detectCarrier(phone);

  const handleOpenBuy = (pkg: StorefrontProductItem) => {
    setSelectedProduct(pkg);
    setCheckoutError("");
  };

  const handleCloseBuy = () => {
    if (checkingOut) return;
    setSelectedProduct(null);
    setCheckoutError("");
  };

  // Submit MoMo payment
  const handleProceedCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const cleanPhone = phone.replace(/\D/g, "").slice(0, 10);
    if (cleanPhone.length !== 10 || !cleanPhone.startsWith("0")) {
      setCheckoutError("Please enter a valid 10-digit Ghana mobile number (e.g. 0244123456).");
      return;
    }

    setCheckingOut(true);
    setCheckoutError("");

    try {
      const res = await fetch(`/api/store/${storefront.slug}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: selectedProduct.packageId,
          customerPhone: cleanPhone,
          customerEmail: email.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to initialize payment.");
      }

      // Save customer info in localStorage for future convenience
      try {
        localStorage.setItem("storefront_customer_phone", cleanPhone);
        if (email.trim()) localStorage.setItem("storefront_customer_email", email.trim());
      } catch {}

      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        throw new Error("No payment link returned by gateway.");
      }
    } catch (err: any) {
      setCheckoutError(err.message || "Failed to process payment. Please try again.");
      setCheckingOut(false);
    }
  };

  const handleSetTrackPreset = (mode: "all" | "today" | "yesterday" | "past7" | "custom") => {
    setTrackDateMode(mode);
    const now = new Date();
    const toYMD = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    if (mode === "all") {
      setTrackDate("");
      setTrackStartDate("");
      setTrackEndDate("");
    } else if (mode === "today") {
      setTrackDate(toYMD(now));
      setTrackStartDate("");
      setTrackEndDate("");
    } else if (mode === "yesterday") {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      setTrackDate(toYMD(y));
      setTrackStartDate("");
      setTrackEndDate("");
    } else if (mode === "past7") {
      const past = new Date(now);
      past.setDate(past.getDate() - 7);
      setTrackDate("");
      setTrackStartDate(toYMD(past));
      setTrackEndDate(toYMD(now));
    }
  };

  // Execute tracking search with date filter
  const handleExecuteTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = trackQuery.trim();
    if (!q) {
      setTrackError("Please enter a phone number or order reference.");
      return;
    }
    setTrackLoading(true);
    setTrackError("");
    setTrackResult(null);

    try {
      const res = await fetch(`/api/store/${storefront.slug}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          date: trackDate || undefined,
          startDate: trackStartDate || undefined,
          endDate: trackEndDate || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error looking up order.");
      setTrackResult(data.orders || []);
      if ((data.orders || []).length === 0) {
        setTrackError("No orders found matching this search criteria and date filter.");
      }
    } catch (err: any) {
      setTrackError(err.message || "Unable to retrieve order status.");
    } finally {
      setTrackLoading(false);
    }
  };

  // Load real approved storefront reviews
  const loadStoreReviews = React.useCallback(async () => {
    try {
      setReviewsLoading(true);
      const res = await fetch(`/api/store/${storefront.slug}/reviews`);
      const data = await res.json();
      if (res.ok) {
        setReviewsList(data.reviews || []);
        if (data.stats) setReviewsStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load storefront reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  }, [storefront.slug]);

  React.useEffect(() => {
    if (isReviewsEnabled) {
      loadStoreReviews();
    }
  }, [isReviewsEnabled, loadStoreReviews]);

  // Handle customer review submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/store/${storefront.slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: reviewName.trim(),
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to submit review.");
        return;
      }
      setReviewSubmitFeedback(data.message || "Thank you! Your review has been submitted for approval.");
      setReviewSubmitted(true);
      setReviewComment("");
    } catch {
      alert("Network error while submitting review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const storeTitle = storefront.name || "pycbundles Store";

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0C0D10] text-[#111318] dark:text-[#F4F4F6] font-sans pb-16">
      {/* ── 1. CLEAN MERCHANT HEADER ─────────────────────────────────────────── */}
      <header className="bg-white dark:bg-[#14161B] border-b border-[#E5E2DC] dark:border-[#262A34]">
        <div className="h-[3px] w-full bg-gradient-to-r from-[#1D4ED8] via-[#3B82F6] to-[#D97706]" />
        <div className="mx-auto max-w-xl px-4 py-6">
          <div className="flex flex-col items-center text-center gap-3">
            {/* Store Logo (Custom uploaded or Default Site Logo) */}
            <div className="h-12 w-12 rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-[#F3F1EC] dark:bg-[#1C1F26] flex items-center justify-center overflow-hidden shrink-0">
              {storefront.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={storefront.logoUrl}
                  alt={storeTitle}
                  className="h-full w-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/icon.svg"
                  alt={storeTitle}
                  className="h-9 w-9 object-contain"
                />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111318] dark:text-[#F4F4F6]">
                  {storeTitle}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-md border border-[#15803D]/25 dark:border-[#22C55E]/25 bg-[#15803D]/10 dark:bg-[#22C55E]/10 px-2 py-0.5 text-[10px] font-semibold text-[#15803D] dark:text-[#22C55E]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#15803D] dark:bg-[#22C55E]" />
                  Online
                </span>
              </div>

              {storefront.description && (
                <p className="text-xs sm:text-sm text-[#5A606B] dark:text-[#949AA6] max-w-md mx-auto leading-relaxed">
                  {storefront.description}
                </p>
              )}
            </div>

            {/* Contact Action Pills */}
            <div className="pt-1 flex items-center justify-center gap-2 flex-wrap">
              <a
                href={`tel:${displayPhone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] hover:bg-[#F3F1EC] dark:hover:bg-[#1C1F26] px-3 py-1.5 text-xs font-medium font-mono tabular-nums text-[#111318] dark:text-[#F4F4F6] transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-[#1D4ED8] dark:text-[#3B82F6]" />
                <span>{displayPhone}</span>
              </a>

              <a
                href={waChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] hover:bg-[#F3F1EC] dark:hover:bg-[#1C1F26] px-3 py-1.5 text-xs font-medium text-[#111318] dark:text-[#F4F4F6] transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5 text-[#15803D] dark:text-[#22C55E]" />
                <span>WhatsApp</span>
              </a>

              <a
                href={waGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] hover:bg-[#F3F1EC] dark:hover:bg-[#1C1F26] px-3 py-1.5 text-xs font-medium text-[#111318] dark:text-[#F4F4F6] transition-colors"
              >
                <Users className="h-3.5 w-3.5 text-[#D97706] dark:text-[#F59E0B]" />
                <span>WA Group</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. SEGMENTED TABS BAR (Buy Data | Track Order | Reviews) ─────────── */}
      <nav className="sticky top-0 z-30 bg-[#FAF9F6]/95 dark:bg-[#0C0D10]/95 backdrop-blur-md border-b border-[#E5E2DC] dark:border-[#262A34] px-3 sm:px-4 py-2.5">
        <div className="mx-auto max-w-xl">
          <div className="flex items-center gap-1 rounded-xl bg-[#F3F1EC] dark:bg-[#1C1F26] p-1 border border-[#E5E2DC] dark:border-[#262A34]">
            <button
              type="button"
              onClick={() => setActiveTab("data")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "data"
                  ? "bg-white dark:bg-[#14161B] text-[#111318] dark:text-[#F4F4F6] font-semibold shadow-xs border border-[#E5E2DC]/80 dark:border-[#262A34]"
                  : "text-[#5A606B] dark:text-[#949AA6] font-medium hover:text-[#111318] dark:hover:text-[#F4F4F6]"
              }`}
            >
              <Signal className={`h-3.5 w-3.5 ${activeTab === "data" ? "text-[#1D4ED8] dark:text-[#3B82F6]" : ""}`} />
              <span>Buy Data</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("track")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "track"
                  ? "bg-white dark:bg-[#14161B] text-[#111318] dark:text-[#F4F4F6] font-semibold shadow-xs border border-[#E5E2DC]/80 dark:border-[#262A34]"
                  : "text-[#5A606B] dark:text-[#949AA6] font-medium hover:text-[#111318] dark:hover:text-[#F4F4F6]"
              }`}
            >
              <ClipboardList className={`h-3.5 w-3.5 ${activeTab === "track" ? "text-[#1D4ED8] dark:text-[#3B82F6]" : ""}`} />
              <span>Track Order</span>
            </button>

            {isAfaEnabled && (
              <button
                type="button"
                onClick={() => setActiveTab("afa")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "afa"
                    ? "bg-white dark:bg-[#14161B] text-[#111318] dark:text-[#F4F4F6] font-semibold shadow-xs border border-[#E5E2DC]/80 dark:border-[#262A34]"
                    : "text-[#5A606B] dark:text-[#949AA6] font-medium hover:text-[#111318] dark:hover:text-[#F4F4F6]"
                }`}
              >
                <ShieldCheck className={`h-3.5 w-3.5 ${activeTab === "afa" ? "text-[#1D4ED8] dark:text-[#3B82F6]" : ""}`} />
                <span>AFA</span>
              </button>
            )}

            {isReviewsEnabled && (
              <button
                type="button"
                onClick={() => setActiveTab("reviews")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "reviews"
                    ? "bg-white dark:bg-[#14161B] text-[#111318] dark:text-[#F4F4F6] font-semibold shadow-xs border border-[#E5E2DC]/80 dark:border-[#262A34]"
                    : "text-[#5A606B] dark:text-[#949AA6] font-medium hover:text-[#111318] dark:hover:text-[#F4F4F6]"
                }`}
              >
                <Star className="h-3.5 w-3.5 fill-[#D97706] text-[#D97706] dark:fill-[#F59E0B] dark:text-[#F59E0B]" />
                <span>Reviews</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── 3. DATA PACKAGES VIEW ────────────────────────────────────────────── */}
      {activeTab === "data" && (
        <main className="mx-auto max-w-xl px-3 sm:px-4 pt-5">
          {/* Network Pills Toolbar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
            {/* MTN */}
            <button
              type="button"
              onClick={() => setActiveNetwork("MTN")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                activeNetwork === "MTN"
                  ? "bg-[#FFCB05] text-[#111318] border-[#EAB308]"
                  : "bg-white dark:bg-[#14161B] text-[#111318] dark:text-[#F4F4F6] border-[#E5E2DC] dark:border-[#262A34] hover:bg-[#F3F1EC] dark:hover:bg-[#1C1F26]"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${activeNetwork === "MTN" ? "bg-[#111318]" : "bg-[#FFCB05]"}`} />
              <span>MTN</span>
            </button>

            {/* Telecel */}
            <button
              type="button"
              onClick={() => setActiveNetwork("TELECEL")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                activeNetwork === "TELECEL"
                  ? "bg-[#E4002B] text-white border-[#E4002B]"
                  : "bg-white dark:bg-[#14161B] text-[#111318] dark:text-[#F4F4F6] border-[#E5E2DC] dark:border-[#262A34] hover:bg-[#F3F1EC] dark:hover:bg-[#1C1F26]"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${activeNetwork === "TELECEL" ? "bg-white" : "bg-[#E4002B]"}`} />
              <span>Telecel</span>
            </button>

            {/* AirtelTigo iShare */}
            <button
              type="button"
              onClick={() => setActiveNetwork("AIRTELTIGO_ISHARE")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                activeNetwork === "AIRTELTIGO_ISHARE" || activeNetwork === "AIRTELTIGO"
                  ? "bg-[#005FB8] text-white border-[#005FB8]"
                  : "bg-white dark:bg-[#14161B] text-[#111318] dark:text-[#F4F4F6] border-[#E5E2DC] dark:border-[#262A34] hover:bg-[#F3F1EC] dark:hover:bg-[#1C1F26]"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  activeNetwork === "AIRTELTIGO_ISHARE" || activeNetwork === "AIRTELTIGO"
                    ? "bg-white"
                    : "bg-[#005FB8]"
                }`}
              />
              <span>AT iShare</span>
            </button>

            {/* AirtelTigo Big Time */}
            {availableNetworks.includes("AIRTELTIGO_BIGTIME") && (
              <button
                type="button"
                onClick={() => setActiveNetwork("AIRTELTIGO_BIGTIME")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  activeNetwork === "AIRTELTIGO_BIGTIME"
                    ? "bg-[#0284C7] text-white border-[#0284C7]"
                    : "bg-white dark:bg-[#14161B] text-[#111318] dark:text-[#F4F4F6] border-[#E5E2DC] dark:border-[#262A34] hover:bg-[#F3F1EC] dark:hover:bg-[#1C1F26]"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${activeNetwork === "AIRTELTIGO_BIGTIME" ? "bg-white" : "bg-[#0284C7]"}`} />
                <span>AT Big Time</span>
              </button>
            )}
          </div>

          {/* Neutral High-Contrast Bundle Card Grid */}
          {filteredProducts.length === 0 ? (
            <div className="mt-6 rounded-xl bg-white dark:bg-[#14161B] p-8 text-center text-xs text-[#5A606B] dark:text-[#949AA6] border border-[#E5E2DC] dark:border-[#262A34]">
              No packages currently on sale for this network. Please select another network above.
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map((pkg) => {
                const meta = carrierMeta(pkg.network);

                return (
                  <button
                    key={pkg.packageId}
                    type="button"
                    onClick={() => handleOpenBuy(pkg)}
                    className="group flex flex-col justify-between rounded-xl bg-white dark:bg-[#14161B] border border-[#E5E2DC] dark:border-[#262A34] p-3.5 text-left transition-all hover:border-[#1D4ED8]/50 dark:hover:border-[#3B82F6]/60 hover:bg-[#FAF9F6] dark:hover:bg-[#1C1F26] active:scale-[0.98] cursor-pointer"
                  >
                    {/* Top Row: Validity + Status Dot */}
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="text-[11px] font-medium text-[#5A606B] dark:text-[#949AA6]">
                        {pkg.validity || "Non-Expiry"}
                      </span>
                      <span className="h-2 w-2 rounded-full bg-[#15803D] dark:bg-[#22C55E]" />
                    </div>

                    {/* Center: Bold Centered GB Size */}
                    <div className="my-4 text-center">
                      <span className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-[#111318] dark:text-[#F4F4F6]">
                        {pkg.gbAmount}
                      </span>
                      <span className="ml-0.5 text-xs sm:text-sm font-bold text-[#111318] dark:text-[#F4F4F6]">
                        GB
                      </span>
                    </div>

                    {/* Bottom Row: Price + Circular Arrow CTA */}
                    <div className="flex items-center justify-between gap-2 w-full pt-2.5 border-t border-[#E5E2DC]/80 dark:border-[#262A34]">
                      <span className="text-sm sm:text-base font-bold font-mono tabular-nums text-[#111318] dark:text-[#F4F4F6]">
                        ₵{pkg.price.toFixed(2)}
                      </span>
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5 ${meta.arrowPill}`}
                      >
                        <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* ── 4. ORDER STATUS / TRACKING TAB VIEW ──────────────────────────────── */}
      {activeTab === "track" && (
        <section className="mx-auto max-w-xl px-4 pt-5">
          <div className="rounded-xl bg-white dark:bg-[#14161B] p-5 border border-[#E5E2DC] dark:border-[#262A34] space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-[#111318] dark:text-[#F4F4F6]">
                Track Order Status
              </h2>
              <p className="text-xs text-[#5A606B] dark:text-[#949AA6]">
                Enter your recipient phone number or order reference to check live delivery telemetry.
              </p>
            </div>

            <form onSubmit={handleExecuteTrack} className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#5A606B] dark:text-[#949AA6]" />
                <input
                  type="text"
                  placeholder="e.g. 0244123456 or reference code"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] pl-9 pr-3 py-2 text-xs font-mono text-[#111318] dark:text-[#F4F4F6] placeholder:font-sans placeholder:text-[#5A606B]/60 dark:placeholder:text-[#949AA6]/60 focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] focus:outline-none transition-colors"
                />
              </div>

              {/* Date Filter Controls */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#5A606B] dark:text-[#949AA6] uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Filter By Order Date</span>
                  </label>
                  {(trackDate || trackStartDate) && (
                    <button
                      type="button"
                      onClick={() => handleSetTrackPreset("all")}
                      className="text-[10px] font-semibold text-[#DC2626] dark:text-[#EF4444] hover:underline cursor-pointer"
                    >
                      Clear Date
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: "all", label: "All Dates" },
                    { id: "today", label: "Today" },
                    { id: "yesterday", label: "Yesterday" },
                    { id: "past7", label: "Past 7 Days" },
                    { id: "custom", label: "Custom Date" },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSetTrackPreset(preset.id as any)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                        trackDateMode === preset.id
                          ? "bg-[#1D4ED8] dark:bg-[#3B82F6] text-white border-[#1D4ED8] dark:border-[#3B82F6]"
                          : "bg-[#FAF9F6] dark:bg-[#0C0D10] hover:bg-[#F3F1EC] dark:hover:bg-[#1C1F26] text-[#5A606B] dark:text-[#949AA6] border-[#E5E2DC] dark:border-[#262A34]"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {trackDateMode === "custom" && (
                  <div className="pt-1">
                    <input
                      type="date"
                      value={trackDate}
                      onChange={(e) => setTrackDate(e.target.value)}
                      className="w-full rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-3 py-1.5 text-xs text-[#111318] dark:text-[#F4F4F6] font-mono outline-none focus:border-[#1D4ED8] dark:focus:border-[#3B82F6]"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={trackLoading}
                className="w-full py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {trackLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Checking Status...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-3.5 w-3.5" />
                    <span>Track Order</span>
                  </>
                )}
              </button>
            </form>

            {trackError && (
              <div className="rounded-lg bg-[#B45309]/10 dark:bg-[#F59E0B]/10 border border-[#B45309]/25 dark:border-[#F59E0B]/25 p-3 text-xs text-[#B45309] dark:text-[#F59E0B] flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{trackError}</span>
              </div>
            )}

            {/* Tracking Results */}
            {trackResult && trackResult.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-[#E5E2DC] dark:border-[#262A34]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">
                  Found {trackResult.length} order(s)
                </span>

                {trackResult.map((ord: any) => {
                  const isDelivered =
                    ord.status === "COMPLETED" || ord.status === "DELIVERED";
                  const isProcessing =
                    ord.status === "PROCESSING" || ord.status === "PENDING";

                  return (
                    <div
                      key={ord.id || ord.reference}
                      className="p-3.5 rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-[#111318] dark:text-[#F4F4F6]">
                          {ord.package?.name || `${ord.network} ${ord.gbAmount}GB`}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isDelivered
                              ? "bg-[#15803D]/10 text-[#15803D] dark:bg-[#22C55E]/15 dark:text-[#22C55E]"
                              : isProcessing
                              ? "bg-[#D97706]/10 text-[#B45309] dark:bg-[#F59E0B]/15 dark:text-[#F59E0B]"
                              : "bg-[#DC2626]/10 text-[#DC2626] dark:bg-[#EF4444]/15 dark:text-[#EF4444]"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#5A606B] dark:text-[#949AA6] font-mono tabular-nums flex items-center justify-between">
                        <span>Recipient: {ord.phoneNumber}</span>
                        <span className="font-semibold text-[#111318] dark:text-[#F4F4F6]">
                          GH₵{ord.price?.toFixed(2) || "—"}
                        </span>
                      </div>

                      <div className="text-[10px] text-[#5A606B] dark:text-[#949AA6] font-mono tabular-nums">
                        Placed on {new Date(ord.createdAt).toLocaleDateString()} at{" "}
                        {new Date(ord.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>

                      {/* Not Received Help Button */}
                      {isProcessing && (
                        <div className="pt-1 flex justify-end">
                          <a
                            href={waChatUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-semibold text-[#1D4ED8] dark:text-[#3B82F6] hover:underline flex items-center gap-1"
                          >
                            <span>Need help with this order?</span>
                            <span>→</span>
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 4B. AFA REGISTRATION TAB VIEW ────────────────────────────────────── */}
      {isAfaEnabled && activeTab === "afa" && (
        <section className="mx-auto max-w-xl px-4 pt-5">
          <div className="rounded-xl bg-white dark:bg-[#14161B] border border-[#E5E2DC] dark:border-[#262A34] overflow-hidden">
            <div className="bg-[#1D4ED8] dark:bg-[#1E3A8A] px-5 py-4 text-white">
              <h2 className="text-base font-bold">AFA Registration</h2>
              <p className="mt-0.5 text-xs text-white/85">
                Submit your details and pay the registration fee securely via Mobile Money.
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setAfaError("");
                setAfaSubmitting(true);
                try {
                  const res = await fetch(`/api/store/${storefront.slug}/afa`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      fullName: afaFullName.trim(),
                      phone: afaPhone.trim().replace(/\D/g, "").slice(0, 10),
                      ghanaCard: afaGhanaCard.trim().toUpperCase(),
                      location: afaLocation.trim(),
                    }),
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    setAfaError(data.error || "Unable to initialize AFA registration.");
                    return;
                  }
                  if (data.authorizationUrl) {
                    window.location.href = data.authorizationUrl;
                  }
                } catch {
                  setAfaError("Network error. Please try again.");
                } finally {
                  setAfaSubmitting(false);
                }
              }}
              className="p-5 space-y-4"
            >
              <div className="rounded-xl border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-4 py-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">
                  Registration Fee
                </span>
                <span className="text-base font-bold font-mono tabular-nums text-[#111318] dark:text-[#F4F4F6]">
                  GHS {(storefront.afaPriceGHS ?? 11).toFixed(2)}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Kofi Mensah"
                  value={afaFullName}
                  onChange={(e) => setAfaFullName(e.target.value)}
                  className="w-full h-10 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-3 text-sm text-[#111318] dark:text-[#F4F4F6] focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">
                  Phone
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  placeholder="0241234567"
                  value={afaPhone}
                  onChange={(e) => setAfaPhone(e.target.value)}
                  className="w-full h-10 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-3 text-sm font-mono text-[#111318] dark:text-[#F4F4F6] focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">
                  Ghana Card (GHA-#########-#)
                </label>
                <input
                  type="text"
                  required
                  placeholder="GHA-123456789-0"
                  value={afaGhanaCard}
                  onChange={(e) => setAfaGhanaCard(e.target.value.toUpperCase())}
                  className="w-full h-10 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-3 text-sm font-mono text-[#111318] dark:text-[#F4F4F6] focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#5A606B] dark:text-[#949AA6]">
                  Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="Accra / Kumasi / Cape Coast"
                  value={afaLocation}
                  onChange={(e) => setAfaLocation(e.target.value)}
                  className="w-full h-10 rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-3 text-sm text-[#111318] dark:text-[#F4F4F6] focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] focus:outline-none"
                />
              </div>

              {afaError && (
                <div className="rounded-lg border border-[#DC2626]/30 bg-[#DC2626]/10 px-3 py-2 text-xs text-[#DC2626] dark:text-[#EF4444]">
                  {afaError}
                </div>
              )}

              <button
                type="submit"
                disabled={afaSubmitting}
                className="w-full h-11 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-xs font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {afaSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Initializing Payment...</span>
                  </>
                ) : (
                  <span>Pay GHS {(storefront.afaPriceGHS ?? 11).toFixed(2)} &amp; Register</span>
                )}
              </button>
            </form>
          </div>
        </section>
      )}

      {/* ── 5. REVIEWS TAB VIEW ──────────────────────────────────────────────── */}
      {isReviewsEnabled && activeTab === "reviews" && (
        <section className="mx-auto max-w-xl px-4 pt-5 space-y-4">
          {/* Rating Summary Card */}
          <div className="rounded-xl bg-white dark:bg-[#14161B] p-5 border border-[#E5E2DC] dark:border-[#262A34] text-center space-y-2">
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="h-5 w-5 fill-[#D97706] text-[#D97706] dark:fill-[#F59E0B] dark:text-[#F59E0B]" />
              ))}
            </div>

            <div className="text-2xl font-bold font-mono tabular-nums text-[#111318] dark:text-[#F4F4F6]">
              {reviewsStats.totalCount > 0 ? reviewsStats.averageRating.toFixed(1) : "5.0"} / 5.0
            </div>
            <p className="text-xs text-[#5A606B] dark:text-[#949AA6] max-w-sm mx-auto">
              {reviewsStats.totalCount > 0 ? (
                <>
                  Based on{" "}
                  <strong className="text-[#111318] dark:text-[#F4F4F6]">
                    {reviewsStats.totalCount} verified customer review{reviewsStats.totalCount === 1 ? "" : "s"}
                  </strong>
                  .
                </>
              ) : (
                <>Verified customer rating for this storefront.</>
              )}
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setReviewModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#D97706]/10 hover:bg-[#D97706]/15 dark:bg-[#F59E0B]/15 dark:hover:bg-[#F59E0B]/20 border border-[#D97706]/25 dark:border-[#F59E0B]/25 px-4 py-2 text-xs font-semibold text-[#B45309] dark:text-[#F59E0B] transition-colors cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Leave a Review</span>
              </button>
            </div>
          </div>

          {/* Testimonial Cards */}
          <div className="space-y-3">
            {reviewsLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#1D4ED8] dark:text-[#3B82F6] mx-auto" />
                <p className="text-xs text-[#5A606B] dark:text-[#949AA6] mt-2">Loading customer reviews...</p>
              </div>
            ) : reviewsList.length > 0 ? (
              reviewsList.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl bg-white dark:bg-[#14161B] border border-[#E5E2DC] dark:border-[#262A34] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-[#1D4ED8]/10 dark:bg-[#3B82F6]/15 text-[#1D4ED8] dark:text-[#3B82F6] font-bold text-xs flex items-center justify-center">
                        {rev.customerName ? rev.customerName[0].toUpperCase() : "C"}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#111318] dark:text-[#F4F4F6]">
                          {rev.customerName}
                        </div>
                        <div className="text-[10px] text-[#15803D] dark:text-[#22C55E] font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Verified Store Customer</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${
                            s <= rev.rating
                              ? "fill-[#D97706] text-[#D97706] dark:fill-[#F59E0B] dark:text-[#F59E0B]"
                              : "text-[#E5E2DC] dark:text-[#262A34]"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-[#5A606B] dark:text-[#949AA6] leading-relaxed pt-0.5">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  <div className="text-[10px] text-[#5A606B] dark:text-[#949AA6] font-mono tabular-nums text-right">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center rounded-xl bg-white dark:bg-[#14161B] border border-[#E5E2DC] dark:border-[#262A34] p-6 space-y-2">
                <Star className="h-8 w-8 text-[#D97706]/50 dark:text-[#F59E0B]/50 mx-auto" />
                <h4 className="text-sm font-bold text-[#111318] dark:text-[#F4F4F6]">No reviews yet</h4>
                <p className="text-xs text-[#5A606B] dark:text-[#949AA6] max-w-xs mx-auto">
                  Be the first customer to share your experience with this storefront!
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D4ED8]/10 hover:bg-[#1D4ED8]/15 dark:bg-[#3B82F6]/15 dark:hover:bg-[#3B82F6]/20 border border-[#1D4ED8]/20 dark:border-[#3B82F6]/25 px-3.5 py-1.5 text-xs font-semibold text-[#1D4ED8] dark:text-[#3B82F6] transition-colors cursor-pointer"
                  >
                    <span>Write First Review</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 6. INSTANT CHECKOUT POPUP MODAL ──────────────────────────────────── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/55 backdrop-blur-xs transition-opacity"
            onClick={handleCloseBuy}
          />

          <div className="relative w-full max-w-sm rounded-xl bg-white dark:bg-[#14161B] border border-[#E5E2DC] dark:border-[#262A34] shadow-xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className={`h-[3px] w-full ${carrierMeta(selectedProduct.network).barColor}`} />

            <div className="p-5 space-y-4">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#E5E2DC] dark:border-[#262A34] pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      carrierMeta(selectedProduct.network).badgeBg
                    }`}
                  >
                    {carrierMeta(selectedProduct.network).label}
                  </span>
                  <span className="text-xs font-bold text-[#111318] dark:text-[#F4F4F6]">
                    Instant Checkout
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCloseBuy}
                  className="p-1 rounded-lg text-[#5A606B] dark:text-[#949AA6] hover:text-[#111318] dark:hover:text-[#F4F4F6] hover:bg-[#F3F1EC] dark:hover:bg-[#1C1F26] transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Selected Bundle Summary */}
              <div className="rounded-xl bg-[#FAF9F6] dark:bg-[#0C0D10] p-3.5 border border-[#E5E2DC] dark:border-[#262A34] flex items-center justify-between">
                <div>
                  <div className="text-base font-bold text-[#111318] dark:text-[#F4F4F6] leading-tight">
                    {selectedProduct.gbAmount}GB Data Plan
                  </div>
                  <div className="text-[11px] text-[#5A606B] dark:text-[#949AA6] font-medium mt-0.5">
                    {selectedProduct.validity || "90 Days Validity · Non-Expiry"}
                  </div>
                </div>
                <span className="text-base font-bold text-[#111318] dark:text-[#F4F4F6] font-mono tabular-nums">
                  GH₵{selectedProduct.price.toFixed(2)}
                </span>
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleProceedCheckout} className="space-y-3.5">
                {/* Recipient Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#111318] dark:text-[#F4F4F6] flex items-center justify-between">
                    <span>Recipient Phone Number</span>
                    <span className="text-[10px] font-normal text-[#5A606B] dark:text-[#949AA6]">Ghana SIM</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    maxLength={10}
                    required
                    autoFocus
                    placeholder="0241234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="w-full rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-3.5 py-2.5 text-sm font-mono tabular-nums text-[#111318] dark:text-[#F4F4F6] placeholder:text-[#5A606B]/50 dark:placeholder:text-[#949AA6]/50 focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] outline-none transition-colors"
                  />

                  {/* Carrier detection badge */}
                  {carrierInfo && (
                    <div className="pt-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#15803D] dark:text-[#22C55E]">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>{carrierInfo.label} number recognized</span>
                    </div>
                  )}
                </div>

                {/* Customer Email */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#111318] dark:text-[#F4F4F6] flex items-center justify-between">
                    <span>Email Address</span>
                    <span className="text-[10px] font-normal text-[#5A606B] dark:text-[#949AA6]">Optional (for receipt)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="your-email@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-3.5 py-2 text-xs text-[#111318] dark:text-[#F4F4F6] placeholder:text-[#5A606B]/50 dark:placeholder:text-[#949AA6]/50 focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] outline-none transition-colors"
                  />
                </div>

                {checkoutError && (
                  <div className="rounded-lg bg-[#DC2626]/10 dark:bg-[#EF4444]/10 border border-[#DC2626]/25 dark:border-[#EF4444]/25 p-2.5 text-xs text-[#DC2626] dark:text-[#EF4444] flex items-start gap-1.5">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                {/* Fee Calculation Breakdown (below inputs) */}
                {(() => {
                  const sellingPesewas = Math.round(selectedProduct.price * 100);
                  const feePesewas = Math.round(sellingPesewas * 0.02);
                  const totalPesewas = sellingPesewas + feePesewas;
                  return (
                    <div className="rounded-xl bg-[#FAF9F6] dark:bg-[#0C0D10] p-3 border border-[#E5E2DC] dark:border-[#262A34] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[#5A606B] dark:text-[#949AA6]">
                        <span>Bundle Price</span>
                        <span className="font-mono tabular-nums">
                          GH₵{selectedProduct.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[#5A606B] dark:text-[#949AA6]">
                        <span>Processing Fee (2%)</span>
                        <span className="font-mono tabular-nums">
                          GH₵{(feePesewas / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-bold text-[#111318] dark:text-[#F4F4F6] pt-1.5 border-t border-[#E5E2DC] dark:border-[#262A34]">
                        <span>Total Payable</span>
                        <span className="text-sm text-[#1D4ED8] dark:text-[#3B82F6] font-mono tabular-nums">
                          GH₵{(totalPesewas / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Pay Button */}
                <button
                  type="submit"
                  disabled={checkingOut}
                  className="w-full py-3 bg-[#1D4ED8] hover:bg-[#1E40AF] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white font-semibold text-sm rounded-lg transition-colors active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {checkingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Connecting MoMo...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span className="font-mono tabular-nums">
                        Pay GH₵{((Math.round(selectedProduct.price * 100) + Math.round(Math.round(selectedProduct.price * 100) * 0.02)) / 100).toFixed(2)} via MoMo
                      </span>
                    </>
                  )}
                </button>

                {/* Security Footnote */}
                <div className="text-center pt-1 space-y-1">
                  <p className="text-[10px] text-[#5A606B] dark:text-[#949AA6] flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-[#15803D] dark:text-[#22C55E]" />
                    <span>256-bit Secure Mobile Money · Instant SIM Crediting</span>
                  </p>
                  <p className="text-[10px] text-[#5A606B] dark:text-[#949AA6] font-mono">
                    Supported: MTN MoMo · Telecel Cash · AT Money
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. LEAVE A REVIEW MODAL ─────────────────────────────────────────── */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/55 backdrop-blur-xs"
            onClick={() => setReviewModalOpen(false)}
          />

          <div className="relative w-full max-w-sm rounded-xl bg-white dark:bg-[#14161B] border border-[#E5E2DC] dark:border-[#262A34] p-5 shadow-xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E2DC] dark:border-[#262A34] pb-3">
              <h3 className="text-sm font-bold text-[#111318] dark:text-[#F4F4F6]">
                Write a Store Review
              </h3>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="p-1 rounded-lg text-[#5A606B] dark:text-[#949AA6] hover:text-[#111318] dark:hover:text-[#F4F4F6] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {reviewSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-[#15803D] dark:text-[#22C55E] mx-auto" />
                <h4 className="text-sm font-bold text-[#111318] dark:text-[#F4F4F6]">
                  Thank you for your feedback!
                </h4>
                <p className="text-xs text-[#5A606B] dark:text-[#949AA6]">
                  {reviewSubmitFeedback || "Your review has been submitted and will appear once approved by the store owner."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setReviewModalOpen(false);
                    setReviewSubmitted(false);
                  }}
                  className="mt-3 px-4 py-1.5 bg-[#1D4ED8] dark:bg-[#3B82F6] text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleReviewSubmit}
                className="space-y-3"
              >
                <div>
                  <label className="text-xs font-semibold text-[#111318] dark:text-[#F4F4F6] block mb-1">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setReviewRating(s)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            s <= reviewRating
                              ? "fill-[#D97706] text-[#D97706] dark:fill-[#F59E0B] dark:text-[#F59E0B]"
                              : "text-[#E5E2DC] dark:text-[#262A34]"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#111318] dark:text-[#F4F4F6]">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel K."
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] px-3 py-2 text-xs text-[#111318] dark:text-[#F4F4F6] outline-none focus:border-[#1D4ED8] dark:focus:border-[#3B82F6]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#111318] dark:text-[#F4F4F6]">Comment</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Share your experience with delivery speed, prices, etc."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full rounded-lg border border-[#E5E2DC] dark:border-[#262A34] bg-[#FAF9F6] dark:bg-[#0C0D10] p-3 text-xs text-[#111318] dark:text-[#F4F4F6] outline-none focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] disabled:opacity-60 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Submitting Review...</span>
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

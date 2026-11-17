import type { NetworkProvider } from "@/lib/types";

/** Public-facing carrier network metadata and storefront helpers. */
export const NETWORK_BRANDS: Record<
  NetworkProvider,
  { label: string; slug: string; tile: string; dim: string; accent: string }
> = {
  MTN: { label: "MTN", slug: "mtn", tile: "bg-[#FFCB05]", dim: "bg-[#a5830b]", accent: "#FFCB05" },
  TELECEL: { label: "Telecel", slug: "telecel", tile: "bg-[#E4002B]", dim: "bg-[#9c0020]", accent: "#E4002B" },
  AIRTELTIGO: { label: "AT iShare", slug: "airteltigo", tile: "bg-[#005fb8]", dim: "bg-[#004280]", accent: "#005FB8" },
  AIRTELTIGO_BIGTIME: { label: "AT Big Time", slug: "at-bigtime", tile: "bg-[#005fb8]", dim: "bg-[#004280]", accent: "#0284C7" },
};

export const NETWORK_ORDER: NetworkProvider[] = ["MTN", "TELECEL", "AIRTELTIGO", "AIRTELTIGO_BIGTIME"];

export function networkBySlug(slug: string): NetworkProvider | null {
  const entry = (Object.entries(NETWORK_BRANDS) as [NetworkProvider, { slug: string }][]).find(
    ([, brand]) => brand.slug === slug
  );
  return entry?.[0] ?? null;
}

export function networkHref(storeSlug: string, network: NetworkProvider): string {
  return `/${storeSlug}/${NETWORK_BRANDS[network].slug}`;
}

export function storeHref(storeSlug: string, subpath: string = ""): string {
  const cleanSub = subpath ? (subpath.startsWith("/") ? subpath : `/${subpath}`) : "";
  return `/${storeSlug}${cleanSub}`;
}

export function ghs(amount: number): string {
  return `₵${amount.toFixed(2)}`;
}

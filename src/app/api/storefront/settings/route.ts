import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleRouteError } from "@/lib/api-helpers";
import { storefrontSettingsSchema } from "@/lib/validation";
import { requireStorefront, isValidSlug, slugify, RESERVED_SLUGS, toPesewas } from "@/lib/storefront";
import { getAfaSettings } from "@/lib/afa";

/** Returns (and lazily fixes) the owner's storefront settings. */
export async function GET() {
  try {
    const user = await requireUser();
    const [storefront, afaSettings] = await Promise.all([
      requireStorefront(user.id),
      getAfaSettings(),
    ]);
    return NextResponse.json({ storefront, afaBaseFeeGHS: afaSettings.feeGHS, globalAfaEnabled: afaSettings.enabled });
  } catch (err) {
    return handleRouteError(err);
  }
}

/**
 * Updates the store profile. The storeName may also seed a slug change —
 * the slug is normalized and validated for collisions (§5).
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser();
    const storefront = await requireStorefront(user.id);
    const input = storefrontSettingsSchema.parse(await request.json());

    let newSlug: string | undefined = undefined;
    if (input.slug && input.slug.trim() !== storefront.slug) {
      const candidate = slugify(input.slug);
      if (!isValidSlug(candidate) || RESERVED_SLUGS.has(candidate)) {
        return NextResponse.json(
          { error: "Store address must be 3-32 lowercase letters, numbers, and hyphens, and not a reserved word" },
          { status: 400 }
        );
      }
      const taken = await prisma.storefront.findFirst({
        where: { slug: candidate, NOT: { id: storefront.id } },
      });
      if (taken) {
        return NextResponse.json({ error: "That store address is already taken" }, { status: 409 });
      }
      newSlug = candidate;
    }

    const resolvedWhatsApp = input.supportPhone?.trim() || input.phone?.trim() || null;

    let logoUrlUpdate: string | null | undefined = undefined;
    if (input.logoUrl !== undefined) {
      const trimmedLogo = input.logoUrl?.trim() || "";
      if (!trimmedLogo) {
        logoUrlUpdate = null;
      } else if (
        /^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,/i.test(trimmedLogo) ||
        /^https?:\/\//i.test(trimmedLogo)
      ) {
        logoUrlUpdate = trimmedLogo;
      } else {
        return NextResponse.json({ error: "Invalid logo image format" }, { status: 400 });
      }
    }

    let afaPricePesewasUpdate: number | null | undefined = undefined;
    if (input.afaPriceGHS !== undefined) {
      if (input.afaPriceGHS === null) {
        afaPricePesewasUpdate = null;
      } else {
        const afaSettings = await getAfaSettings();
        const candidatePesewas = toPesewas(input.afaPriceGHS);
        if (candidatePesewas < afaSettings.feePesewas) {
          return NextResponse.json(
            { error: `Storefront AFA price cannot be below base fee (GHS ${afaSettings.feeGHS.toFixed(2)})` },
            { status: 400 }
          );
        }
        afaPricePesewasUpdate = candidatePesewas;
      }
    }

    const updated = await prisma.storefront.update({
      where: { id: storefront.id },
      data: {
        name: input.storeName,
        ...(newSlug ? { slug: newSlug } : {}),
        description: input.description || null,
        phone: input.phone || null,
        whatsappGroupLink: input.whatsappGroupLink || null,
        whatsapp: resolvedWhatsApp,
        location: input.location || null,
        contactText: input.contactText || null,
        whatsappLabel: input.whatsappLabel || null,
        notice: input.notice !== undefined ? (input.notice?.trim() || null) : undefined,
        reviewsEnabled: input.reviewsEnabled !== undefined ? input.reviewsEnabled : undefined,
        ...(logoUrlUpdate !== undefined ? { logoUrl: logoUrlUpdate } : {}),
        ...(input.afaEnabled !== undefined ? { afaEnabled: input.afaEnabled } : {}),
        ...(afaPricePesewasUpdate !== undefined ? { afaPricePesewas: afaPricePesewasUpdate } : {}),
        ...(input.isActive !== undefined && storefront.status === "ENABLED"
          ? { isActive: input.isActive }
          : {}),
      },
    });
    return NextResponse.json({ storefront: updated });
  } catch (err) {
    return handleRouteError(err);
  }
}

/** Slug availability check + change (admin assigns initial slug on enable). */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const storefront = await requireStorefront(user.id);
    const body = (await request.json()) as { slug?: string };
    const slug = slugify(body.slug ?? "");
    if (!isValidSlug(slug) || RESERVED_SLUGS.has(slug)) {
      return NextResponse.json(
        { error: "Store address must be 3-32 lowercase letters, numbers, and hyphens, and not a reserved word" },
        { status: 400 }
      );
    }
    const taken = await prisma.storefront.findFirst({ where: { slug, NOT: { id: storefront.id } } });
    if (taken) return NextResponse.json({ error: "That store address is already taken" }, { status: 409 });

    const updated = await prisma.storefront.update({ where: { id: storefront.id }, data: { slug } });
    return NextResponse.json({ storefront: updated, message: "Store address updated successfully" });
  } catch (err) {
    return handleRouteError(err);
  }
}

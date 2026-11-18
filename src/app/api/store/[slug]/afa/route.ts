import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { apiError, getRequestOrigin, handleRouteError } from "@/lib/api-helpers";
import { afaRegistrationSchema } from "@/lib/validation";
import { getAfaSettings } from "@/lib/afa";
import { getEnabledStorefrontBySlug } from "@/lib/storefront";
import { initializeTransaction, isPaystackConfigured } from "@/lib/paystack";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const input = afaRegistrationSchema.parse(await request.json());

    const afaSettings = await getAfaSettings();
    if (!afaSettings.enabled) {
      return apiError(503, "AFA Registration is currently disabled by administrator.");
    }

    const storefront = await getEnabledStorefrontBySlug(slug);
    if (!storefront || storefront.status !== "ENABLED") {
      return apiError(404, "Store not found");
    }
    if (!storefront.isActive) {
      return apiError(400, "This store is temporarily paused by the owner.");
    }
    if (!storefront.afaEnabled) {
      return apiError(400, "AFA Registration is not enabled on this storefront.");
    }
    if (!(await isPaystackConfigured())) {
      return apiError(503, "Online payment is not available right now.");
    }

    const feePesewas =
      storefront.afaPricePesewas && storefront.afaPricePesewas >= afaSettings.feePesewas
        ? storefront.afaPricePesewas
        : afaSettings.feePesewas;
    const commissionPesewas = Math.max(0, feePesewas - afaSettings.feePesewas);

    const reference = `AFA-SF-${randomBytes(5).toString("hex").toUpperCase()}`;
    const origin = getRequestOrigin(request);
    const callbackUrl = `${origin}/api/store/paystack/callback`;
    const email = `afa-${input.phone}@pycbundles.com`;

    const paystack = await initializeTransaction({
      email,
      amountPesewas: feePesewas,
      reference,
      callbackUrl,
      metadata: {
        kind: "storefront_afa",
        storefrontId: storefront.id,
        slug: storefront.slug,
        phone: input.phone,
      },
    });

    if (!paystack?.authorization_url) {
      return apiError(502, "Failed to initialize Paystack checkout.");
    }

    await prisma.afaRegistration.create({
      data: {
        userId: storefront.userId,
        storefrontId: storefront.id,
        fullName: input.fullName,
        phone: input.phone,
        ghanaCard: input.ghanaCard,
        location: input.location,
        feePesewas,
        commissionPesewas,
        paymentMethod: "PAYSTACK",
        paymentReference: reference,
        paymentStatus: "PENDING",
        status: "PENDING",
      },
    });

    return NextResponse.json({
      authorizationUrl: paystack.authorization_url,
      reference,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

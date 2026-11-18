import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { apiError, handleRouteError } from "@/lib/api-helpers";
import { afaRegistrationSchema } from "@/lib/validation";
import { getAfaSettings } from "@/lib/afa";

export async function GET() {
  try {
    const user = await requireUser();
    const [afaSettings, dbUser, registrations] = await Promise.all([
      getAfaSettings(),
      prisma.user.findUnique({ where: { id: user.id }, select: { balance: true } }),
      prisma.afaRegistration.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    return NextResponse.json({
      enabled: afaSettings.enabled,
      feeGHS: afaSettings.feeGHS,
      walletBalance: dbUser?.balance ?? 0,
      registrations,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    if (user.status === "FROZEN") {
      return apiError(403, "Your account is frozen. Please contact support.");
    }

    const afaSettings = await getAfaSettings();
    if (!afaSettings.enabled) {
      return apiError(503, "AFA Registration is currently disabled by administrator.");
    }

    const input = afaRegistrationSchema.parse(await request.json());
    const feeGHS = afaSettings.feeGHS;
    const reference = `AFA-W-${randomBytes(5).toString("hex").toUpperCase()}`;

    const registration = await prisma.$transaction(async (tx) => {
      const freshUser = await tx.user.findUnique({
        where: { id: user.id },
        select: { balance: true },
      });
      if (!freshUser || freshUser.balance < feeGHS) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      if (feeGHS > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: { balance: { decrement: feeGHS } },
        });
        await tx.walletTransaction.create({
          data: {
            userId: user.id,
            type: "DEBIT",
            amount: feeGHS,
            status: "APPROVED",
            reference,
            note: `AFA Registration: ${input.fullName} (${input.phone})`,
          },
        });
      }

      return tx.afaRegistration.create({
        data: {
          userId: user.id,
          fullName: input.fullName,
          phone: input.phone,
          ghanaCard: input.ghanaCard,
          location: input.location,
          feePesewas: afaSettings.feePesewas,
          commissionPesewas: 0,
          paymentMethod: "WALLET",
          paymentReference: reference,
          paymentStatus: "PAID",
          status: "PENDING",
        },
      });
    });

    return NextResponse.json({ registration }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "INSUFFICIENT_BALANCE") {
      return apiError(400, "Insufficient wallet balance for AFA registration.");
    }
    return handleRouteError(err);
  }
}

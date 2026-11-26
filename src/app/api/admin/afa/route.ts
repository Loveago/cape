import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, handleRouteError } from "@/lib/api-helpers";
import { getAfaSettings } from "@/lib/afa";

const updateAfaSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED", "REFUNDED"]),
  adminNote: z.string().max(300).optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const statusFilter = request.nextUrl.searchParams.get("status");

    const [afaSettings, registrations] = await Promise.all([
      getAfaSettings(),
      prisma.afaRegistration.findMany({
        where: statusFilter && statusFilter !== "ALL" ? { status: statusFilter } : undefined,
        include: {
          user: { select: { id: true, name: true, email: true } },
          storefront: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
    ]);

    return NextResponse.json({
      settings: afaSettings,
      registrations,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const input = updateAfaSchema.parse(await request.json());

    const existing = await prisma.afaRegistration.findUnique({ where: { id: input.id } });
    if (!existing) return apiError(404, "AFA registration not found");

    const updated = await prisma.$transaction(async (tx) => {
      const shouldRefundWallet =
        input.status === "REFUNDED" &&
        existing.status !== "REFUNDED" &&
        existing.paymentStatus === "PAID" &&
        existing.paymentMethod === "WALLET" &&
        existing.feePesewas > 0 &&
        Boolean(existing.userId);

      if (shouldRefundWallet && existing.userId) {
        const feeGHS = existing.feePesewas / 100;
        const refundRef = `REFUND-${existing.paymentReference || existing.id}`;

        await tx.user.update({
          where: { id: existing.userId },
          data: { balance: { increment: feeGHS } },
        });
        await tx.walletTransaction.create({
          data: {
            userId: existing.userId,
            type: "REFUND",
            amount: feeGHS,
            status: "APPROVED",
            reference: refundRef,
            note: `Refund for AFA Registration: ${existing.fullName} (${existing.phone})`,
          },
        });
      }

      return tx.afaRegistration.update({
        where: { id: input.id },
        data: {
          status: input.status,
          paymentStatus:
            input.status === "REFUNDED" && existing.paymentStatus === "PAID"
              ? "REFUNDED"
              : undefined,
          adminNote: input.adminNote !== undefined ? input.adminNote?.trim() || null : undefined,
        },
      });
    });

    return NextResponse.json({ registration: updated });
  } catch (err) {
    return handleRouteError(err);
  }
}

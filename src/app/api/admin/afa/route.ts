import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, handleRouteError } from "@/lib/api-helpers";
import { getAfaSettings } from "@/lib/afa";

const updateAfaSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "REJECTED"]),
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

    const updated = await prisma.afaRegistration.update({
      where: { id: input.id },
      data: {
        status: input.status,
        adminNote: input.adminNote !== undefined ? input.adminNote?.trim() || null : undefined,
      },
    });

    return NextResponse.json({ registration: updated });
  } catch (err) {
    return handleRouteError(err);
  }
}

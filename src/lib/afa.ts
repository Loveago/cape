import { prisma } from "./prisma";
import { verifyTransaction } from "./paystack";
import { ensureWallet, toPesewas } from "./storefront";

export interface AfaSettings {
  enabled: boolean;
  feeGHS: number;
  feePesewas: number;
}

export async function getAfaSettings(): Promise<AfaSettings> {
  try {
    const rows = await prisma.systemSetting.findMany({
      where: { key: { in: ["afa_enabled", "afa_registration_fee"] } },
    });
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;

    const enabled = map.afa_enabled !== "false";
    const parsedFee = parseFloat(map.afa_registration_fee ?? "11");
    const feeGHS = Number.isFinite(parsedFee) && parsedFee >= 0 ? parsedFee : 11;
    return {
      enabled,
      feeGHS,
      feePesewas: toPesewas(feeGHS),
    };
  } catch {
    return { enabled: true, feeGHS: 11, feePesewas: 1100 };
  }
}

/**
 * Idempotently verifies and settles a Paystack-paid storefront AFA registration,
 * crediting the reseller's storefront wallet with their commission if applicable.
 */
export async function settleStorefrontAfaRegistration(reference: string): Promise<{
  settled: boolean;
  slug?: string;
}> {
  const row = await prisma.afaRegistration.findUnique({
    where: { paymentReference: reference },
    include: { storefront: { select: { id: true, slug: true, userId: true } } },
  });
  if (!row) return { settled: false };
  const slug = row.storefront?.slug;
  if (row.paymentStatus === "PAID") return { settled: true, slug };

  const verification = await verifyTransaction(reference);
  if (verification.status !== "success") {
    return { settled: false, slug };
  }
  const paidPesewas = verification.amount;
  if (typeof paidPesewas === "number" && paidPesewas < row.feePesewas) {
    return { settled: false, slug };
  }

  await prisma.$transaction(async (tx) => {
    const fresh = await tx.afaRegistration.findUnique({ where: { id: row.id } });
    if (!fresh || fresh.paymentStatus === "PAID") return;

    await tx.afaRegistration.update({
      where: { id: row.id },
      data: { paymentStatus: "PAID" },
    });

    if (row.storefront && row.commissionPesewas > 0) {
      await ensureWallet(row.storefront.userId);
      const commissionGHS = row.commissionPesewas / 100;
      const wallet = await tx.storefrontWallet.findUnique({
        where: { userId: row.storefront.userId },
      });
      if (wallet) {
        const nextBal = Math.round((wallet.balance + commissionGHS) * 100) / 100;
        await tx.storefrontWallet.update({
          where: { id: wallet.id },
          data: {
            balance: nextBal,
          },
        });
      }
    }
  });

  return { settled: true, slug };
}

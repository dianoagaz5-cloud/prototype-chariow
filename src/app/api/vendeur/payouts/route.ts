import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getSettings } from "@/lib/commission";

const schema = z.object({
  amount: z.number().int().min(1),
  provider: z.enum(["MTN_MOMO", "MOOV_MONEY", "CELTIIS_CASH"]),
  phone: z.string().min(6),
});

export async function POST(req: Request) {
  const user = await requireRole(["VENDEUR"]).catch(() => null);
  if (!user) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  if (!seller) return NextResponse.json({ ok: false, error: "Profil vendeur manquant" }, { status: 400 });
  if (seller.status !== "APPROVED")
    return NextResponse.json({ ok: false, error: "Boutique non approuvée" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  const { amount, provider, phone } = parsed.data;

  const settings = await getSettings();
  if (amount < settings.minPayoutAmount) {
    return NextResponse.json({ ok: false, error: `Minimum ${settings.minPayoutAmount} FCFA` }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const dec = await tx.seller.updateMany({
        where: { id: seller.id, balance: { gte: amount } },
        data: { balance: { decrement: amount } },
      });
      if (dec.count === 0) throw new Error("INSUFFICIENT_BALANCE");
      await tx.payout.create({
        data: {
          sellerId: seller.id,
          amount,
          provider,
          phone,
          status: "PENDING",
        },
      });
    });
  } catch (e) {
    if (e instanceof Error && e.message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json({ ok: false, error: "Solde insuffisant" }, { status: 400 });
    }
    throw e;
  }

  return NextResponse.json({ ok: true });
}

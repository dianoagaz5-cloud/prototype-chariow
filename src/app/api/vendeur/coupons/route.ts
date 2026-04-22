import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

const schema = z.object({
  code: z.string().min(3).max(20),
  percent: z.number().int().min(1).max(90).optional(),
  amount: z.number().int().min(100).optional(),
  maxUses: z.number().int().min(1).max(10000),
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
  const d = parsed.data;
  if (!d.percent && !d.amount) {
    return NextResponse.json({ ok: false, error: "Définir percent ou amount" }, { status: 400 });
  }
  try {
    const c = await prisma.coupon.create({
      data: {
        code: d.code,
        sellerId: seller.id,
        percent: d.percent,
        amount: d.amount,
        maxUses: d.maxUses,
      },
    });
    return NextResponse.json({ ok: true, id: c.id });
  } catch {
    return NextResponse.json({ ok: false, error: "Code déjà utilisé" }, { status: 400 });
  }
}

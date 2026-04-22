import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

const schema = z.object({ action: z.enum(["approve", "reject", "paid"]) });

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireRole(["ADMIN"]).catch(() => null);
  if (!admin) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  const { id } = await ctx.params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Action invalide" }, { status: 400 });

  const payout = await prisma.payout.findUnique({ where: { id } });
  if (!payout) return NextResponse.json({ ok: false, error: "Introuvable" }, { status: 404 });

  if (parsed.data.action === "reject") {
    if (payout.status !== "PENDING") {
      return NextResponse.json({ ok: false, error: "Statut invalide" }, { status: 400 });
    }
    await prisma.$transaction([
      prisma.payout.update({ where: { id }, data: { status: "REJECTED", processedAt: new Date() } }),
      prisma.seller.update({ where: { id: payout.sellerId }, data: { balance: { increment: payout.amount } } }),
    ]);
  } else if (parsed.data.action === "approve") {
    if (payout.status !== "PENDING") {
      return NextResponse.json({ ok: false, error: "Statut invalide" }, { status: 400 });
    }
    await prisma.payout.update({ where: { id }, data: { status: "APPROVED" } });
  } else {
    if (payout.status !== "APPROVED") {
      return NextResponse.json({ ok: false, error: "Statut invalide" }, { status: 400 });
    }
    await prisma.payout.update({ where: { id }, data: { status: "PAID", processedAt: new Date() } });
  }
  return NextResponse.json({ ok: true });
}

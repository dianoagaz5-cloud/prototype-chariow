import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ kind: string; id: string }> },
) {
  const user = await requireRole(["VENDEUR", "ADMIN"]).catch(() => null);
  if (!user) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  const { kind, id } = await ctx.params;
  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  const isAdmin = user.role === "ADMIN";

  if (kind === "product") {
    const p = await prisma.product.findUnique({ where: { id } });
    if (!p) return NextResponse.json({ ok: false, error: "Introuvable" }, { status: 404 });
    if (!isAdmin && p.sellerId !== seller?.id)
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 403 });
    await prisma.product.delete({ where: { id } });
  } else if (kind === "service") {
    const s = await prisma.service.findUnique({ where: { id } });
    if (!s) return NextResponse.json({ ok: false, error: "Introuvable" }, { status: 404 });
    if (!isAdmin && s.sellerId !== seller?.id)
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 403 });
    await prisma.service.delete({ where: { id } });
  } else if (kind === "ebook") {
    const e = await prisma.ebook.findUnique({ where: { id } });
    if (!e) return NextResponse.json({ ok: false, error: "Introuvable" }, { status: 404 });
    if (!isAdmin && e.sellerId !== seller?.id)
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 403 });
    await prisma.ebook.delete({ where: { id } });
  } else {
    return NextResponse.json({ ok: false, error: "Type invalide" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

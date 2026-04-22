import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

const schema = z.object({ action: z.enum(["approve", "reject"]) });

export async function POST(
  req: Request,
  ctx: { params: Promise<{ resource: string; id: string }> },
) {
  const admin = await requireRole(["ADMIN"]).catch(() => null);
  if (!admin) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  const { resource, id } = await ctx.params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Action invalide" }, { status: 400 });
  const status = parsed.data.action === "approve" ? "APPROVED" : "REJECTED";

  try {
    if (resource === "seller") {
      await prisma.seller.update({ where: { id }, data: { status } });
    } else if (resource === "product") {
      await prisma.product.update({ where: { id }, data: { status } });
    } else if (resource === "service") {
      await prisma.service.update({ where: { id }, data: { status } });
    } else if (resource === "ebook") {
      await prisma.ebook.update({ where: { id }, data: { status } });
    } else {
      return NextResponse.json({ ok: false, error: "Ressource invalide" }, { status: 400 });
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ ok: false, error: "Ressource introuvable" }, { status: 404 });
    }
    throw e;
  }
  return NextResponse.json({ ok: true });
}

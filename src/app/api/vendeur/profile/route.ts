import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

const schema = z.object({
  shopName: z.string().min(2),
  description: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().min(2),
  banner: z.string().optional(),
  avatar: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await requireRole(["VENDEUR"]).catch(() => null);
  if (!user) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  if (!seller) return NextResponse.json({ ok: false, error: "Profil vendeur manquant" }, { status: 400 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  const d = parsed.data;
  await prisma.seller.update({
    where: { id: seller.id },
    data: {
      shopName: d.shopName,
      description: d.description ?? "",
      phone: d.phone ?? "",
      city: d.city,
      banner: d.banner || null,
      avatar: d.avatar || null,
    },
  });
  return NextResponse.json({ ok: true });
}

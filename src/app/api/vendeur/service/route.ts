import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().int().min(0),
  negotiable: z.boolean().default(false),
  deliveryDays: z.number().int().min(0).optional(),
  categoryId: z.string(),
  images: z.array(z.string().url()).min(1),
});

export async function POST(req: Request) {
  const user = await requireRole(["VENDEUR"]).catch(() => null);
  if (!user) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  if (!seller) return NextResponse.json({ ok: false, error: "Profil vendeur manquant" }, { status: 400 });
  if (seller.status !== "APPROVED")
    return NextResponse.json({ ok: false, error: "Boutique non approuvée" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const d = parsed.data;
  const slug = `${slugify(d.name)}-${Date.now().toString(36)}`;

  const s = await prisma.service.create({
    data: {
      sellerId: seller.id,
      categoryId: d.categoryId,
      name: d.name,
      slug,
      description: d.description,
      price: d.price,
      negotiable: d.negotiable,
      deliveryDays: d.deliveryDays,
      images: JSON.stringify(d.images),
      status: "PENDING",
    },
  });
  return NextResponse.json({ ok: true, id: s.id });
}

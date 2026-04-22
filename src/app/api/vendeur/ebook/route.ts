import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().int().min(0),
  categoryId: z.string(),
  author: z.string().min(1),
  pages: z.number().int().min(1).optional(),
  cover: z.string().url(),
  fileUrl: z.string().url(),
  images: z.array(z.string().url()).optional(),
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

  const e = await prisma.ebook.create({
    data: {
      sellerId: seller.id,
      categoryId: d.categoryId,
      title: d.name,
      slug,
      description: d.description,
      price: d.price,
      cover: d.cover,
      fileUrl: d.fileUrl,
      pages: d.pages,
      author: d.author,
      status: "PENDING",
    },
  });
  return NextResponse.json({ ok: true, id: e.id });
}

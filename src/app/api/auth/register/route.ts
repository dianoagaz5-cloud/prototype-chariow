import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  phone: z.string().min(6).max(40).optional(),
  city: z.string().max(40).optional(),
  role: z.enum(["CLIENT", "VENDEUR"]),
  shopName: z.string().max(80).optional(),
  shopDescription: z.string().max(1000).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Données invalides." }, { status: 400 });
  }
  const { name, password, phone, city, role, shopName, shopDescription } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ ok: false, error: "Cet email est déjà utilisé." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { email, name, passwordHash, phone, city, role },
    });

    if (role === "VENDEUR") {
      const baseSlug = slugify(shopName || name);
      const fallback = `boutique-${created.id.slice(0, 6)}`;
      let slug = baseSlug || fallback;
      let i = 1;
      while (await tx.seller.findUnique({ where: { slug } })) {
        slug = `${baseSlug || fallback}-${i++}`;
      }
      await tx.seller.create({
        data: {
          userId: created.id,
          shopName: shopName || `Boutique de ${name}`,
          slug,
          description: shopDescription || "",
          phone: phone || "",
          city: city || "Cotonou",
          status: "PENDING",
        },
      });
    }

    return created;
  });

  await createSession(user);

  return NextResponse.json({ ok: true, user: { id: user.id, role: user.role } });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Identifiants invalides." }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();
  const { password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email }, include: { seller: true } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ ok: false, error: "Email ou mot de passe incorrect." }, { status: 401 });
  }

  await createSession(user);

  return NextResponse.json({
    ok: true,
    user: { id: user.id, role: user.role, hasSeller: !!user.seller },
  });
}

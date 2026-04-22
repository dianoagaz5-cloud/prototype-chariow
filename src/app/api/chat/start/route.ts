import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  sellerId: z.string(),
  subject: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "AUTH" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "BAD_INPUT" }, { status: 400 });

  const seller = await prisma.seller.findUnique({ where: { id: parsed.data.sellerId } });
  if (!seller) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });

  const thread = await prisma.chatThread.upsert({
    where: { buyerId_sellerId: { buyerId: user.id, sellerId: seller.id } },
    update: { subject: parsed.data.subject ?? undefined },
    create: {
      buyerId: user.id,
      sellerId: seller.id,
      subject: parsed.data.subject,
    },
  });

  const messages = await prisma.message.findMany({
    where: { threadId: thread.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    ok: true,
    threadId: thread.id,
    messages: messages.map((m) => ({
      id: m.id,
      authorId: m.authorId,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

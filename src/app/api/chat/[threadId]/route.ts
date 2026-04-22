import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function guard(threadId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "AUTH" as const, user: null, thread: null };
  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    include: { seller: true },
  });
  if (!thread) return { error: "NOT_FOUND" as const, user, thread: null };
  const isBuyer = thread.buyerId === user.id;
  const isSeller = thread.seller.userId === user.id;
  if (!isBuyer && !isSeller && user.role !== "ADMIN") {
    return { error: "FORBIDDEN" as const, user, thread };
  }
  return { error: null, user, thread };
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ threadId: string }> },
) {
  const { threadId } = await ctx.params;
  const g = await guard(threadId);
  if (g.error) {
    const status = g.error === "AUTH" ? 401 : g.error === "NOT_FOUND" ? 404 : 403;
    return NextResponse.json({ ok: false, error: g.error }, { status });
  }
  const messages = await prisma.message.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({
    ok: true,
    messages: messages.map((m) => ({
      id: m.id,
      authorId: m.authorId,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ threadId: string }> },
) {
  const { threadId } = await ctx.params;
  const g = await guard(threadId);
  if (g.error) {
    const status = g.error === "AUTH" ? 401 : g.error === "NOT_FOUND" ? 404 : 403;
    return NextResponse.json({ ok: false, error: g.error }, { status });
  }

  const body = (await req.json().catch(() => null)) as { body?: string } | null;
  const text = String(body?.body || "").trim();
  if (!text) return NextResponse.json({ ok: false, error: "EMPTY" }, { status: 400 });

  await prisma.message.create({
    data: {
      threadId,
      authorId: g.user!.id,
      body: text.slice(0, 2000),
    },
  });

  await prisma.chatThread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() },
  });

  const messages = await prisma.message.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    ok: true,
    messages: messages.map((m) => ({
      id: m.id,
      authorId: m.authorId,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

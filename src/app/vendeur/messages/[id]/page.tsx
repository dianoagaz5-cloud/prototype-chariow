import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ChatPanel } from "@/components/vendeur/chat-panel";

export const dynamic = "force-dynamic";

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  const thread = await prisma.chatThread.findUnique({
    where: { id },
    include: { buyer: true, messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!thread || !seller || thread.sellerId !== seller.id) notFound();

  return (
    <div>
      <h2 className="font-semibold mb-1">Conversation avec {thread.buyer.name}</h2>
      <p className="text-xs text-muted-foreground mb-4">{thread.buyer.email}</p>
      <ChatPanel
        threadId={thread.id}
        currentUserId={user.id}
        initialMessages={thread.messages.map((m) => ({
          id: m.id,
          body: m.body,
          authorId: m.authorId,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}

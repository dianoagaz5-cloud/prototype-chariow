import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function VendeurMessagesPage() {
  const user = await requireUser();
  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  if (!seller) return null;

  const threads = await prisma.chatThread.findMany({
    where: { sellerId: seller.id },
    include: {
      buyer: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <h2 className="font-semibold flex items-center gap-2 mb-4">
        <MessageSquare size={18} /> Messages clients
      </h2>
      {threads.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground">
          Aucune conversation pour le moment.
        </div>
      ) : (
        <ul className="space-y-2">
          {threads.map((t) => {
            const last = t.messages[0];
            return (
              <li key={t.id}>
                <Link
                  href={`/vendeur/messages/${t.id}`}
                  className="flex items-center gap-3 rounded-xl border bg-card p-3 hover:border-primary/40"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center font-bold">
                    {t.buyer.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-sm">{t.buyer.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(t.updatedAt).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {last ? last.body : "—"}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

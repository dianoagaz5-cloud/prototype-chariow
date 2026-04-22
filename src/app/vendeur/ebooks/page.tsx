import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatFCFA } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteListingButton } from "@/components/vendeur/delete-listing-button";

export const dynamic = "force-dynamic";

export default async function VendeurEbooksPage() {
  const user = await requireUser();
  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  if (!seller) return null;

  const ebooks = await prisma.ebook.findMany({
    where: { sellerId: seller.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-semibold">Ebooks ({ebooks.length})</h2>
        <Link href="/vendeur/ebooks/nouveau"><Button><Plus size={16} /> Nouvel ebook</Button></Link>
      </div>

      {ebooks.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground">Aucun ebook.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ebooks.map((e) => (
            <div key={e.id} className="rounded-xl border bg-card p-3 flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={e.cover} alt="" className="h-28 w-20 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-sm leading-tight line-clamp-2">{e.title}</div>
                  <StatusBadge status={e.status} />
                </div>
                <div className="text-[11px] text-muted-foreground">{e.author}</div>
                <div className="mt-2 font-semibold text-primary">{formatFCFA(e.price)}</div>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <Link href={`/ebook/${e.slug}`} target="_blank" className="underline">Voir</Link>
                  <DeleteListingButton kind="ebook" id={e.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") return <Badge variant="success">Publié</Badge>;
  if (status === "PENDING") return <Badge variant="warning">En attente</Badge>;
  if (status === "REJECTED") return <Badge variant="destructive">Refusé</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

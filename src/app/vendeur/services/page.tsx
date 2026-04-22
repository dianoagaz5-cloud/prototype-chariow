import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatFCFA } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseImages } from "@/lib/utils";
import { DeleteListingButton } from "@/components/vendeur/delete-listing-button";

export const dynamic = "force-dynamic";

export default async function VendeurServicesPage() {
  const user = await requireUser();
  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  if (!seller) return null;

  const services = await prisma.service.findMany({
    where: { sellerId: seller.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-semibold">Services ({services.length})</h2>
        <Link href="/vendeur/services/nouveau"><Button><Plus size={16} /> Nouveau service</Button></Link>
      </div>

      {services.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground">Aucun service.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((s) => {
            const img = parseImages(s.images)[0];
            return (
              <div key={s.id} className="flex gap-3 rounded-xl border bg-card p-3">
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" className="h-20 w-20 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium truncate">{s.name}</div>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="text-xs text-muted-foreground">{s.category.name}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="font-semibold text-primary text-sm">{formatFCFA(s.price)}{s.negotiable && <span className="ml-1 text-[11px] text-muted-foreground">· négociable</span>}</div>
                    <div className="inline-flex gap-2">
                      <Link href={`/service/${s.slug}`} target="_blank" className="text-xs underline">Voir</Link>
                      <DeleteListingButton kind="service" id={s.id} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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

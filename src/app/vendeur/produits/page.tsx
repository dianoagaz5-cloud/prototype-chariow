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

export default async function VendeurProduitsPage() {
  const user = await requireUser();
  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  if (!seller) return null;

  const products = await prisma.product.findMany({
    where: { sellerId: seller.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="font-semibold">Produits ({products.length})</h2>
          <p className="text-xs text-muted-foreground">Les produits sont validés par un admin avant publication.</p>
        </div>
        <Link href="/vendeur/produits/nouveau">
          <Button><Plus size={16} /> Nouveau produit</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground">
          Aucun produit. Commencez par créer votre premier produit.
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left border-b bg-muted/40">
              <tr>
                <th className="px-3 py-2">Produit</th>
                <th className="px-3 py-2">Catégorie</th>
                <th className="px-3 py-2">Prix</th>
                <th className="px-3 py-2">Stock</th>
                <th className="px-3 py-2">Ventes</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const img = parseImages(p.images)[0];
                return (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {img && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt="" className="h-10 w-10 rounded object-cover" />
                        )}
                        <div className="min-w-0">
                          <div className="font-medium truncate max-w-[220px]">{p.name}</div>
                          <div className="text-[11px] text-muted-foreground">{new Date(p.createdAt).toLocaleDateString("fr-FR")}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs">{p.category.name}</td>
                    <td className="px-3 py-2 font-semibold">{formatFCFA(p.price)}</td>
                    <td className="px-3 py-2">{p.stock}</td>
                    <td className="px-3 py-2">{p.soldCount}</td>
                    <td className="px-3 py-2"><StatusBadge status={p.status} /></td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex gap-2">
                        <Link href={`/produit/${p.slug}`} target="_blank" className="text-xs underline">Voir</Link>
                        <DeleteListingButton kind="product" id={p.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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

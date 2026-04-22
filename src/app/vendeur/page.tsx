import Link from "next/link";
import { TrendingUp, Package, Wrench, BookOpen, MessageSquare, Wallet, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatFCFA } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function VendeurHome() {
  const user = await requireUser();
  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  if (!seller) return null;

  const [productsCount, servicesCount, ebooksCount, orders, threads] = await Promise.all([
    prisma.product.count({ where: { sellerId: seller.id } }),
    prisma.service.count({ where: { sellerId: seller.id } }),
    prisma.ebook.count({ where: { sellerId: seller.id } }),
    prisma.orderItem.findMany({
      where: { sellerId: seller.id },
      include: { order: true },
      orderBy: { order: { createdAt: "desc" } },
      take: 8,
    }),
    prisma.chatThread.count({ where: { sellerId: seller.id } }),
  ]);

  const totalSales = orders
    .filter((o) => o.order.status === "PAID")
    .reduce((acc, o) => acc + o.price * o.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={<TrendingUp size={18} />} label="Solde disponible" value={formatFCFA(seller.balance)} hint="Retirable" />
        <Stat icon={<Wallet size={18} />} label="Ventes totales" value={formatFCFA(totalSales)} />
        <Stat icon={<Package size={18} />} label="Articles" value={`${productsCount + servicesCount + ebooksCount}`} hint={`${productsCount} prod · ${servicesCount} serv · ${ebooksCount} eb`} />
        <Stat icon={<MessageSquare size={18} />} label="Conversations" value={String(threads)} />
      </div>

      <section>
        <h2 className="font-semibold mb-3">Raccourcis</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/vendeur/produits/nouveau"><Button variant="outline" className="w-full justify-start"><Plus size={16} /><Package size={16} /> Nouveau produit</Button></Link>
          <Link href="/vendeur/services/nouveau"><Button variant="outline" className="w-full justify-start"><Plus size={16} /><Wrench size={16} /> Nouveau service</Button></Link>
          <Link href="/vendeur/ebooks/nouveau"><Button variant="outline" className="w-full justify-start"><Plus size={16} /><BookOpen size={16} /> Nouvel ebook</Button></Link>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Commandes récentes</h2>
          <Link href="/vendeur/retraits" className="text-sm text-primary hover:underline">
            Demander un retrait →
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground text-sm">
            Aucune vente pour le moment.
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-left border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-2">Commande</th>
                  <th className="px-4 py-2">Article</th>
                  <th className="px-4 py-2">Qté</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="px-4 py-2 font-mono text-xs">{o.order.number}</td>
                    <td className="px-4 py-2 truncate max-w-[260px]">{o.name}</td>
                    <td className="px-4 py-2">{o.quantity}</td>
                    <td className="px-4 py-2 font-semibold">{formatFCFA(o.price * o.quantity)}</td>
                    <td className="px-4 py-2">
                      <span className="text-xs px-2 py-0.5 rounded-full border">{o.order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs">{label}</span>
        <span className="h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center">{icon}</span>
      </div>
      <div className="mt-2 text-xl font-bold">{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
    </Card>
  );
}

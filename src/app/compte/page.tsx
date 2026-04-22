import Link from "next/link";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatFCFA } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?next=/compte");
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold">Mon compte</h1>
      <p className="text-sm text-muted-foreground">
        {user.name} · {user.email}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {user.role === "VENDEUR" && (
          <Link href="/vendeur"><Button variant="outline" size="sm">Espace vendeur</Button></Link>
        )}
        {user.role === "ADMIN" && (
          <Link href="/admin"><Button variant="outline" size="sm">Admin</Button></Link>
        )}
        <form action="/api/auth/logout" method="post">
          <Button type="submit" variant="outline" size="sm">Se déconnecter</Button>
        </form>
      </div>

      <section className="mt-10">
        <h2 className="font-semibold flex items-center gap-2">
          <Package size={18} /> Mes commandes
        </h2>
        {orders.length === 0 ? (
          <div className="mt-4 rounded-xl border bg-card p-8 text-center text-muted-foreground">
            Aucune commande.
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/commande/${o.id}`}
                  className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4 hover:border-primary/40"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{o.number}</span>
                      {o.status === "PAID" && <Badge variant="success">Payée</Badge>}
                      {o.status === "PENDING" && <Badge variant="warning">En attente</Badge>}
                      {o.status === "CANCELLED" && <Badge variant="destructive">Annulée</Badge>}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleString("fr-FR")} · {o.items.length} article(s)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-primary">{formatFCFA(o.total)}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

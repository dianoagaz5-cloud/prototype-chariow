import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Package, Wrench, BookOpen, MessageSquare, TicketPercent, Wallet, Store } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

const NAV = [
  { href: "/vendeur", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/vendeur/produits", label: "Produits", icon: Package },
  { href: "/vendeur/services", label: "Services", icon: Wrench },
  { href: "/vendeur/ebooks", label: "Ebooks", icon: BookOpen },
  { href: "/vendeur/messages", label: "Messages", icon: MessageSquare },
  { href: "/vendeur/coupons", label: "Coupons", icon: TicketPercent },
  { href: "/vendeur/retraits", label: "Retraits", icon: Wallet },
  { href: "/vendeur/boutique", label: "Ma boutique", icon: Store },
];

export default async function VendeurLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?next=/vendeur");
  if (user.role !== "VENDEUR" || !user.seller) redirect("/inscription?role=VENDEUR");

  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });

  return (
    <div className="container py-6 md:py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Espace vendeur</h1>
            <p className="text-xs text-muted-foreground">{seller?.shopName}</p>
          </div>
          {seller?.status === "PENDING" && (
            <Badge variant="warning">En attente de validation admin</Badge>
          )}
          {seller?.status === "APPROVED" && <Badge variant="success">Boutique active</Badge>}
          {seller?.status === "REJECTED" && <Badge variant="destructive">Refusée</Badge>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <aside className="md:sticky md:top-24 h-fit rounded-xl border bg-card p-2">
          <nav className="flex md:flex-col gap-1 overflow-x-auto">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted shrink-0"
              >
                <n.icon size={16} />
                <span>{n.label}</span>
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

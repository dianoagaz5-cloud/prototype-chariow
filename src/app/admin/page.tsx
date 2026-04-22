import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { Users, Package, Wallet, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [sellers, pendingSellers, pendingProducts, pendingServices, pendingEbooks, pendingPayouts, orders] =
    await Promise.all([
      prisma.seller.count(),
      prisma.seller.count({ where: { status: "PENDING" } }),
      prisma.product.count({ where: { status: "PENDING" } }),
      prisma.service.count({ where: { status: "PENDING" } }),
      prisma.ebook.count({ where: { status: "PENDING" } }),
      prisma.payout.count({ where: { status: "PENDING" } }),
      prisma.order.findMany({ where: { status: "PAID" } }),
    ]);
  const gmv = orders.reduce((a, o) => a + o.total, 0);
  const commissions = orders.reduce((a, o) => a + o.commission, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={<TrendingUp size={18} />} label="GMV total" value={formatFCFA(gmv)} />
        <Stat icon={<Wallet size={18} />} label="Commissions" value={formatFCFA(commissions)} />
        <Stat icon={<Users size={18} />} label="Vendeurs" value={String(sellers)} hint={`${pendingSellers} à valider`} />
        <Stat icon={<Package size={18} />} label="Articles en attente" value={String(pendingProducts + pendingServices + pendingEbooks)} />
      </div>

      <Card className="p-5">
        <h2 className="font-semibold mb-3">Actions requises</h2>
        <ul className="text-sm space-y-2">
          <li>📋 <strong>{pendingSellers}</strong> vendeur(s) en attente de validation</li>
          <li>📦 <strong>{pendingProducts}</strong> produit(s) en attente</li>
          <li>🔧 <strong>{pendingServices}</strong> service(s) en attente</li>
          <li>📚 <strong>{pendingEbooks}</strong> ebook(s) en attente</li>
          <li>💸 <strong>{pendingPayouts}</strong> retrait(s) en attente</li>
        </ul>
      </Card>
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

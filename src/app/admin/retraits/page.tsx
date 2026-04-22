import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { AdminPayoutActions } from "@/components/admin/payout-actions";

export const dynamic = "force-dynamic";

export default async function AdminPayoutsPage() {
  const payouts = await prisma.payout.findMany({
    include: { seller: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="font-semibold mb-4">Retraits ({payouts.length})</h2>
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left border-b bg-muted/40">
            <tr>
              <th className="px-3 py-2">Vendeur</th>
              <th className="px-3 py-2">Montant</th>
              <th className="px-3 py-2">Numéro</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="px-3 py-2">
                  <div className="font-medium">{p.seller.shopName}</div>
                  <div className="text-[11px] text-muted-foreground">{p.seller.user.email}</div>
                </td>
                <td className="px-3 py-2 font-semibold">{formatFCFA(p.amount)}</td>
                <td className="px-3 py-2 text-xs">
                  <div>{p.provider}</div>
                  <div className="text-muted-foreground">{p.phone}</div>
                </td>
                <td className="px-3 py-2 text-xs">{new Date(p.createdAt).toLocaleString("fr-FR")}</td>
                <td className="px-3 py-2">
                  {p.status === "PAID" && <Badge variant="success">Payé</Badge>}
                  {p.status === "APPROVED" && <Badge variant="success">Approuvé</Badge>}
                  {p.status === "PENDING" && <Badge variant="warning">En attente</Badge>}
                  {p.status === "REJECTED" && <Badge variant="destructive">Rejeté</Badge>}
                </td>
                <td className="px-3 py-2 text-right">
                  <AdminPayoutActions id={p.id} status={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatFCFA } from "@/lib/money";
import { getSettings } from "@/lib/commission";
import { PayoutRequestForm } from "@/components/vendeur/payout-form";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function PayoutsPage() {
  const user = await requireUser();
  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  if (!seller) return null;
  const settings = await getSettings();
  const payouts = await prisma.payout.findMany({
    where: { sellerId: seller.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-gradient-to-br from-primary/10 to-primary/0 p-5">
        <div className="text-xs text-muted-foreground">Solde disponible</div>
        <div className="mt-1 text-3xl font-bold text-primary">{formatFCFA(seller.balance)}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Retrait minimum : {formatFCFA(settings.minPayoutAmount)}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Demander un retrait</h2>
        <PayoutRequestForm balance={seller.balance} minAmount={settings.minPayoutAmount} />
      </section>

      <section>
        <h2 className="font-semibold mb-3">Historique</h2>
        {payouts.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            Aucun retrait.
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-left border-b bg-muted/40">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Montant</th>
                  <th className="px-3 py-2">Opérateur</th>
                  <th className="px-3 py-2">Téléphone</th>
                  <th className="px-3 py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-3 py-2 text-xs">{new Date(p.createdAt).toLocaleString("fr-FR")}</td>
                    <td className="px-3 py-2 font-semibold">{formatFCFA(p.amount)}</td>
                    <td className="px-3 py-2 text-xs">{p.provider}</td>
                    <td className="px-3 py-2 text-xs">{p.phone}</td>
                    <td className="px-3 py-2"><PayoutBadge status={p.status} /></td>
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

function PayoutBadge({ status }: { status: string }) {
  if (status === "PAID") return <Badge variant="success">Payé</Badge>;
  if (status === "APPROVED") return <Badge variant="success">Approuvé</Badge>;
  if (status === "PENDING") return <Badge variant="warning">En attente</Badge>;
  if (status === "REJECTED") return <Badge variant="destructive">Rejeté</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

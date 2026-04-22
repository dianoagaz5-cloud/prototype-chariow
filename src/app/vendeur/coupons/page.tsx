import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatFCFA } from "@/lib/money";
import { CouponForm } from "@/components/vendeur/coupon-form";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const user = await requireUser();
  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  if (!seller) return null;
  const coupons = await prisma.coupon.findMany({
    where: { sellerId: seller.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-semibold mb-3">Créer un coupon</h2>
        <CouponForm />
      </section>

      <section>
        <h2 className="font-semibold mb-3">Mes coupons</h2>
        {coupons.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            Aucun coupon.
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-left border-b bg-muted/40">
                <tr>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Réduction</th>
                  <th className="px-3 py-2">Util.</th>
                  <th className="px-3 py-2">Expire</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-mono">{c.code}</td>
                    <td className="px-3 py-2">
                      {c.percent ? `-${c.percent}%` : c.amount ? `-${formatFCFA(c.amount)}` : "—"}
                    </td>
                    <td className="px-3 py-2 text-xs">{c.uses}/{c.maxUses}</td>
                    <td className="px-3 py-2 text-xs">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("fr-FR") : "—"}</td>
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

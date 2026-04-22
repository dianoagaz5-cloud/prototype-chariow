import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { AdminActionButtons } from "@/components/admin/action-buttons";

export const dynamic = "force-dynamic";

export default async function AdminVendeursPage() {
  const sellers = await prisma.seller.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="font-semibold mb-4">Vendeurs ({sellers.length})</h2>
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left border-b bg-muted/40">
            <tr>
              <th className="px-3 py-2">Boutique</th>
              <th className="px-3 py-2">Contact</th>
              <th className="px-3 py-2">Ville</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="px-3 py-2">
                  <div className="font-medium">{s.shopName}</div>
                  <div className="text-[11px] text-muted-foreground">@{s.slug}</div>
                </td>
                <td className="px-3 py-2 text-xs">
                  <div>{s.user.name}</div>
                  <div className="text-muted-foreground">{s.user.email}</div>
                  <div className="text-muted-foreground">{s.phone}</div>
                </td>
                <td className="px-3 py-2 text-xs">{s.city}</td>
                <td className="px-3 py-2">
                  {s.status === "APPROVED" && <Badge variant="success">Approuvé</Badge>}
                  {s.status === "PENDING" && <Badge variant="warning">En attente</Badge>}
                  {s.status === "REJECTED" && <Badge variant="destructive">Refusé</Badge>}
                </td>
                <td className="px-3 py-2 text-right">
                  <AdminActionButtons resource="seller" id={s.id} status={s.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

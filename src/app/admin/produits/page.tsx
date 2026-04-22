import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { parseImages } from "@/lib/utils";
import { AdminActionButtons } from "@/components/admin/action-buttons";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const [products, services, ebooks] = await Promise.all([
    prisma.product.findMany({ include: { seller: true }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.service.findMany({ include: { seller: true }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.ebook.findMany({ include: { seller: true }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  return (
    <div className="space-y-8">
      <Section title={`Produits (${products.length})`}>
        <Table
          items={products.map((p) => ({
            id: p.id,
            name: p.name,
            image: parseImages(p.images)[0],
            seller: p.seller.shopName,
            price: p.price,
            status: p.status,
          }))}
          kind="product"
        />
      </Section>
      <Section title={`Services (${services.length})`}>
        <Table
          items={services.map((s) => ({
            id: s.id,
            name: s.name,
            image: parseImages(s.images)[0],
            seller: s.seller.shopName,
            price: s.price,
            status: s.status,
          }))}
          kind="service"
        />
      </Section>
      <Section title={`Ebooks (${ebooks.length})`}>
        <Table
          items={ebooks.map((e) => ({
            id: e.id,
            name: e.title,
            image: e.cover,
            seller: e.seller.shopName,
            price: e.price,
            status: e.status,
          }))}
          kind="ebook"
        />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Table({
  items,
  kind,
}: {
  items: { id: string; name: string; image?: string; seller: string; price: number; status: string }[];
  kind: "product" | "service" | "ebook";
}) {
  if (items.length === 0)
    return <div className="rounded-xl border bg-card p-6 text-center text-muted-foreground text-sm">Aucun.</div>;
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {items.map((i) => (
            <tr key={i.id} className="border-b last:border-0">
              <td className="px-3 py-2 w-14">
                {i.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.image} alt="" className="h-10 w-10 rounded object-cover" />
                )}
              </td>
              <td className="px-3 py-2">
                <div className="font-medium truncate max-w-[220px]">{i.name}</div>
                <div className="text-[11px] text-muted-foreground">{i.seller}</div>
              </td>
              <td className="px-3 py-2 font-semibold">{formatFCFA(i.price)}</td>
              <td className="px-3 py-2">
                {i.status === "APPROVED" && <Badge variant="success">OK</Badge>}
                {i.status === "PENDING" && <Badge variant="warning">En attente</Badge>}
                {i.status === "REJECTED" && <Badge variant="destructive">Refusé</Badge>}
              </td>
              <td className="px-3 py-2 text-right">
                <AdminActionButtons resource={kind} id={i.id} status={i.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

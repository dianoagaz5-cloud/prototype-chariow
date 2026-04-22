import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, Download, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatFCFA } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/connexion?next=/commande/${id}`);
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();
  if (order.userId !== user.id && user.role !== "ADMIN") notFound();

  const ebookItems = order.items.filter((i) => i.kind === "EBOOK");

  return (
    <div className="container py-12 max-w-3xl">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 grid place-items-center">
          <CheckCircle2 className="text-emerald-600" size={32} />
        </div>
        <h1 className="mt-4 text-2xl md:text-3xl font-bold">
          {order.status === "PAID" ? "Commande confirmée !" : "Commande reçue"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Numéro de commande :{" "}
          <span className="font-mono text-foreground">{order.number}</span>
        </p>
        <Badge variant={order.status === "PAID" ? "success" : "warning"} className="mt-3">
          {order.status === "PAID" ? "Payée" : "En attente de paiement"}
        </Badge>
      </div>

      <div className="mt-8 rounded-2xl border bg-card p-5">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Package size={16} /> Articles
        </h2>
        <ul className="divide-y">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between py-2">
              <div>
                <div className="text-sm font-medium">{i.name}</div>
                <div className="text-xs text-muted-foreground">
                  {i.kind === "PRODUCT" && `Produit × ${i.quantity}`}
                  {i.kind === "SERVICE" && "Service"}
                  {i.kind === "EBOOK" && "Ebook (PDF)"}
                </div>
              </div>
              <div className="text-sm font-semibold">{formatFCFA(i.price * i.quantity)}</div>
            </li>
          ))}
        </ul>
        <dl className="mt-4 border-t pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Sous-total</dt>
            <dd>{formatFCFA(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Livraison</dt>
            <dd>{order.shipping ? formatFCFA(order.shipping) : <span className="text-emerald-600">Gratuite</span>}</dd>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <dt className="font-medium">Total</dt>
            <dd className="text-lg font-bold text-primary">{formatFCFA(order.total)}</dd>
          </div>
        </dl>
      </div>

      {ebookItems.length > 0 && order.status === "PAID" && (
        <div className="mt-6 rounded-2xl border bg-card p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Download size={16} /> Vos ebooks
          </h2>
          <ul className="space-y-3">
            {ebookItems.map((i) => (
              <li key={i.id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{i.name}</div>
                  <div className="text-xs text-muted-foreground">Lien sécurisé (3 téléchargements max)</div>
                </div>
                <Link href={`/compte/telecharger/${order.id}`}>
                  <Button size="sm"><Download size={14} /> Télécharger</Button>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex gap-3 justify-center">
        <Link href="/"><Button variant="outline">Retour à l&apos;accueil</Button></Link>
        <Link href="/compte"><Button>Voir mes commandes</Button></Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Download, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DownloadPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/connexion?next=/compte/telecharger/${orderId}`);
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { ebook: true } },
      downloads: true,
    },
  });
  if (!order || order.userId !== user.id) notFound();

  const ebookItems = order.items.filter((i) => i.kind === "EBOOK" && i.ebook);

  return (
    <div className="container py-10 max-w-3xl">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Download size={22} /> Mes téléchargements
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Commande <span className="font-mono">{order.number}</span>
      </p>

      {ebookItems.length === 0 ? (
        <div className="mt-8 rounded-xl border bg-card p-8 text-center text-muted-foreground">
          Aucun ebook dans cette commande.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {ebookItems.map((i) => {
            const tok = order.downloads.find((d) => d.ebookId === i.ebookId);
            const remaining = tok ? Math.max(0, tok.maxUses - tok.uses) : 0;
            const expired = tok ? tok.expiresAt < new Date() : true;
            return (
              <li key={i.id} className="flex items-center gap-4 rounded-xl border bg-card p-4">
                {i.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.image} alt="" className="h-16 w-12 rounded object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{i.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
                    <BookOpen size={12} /> PDF · {remaining} téléchargement{remaining > 1 ? "s" : ""} restant{remaining > 1 ? "s" : ""}
                  </div>
                </div>
                {tok && !expired && remaining > 0 ? (
                  <Link href={`/api/ebooks/download/${tok.token}`}>
                    <Button size="sm"><Download size={14} /> Télécharger</Button>
                  </Link>
                ) : (
                  <Button size="sm" variant="outline" disabled>Indisponible</Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Download, Shield, User as UserIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/money";
import { StarRating } from "@/components/ui/star-rating";
import { AddToCartButton } from "@/components/common/add-to-cart-button";
import { ChatWidget } from "@/components/common/chat-widget";

export const dynamic = "force-dynamic";

export default async function EbookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ebook = await prisma.ebook.findUnique({
    where: { slug },
    include: { seller: true, category: true },
  });
  if (!ebook || ebook.status !== "APPROVED") notFound();

  return (
    <div className="container py-8">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/" className="hover:text-primary">Accueil</Link> /{" "}
        <Link href="/ebooks" className="hover:text-primary">Ebooks</Link> /{" "}
        <span className="text-foreground">{ebook.title}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
        <div>
          <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-muted shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ebook.cover} alt={ebook.title} className="h-full w-full object-cover" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BookOpen size={12} /> Ebook · {ebook.category.name}
          </div>
          <h1 className="mt-1 text-2xl md:text-3xl font-bold">{ebook.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
            <UserIcon size={12} /> Par {ebook.author}
          </p>

          <div className="mt-2 flex items-center gap-3 text-sm">
            <StarRating value={ebook.rating} />
            <span className="text-muted-foreground">{ebook.soldCount} ventes</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{formatFCFA(ebook.price)}</span>
          </div>

          <p className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap">{ebook.description}</p>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {ebook.pages && (
              <div className="rounded-lg border p-3">
                <dt className="text-xs text-muted-foreground">Pages</dt>
                <dd className="font-semibold">{ebook.pages}</dd>
              </div>
            )}
            {ebook.author && (
              <div className="rounded-lg border p-3">
                <dt className="text-xs text-muted-foreground">Auteur</dt>
                <dd className="font-semibold">{ebook.author}</dd>
              </div>
            )}
          </dl>

          <div className="mt-6">
            <AddToCartButton
              size="lg"
              item={{
                kind: "EBOOK",
                id: ebook.id,
                slug: ebook.slug,
                name: ebook.title,
                image: ebook.cover,
                price: ebook.price,
                sellerId: ebook.seller.id,
                sellerName: ebook.seller.shopName,
              }}
              label="Ajouter au panier"
            />
          </div>

          <div className="mt-3">
            <ChatWidget sellerId={ebook.seller.id} sellerName={ebook.seller.shopName} subject={`Ebook: ${ebook.title}`} />
          </div>

          <div className="mt-6 rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2"><Download size={12} /> Téléchargement immédiat après paiement</div>
            <div className="flex items-center gap-2"><Shield size={12} /> Lien sécurisé (expire après 7 jours)</div>
            <div className="flex items-center gap-2"><BookOpen size={12} /> 3 téléchargements max par achat</div>
          </div>
        </div>
      </div>
    </div>
  );
}

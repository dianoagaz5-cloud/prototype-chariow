import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Package, Shield, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import { formatFCFA } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { AddToCartButton } from "@/components/common/add-to-cart-button";
import { ChatWidget } from "@/components/common/chat-widget";
import { ProductCard } from "@/components/common/product-card";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      seller: true,
      category: true,
      reviews: { include: { user: true }, orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!product || product.status !== "APPROVED") notFound();

  const images = parseImages(product.images);
  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, status: "APPROVED", NOT: { id: product.id } },
    include: { seller: true },
    take: 5,
  });

  return (
    <div className="container py-8">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/" className="hover:text-primary">Accueil</Link> /{" "}
        <Link href="/boutique" className="hover:text-primary">Boutique</Link> /{" "}
        <Link href={`/boutique?cat=${product.category.slug}`} className="hover:text-primary">{product.category.name}</Link> /{" "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[0]} alt={product.name} className="h-full w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.slice(0, 5).map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={img} alt="" className="aspect-square w-full object-cover rounded-lg border" />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            {discount && <Badge variant="danger">-{discount}%</Badge>}
            {product.stock === 0 && <Badge variant="secondary">Rupture</Badge>}
            {product.stock > 0 && product.stock < 5 && <Badge variant="warning">Dernières unités</Badge>}
          </div>
          <h1 className="mt-2 text-2xl md:text-3xl font-bold">{product.name}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm">
            <StarRating value={product.rating} />
            <span className="text-muted-foreground">{product.ratingCount} avis · {product.soldCount} vendus</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{formatFCFA(product.price)}</span>
            {product.comparePrice && (
              <span className="text-lg text-muted-foreground line-through">{formatFCFA(product.comparePrice)}</span>
            )}
          </div>

          <p className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap">{product.description}</p>

          <div className="mt-6 rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-primary text-white grid place-items-center font-bold">
                {product.seller.shopName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/vendeurs/${product.seller.slug}`} className="font-semibold hover:text-primary">
                  {product.seller.shopName}
                </Link>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin size={12} /> {product.seller.city} <span>·</span>{" "}
                  <StarRating value={product.seller.rating} size={10} />
                </div>
              </div>
              <ChatWidget sellerId={product.seller.id} sellerName={product.seller.shopName} subject={`Produit: ${product.name}`} />
            </div>
          </div>

          <div className="mt-6">
            <AddToCartButton
              size="lg"
              showQty
              item={{
                kind: "PRODUCT",
                id: product.id,
                slug: product.slug,
                name: product.name,
                image: images[0] || null,
                price: product.price,
                sellerId: product.seller.id,
                sellerName: product.seller.shopName,
              }}
            />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
            <FeatureBadge icon={<Truck size={14} />} label="Livraison Bénin" />
            <FeatureBadge icon={<Shield size={14} />} label="Paiement sécurisé" />
            <FeatureBadge icon={<Package size={14} />} label="Vendeur vérifié" />
          </div>
        </div>
      </div>

      {product.reviews.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-bold">Avis clients</h2>
          <div className="mt-4 space-y-3">
            {product.reviews.map((r) => (
              <div key={r.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{r.user.name}</div>
                  <StarRating value={r.rating} size={12} showNumber={false} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-bold">Vous aimerez aussi</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {related.map((p) => {
              const imgs = parseImages(p.images);
              return (
                <ProductCard
                  key={p.id}
                  data={{
                    id: p.id,
                    slug: p.slug,
                    name: p.name,
                    price: p.price,
                    comparePrice: p.comparePrice,
                    image: imgs[0] || "",
                    rating: p.rating,
                    ratingCount: p.ratingCount,
                    soldCount: p.soldCount,
                    flashUntil: p.flashUntil,
                    sellerId: p.seller.id,
                    sellerName: p.seller.slug,
                  }}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function FeatureBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="rounded-lg border bg-card p-2 flex items-center gap-2 text-center justify-center">
      <span className="text-primary">{icon}</span>
      <span className="text-[11px] font-medium">{label}</span>
    </div>
  );
}

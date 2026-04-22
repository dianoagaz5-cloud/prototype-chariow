import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, MapPin, Shield, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import { formatFCFA } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { AddToCartButton } from "@/components/common/add-to-cart-button";
import { ChatWidget } from "@/components/common/chat-widget";

export const dynamic = "force-dynamic";

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await prisma.service.findUnique({
    where: { slug },
    include: { seller: true, category: true },
  });
  if (!service || service.status !== "APPROVED") notFound();
  const images = parseImages(service.images);

  return (
    <div className="container py-8">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/" className="hover:text-primary">Accueil</Link> /{" "}
        <Link href="/services" className="hover:text-primary">Services</Link> /{" "}
        <Link href={`/services?cat=${service.category.slug}`} className="hover:text-primary">{service.category.name}</Link> /{" "}
        <span className="text-foreground">{service.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[0]} alt={service.name} className="h-full w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {images.slice(0, 4).map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={img} alt="" className="aspect-video w-full object-cover rounded-lg border" />
              ))}
            </div>
          )}

          <h1 className="mt-6 text-2xl md:text-3xl font-bold">{service.name}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm">
            <StarRating value={service.rating} />
            <span className="text-muted-foreground">{service.ratingCount} avis · {service.soldCount} commandes</span>
          </div>

          <p className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap">{service.description}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {service.negotiable && <Badge variant="success">Prix négociable</Badge>}
            {service.deliveryDays && <Badge variant="secondary"><Clock size={10} className="mr-1" />{service.deliveryDays} jours</Badge>}
          </div>
        </div>

        <aside className="md:sticky md:top-28 h-fit space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="text-xs text-muted-foreground">À partir de</div>
            <div className="text-3xl font-bold text-primary">{formatFCFA(service.price)}</div>
            {service.negotiable && (
              <div className="mt-1 text-xs text-emerald-600 font-medium">Négociable avec le vendeur</div>
            )}
            <div className="mt-4">
              <AddToCartButton
                size="lg"
                item={{
                  kind: "SERVICE",
                  id: service.id,
                  slug: service.slug,
                  name: service.name,
                  image: images[0] || null,
                  price: service.price,
                  sellerId: service.seller.id,
                  sellerName: service.seller.shopName,
                }}
                label="Commander"
              />
            </div>
            <div className="mt-3">
              <ChatWidget sellerId={service.seller.id} sellerName={service.seller.shopName} subject={`Service: ${service.name}`} />
            </div>
            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Shield size={12} /> Paiement sécurisé</div>
              <div className="flex items-center gap-2"><Users size={12} /> Vendeur vérifié</div>
              <div className="flex items-center gap-2"><Clock size={12} /> Réponse rapide</div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <Link href={`/vendeurs/${service.seller.slug}`} className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-primary text-white grid place-items-center font-bold">
                {service.seller.shopName.charAt(0)}
              </div>
              <div>
                <div className="font-semibold">{service.seller.shopName}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin size={11} /> {service.seller.city}
                </div>
              </div>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

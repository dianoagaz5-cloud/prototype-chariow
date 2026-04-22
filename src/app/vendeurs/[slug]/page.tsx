import { notFound } from "next/navigation";
import { MapPin, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import { ProductCard } from "@/components/common/product-card";
import { ServiceCard } from "@/components/common/service-card";
import { EbookCard } from "@/components/common/ebook-card";
import { StarRating } from "@/components/ui/star-rating";
import { ChatWidget } from "@/components/common/chat-widget";

export const dynamic = "force-dynamic";

export default async function SellerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seller = await prisma.seller.findUnique({
    where: { slug },
    include: {
      products: { where: { status: "APPROVED" }, include: { seller: true } },
      services: { where: { status: "APPROVED" }, include: { seller: true } },
      ebooks: { where: { status: "APPROVED" } },
    },
  });
  if (!seller || seller.status !== "APPROVED") notFound();

  return (
    <div>
      <div className="relative h-52 md:h-64 bg-gradient-to-br from-primary/40 to-accent/40">
        {seller.banner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={seller.banner} alt="" className="h-full w-full object-cover" />
        )}
      </div>

      <div className="container -mt-16 relative z-10">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="h-24 w-24 md:h-28 md:w-28 overflow-hidden rounded-full border-4 border-white bg-muted shrink-0">
              {seller.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={seller.avatar} alt={seller.shopName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary text-white text-2xl font-bold">
                  {seller.shopName.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{seller.shopName}</h1>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin size={14} /> {seller.city}</span>
                <span className="flex items-center gap-1"><Phone size={14} /> {seller.phone}</span>
                <StarRating value={seller.rating} /> <span>({seller.ratingCount} avis)</span>
              </div>
              <p className="mt-3 text-sm text-foreground/90">{seller.description}</p>
            </div>
            <div className="flex flex-col gap-2">
              <ChatWidget sellerId={seller.id} sellerName={seller.shopName} />
            </div>
          </div>
        </div>

        {seller.products.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold">Produits ({seller.products.length})</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {seller.products.map((p) => {
                const images = parseImages(p.images);
                return (
                  <ProductCard
                    key={p.id}
                    data={{
                      id: p.id,
                      slug: p.slug,
                      name: p.name,
                      price: p.price,
                      comparePrice: p.comparePrice,
                      image: images[0] || "",
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

        {seller.services.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold">Services ({seller.services.length})</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {seller.services.map((s) => {
                const images = parseImages(s.images);
                return (
                  <ServiceCard
                    key={s.id}
                    data={{
                      id: s.id,
                      slug: s.slug,
                      name: s.name,
                      price: s.price,
                      negotiable: s.negotiable,
                      image: images[0] || "",
                      rating: s.rating,
                      ratingCount: s.ratingCount,
                      deliveryDays: s.deliveryDays,
                      sellerName: s.seller.shopName,
                      sellerAvatar: s.seller.avatar,
                    }}
                  />
                );
              })}
            </div>
          </section>
        )}

        {seller.ebooks.length > 0 && (
          <section className="mt-10 pb-10">
            <h2 className="text-xl font-bold">Ebooks ({seller.ebooks.length})</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {seller.ebooks.map((e) => (
                <EbookCard
                  key={e.id}
                  data={{
                    id: e.id,
                    slug: e.slug,
                    title: e.title,
                    author: e.author,
                    price: e.price,
                    cover: e.cover,
                    rating: e.rating,
                    pages: e.pages,
                    soldCount: e.soldCount,
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

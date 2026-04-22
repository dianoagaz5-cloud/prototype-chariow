import { Zap } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import { ProductCard } from "@/components/common/product-card";
import { Countdown } from "@/components/common/countdown";
import { HorizontalScroll } from "@/components/common/horizontal-scroll";

export async function FlashSalesSection() {
  const items = await prisma.product.findMany({
    where: { status: "APPROVED", flashUntil: { gt: new Date() } },
    include: { seller: true },
    take: 10,
    orderBy: { flashUntil: "asc" },
  });

  if (!items.length) return null;

  const end = items[0].flashUntil!;

  return (
    <section className="container my-10">
      <div className="rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 p-6 md:p-8 text-white">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 grid place-items-center">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold">Ventes Flash</h2>
              <p className="text-sm opacity-90">Dépêche-toi, ces offres sont limitées !</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="opacity-90">Se termine dans</span>
            <Countdown to={end} />
          </div>
        </div>

        <HorizontalScroll>
          {items.map((p) => {
            const images = parseImages(p.images);
            return (
              <div key={p.id} className="w-52 md:w-56 shrink-0 snap-start">
                <ProductCard
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
              </div>
            );
          })}
        </HorizontalScroll>

        <div className="mt-4 text-right">
          <Link href="/boutique?flash=1" className="text-sm font-semibold underline-offset-4 hover:underline">
            Voir tous les flashs →
          </Link>
        </div>
      </div>
    </section>
  );
}

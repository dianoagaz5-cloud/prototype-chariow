import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import { ProductCard } from "@/components/common/product-card";
import { SectionHeading } from "@/components/common/section-heading";

export async function PopularProductsSection() {
  const products = await prisma.product.findMany({
    where: { status: "APPROVED" },
    include: { seller: true },
    orderBy: { soldCount: "desc" },
    take: 10,
  });

  return (
    <section className="container my-10">
      <SectionHeading
        title="Produits populaires"
        subtitle="Les plus vendus cette semaine"
        href="/boutique"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((p) => {
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
  );
}

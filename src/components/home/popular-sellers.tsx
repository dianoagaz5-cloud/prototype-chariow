import { prisma } from "@/lib/prisma";
import { SellerCard } from "@/components/common/seller-card";
import { SectionHeading } from "@/components/common/section-heading";

export async function PopularSellersSection() {
  const sellers = await prisma.seller.findMany({
    where: { status: "APPROVED" },
    orderBy: { rating: "desc" },
    take: 6,
  });
  const sellersWithCounts = await Promise.all(
    sellers.map(async (s) => ({
      ...s,
      productCount: await prisma.product.count({ where: { sellerId: s.id, status: "APPROVED" } }),
    })),
  );

  return (
    <section className="container my-10">
      <SectionHeading
        title="Vendeurs populaires"
        subtitle="Nos boutiques les plus appréciées"
        href="/vendeurs"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sellersWithCounts.map((s) => (
          <SellerCard
            key={s.id}
            data={{
              slug: s.slug,
              shopName: s.shopName,
              city: s.city,
              avatar: s.avatar,
              banner: s.banner,
              rating: s.rating,
              productCount: s.productCount,
            }}
          />
        ))}
      </div>
    </section>
  );
}

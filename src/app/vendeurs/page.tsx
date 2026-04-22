import { prisma } from "@/lib/prisma";
import { SellerCard } from "@/components/common/seller-card";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vendeurs" };

export default async function SellersPage() {
  const sellers = await prisma.seller.findMany({
    where: { status: "APPROVED" },
    orderBy: { rating: "desc" },
  });
  const withCounts = await Promise.all(
    sellers.map(async (s) => ({
      ...s,
      productCount: await prisma.product.count({ where: { sellerId: s.id, status: "APPROVED" } }),
    })),
  );

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold md:text-3xl">Nos vendeurs</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Des boutiques vérifiées, partout au Bénin.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {withCounts.map((s) => (
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
    </div>
  );
}

import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import { ProductCard } from "@/components/common/product-card";

export const dynamic = "force-dynamic";
export const metadata = { title: "Boutique" };

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; sort?: string; flash?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const catSlug = sp.cat;
  const sort = sp.sort || "popular";
  const isFlash = sp.flash === "1";

  const categories = await prisma.category.findMany({ where: { kind: "PRODUCT" } });
  const selectedCat = catSlug ? categories.find((c) => c.slug === catSlug) : null;

  const where: Prisma.ProductWhereInput = {
    status: "APPROVED",
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...(selectedCat && { categoryId: selectedCat.id }),
    ...(isFlash && { flashUntil: { gt: new Date() } }),
  };

  const orderBy =
    sort === "price-asc"
      ? { price: "asc" as const }
      : sort === "price-desc"
      ? { price: "desc" as const }
      : sort === "new"
      ? { createdAt: "desc" as const }
      : { soldCount: "desc" as const };

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, include: { seller: true }, orderBy, take: 60 }),
    prisma.product.count({ where }),
  ]);

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold md:text-3xl">Boutique</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {total} produit{total > 1 ? "s" : ""} {q && <>pour « {q} »</>}
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr]">
        {/* Sidebar filters */}
        <aside className="space-y-4">
          <div className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Catégories</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href={`/boutique${q ? `?q=${q}` : ""}`} className={`block rounded px-2 py-1.5 ${!catSlug ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                  Toutes
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/boutique?cat=${c.slug}${q ? `&q=${q}` : ""}`}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 ${catSlug === c.slug ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                  >
                    <span>{c.icon}</span> {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Trier par</h3>
            <div className="flex flex-col gap-1 text-sm">
              {[
                { v: "popular", l: "Populaires" },
                { v: "new", l: "Nouveautés" },
                { v: "price-asc", l: "Prix croissant" },
                { v: "price-desc", l: "Prix décroissant" },
              ].map((o) => {
                const params = new URLSearchParams();
                if (q) params.set("q", q);
                if (catSlug) params.set("cat", catSlug);
                if (isFlash) params.set("flash", "1");
                params.set("sort", o.v);
                return (
                  <Link
                    key={o.v}
                    href={`/boutique?${params}`}
                    className={`rounded px-2 py-1.5 ${sort === o.v ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                  >
                    {o.l}
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        <div>
          {products.length === 0 ? (
            <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
              Aucun produit trouvé. Essaye un autre filtre ou mot-clé.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
          )}
        </div>
      </div>
    </div>
  );
}

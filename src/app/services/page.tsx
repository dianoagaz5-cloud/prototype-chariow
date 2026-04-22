import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import { ServiceCard } from "@/components/common/service-card";

export const dynamic = "force-dynamic";
export const metadata = { title: "Services" };

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const catSlug = sp.cat;

  const categories = await prisma.category.findMany({ where: { kind: "SERVICE" } });
  const selectedCat = catSlug ? categories.find((c) => c.slug === catSlug) : null;

  const where: Prisma.ServiceWhereInput = {
    status: "APPROVED",
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...(selectedCat && { categoryId: selectedCat.id }),
  };

  const services = await prisma.service.findMany({
    where,
    include: { seller: true },
    orderBy: { soldCount: "desc" },
  });

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold md:text-3xl">Services</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Des professionnels du Bénin à votre service.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={`/services${q ? `?q=${q}` : ""}`}
          className={`rounded-full border px-3 py-1.5 text-xs ${!catSlug ? "bg-primary text-white border-primary" : "hover:bg-muted"}`}
        >
          Toutes
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/services?cat=${c.slug}${q ? `&q=${q}` : ""}`}
            className={`rounded-full border px-3 py-1.5 text-xs ${catSlug === c.slug ? "bg-primary text-white border-primary" : "hover:bg-muted"}`}
          >
            <span className="mr-1">{c.icon}</span>
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        {services.length === 0 ? (
          <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
            Aucun service pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => {
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
        )}
      </div>
    </div>
  );
}

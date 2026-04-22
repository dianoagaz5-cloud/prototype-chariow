import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { EbookCard } from "@/components/common/ebook-card";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ebooks" };

export default async function EbooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const catSlug = sp.cat;

  const categories = await prisma.category.findMany({ where: { kind: "EBOOK" } });
  const selectedCat = catSlug ? categories.find((c) => c.slug === catSlug) : null;

  const where: Prisma.EbookWhereInput = {
    status: "APPROVED",
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { author: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...(selectedCat && { categoryId: selectedCat.id }),
  };

  const ebooks = await prisma.ebook.findMany({
    where,
    orderBy: { soldCount: "desc" },
  });

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold md:text-3xl">Ebooks</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Des savoirs accessibles, en téléchargement immédiat.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={`/ebooks${q ? `?q=${q}` : ""}`}
          className={`rounded-full border px-3 py-1.5 text-xs ${!catSlug ? "bg-primary text-white border-primary" : "hover:bg-muted"}`}
        >
          Tous
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/ebooks?cat=${c.slug}${q ? `&q=${q}` : ""}`}
            className={`rounded-full border px-3 py-1.5 text-xs ${catSlug === c.slug ? "bg-primary text-white border-primary" : "hover:bg-muted"}`}
          >
            <span className="mr-1">{c.icon}</span>
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        {ebooks.length === 0 ? (
          <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
            Aucun ebook pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {ebooks.map((e) => (
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
        )}
      </div>
    </div>
  );
}

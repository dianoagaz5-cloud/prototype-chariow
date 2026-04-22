import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/common/section-heading";

export async function CategoriesSection() {
  const cats = await prisma.category.findMany({ where: { kind: "PRODUCT" }, take: 12 });
  const catsWithCounts = await Promise.all(
    cats.map(async (c) => ({
      ...c,
      count: await prisma.product.count({ where: { categoryId: c.id, status: "APPROVED" } }),
    })),
  );

  return (
    <section className="container my-10">
      <SectionHeading title="Parcourir par catégorie" subtitle="Explorez les univers de la marketplace" href="/boutique" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {catsWithCounts.map((c) => (
          <Link
            key={c.id}
            href={`/boutique?cat=${c.slug}`}
            className="group relative overflow-hidden rounded-2xl border bg-white p-4 text-center transition-all hover:-translate-y-1 hover:shadow-lg hover:border-primary"
          >
            <div className="mb-2 text-3xl transition-transform group-hover:scale-110">{c.icon}</div>
            <div className="text-sm font-semibold line-clamp-1">{c.name}</div>
            <div className="text-xs text-muted-foreground">{c.count} produits</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

import { prisma } from "@/lib/prisma";
import { EbookCard } from "@/components/common/ebook-card";
import { SectionHeading } from "@/components/common/section-heading";

export async function EbooksSection() {
  const ebooks = await prisma.ebook.findMany({
    where: { status: "APPROVED" },
    orderBy: { featured: "desc" },
    take: 5,
  });

  return (
    <section className="container my-10">
      <SectionHeading
        title="Ebooks recommandés"
        subtitle="Apprendre, entreprendre, grandir — en PDF"
        href="/ebooks"
      />
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
    </section>
  );
}

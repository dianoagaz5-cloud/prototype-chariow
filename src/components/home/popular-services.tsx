import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import { ServiceCard } from "@/components/common/service-card";
import { SectionHeading } from "@/components/common/section-heading";

export async function PopularServicesSection() {
  const services = await prisma.service.findMany({
    where: { status: "APPROVED" },
    include: { seller: true },
    orderBy: { soldCount: "desc" },
    take: 6,
  });

  return (
    <section className="container my-10">
      <SectionHeading
        title="Services populaires"
        subtitle="Développement, design, réparation, livraison…"
        href="/services"
      />
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
    </section>
  );
}

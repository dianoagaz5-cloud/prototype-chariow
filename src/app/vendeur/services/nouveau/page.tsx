import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ListingForm } from "@/components/vendeur/listing-form";

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  await requireRole(["VENDEUR"]);
  const categories = await prisma.category.findMany({ where: { kind: "SERVICE" }, orderBy: { name: "asc" } });

  return (
    <div>
      <h2 className="font-semibold mb-1">Nouveau service</h2>
      <p className="text-xs text-muted-foreground mb-5">Examiné par un admin avant publication.</p>
      <ListingForm kind="service" categories={categories} />
    </div>
  );
}

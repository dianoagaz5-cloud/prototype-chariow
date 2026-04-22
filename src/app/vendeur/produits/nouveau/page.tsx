import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ListingForm } from "@/components/vendeur/listing-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireRole(["VENDEUR"]);
  const categories = await prisma.category.findMany({ where: { kind: "PRODUCT" }, orderBy: { name: "asc" } });

  return (
    <div>
      <h2 className="font-semibold mb-1">Nouveau produit</h2>
      <p className="text-xs text-muted-foreground mb-5">
        Votre produit sera examiné par un admin avant publication.
      </p>
      <ListingForm kind="product" categories={categories} />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ListingForm } from "@/components/vendeur/listing-form";

export const dynamic = "force-dynamic";

export default async function NewEbookPage() {
  await requireRole(["VENDEUR"]);
  const categories = await prisma.category.findMany({ where: { kind: "EBOOK" }, orderBy: { name: "asc" } });

  return (
    <div>
      <h2 className="font-semibold mb-1">Nouvel ebook</h2>
      <p className="text-xs text-muted-foreground mb-5">Examiné par un admin avant publication.</p>
      <ListingForm kind="ebook" categories={categories} />
    </div>
  );
}

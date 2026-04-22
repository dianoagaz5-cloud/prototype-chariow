import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ShopProfileForm } from "@/components/vendeur/shop-profile-form";

export const dynamic = "force-dynamic";

export default async function MyShopPage() {
  const user = await requireUser();
  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  if (!seller) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-semibold">Ma boutique</h2>
        <Link href={`/vendeurs/${seller.slug}`} target="_blank">
          <Button variant="outline" size="sm">Voir ma boutique</Button>
        </Link>
      </div>
      <ShopProfileForm
        seller={{
          shopName: seller.shopName,
          description: seller.description,
          phone: seller.phone,
          city: seller.city,
          banner: seller.banner ?? "",
          avatar: seller.avatar ?? "",
        }}
      />
    </div>
  );
}

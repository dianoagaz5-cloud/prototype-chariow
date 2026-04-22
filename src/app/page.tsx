import { Hero } from "@/components/home/hero";
import { TrustStrip } from "@/components/home/trust-strip";
import { FlashSalesSection } from "@/components/home/flash-sales";
import { CategoriesSection } from "@/components/home/categories";
import { PopularProductsSection } from "@/components/home/popular-products";
import { PopularServicesSection } from "@/components/home/popular-services";
import { EbooksSection } from "@/components/home/ebooks-section";
import { PopularSellersSection } from "@/components/home/popular-sellers";
import { CtaSell } from "@/components/home/cta-sell";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <FlashSalesSection />
      <CategoriesSection />
      <PopularProductsSection />
      <PopularServicesSection />
      <EbooksSection />
      <PopularSellersSection />
      <CtaSell />
    </>
  );
}

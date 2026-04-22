"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Store } from "lucide-react";
import { StarRating } from "@/components/ui/star-rating";

export type SellerCardData = {
  slug: string;
  shopName: string;
  city: string;
  avatar?: string | null;
  banner?: string | null;
  rating: number;
  productCount: number;
};

export function SellerCard({ data }: { data: SellerCardData }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md"
    >
      <Link href={`/vendeurs/${data.slug}`} className="block">
        <div className="relative h-24 bg-gradient-to-br from-primary/30 to-accent/30">
          {data.banner && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.banner} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="-mt-8 flex items-end gap-3 px-4">
          <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-muted">
            {data.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.avatar} alt={data.shopName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-white">
                <Store size={20} />
              </div>
            )}
          </div>
          <div className="pb-2">
            <h3 className="line-clamp-1 text-sm font-semibold">{data.shopName}</h3>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin size={10} /> {data.city}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between px-4 pb-4 pt-2">
          <StarRating value={data.rating} size={12} />
          <span className="text-xs text-muted-foreground">{data.productCount} produits</span>
        </div>
      </Link>
    </motion.div>
  );
}

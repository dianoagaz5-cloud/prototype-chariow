"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { formatFCFA } from "@/lib/money";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";

export type ServiceCardData = {
  id: string;
  slug: string;
  name: string;
  price: number;
  negotiable: boolean;
  image: string;
  rating: number;
  ratingCount: number;
  deliveryDays?: number | null;
  sellerName: string;
  sellerAvatar?: string | null;
};

export function ServiceCard({ data }: { data: ServiceCardData }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md"
    >
      <Link href={`/service/${data.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.image}
          alt={data.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {data.negotiable && (
          <Badge variant="success" className="absolute left-2 top-2">Négociable</Badge>
        )}
      </Link>
      <div className="p-4">
        <div className="flex items-center gap-2">
          {data.sellerAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.sellerAvatar} alt="" className="h-6 w-6 rounded-full object-cover" />
          ) : (
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-accent" />
          )}
          <span className="text-xs text-muted-foreground truncate">{data.sellerName}</span>
        </div>
        <Link href={`/service/${data.slug}`}>
          <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-snug min-h-[2.5rem]">{data.name}</h3>
        </Link>
        <div className="mt-2 flex items-center justify-between text-xs">
          <StarRating value={data.rating} size={12} />
          {data.deliveryDays && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Clock size={12} /> {data.deliveryDays}j
            </span>
          )}
        </div>
        <div className="mt-3 flex items-baseline justify-between border-t pt-3">
          <span className="text-xs text-muted-foreground">À partir de</span>
          <span className="text-base font-bold text-primary">{formatFCFA(data.price)}</span>
        </div>
      </div>
    </motion.div>
  );
}

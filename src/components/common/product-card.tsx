"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Zap } from "lucide-react";
import { formatFCFA } from "@/lib/money";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number;
  comparePrice?: number | null;
  image: string;
  rating: number;
  ratingCount: number;
  soldCount?: number;
  flashUntil?: Date | null;
  sellerId: string;
  sellerName: string;
};

export function ProductCard({ data }: { data: ProductCardData }) {
  const { add } = useCart();
  const discount =
    data.comparePrice && data.comparePrice > data.price
      ? Math.round(((data.comparePrice - data.price) / data.comparePrice) * 100)
      : null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md"
    >
      <Link href={`/produit/${data.slug}`} className="block relative aspect-square overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.image}
          alt={data.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {discount && (
          <Badge variant="danger" className="absolute left-2 top-2 shadow-sm">
            -{discount}%
          </Badge>
        )}
        {data.flashUntil && new Date(data.flashUntil) > new Date() && (
          <Badge variant="dark" className="absolute right-2 top-2 gap-1">
            <Zap size={12} /> Flash
          </Badge>
        )}
        <button
          type="button"
          aria-label="Favoris"
          onClick={(e) => { e.preventDefault(); toast.success("Ajouté aux favoris"); }}
          className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-white/90 p-2 shadow"
        >
          <Heart size={14} />
        </button>
      </Link>

      <div className="p-3">
        <Link href={`/produit/${data.slug}`} className="block">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug min-h-[2.5rem]">{data.name}</h3>
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-primary">{formatFCFA(data.price)}</span>
          {data.comparePrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatFCFA(data.comparePrice)}
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center justify-between text-xs">
          <StarRating value={data.rating} size={12} />
          <span className="text-muted-foreground">
            {data.soldCount ? `${data.soldCount} vendus` : `${data.ratingCount} avis`}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Link
            href={`/vendeurs/${data.sellerName}`}
            className="text-xs text-muted-foreground hover:text-primary truncate max-w-[70%]"
          >
            par {data.sellerName}
          </Link>
          <button
            type="button"
            aria-label="Ajouter au panier"
            onClick={(e) => {
              e.preventDefault();
              const added = add({
                kind: "PRODUCT",
                id: data.id,
                slug: data.slug,
                name: data.name,
                image: data.image,
                price: data.price,
                sellerId: data.sellerId,
                sellerName: data.sellerName,
              });
              if (added) toast.success("Ajouté au panier");
              else toast.info("Déjà dans votre panier");
            }}
            className="rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90 transition"
          >
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

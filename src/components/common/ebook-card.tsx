"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { formatFCFA } from "@/lib/money";
import { StarRating } from "@/components/ui/star-rating";

export type EbookCardData = {
  id: string;
  slug: string;
  title: string;
  author: string;
  price: number;
  cover: string;
  rating: number;
  pages?: number | null;
  soldCount?: number;
};

export function EbookCard({ data }: { data: EbookCardData }) {
  return (
    <motion.div
      whileHover={{ y: -4, rotate: -0.5 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md"
    >
      <Link href={`/ebook/${data.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.cover}
          alt={data.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium">
            <BookOpen size={10} /> Ebook
          </span>
        </div>
      </Link>
      <div className="p-3">
        <Link href={`/ebook/${data.slug}`}>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug min-h-[2.5rem]">{data.title}</h3>
        </Link>
        <p className="mt-1 text-xs text-muted-foreground truncate">par {data.author}</p>
        <div className="mt-2 flex items-center justify-between">
          <StarRating value={data.rating} size={12} />
          {data.pages && <span className="text-xs text-muted-foreground">{data.pages} p.</span>}
        </div>
        <div className="mt-2 border-t pt-2">
          <span className="text-base font-bold text-primary">{formatFCFA(data.price)}</span>
        </div>
      </div>
    </motion.div>
  );
}

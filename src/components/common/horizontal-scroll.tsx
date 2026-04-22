"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function HorizontalScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.7), behavior: "smooth" });
  };

  return (
    <div className="relative group">
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-2 snap-x"
      >
        {children}
      </div>
      <button
        onClick={() => scroll(-1)}
        className="hidden md:grid absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 place-items-center h-10 w-10 rounded-full bg-white border shadow opacity-0 group-hover:opacity-100 transition"
        aria-label="Précédent"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={() => scroll(1)}
        className="hidden md:grid absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 place-items-center h-10 w-10 rounded-full bg-white border shadow opacity-0 group-hover:opacity-100 transition"
        aria-label="Suivant"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

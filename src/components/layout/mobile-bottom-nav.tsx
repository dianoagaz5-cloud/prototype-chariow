"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, Search, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/boutique", label: "Boutique", icon: Store },
  { href: "/services", label: "Services", icon: Search },
  { href: "/panier", label: "Panier", icon: ShoppingCart },
  { href: "/compte", label: "Compte", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t bg-white/95 backdrop-blur">
      <div className="grid grid-cols-5 py-1">
        {items.map((it) => {
          const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span>{it.label}</span>
              {it.href === "/panier" && count > 0 && (
                <span className="absolute top-1 right-[calc(50%-18px)] min-w-[16px] h-4 rounded-full bg-primary text-white text-[9px] font-bold grid place-items-center px-1">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

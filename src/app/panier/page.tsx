"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatFCFA } from "@/lib/money";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const { items, setQty, remove, subtotal, clear } = useCart();

  const [freeShippingFromXOF, setFreeShippingFromXOF] = useState(50_000);
  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d?.freeShippingFromXOF === "number") setFreeShippingFromXOF(d.freeShippingFromXOF);
      })
      .catch(() => {});
  }, []);
  const missing = Math.max(0, freeShippingFromXOF - subtotal);

  return (
    <div className="container py-8">
      <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
        <ShoppingCart size={24} /> Mon panier
      </h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border bg-card p-10 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-muted grid place-items-center mb-4">
            <ShoppingCart size={24} />
          </div>
          <p className="text-muted-foreground">Votre panier est vide.</p>
          <Link href="/boutique" className="inline-block mt-4">
            <Button>Explorer la boutique</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={`${item.kind}-${item.id}`}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-4 rounded-xl border bg-card p-3"
                >
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.name} className="h-24 w-24 object-cover rounded-lg" />
                  )}
                  <div className="flex-1 min-w-0">
                    <Link href={detailHref(item.kind, item.slug)} className="text-sm font-semibold hover:text-primary line-clamp-2">
                      {item.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">par {item.sellerName}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {item.kind === "PRODUCT" && "Produit physique"}
                      {item.kind === "SERVICE" && "Service"}
                      {item.kind === "EBOOK" && "Ebook (PDF)"}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      {item.kind === "PRODUCT" ? (
                        <div className="flex items-center rounded-lg border">
                          <button
                            onClick={() => setQty(item.kind, item.id, item.quantity - 1)}
                            className="h-8 w-8 grid place-items-center hover:bg-muted"
                            aria-label="−"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => setQty(item.kind, item.id, item.quantity + 1)}
                            className="h-8 w-8 grid place-items-center hover:bg-muted"
                            aria-label="+"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Qté : 1</span>
                      )}
                      <div className="text-right">
                        <div className="text-sm font-bold text-primary">{formatFCFA(item.price * item.quantity)}</div>
                        {item.quantity > 1 && (
                          <div className="text-[11px] text-muted-foreground">{formatFCFA(item.price)} / unité</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(item.kind, item.id)}
                    aria-label="Retirer"
                    className="self-start p-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex justify-between items-center pt-2">
              <button onClick={clear} className="text-xs text-muted-foreground hover:text-destructive">
                Vider le panier
              </button>
              <Link href="/boutique" className="text-xs text-primary hover:underline">
                Continuer mes achats →
              </Link>
            </div>
          </div>

          <aside className="md:sticky md:top-28 h-fit rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="font-semibold">Récapitulatif</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sous-total</dt>
                <dd>{formatFCFA(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Livraison</dt>
                <dd>{missing === 0 ? <span className="text-emerald-600 font-medium">Gratuite</span> : "Selon ville"}</dd>
              </div>
              {missing > 0 && (
                <div className="text-[11px] text-muted-foreground pt-1">
                  Ajoute {formatFCFA(missing)} pour la livraison gratuite !
                </div>
              )}
            </dl>
            <div className="mt-4 border-t pt-4 flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-primary">{formatFCFA(subtotal)}</span>
            </div>
            <Link href="/checkout" className="mt-5 block">
              <Button size="lg" className="w-full">Passer au paiement</Button>
            </Link>
            <div className="mt-3 text-[11px] text-muted-foreground text-center">
              Paiement sécurisé · MTN · Moov · Celtiis
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function detailHref(kind: "PRODUCT" | "SERVICE" | "EBOOK", slug: string) {
  if (kind === "PRODUCT") return `/produit/${slug}`;
  if (kind === "SERVICE") return `/service/${slug}`;
  return `/ebook/${slug}`;
}

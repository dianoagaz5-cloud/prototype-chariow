"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart, type CartItem } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AddToCartButton({
  item,
  label = "Ajouter au panier",
  size = "default",
  showQty = false,
  className,
}: {
  item: Omit<CartItem, "quantity">;
  label?: string;
  size?: "default" | "lg" | "sm";
  showQty?: boolean;
  className?: string;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      {showQty && (
        <div className="flex items-center rounded-lg border">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="h-10 w-10 grid place-items-center hover:bg-muted rounded-l-lg"
            aria-label="Moins"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-medium">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="h-10 w-10 grid place-items-center hover:bg-muted rounded-r-lg"
            aria-label="Plus"
          >
            +
          </button>
        </div>
      )}
      <Button
        size={size}
        className="flex-1 gap-2"
        onClick={() => {
          const added = add(item, qty);
          if (added) {
            toast.success(`${qty} × ${item.name} ajouté au panier`);
            setAdded(true);
            setTimeout(() => setAdded(false), 1500);
          } else {
            toast.info("Déjà dans votre panier");
          }
        }}
      >
        {added ? <Check size={16} /> : <ShoppingCart size={16} />}
        {added ? "Ajouté" : label}
      </Button>
    </div>
  );
}

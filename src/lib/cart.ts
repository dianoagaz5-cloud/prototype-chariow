"use client";

import { useEffect, useState, useCallback } from "react";

export type CartItem = {
  kind: "PRODUCT" | "SERVICE" | "EBOOK";
  id: string;
  slug: string;
  name: string;
  image: string | null;
  price: number;
  sellerId: string;
  sellerName: string;
  quantity: number;
};

const KEY = "mkt_cart_v1";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("mkt:cart"));
}

export function getCart(): CartItem[] {
  return read();
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(read());
    const handler = () => setItems(read());
    window.addEventListener("mkt:cart", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("mkt:cart", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const add = useCallback((item: Omit<CartItem, "quantity">, qty = 1): boolean => {
    const current = read();
    const existing = current.find((i) => i.id === item.id && i.kind === item.kind);
    if (existing) {
      if (item.kind === "PRODUCT") {
        existing.quantity += qty;
      } else {
        return false;
      }
    } else {
      current.push({ ...item, quantity: item.kind === "PRODUCT" ? qty : 1 });
    }
    write(current);
    return true;
  }, []);

  const remove = useCallback((kind: CartItem["kind"], id: string) => {
    write(read().filter((i) => !(i.kind === kind && i.id === id)));
  }, []);

  const setQty = useCallback((kind: CartItem["kind"], id: string, qty: number) => {
    const current = read().map((i) =>
      i.kind === kind && i.id === id
        ? { ...i, quantity: kind === "PRODUCT" ? Math.max(1, qty) : 1 }
        : i,
    );
    write(current);
  }, []);

  const clear = useCallback(() => write([]), []);

  const count = items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return { items, add, remove, setQty, clear, count, subtotal };
}

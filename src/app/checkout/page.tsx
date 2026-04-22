"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatFCFA } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PAYMENT_PROVIDERS } from "@/lib/payment";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CITIES = [
  { v: "Cotonou", fee: 1500 },
  { v: "Abomey-Calavi", fee: 2000 },
  { v: "Porto-Novo", fee: 2500 },
  { v: "Ouidah", fee: 3000 },
  { v: "Parakou", fee: 5000 },
  { v: "Autre (national)", fee: 5000 },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [city, setCity] = useState(CITIES[0].v);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    note: "",
    paymentPhone: "",
  });
  const [provider, setProvider] = useState(PAYMENT_PROVIDERS[0].value);
  const [pending, setPending] = useState(false);
  const [freeShippingFromXOF, setFreeShippingFromXOF] = useState(50_000);

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d?.freeShippingFromXOF === "number") setFreeShippingFromXOF(d.freeShippingFromXOF);
      })
      .catch(() => {});
  }, []);

  const hasPhysical = items.some((i) => i.kind === "PRODUCT");
  const shippingFee = useMemo(() => {
    if (!hasPhysical) return 0;
    if (subtotal >= freeShippingFromXOF) return 0;
    return CITIES.find((c) => c.v === city)?.fee ?? 0;
  }, [hasPhysical, subtotal, city, freeShippingFromXOF]);
  const total = subtotal + shippingFee;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setPending(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ kind: i.kind, id: i.id, quantity: i.quantity })),
        contact: {
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          address: hasPhysical ? form.address : undefined,
          city: hasPhysical ? city : undefined,
          note: form.note,
        },
        payment: {
          provider,
          phone: form.paymentPhone,
        },
      }),
    });
    const data = await res.json();
    setPending(false);
    if (!data.ok) {
      toast.error(data.error || "Impossible de créer la commande.");
      return;
    }
    clear();
    toast.success("Commande confirmée !");
    router.push(`/commande/${data.orderId}`);
  }

  if (items.length === 0) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">Votre panier est vide.</p>
        <Link href="/boutique" className="inline-block mt-4">
          <Button>Retour à la boutique</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl md:text-3xl font-bold">Paiement</h1>
      <form onSubmit={onSubmit} className="mt-6 grid gap-6 md:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {hasPhysical && (
            <section className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="font-semibold mb-4">1. Livraison</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom complet" id="fullName" value={form.fullName} onChange={(v) => setForm((s) => ({ ...s, fullName: v }))} required />
                <Field label="Téléphone" id="phone" value={form.phone} onChange={(v) => setForm((s) => ({ ...s, phone: v }))} placeholder="+229 97 00 00 00" required />
                <Field label="Email" id="email" type="email" value={form.email} onChange={(v) => setForm((s) => ({ ...s, email: v }))} required className="sm:col-span-2" />
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Ville</Label>
                  <Select value={city} onChange={(e) => setCity(e.target.value)}>
                    {CITIES.map((c) => (
                      <option key={c.v} value={c.v}>
                        {c.v} — {c.fee} FCFA
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="addr">Adresse</Label>
                  <Textarea id="addr" rows={2} value={form.address} onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))} required />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="note">Note pour le livreur (optionnel)</Label>
                  <Textarea id="note" rows={2} value={form.note} onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))} />
                </div>
              </div>
            </section>
          )}

          {!hasPhysical && (
            <section className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="font-semibold mb-4">1. Coordonnées</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom complet" id="fullName" value={form.fullName} onChange={(v) => setForm((s) => ({ ...s, fullName: v }))} required />
                <Field label="Téléphone" id="phone" value={form.phone} onChange={(v) => setForm((s) => ({ ...s, phone: v }))} required />
                <Field label="Email" id="email" type="email" value={form.email} onChange={(v) => setForm((s) => ({ ...s, email: v }))} required className="sm:col-span-2" />
              </div>
            </section>
          )}

          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="font-semibold mb-4">{hasPhysical ? "2" : "2"}. Mode de paiement</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PAYMENT_PROVIDERS.map((p) => (
                <button
                  type="button"
                  key={p.value}
                  onClick={() => setProvider(p.value)}
                  className={cn(
                    "text-left rounded-xl border p-4 transition-all",
                    provider === p.value ? "border-primary bg-primary/5 shadow-sm" : "hover:border-zinc-400",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-8 w-8 rounded-full grid place-items-center text-white text-xs font-bold"
                      style={{ background: p.color }}
                    >
                      {p.operator.charAt(0)}
                    </span>
                    <div>
                      <div className="text-sm font-semibold">{p.label}</div>
                      <div className="text-[11px] text-muted-foreground">{p.operator}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-[11px] text-muted-foreground">
                    Préfixes : {p.prefixes.slice(0, 4).join(", ")}…
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-1.5 max-w-md">
              <Label htmlFor="paymentPhone">Numéro Mobile Money</Label>
              <Input
                id="paymentPhone"
                placeholder="+229 97 00 00 00"
                value={form.paymentPhone}
                onChange={(e) => setForm((s) => ({ ...s, paymentPhone: e.target.value }))}
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Tu recevras une notification pour confirmer le paiement.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Shield size={14} className="text-emerald-600" /> Paiement 100% sécurisé
            </div>
          </section>
        </div>

        <aside className="md:sticky md:top-28 h-fit rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold mb-3">Récapitulatif</h2>
          <ul className="space-y-2 max-h-72 overflow-y-auto text-sm">
            {items.map((i) => (
              <li key={`${i.kind}-${i.id}`} className="flex items-center gap-2">
                {i.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.image} alt="" className="h-10 w-10 rounded object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{i.name}</div>
                  <div className="text-[11px] text-muted-foreground">× {i.quantity}</div>
                </div>
                <div className="text-xs font-semibold">{formatFCFA(i.price * i.quantity)}</div>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Sous-total</dt>
              <dd>{formatFCFA(subtotal)}</dd>
            </div>
            {hasPhysical && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Livraison</dt>
                <dd>{shippingFee === 0 ? <span className="text-emerald-600">Gratuite</span> : formatFCFA(shippingFee)}</dd>
              </div>
            )}
          </dl>
          <div className="mt-3 border-t pt-3 flex justify-between">
            <span className="text-sm font-medium">Total</span>
            <span className="text-xl font-bold text-primary">{formatFCFA(total)}</span>
          </div>

          <Button type="submit" size="lg" className="w-full mt-5" disabled={pending}>
            {pending ? "Traitement…" : `Payer ${formatFCFA(total)}`}
          </Button>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  className,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} />
    </div>
  );
}

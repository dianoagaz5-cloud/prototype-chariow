"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type Category = { id: string; name: string };

export function ListingForm({
  kind,
  categories,
}: {
  kind: "product" | "service" | "ebook";
  categories: Category[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({
    name: "",
    description: "",
    price: "",
    categoryId: categories[0]?.id ?? "",
    images: "",
    stock: "0",
    comparePrice: "",
    negotiable: "false",
    deliveryDays: "",
    author: "",
    pages: "",
    cover: "",
    fileUrl: "",
  });

  function set<K extends string>(k: K, v: string) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const payload: Record<string, unknown> = {
      name: form.name,
      description: form.description,
      price: Number(form.price) || 0,
      categoryId: form.categoryId,
      images: form.images
        .split(/[\n,]+/)
        .map((x) => x.trim())
        .filter(Boolean),
    };
    if (kind === "product") {
      payload.stock = Number(form.stock) || 0;
      payload.comparePrice = form.comparePrice ? Number(form.comparePrice) : undefined;
    } else if (kind === "service") {
      payload.negotiable = form.negotiable === "true";
      payload.deliveryDays = form.deliveryDays ? Number(form.deliveryDays) : undefined;
    } else {
      payload.author = form.author;
      payload.pages = form.pages ? Number(form.pages) : undefined;
      payload.cover = form.cover;
      payload.fileUrl = form.fileUrl;
    }

    const res = await fetch(`/api/vendeur/${kind}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setPending(false);
    if (!data.ok) {
      toast.error(data.error || "Erreur");
      return;
    }
    toast.success("Créé ! En attente de validation admin.");
    const listPath =
      kind === "product" ? "/vendeur/produits" : kind === "service" ? "/vendeur/services" : "/vendeur/ebooks";
    router.push(listPath);
    router.refresh();
  }

  const nameLabel = kind === "ebook" ? "Titre" : "Nom";
  const imageLabel = kind === "ebook" ? "Images additionnelles (optionnel)" : "Images (URLs, une par ligne)";

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-card p-5">
      <div className="space-y-1.5">
        <Label>{nameLabel}</Label>
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
      </div>

      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Prix (FCFA)</Label>
          <Input type="number" min={0} value={form.price} onChange={(e) => set("price", e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Catégorie</Label>
          <Select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {kind === "product" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Stock</Label>
            <Input type="number" min={0} value={form.stock} onChange={(e) => set("stock", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Prix barré (optionnel)</Label>
            <Input type="number" min={0} value={form.comparePrice} onChange={(e) => set("comparePrice", e.target.value)} />
          </div>
        </div>
      )}

      {kind === "service" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Délai (jours)</Label>
            <Input type="number" min={0} value={form.deliveryDays} onChange={(e) => set("deliveryDays", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Prix négociable</Label>
            <Select value={form.negotiable} onChange={(e) => set("negotiable", e.target.value)}>
              <option value="false">Non</option>
              <option value="true">Oui</option>
            </Select>
          </div>
        </div>
      )}

      {kind === "ebook" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Auteur</Label>
              <Input value={form.author} onChange={(e) => set("author", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Nombre de pages</Label>
              <Input type="number" min={1} value={form.pages} onChange={(e) => set("pages", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>URL couverture (image)</Label>
            <Input value={form.cover} onChange={(e) => set("cover", e.target.value)} placeholder="https://..." required />
          </div>
          <div className="space-y-1.5">
            <Label>URL fichier PDF</Label>
            <Input value={form.fileUrl} onChange={(e) => set("fileUrl", e.target.value)} placeholder="https://..." required />
          </div>
        </>
      )}

      <div className="space-y-1.5">
        <Label>{imageLabel}</Label>
        <Textarea
          rows={3}
          value={form.images}
          onChange={(e) => set("images", e.target.value)}
          placeholder="https://picsum.photos/seed/exemple/800/800"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Envoi…" : "Créer"}
        </Button>
      </div>
    </form>
  );
}

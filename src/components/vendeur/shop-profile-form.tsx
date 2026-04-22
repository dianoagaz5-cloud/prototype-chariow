"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ShopProfileForm({
  seller,
}: {
  seller: {
    shopName: string;
    description: string;
    phone: string;
    city: string;
    banner: string;
    avatar: string;
  };
}) {
  const router = useRouter();
  const [form, setForm] = useState(seller);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const res = await fetch("/api/vendeur/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setPending(false);
    if (!data.ok) {
      toast.error(data.error || "Erreur");
      return;
    }
    toast.success("Profil mis à jour !");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Nom de la boutique</Label>
          <Input value={form.shopName} onChange={(e) => setForm((s) => ({ ...s, shopName: e.target.value }))} required />
        </div>
        <div className="space-y-1.5">
          <Label>Ville</Label>
          <Input value={form.city} onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))} required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea rows={4} value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Téléphone</Label>
          <Input value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>URL avatar</Label>
          <Input value={form.avatar} onChange={(e) => setForm((s) => ({ ...s, avatar: e.target.value }))} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>URL bannière</Label>
        <Input value={form.banner} onChange={(e) => setForm((s) => ({ ...s, banner: e.target.value }))} />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</Button>
      </div>
    </form>
  );
}

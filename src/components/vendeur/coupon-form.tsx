"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function CouponForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<"percent" | "amount">("percent");
  const [value, setValue] = useState("");
  const [maxUses, setMaxUses] = useState("50");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const payload = {
      code: code.trim().toUpperCase(),
      percent: mode === "percent" ? Number(value) : undefined,
      amount: mode === "amount" ? Number(value) : undefined,
      maxUses: Number(maxUses) || 50,
    };
    const res = await fetch("/api/vendeur/coupons", {
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
    toast.success("Coupon créé !");
    setCode("");
    setValue("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-4 rounded-xl border bg-card p-4">
      <div className="space-y-1.5 sm:col-span-1">
        <Label>Code</Label>
        <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SUMMER10" required />
      </div>
      <div className="space-y-1.5">
        <Label>Type</Label>
        <Select value={mode} onChange={(e) => setMode(e.target.value as "percent" | "amount")}>
          <option value="percent">% réduction</option>
          <option value="amount">Montant FCFA</option>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Valeur</Label>
        <Input type="number" min={1} value={value} onChange={(e) => setValue(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label>Utilisations max</Label>
        <Input type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
      </div>
      <div className="sm:col-span-4 flex justify-end">
        <Button type="submit" disabled={pending}>{pending ? "Création…" : "Créer le coupon"}</Button>
      </div>
    </form>
  );
}

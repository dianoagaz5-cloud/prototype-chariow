"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PAYMENT_PROVIDERS } from "@/lib/payment";
import { formatFCFA } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function PayoutRequestForm({ balance, minAmount }: { balance: number; minAmount: number }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState(PAYMENT_PROVIDERS[0].value);
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(amount);
    if (amt < minAmount) {
      toast.error(`Minimum ${formatFCFA(minAmount)}.`);
      return;
    }
    if (amt > balance) {
      toast.error("Montant supérieur au solde.");
      return;
    }
    setPending(true);
    const res = await fetch("/api/vendeur/payouts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: amt, provider, phone }),
    });
    const data = await res.json();
    setPending(false);
    if (!data.ok) {
      toast.error(data.error || "Erreur");
      return;
    }
    toast.success("Demande envoyée !");
    setAmount("");
    setPhone("");
    router.refresh();
  }

  const disabled = balance < minAmount;

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-3 rounded-xl border bg-card p-4">
      <div className="space-y-1.5">
        <Label>Montant (FCFA)</Label>
        <Input type="number" min={minAmount} max={balance} value={amount} onChange={(e) => setAmount(e.target.value)} required disabled={disabled} />
      </div>
      <div className="space-y-1.5">
        <Label>Opérateur</Label>
        <Select value={provider} onChange={(e) => setProvider(e.target.value as typeof provider)}>
          {PAYMENT_PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Numéro</Label>
        <Input placeholder="+229 97 00 00 00" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={disabled} />
      </div>
      <div className="sm:col-span-3 flex justify-end">
        <Button type="submit" disabled={pending || disabled}>
          {disabled ? "Solde insuffisant" : pending ? "Envoi…" : "Demander le retrait"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Store, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterInner />
    </Suspense>
  );
}

function RegisterInner() {
  const router = useRouter();
  const search = useSearchParams();
  const initialRole = (search.get("role") as "CLIENT" | "VENDEUR") || "CLIENT";

  const [role, setRole] = useState<"CLIENT" | "VENDEUR">(initialRole);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "Cotonou",
    shopName: "",
    shopDescription: "",
  });
  const [pending, setPending] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...form, role }),
    });
    const data = await res.json();
    setPending(false);
    if (!data.ok) {
      toast.error(data.error || "Inscription impossible");
      return;
    }
    toast.success(role === "VENDEUR"
      ? "Compte vendeur créé. En attente de validation admin."
      : "Compte créé avec succès !");
    router.push(role === "VENDEUR" ? "/vendeur" : "/");
    router.refresh();
  }

  return (
    <div className="container py-12 flex justify-center">
      <div className="w-full max-w-xl rounded-2xl border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">Créer un compte</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="text-primary font-medium hover:underline">
            Se connecter
          </Link>
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <RoleCard
            active={role === "CLIENT"}
            onClick={() => setRole("CLIENT")}
            icon={<UserIcon size={18} />}
            title="Je veux acheter"
            desc="Explorer et acheter sur la marketplace."
          />
          <RoleCard
            active={role === "VENDEUR"}
            onClick={() => setRole("VENDEUR")}
            icon={<Store size={18} />}
            title="Je veux vendre"
            desc="Créer ma boutique (validation admin)."
          />
        </div>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input id="name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" placeholder="+229 97 00 00 00" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">Ville</Label>
            <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" minLength={6} required value={form.password} onChange={(e) => set("password", e.target.value)} />
          </div>

          {role === "VENDEUR" && (
            <>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="shopName">Nom de la boutique</Label>
                <Input id="shopName" required value={form.shopName} onChange={(e) => set("shopName", e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="shopDescription">Description de la boutique</Label>
                <Textarea id="shopDescription" rows={3} value={form.shopDescription} onChange={(e) => set("shopDescription", e.target.value)} />
              </div>
            </>
          )}

          <div className="sm:col-span-2">
            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {pending ? "Création…" : role === "VENDEUR" ? "Créer ma boutique" : "Créer mon compte"}
            </Button>
            {role === "VENDEUR" && (
              <p className="mt-2 text-xs text-muted-foreground text-center">
                Ta boutique sera validée sous 24h par notre équipe.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function RoleCard({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-left rounded-xl border p-4 transition-all",
        active
          ? "border-primary bg-primary/5 shadow-sm"
          : "hover:border-zinc-400",
      )}
    >
      <div className={cn("mb-1.5 inline-flex h-9 w-9 items-center justify-center rounded-lg",
        active ? "bg-primary text-white" : "bg-muted text-foreground")}>{icon}</div>
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </button>
  );
}

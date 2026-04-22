"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setPending(false);
    if (!data.ok) {
      toast.error(data.error || "Connexion impossible");
      return;
    }
    toast.success("Bienvenue !");
    router.push(next);
    router.refresh();
  }

  return (
    <div className="container py-12 flex justify-center">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">Se connecter</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pas de compte ?{" "}
          <Link href="/inscription" className="text-primary font-medium hover:underline">
            Créer un compte
          </Link>
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Connexion…" : "Se connecter"}
          </Button>
        </form>

        <div className="mt-6 rounded-lg border bg-muted/50 p-4 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Comptes de démonstration</p>
          <p>Admin : admin@marketplace.bj / admin1234</p>
          <p>Client : client@demo.bj / password</p>
          <p>Vendeur : awa@boutique.bj / password</p>
        </div>
      </div>
    </div>
  );
}

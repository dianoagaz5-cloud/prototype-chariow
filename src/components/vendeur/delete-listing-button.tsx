"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DeleteListingButton({
  kind,
  id,
}: {
  kind: "product" | "service" | "ebook";
  id: string;
}) {
  const router = useRouter();

  async function onClick() {
    if (!confirm("Supprimer cet élément ?")) return;
    const res = await fetch(`/api/vendeur/${kind}/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.ok) {
      toast.success("Supprimé.");
      router.refresh();
    } else {
      toast.error(data.error || "Erreur");
    }
  }

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
      aria-label="Supprimer"
    >
      <Trash2 size={12} /> Supprimer
    </button>
  );
}

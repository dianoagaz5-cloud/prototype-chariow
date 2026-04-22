"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

type Resource = "seller" | "product" | "service" | "ebook";

export function AdminActionButtons({
  resource,
  id,
  status,
}: {
  resource: Resource;
  id: string;
  status: string;
}) {
  const router = useRouter();
  async function act(action: "approve" | "reject") {
    const res = await fetch(`/api/admin/${resource}/${id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (data.ok) {
      toast.success(action === "approve" ? "Approuvé" : "Rejeté");
      router.refresh();
    } else {
      toast.error(data.error || "Erreur");
    }
  }
  return (
    <div className="inline-flex gap-1">
      {status !== "APPROVED" && (
        <button
          onClick={() => act("approve")}
          className="inline-flex items-center gap-1 rounded-md bg-emerald-600 text-white text-xs px-2 py-1 hover:bg-emerald-700"
        >
          <Check size={12} /> Valider
        </button>
      )}
      {status !== "REJECTED" && (
        <button
          onClick={() => act("reject")}
          className="inline-flex items-center gap-1 rounded-md bg-destructive text-white text-xs px-2 py-1 hover:opacity-90"
        >
          <X size={12} /> Rejeter
        </button>
      )}
    </div>
  );
}

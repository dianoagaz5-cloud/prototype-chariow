"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function AdminPayoutActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  async function act(action: "approve" | "reject" | "paid") {
    const res = await fetch(`/api/admin/payout/${id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (data.ok) {
      toast.success("Mis à jour");
      router.refresh();
    } else toast.error(data.error || "Erreur");
  }
  return (
    <div className="inline-flex gap-1">
      {status === "PENDING" && (
        <>
          <button onClick={() => act("approve")} className="rounded-md bg-emerald-600 text-white text-xs px-2 py-1 hover:bg-emerald-700">Approuver</button>
          <button onClick={() => act("reject")} className="rounded-md bg-destructive text-white text-xs px-2 py-1 hover:opacity-90">Rejeter</button>
        </>
      )}
      {status === "APPROVED" && (
        <button onClick={() => act("paid")} className="rounded-md bg-primary text-white text-xs px-2 py-1 hover:opacity-90">Marquer payé</button>
      )}
    </div>
  );
}

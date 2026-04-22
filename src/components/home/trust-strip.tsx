import { ShieldCheck, Truck, Wallet, HeadphonesIcon } from "lucide-react";

const items = [
  { icon: ShieldCheck, title: "Paiement sécurisé", desc: "MTN MoMo · Moov · Celtiis Cash" },
  { icon: Truck, title: "Livraison rapide", desc: "Cotonou, Calavi, Porto-Novo & national" },
  { icon: Wallet, title: "Vendeurs vérifiés", desc: "Validation manuelle par nos équipes" },
  { icon: HeadphonesIcon, title: "Support 7j/7", desc: "Assistance via chat et téléphone" },
];

export function TrustStrip() {
  return (
    <section className="container my-10">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.title} className="rounded-xl border bg-white p-4 flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <Icon size={20} />
              </div>
              <div>
                <div className="text-sm font-semibold">{it.title}</div>
                <div className="text-xs text-muted-foreground">{it.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

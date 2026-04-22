import Link from "next/link";
import { ArrowRight, Package, Briefcase, BookOpen } from "lucide-react";

export function CtaSell() {
  return (
    <section className="container my-10">
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900 p-8 md:p-14 text-white">
        <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative grid gap-6 md:grid-cols-[1.2fr_1fr] md:gap-10 md:items-center">
          <div>
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              Commencer à vendre
            </span>
            <h2 className="mt-4 text-2xl md:text-4xl font-bold leading-tight">
              Transforme ta boutique en marketplace en 5 minutes
            </h2>
            <p className="mt-3 text-zinc-300 max-w-lg">
              Crée ta boutique, ajoute tes produits, fixe tes prix. Nous nous occupons
              des paiements MoMo et du suivi client. Commission claire, retraits rapides.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/inscription?role=VENDEUR"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
              >
                Devenir vendeur <ArrowRight size={16} />
              </Link>
              <Link
                href="/a-propos"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-semibold hover:bg-white/10"
              >
                En savoir plus
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <CTAItem icon={<Package size={18} />} title="Produits physiques" desc="Mode, électronique, maison, alimentation…" />
            <CTAItem icon={<Briefcase size={18} />} title="Services" desc="Dev web, design, réparation, livraison…" />
            <CTAItem icon={<BookOpen size={18} />} title="Ebooks" desc="Partage ton savoir en PDF, vends à l'unité" />
          </div>
        </div>
      </div>
    </section>
  );
}

function CTAItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl bg-white/10 border border-white/10 p-4 backdrop-blur hover:bg-white/15 transition">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-white/20 grid place-items-center">{icon}</div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs text-zinc-300">{desc}</div>
        </div>
      </div>
    </div>
  );
}

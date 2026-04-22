"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Sparkles, TrendingUp, Store, BookOpen, Package } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="hero-grid-bg absolute inset-0" />
      <div className="container relative grid gap-8 py-10 md:grid-cols-2 md:py-16 lg:py-20">
        <div className="flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex w-fit items-center gap-2 rounded-full border bg-white/80 px-3 py-1 text-xs font-medium text-primary"
          >
            <Sparkles size={12} /> La marketplace n°1 au Bénin
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mt-4 text-3xl font-bold leading-tight tracking-tight md:text-5xl"
          >
            Achetez et vendez{" "}
            <span className="gradient-text">facilement</span> au Bénin
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mt-4 text-base text-muted-foreground md:text-lg"
          >
            Produits, services et ebooks de vendeurs de confiance. Paiement MTN MoMo, Moov
            Money et Celtiis Cash. Livraison Cotonou, Calavi, Porto-Novo & partout au Bénin.
          </motion.p>

          <motion.form
            action="/boutique"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="mt-6 relative max-w-lg"
          >
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              placeholder="Rechercher un produit, service, ebook…"
              className="h-14 w-full rounded-full border bg-white pl-12 pr-32 text-sm shadow-sm focus:border-primary"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 h-10 rounded-full bg-primary px-5 text-sm font-medium text-white hover:bg-primary/90"
            >
              Rechercher
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32 }}
            className="mt-4 flex flex-wrap gap-2"
          >
            <Link href="/boutique" className="rounded-full border bg-white px-3 py-1 text-xs hover:border-primary">Mode</Link>
            <Link href="/boutique" className="rounded-full border bg-white px-3 py-1 text-xs hover:border-primary">Électronique</Link>
            <Link href="/services" className="rounded-full border bg-white px-3 py-1 text-xs hover:border-primary">Dév web</Link>
            <Link href="/ebooks" className="rounded-full border bg-white px-3 py-1 text-xs hover:border-primary">Business</Link>
            <Link href="/boutique" className="rounded-full border bg-white px-3 py-1 text-xs hover:border-primary">Beauté</Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              href="/inscription?role=VENDEUR"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800 transition"
            >
              <Store size={16} /> Commencer à vendre
            </Link>
            <Link
              href="/boutique"
              className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium hover:bg-muted transition"
            >
              <TrendingUp size={16} /> Voir les tendances
            </Link>
          </motion.div>

          <div className="mt-6 flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex -space-x-2">
              {[0, 1, 2, 3].map((i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={`https://picsum.photos/seed/av-${i}/80/80`}
                  alt=""
                  className="h-7 w-7 rounded-full border-2 border-white object-cover"
                />
              ))}
            </span>
            <span><span className="font-semibold text-foreground">+5 000</span> acheteurs satisfaits</span>
          </div>
        </div>

        {/* Right visual */}
        <div className="relative hidden md:flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative h-[480px] w-full"
          >
            <FloatingCard
              delay={0}
              className="absolute top-2 left-2 w-56"
              img={`https://picsum.photos/seed/hero-a/400/400`}
              title="Robe Wax moderne"
              price="18 500 FCFA"
              icon={<Package size={14} />}
            />
            <FloatingCard
              delay={0.15}
              className="absolute top-24 right-0 w-56"
              img={`https://picsum.photos/seed/hero-b/400/400`}
              title="Smartphone Pro 128 Go"
              price="135 000 FCFA"
              icon={<Package size={14} />}
            />
            <FloatingCard
              delay={0.3}
              className="absolute bottom-16 left-6 w-56"
              img={`https://picsum.photos/seed/hero-c/400/400`}
              title="Ebook : Lancer son business"
              price="5 000 FCFA"
              icon={<BookOpen size={14} />}
            />
            <FloatingCard
              delay={0.45}
              className="absolute bottom-0 right-8 w-60"
              img={`https://picsum.photos/seed/hero-d/400/400`}
              title="Création site web pro"
              price="250 000 FCFA"
              icon={<Sparkles size={14} />}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FloatingCard({
  img,
  title,
  price,
  icon,
  delay = 0,
  className = "",
}: {
  img: string;
  title: string;
  price: string;
  icon: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`${className} rounded-2xl bg-white border shadow-xl overflow-hidden animate-float`}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} alt="" className="h-32 w-full object-cover" />
      <div className="p-3">
        <div className="flex items-center gap-1 text-xs text-primary font-medium">{icon} Populaire</div>
        <div className="text-sm font-semibold mt-1 line-clamp-1">{title}</div>
        <div className="text-primary font-bold mt-1 text-sm">{price}</div>
      </div>
    </motion.div>
  );
}

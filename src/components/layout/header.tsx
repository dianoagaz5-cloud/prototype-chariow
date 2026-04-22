"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  Store,
  Package,
  Briefcase,
  BookOpen,
  LogOut,
  LayoutDashboard,
  Shield,
} from "lucide-react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MeUser = {
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "VENDEUR" | "ADMIN";
  hasSeller: boolean;
} | null;

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/boutique", label: "Boutique" },
  { href: "/services", label: "Services" },
  { href: "/ebooks", label: "Ebooks" },
  { href: "/vendeurs", label: "Vendeurs" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sellMenuOpen, setSellMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [q, setQ] = useState("");
  const [me, setMe] = useState<MeUser>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setMe(d.user))
      .catch(() => setMe(null));
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
    setSellMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-zinc-900 text-white text-xs">
        <div className="container flex items-center justify-between py-1.5">
          <span className="truncate">🇧🇯 Livraison partout au Bénin · Paiements MTN MoMo, Moov Money, Celtiis Cash</span>
          <span className="hidden md:inline text-zinc-300">Support : +229 97 00 00 00</span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          {/* Mobile burger */}
          <button
            className="md:hidden p-2 -ml-2"
            aria-label="Menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center text-white font-bold text-sm shadow-sm">
              M
            </div>
            <span className="text-lg font-bold tracking-tight">Marketplace</span>
          </Link>

          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/boutique?q=${encodeURIComponent(q)}`);
            }}
            className="hidden md:flex flex-1 max-w-xl mx-2 relative"
          >
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher des produits, services, ebooks…"
              className="h-10 w-full rounded-full border border-input bg-muted/40 pl-9 pr-24 text-sm focus:bg-background transition"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 h-8 rounded-full bg-primary px-4 text-xs font-medium text-white hover:bg-primary/90 transition"
            >
              Rechercher
            </button>
          </form>

          {/* Desktop actions */}
          <div className="ml-auto flex items-center gap-2">
            {/* Sell dropdown */}
            <div
              className="hidden md:block relative"
              onMouseEnter={() => setSellMenuOpen(true)}
              onMouseLeave={() => setSellMenuOpen(false)}
            >
              <Button
                variant="default"
                size="sm"
                className="gap-1"
              >
                <Store size={14} />
                Commencer à vendre
                <ChevronDown size={14} />
              </Button>
              <AnimatePresence>
                {sellMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 top-full w-64 rounded-xl border bg-white shadow-lg overflow-hidden"
                  >
                    <SellMenuItem
                      icon={<Package size={16} />}
                      title="Vendre des produits"
                      desc="Publiez votre boutique en ligne"
                      href="/vendeur/produits/nouveau"
                    />
                    <SellMenuItem
                      icon={<Briefcase size={16} />}
                      title="Proposer un service"
                      desc="Développement, design, livraison…"
                      href="/vendeur/services/nouveau"
                    />
                    <SellMenuItem
                      icon={<BookOpen size={16} />}
                      title="Vendre un ebook"
                      desc="Partagez votre savoir en PDF"
                      href="/vendeur/ebooks/nouveau"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <Link
              href="/panier"
              aria-label="Panier"
              className="relative rounded-lg p-2 hover:bg-muted transition"
            >
              <ShoppingCart size={20} />
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-primary text-white text-[10px] font-bold grid place-items-center px-1"
                >
                  {count}
                </motion.span>
              )}
            </Link>

            {/* Account */}
            <div className="relative">
              <button
                aria-label="Compte"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-1 rounded-lg p-2 hover:bg-muted transition"
              >
                <User size={20} />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 top-full mt-1 w-56 rounded-xl border bg-white shadow-lg overflow-hidden"
                  >
                    {me ? (
                      <>
                        <div className="px-4 py-3 border-b">
                          <div className="text-sm font-semibold truncate">{me.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{me.email}</div>
                        </div>
                        <MenuLink href="/compte" icon={<LayoutDashboard size={14} />}>Mon compte</MenuLink>
                        {me.hasSeller && (
                          <MenuLink href="/vendeur" icon={<Store size={14} />}>Dashboard vendeur</MenuLink>
                        )}
                        {me.role === "ADMIN" && (
                          <MenuLink href="/admin" icon={<Shield size={14} />}>Admin</MenuLink>
                        )}
                        <button
                          onClick={async () => {
                            await fetch("/api/auth/logout", { method: "POST" });
                            setMe(null);
                            router.push("/");
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2 border-t"
                        >
                          <LogOut size={14} /> Se déconnecter
                        </button>
                      </>
                    ) : (
                      <>
                        <MenuLink href="/connexion">Connexion</MenuLink>
                        <MenuLink href="/inscription">Créer un compte</MenuLink>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:block border-t bg-white">
          <div className="container flex items-center gap-1 h-11 text-sm overflow-x-auto scrollbar-hide">
            {navLinks.map((l) => {
              const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                    active
                      ? "text-primary bg-primary/10"
                      : "text-foreground/80 hover:text-primary hover:bg-muted",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Mobile search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/boutique?q=${encodeURIComponent(q)}`);
          }}
          className="md:hidden container pb-3"
        >
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher…"
              className="h-10 w-full rounded-full border border-input bg-muted/40 pl-9 pr-4 text-sm"
            />
          </div>
        </form>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28 }}
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-xl md:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b p-4">
                <span className="font-bold">Menu</span>
                <button onClick={() => setMobileOpen(false)} aria-label="Fermer">
                  <X size={20} />
                </button>
              </div>
              <nav className="p-3 flex flex-col">
                {navLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="px-3 py-3 rounded-lg text-sm font-medium hover:bg-muted"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
              <div className="border-t p-3">
                <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground px-3">
                  Vendre
                </div>
                <Link href="/vendeur/produits/nouveau" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted text-sm">
                  <Package size={16} /> Vendre des produits
                </Link>
                <Link href="/vendeur/services/nouveau" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted text-sm">
                  <Briefcase size={16} /> Proposer un service
                </Link>
                <Link href="/vendeur/ebooks/nouveau" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted text-sm">
                  <BookOpen size={16} /> Vendre un ebook
                </Link>
              </div>
              <div className="border-t p-3 flex flex-col gap-2">
                {me ? (
                  <>
                    <Link href="/compte" className="block"><Button variant="outline" className="w-full">Mon compte</Button></Link>
                    {me.hasSeller && <Link href="/vendeur" className="block"><Button className="w-full">Dashboard vendeur</Button></Link>}
                  </>
                ) : (
                  <>
                    <Link href="/connexion" className="block"><Button variant="outline" className="w-full">Connexion</Button></Link>
                    <Link href="/inscription" className="block"><Button className="w-full">Créer un compte</Button></Link>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SellMenuItem({ icon, title, desc, href }: { icon: React.ReactNode; title: string; desc: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 px-4 py-3 hover:bg-muted transition-colors"
    >
      <div className="mt-0.5 h-8 w-8 grid place-items-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </Link>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted">
      {icon} {children}
    </Link>
  );
}

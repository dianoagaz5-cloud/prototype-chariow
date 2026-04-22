import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 bg-zinc-900 text-zinc-300">
      <div className="container grid gap-8 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center text-white font-bold text-sm">
              M
            </div>
            <span className="text-lg font-bold text-white">Marketplace</span>
          </div>
          <p className="text-sm text-zinc-400">
            La marketplace de référence au Bénin. Achetez et vendez produits, services
            et ebooks en toute confiance.
          </p>
          <div className="mt-4 flex gap-2 text-xs text-zinc-500">
            <span>Suivez-nous sur les réseaux sociaux</span>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Découvrir</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/boutique" className="hover:text-white">Boutique</Link></li>
            <li><Link href="/services" className="hover:text-white">Services</Link></li>
            <li><Link href="/ebooks" className="hover:text-white">Ebooks</Link></li>
            <li><Link href="/vendeurs" className="hover:text-white">Vendeurs</Link></li>
            <li><Link href="/a-propos" className="hover:text-white">À propos</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Vendre sur Marketplace</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/inscription" className="hover:text-white">Devenir vendeur</Link></li>
            <li><Link href="/vendeur/produits/nouveau" className="hover:text-white">Vendre des produits</Link></li>
            <li><Link href="/vendeur/services/nouveau" className="hover:text-white">Proposer un service</Link></li>
            <li><Link href="/vendeur/ebooks/nouveau" className="hover:text-white">Vendre un ebook</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2"><MapPin size={14} className="mt-0.5" /> Cotonou, Bénin</li>
            <li className="flex items-start gap-2"><Phone size={14} className="mt-0.5" /> +229 97 00 00 00</li>
            <li className="flex items-start gap-2"><Mail size={14} className="mt-0.5" /> contact@marketplace.bj</li>
          </ul>
          <div className="mt-4 text-xs text-zinc-400">
            Villes couvertes : Cotonou · Abomey-Calavi · Porto-Novo · et livraison nationale
          </div>
        </div>
      </div>
      <div className="border-t border-zinc-800 py-4">
        <div className="container flex flex-col md:flex-row justify-between gap-2 text-xs text-zinc-500">
          <span>© {new Date().getFullYear()} Marketplace Bénin. Tous droits réservés.</span>
          <div className="flex gap-4">
            <span>Paiements : MTN MoMo · Moov Money · Celtiis Cash</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

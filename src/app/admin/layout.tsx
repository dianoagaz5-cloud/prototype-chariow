import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, Package, Wallet, Settings } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Vue d'ensemble", icon: Settings, exact: true },
  { href: "/admin/vendeurs", label: "Vendeurs", icon: Users },
  { href: "/admin/produits", label: "Articles", icon: Package },
  { href: "/admin/retraits", label: "Retraits", icon: Wallet },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?next=/admin");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="container py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Administration</h1>
        <p className="text-xs text-muted-foreground">Validation des vendeurs, articles et retraits</p>
      </div>
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <aside className="md:sticky md:top-24 h-fit rounded-xl border bg-card p-2">
          <nav className="flex md:flex-col gap-1 overflow-x-auto">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted shrink-0"
              >
                <n.icon size={16} />
                <span>{n.label}</span>
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

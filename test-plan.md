# Test Plan — Marketplace MVP v1 (PR #1)

## What changed
Entire marketplace stack added: home, catalogs (produits / services / ebooks), fiche produit + panier, checkout avec paiements mock (MoMo/Moov/Celtiis), commission + crédit solde vendeur, téléchargement ebook sécurisé, chat, dashboards vendeur + admin. Round 2 de corrections: auth sur `/commande/[id]`, race condition ebook, collision order number, URL relative ebook, status 404 chat.

Ref code:
- `src/app/page.tsx` — home
- `src/app/produit/[slug]/page.tsx` — fiche produit
- `src/app/panier/page.tsx` — panier
- `src/app/checkout/page.tsx` — checkout form
- `src/app/api/orders/route.ts:49-79, 191-222, 225-227` — guest user + session + crédit solde vendeur
- `src/app/commande/[id]/page.tsx:14-21` — auth + ownership check
- `src/lib/commission.ts`, `src/lib/payment.ts` — commission + mock MoMo ref "MTN-…"

## Primary flow (unique case testé)
1. Ouvrir http://localhost:3001/ — attendu: header "Marketplace", bouton "Commencer à vendre", hero "Achetez et vendez facilement au Bénin".
2. Cliquer sur la 1ère carte produit dans la section Produits populaires — URL doit devenir `/produit/<slug>`, la fiche affiche nom, prix en **FCFA** (pas de `€`, `$`), bouton "Ajouter au panier".
3. Cliquer "Ajouter au panier" — badge panier en header doit afficher **1** (pas 0, pas vide).
4. Cliquer icône panier → `/panier` — l'item ajouté apparaît avec son nom, quantité **1**, sous-total = prix produit en FCFA.
5. Cliquer "Passer la commande" → `/checkout`. Remplir: prénom/nom, **email inédit** (guest: `kodjo.visiteur+1@example.bj`), téléphone `+22997123456`, adresse, ville **Cotonou**, mode de paiement **MTN MoMo**. (Le serveur auto-crée un compte + session via `createSession` — cf. `src/app/api/orders/route.ts:242-244`.)
6. Valider → POST `/api/orders` attendu 200 avec `{ ok: true, orderId }`. Redirection automatique vers `/commande/<orderId>`.
7. Sur la page de confirmation — attendu:
   - badge statut **"Payée"** (pas "En attente")
   - total avec livraison **+1500 FCFA** (tarif Cotonou, cf. `src/lib/shipping.ts`)
   - référence paiement contient préfixe **`MTN-`** (cf. `initiateMockPayment`)
   - aucune erreur 403/404/500

## Régression ciblée (bug-fix round 2 + round 6)
- Avant le fix, `/commande/<orderId>` s'affichait sans auth. Test: après le flow, se déconnecter et réaccéder à la même URL — attendu: redirection vers `/connexion?next=/commande/<orderId>` (pas les détails de la commande).
- Round 6 (BUG 11): `/compte` déconnecté doit rediriger vers `/connexion?next=/compte` (pas un écran d'erreur 500). Test discriminant: sans le fix, le `requireUser()` throw donnait une page d'erreur générique.

## Secondaire (preuve commission)
- Se déconnecter, se reconnecter `awa@boutique.bj` / `password`, aller sur `/compte/vendeur`. Attendu: le solde est **strictement > 0 FCFA** et a augmenté vs la valeur seed (initialement 45 000 FCFA pour Awa).

## Éléments non testés
- Tests unitaires / CI Vercel (connu: échec attendu car SQLite en dev — user a choisi Option A).
- Téléchargement ebook, chat temps réel, dashboards admin: hors scope vidéo primaire.

## Serait-ce identique si cassé?
- Si l'auth `/commande/[id]` n'existait pas, déconnecté on verrait quand même le détail → test discriminant.
- Si la commission était cassée, le solde vendeur resterait à 45 000 FCFA → test discriminant.
- Si FCFA n'était pas appliqué, on verrait un symbole `$` ou `€` → test discriminant.
- Si le mock MoMo ne marquait pas "Payée", le badge afficherait "En attente" → test discriminant.

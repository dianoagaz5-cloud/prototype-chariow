import { NextResponse } from "next/server";

/**
 * Rule-based local AI assistant. No external API dependency.
 * Matches common user questions and returns helpful French responses.
 * Easy to swap with OpenAI/Groq later: just replace matchRules with an API call.
 */

type Rule = { match: RegExp; reply: string };

const RULES: Rule[] = [
  {
    match: /(acheter|comment\s+ach)/i,
    reply: `Pour acheter sur Marketplace :
1. Parcours le catalogue (Boutique, Services ou Ebooks).
2. Clique sur un article puis "Ajouter au panier".
3. Va sur /panier puis "Passer au paiement".
4. Choisis MTN Mobile Money, Moov Money ou Celtiis Cash et valide.
Tu recevras une confirmation immédiate.`,
  },
  {
    match: /(vendre|vendeur|devenir\s+vendeur|inscription\s+vendeur)/i,
    reply: `Pour devenir vendeur :
1. Inscris-toi en choisissant "Je veux vendre" (/inscription).
2. Renseigne le nom et la description de ta boutique.
3. Notre équipe valide ton compte sous 24h.
4. Depuis ton dashboard, ajoute produits, services ou ebooks.
Tu peux vendre des produits physiques, services ou ebooks 👌`,
  },
  {
    match: /(paie|mtn|momo|moov|celtiis|mobile money)/i,
    reply: `Moyens de paiement acceptés :
• MTN Mobile Money (+229 9x xx xx xx)
• Moov Money
• Celtiis Cash
Au checkout, tu choisis l'opérateur, tu confirmes sur ton téléphone, et la commande est validée instantanément.`,
  },
  {
    match: /(livraison|livré|expédition)/i,
    reply: `Nous livrons à Cotonou, Abomey-Calavi, Porto-Novo et partout au Bénin. Livraison gratuite dès 50 000 FCFA d'achat. Délai moyen : 24 à 72h selon la ville.`,
  },
  {
    match: /(ebook|pdf|t[eé]l[eé]charger)/i,
    reply: `Les ebooks sont livrés en PDF. Après paiement :
• Un lien de téléchargement sécurisé t'est généré dans "Mon compte".
• Le lien expire après 7 jours et 3 téléchargements pour éviter le partage.
Tu peux acheter, puis télécharger immédiatement.`,
  },
  {
    match: /(commission|frais|% ?de ?vente)/i,
    reply: `La commission Marketplace est de 8% par vente. Elle couvre l'hébergement, le paiement et le support. Tu peux demander un retrait dès 15 000 FCFA sur ton compte vendeur.`,
  },
  {
    match: /(retrait|payout|withdraw)/i,
    reply: `Retraits vendeur : depuis ton dashboard → "Retraits", demande un versement. Minimum 15 000 FCFA. Validation admin sous 24h, puis virement MoMo sur ton numéro.`,
  },
  {
    match: /(chat|message|contacter)/i,
    reply: `Tu peux discuter directement avec un vendeur depuis la page produit, service ou sa boutique — bouton "Discuter avec le vendeur". Il faut être connecté.`,
  },
  {
    match: /(s[eé]curit|fraude|arnaque)/i,
    reply: `Sécurité : les vendeurs sont validés manuellement. Les produits passent par une modération. Paie uniquement via Marketplace (jamais en direct). Utilise le chat pour garder une trace.`,
  },
  {
    match: /(bonjour|salut|hello|bonsoir|hey)/i,
    reply: "Salut 👋 ! Je suis l'assistant Marketplace. Pose-moi ta question : acheter, vendre, paiement, livraison…",
  },
  {
    match: /(merci|super|parfait)/i,
    reply: "Avec plaisir 🙌 Dis-moi si tu as d'autres questions !",
  },
];

function matchRules(message: string): string {
  for (const r of RULES) {
    if (r.match.test(message)) return r.reply;
  }
  return `Je peux t'aider sur :
• Acheter sur la plateforme
• Devenir vendeur
• Paiements MoMo / Moov / Celtiis
• Livraison
• Ebooks et téléchargements
• Commission et retraits
Essaie de reformuler ta question 🙂`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = String(body?.message || "").slice(0, 1000);
    if (!message.trim()) {
      return NextResponse.json({ reply: "Dis-moi ce que tu cherches 🙂" });
    }
    const reply = matchRules(message);
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: "Je n'ai pas pu traiter ta demande." }, { status: 500 });
  }
}

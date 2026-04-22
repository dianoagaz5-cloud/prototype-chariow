/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(s: string) {
  return s
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function img(id: number, w = 800, h = 800) {
  return `https://picsum.photos/seed/mkt-${id}/${w}/${h}`;
}

async function main() {
  console.log("→ Seeding database…");

  // Wipe existing data
  await prisma.$transaction([
    prisma.ebookDownloadToken.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.message.deleteMany(),
    prisma.chatThread.deleteMany(),
    prisma.review.deleteMany(),
    prisma.follow.deleteMany(),
    prisma.coupon.deleteMany(),
    prisma.payout.deleteMany(),
    prisma.product.deleteMany(),
    prisma.service.deleteMany(),
    prisma.ebook.deleteMany(),
    prisma.category.deleteMany(),
    prisma.seller.deleteMany(),
    prisma.user.deleteMany(),
    prisma.settings.deleteMany(),
  ]);

  await prisma.settings.create({
    data: {
      id: 1,
      siteName: "Marketplace",
      commissionPercent: 8,
      minPayoutAmount: 15000,
      freeShippingFromXOF: 50000,
    },
  });

  // ───────── Users ─────────
  const adminPassword = await bcrypt.hash("admin1234", 10);
  const password = await bcrypt.hash("password", 10);

  await prisma.user.create({
    data: {
      email: "admin@marketplace.bj",
      name: "Admin Marketplace",
      passwordHash: adminPassword,
      role: "ADMIN",
      city: "Cotonou",
      phone: "+22997000000",
    },
  });

  const client = await prisma.user.create({
    data: {
      email: "client@demo.bj",
      name: "Client Démo",
      passwordHash: password,
      role: "CLIENT",
      city: "Cotonou",
      phone: "+22997111111",
    },
  });

  // ───────── Categories ─────────
  const productCats = [
    { name: "Mode & Accessoires", icon: "👗" },
    { name: "Électronique", icon: "📱" },
    { name: "Maison & Déco", icon: "🛋️" },
    { name: "Beauté & Soin", icon: "💄" },
    { name: "Alimentation", icon: "🥘" },
    { name: "Artisanat", icon: "🧵" },
  ];
  const serviceCats = [
    { name: "Développement", icon: "💻" },
    { name: "Design", icon: "🎨" },
    { name: "Réparation", icon: "🔧" },
    { name: "Livraison", icon: "🚚" },
    { name: "Marketing", icon: "📣" },
  ];
  const ebookCats = [
    { name: "Business", icon: "💼" },
    { name: "Développement personnel", icon: "🌱" },
    { name: "Éducation", icon: "📚" },
    { name: "Technologie", icon: "🧠" },
  ];

  const catProducts = await Promise.all(
    productCats.map((c) =>
      prisma.category.create({
        data: { name: c.name, slug: slugify(c.name), icon: c.icon, kind: "PRODUCT" },
      }),
    ),
  );
  const catServices = await Promise.all(
    serviceCats.map((c) =>
      prisma.category.create({
        data: { name: c.name, slug: slugify(c.name), icon: c.icon, kind: "SERVICE" },
      }),
    ),
  );
  const catEbooks = await Promise.all(
    ebookCats.map((c) =>
      prisma.category.create({
        data: { name: c.name, slug: slugify(c.name), icon: c.icon, kind: "EBOOK" },
      }),
    ),
  );

  // ───────── Sellers ─────────
  const sellersData = [
    {
      email: "awa@boutique.bj",
      name: "Awa Houessou",
      shop: "Awa Fashion",
      desc: "Mode africaine moderne, tissus wax et prêt-à-porter féminin.",
      city: "Cotonou",
      phone: "+22997234567",
    },
    {
      email: "koffi@tech.bj",
      name: "Koffi Aguidi",
      shop: "Koffi Tech",
      desc: "Smartphones, accessoires et gadgets haute qualité à Cotonou.",
      city: "Cotonou",
      phone: "+22996345678",
    },
    {
      email: "maryse@deco.bj",
      name: "Maryse Dossou",
      shop: "Maison Maryse",
      desc: "Déco intérieure artisanale, meubles sur mesure et objets décoratifs.",
      city: "Abomey-Calavi",
      phone: "+22995456789",
    },
    {
      email: "daniel@codebj.bj",
      name: "Daniel Sossou",
      shop: "CodeBJ Studio",
      desc: "Agence de développement web & mobile — solutions pour PME béninoises.",
      city: "Porto-Novo",
      phone: "+22994567890",
    },
    {
      email: "sandra@beauty.bj",
      name: "Sandra Kakpo",
      shop: "Sandra Beauty",
      desc: "Cosmétiques naturels au beurre de karité et produits capillaires.",
      city: "Cotonou",
      phone: "+22996678901",
    },
    {
      email: "patrice@saveur.bj",
      name: "Patrice Agbo",
      shop: "Saveurs du Bénin",
      desc: "Épicerie fine : piments, épices, miels et produits du terroir.",
      city: "Cotonou",
      phone: "+22997789012",
    },
  ];

  const sellers = [];
  for (let i = 0; i < sellersData.length; i++) {
    const d = sellersData[i];
    const user = await prisma.user.create({
      data: {
        email: d.email,
        name: d.name,
        passwordHash: password,
        role: "VENDEUR",
        city: d.city,
        phone: d.phone,
      },
    });
    const seller = await prisma.seller.create({
      data: {
        userId: user.id,
        shopName: d.shop,
        slug: slugify(d.shop),
        description: d.desc,
        phone: d.phone,
        city: d.city,
        banner: `https://picsum.photos/seed/shop-banner-${i}/1600/500`,
        avatar: `https://picsum.photos/seed/shop-avatar-${i}/200/200`,
        status: "APPROVED",
        rating: 4.2 + Math.random() * 0.7,
        ratingCount: 20 + Math.floor(Math.random() * 200),
        balance: 50_000 + Math.floor(Math.random() * 200_000),
      },
    });
    sellers.push(seller);
  }

  // A pending seller awaiting validation
  const pendingSellerUser = await prisma.user.create({
    data: {
      email: "nouveau@vendeur.bj",
      name: "Nouveau Vendeur",
      passwordHash: password,
      role: "VENDEUR",
      city: "Cotonou",
      phone: "+22997000001",
    },
  });
  await prisma.seller.create({
    data: {
      userId: pendingSellerUser.id,
      shopName: "Nouvelle Boutique",
      slug: "nouvelle-boutique",
      description: "Boutique fraîchement créée — en attente de validation admin.",
      phone: "+22997000001",
      city: "Cotonou",
      status: "PENDING",
    },
  });

  // ───────── Products ─────────
  const products = [
    {
      seller: sellers[0],
      cat: catProducts[0],
      name: "Robe Wax moderne — collection Cotonou",
      price: 18500,
      compare: 25000,
      flash: true,
      desc: "Robe élégante en tissu wax 100% coton, coupe cintrée et détails brodés main. Parfaite pour cérémonies et sorties.",
    },
    {
      seller: sellers[0],
      cat: catProducts[0],
      name: "Chemise homme bogolan premium",
      price: 14000,
      desc: "Chemise en bogolan traditionnel, style moderne avec coupe droite confortable.",
    },
    {
      seller: sellers[1],
      cat: catProducts[1],
      name: "Smartphone Android Pro 128GB",
      price: 135000,
      compare: 160000,
      flash: true,
      desc: "Écran 6.7\" AMOLED, triple caméra 50MP, batterie 5000 mAh, 8 Go RAM.",
    },
    {
      seller: sellers[1],
      cat: catProducts[1],
      name: "Écouteurs Bluetooth ANC",
      price: 22500,
      desc: "Réduction de bruit active, 30h d'autonomie, connexion multipoint.",
    },
    {
      seller: sellers[1],
      cat: catProducts[1],
      name: "Montre connectée sport",
      price: 28000,
      desc: "Suivi cardiaque, GPS, 50m étanche, 100+ modes sport.",
    },
    {
      seller: sellers[2],
      cat: catProducts[2],
      name: "Fauteuil en rotin artisanal",
      price: 75000,
      desc: "Fauteuil tressé main, essence locale, très confortable.",
    },
    {
      seller: sellers[2],
      cat: catProducts[5],
      name: "Statue en bronze Bénin",
      price: 45000,
      desc: "Pièce artisanale d'art béninois, fonte traditionnelle.",
    },
    {
      seller: sellers[4],
      cat: catProducts[3],
      name: "Beurre de karité pur 250g",
      price: 3500,
      flash: true,
      desc: "100% naturel, non raffiné, hydrate et nourrit la peau en profondeur.",
    },
    {
      seller: sellers[4],
      cat: catProducts[3],
      name: "Savon noir artisanal",
      price: 2000,
      desc: "Savon traditionnel africain à base de cendres de plantain.",
    },
    {
      seller: sellers[5],
      cat: catProducts[4],
      name: "Piment Oti moulu 500g",
      price: 4500,
      desc: "Piment du Nord Bénin, saveur intense et chaleur marquée.",
    },
    {
      seller: sellers[5],
      cat: catProducts[4],
      name: "Miel pur de forêt 1L",
      price: 8500,
      desc: "Miel 100% naturel récolté dans les forêts du Bénin.",
    },
    {
      seller: sellers[0],
      cat: catProducts[0],
      name: "Sac à main cuir artisanal",
      price: 32000,
      desc: "Cuir véritable travaillé à la main par nos artisans de Cotonou.",
    },
  ];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const images = [img(100 + i), img(200 + i), img(300 + i)];
    await prisma.product.create({
      data: {
        sellerId: p.seller.id,
        categoryId: p.cat.id,
        name: p.name,
        slug: slugify(p.name) + "-" + i,
        description: p.desc,
        price: p.price,
        comparePrice: p.compare ?? null,
        stock: 10 + Math.floor(Math.random() * 40),
        images: JSON.stringify(images),
        status: "APPROVED",
        featured: i < 6,
        flashUntil: p.flash ? new Date(Date.now() + 1000 * 60 * 60 * 8) : null,
        rating: 4.0 + Math.random() * 0.9,
        ratingCount: 5 + Math.floor(Math.random() * 80),
        soldCount: Math.floor(Math.random() * 300),
      },
    });
  }

  // ───────── Services ─────────
  const services = [
    {
      seller: sellers[3],
      cat: catServices[0],
      name: "Création site web professionnel",
      price: 250000,
      desc: "Site vitrine ou e-commerce responsive, hébergement 1 an inclus, SEO de base.",
      delivery: 14,
    },
    {
      seller: sellers[3],
      cat: catServices[0],
      name: "Application mobile Android",
      price: 450000,
      desc: "Développement sur mesure, publication Play Store, maintenance 3 mois.",
      delivery: 30,
    },
    {
      seller: sellers[3],
      cat: catServices[1],
      name: "Design logo & identité visuelle",
      price: 35000,
      desc: "Logo HD + charte graphique complète + cartes de visite.",
      delivery: 5,
    },
    {
      seller: sellers[1],
      cat: catServices[2],
      name: "Réparation smartphone express",
      price: 7500,
      desc: "Diagnostic gratuit, réparation écran/batterie/faceID, garantie 30 jours.",
      delivery: 1,
      negotiable: true,
    },
    {
      seller: sellers[5],
      cat: catServices[3],
      name: "Livraison express Cotonou",
      price: 1500,
      desc: "Livraison en moins de 2h dans Cotonou et Calavi.",
      delivery: 1,
      negotiable: true,
    },
    {
      seller: sellers[4],
      cat: catServices[4],
      name: "Gestion réseaux sociaux (1 mois)",
      price: 80000,
      desc: "Community management complet, création de 20 posts, modération des commentaires.",
      delivery: 30,
    },
  ];

  for (let i = 0; i < services.length; i++) {
    const s = services[i];
    await prisma.service.create({
      data: {
        sellerId: s.seller.id,
        categoryId: s.cat.id,
        name: s.name,
        slug: slugify(s.name) + "-" + i,
        description: s.desc,
        price: s.price,
        negotiable: !!s.negotiable,
        images: JSON.stringify([img(500 + i), img(600 + i)]),
        deliveryDays: s.delivery,
        status: "APPROVED",
        featured: i < 4,
        rating: 4.3 + Math.random() * 0.6,
        ratingCount: 5 + Math.floor(Math.random() * 60),
        soldCount: Math.floor(Math.random() * 100),
      },
    });
  }

  // ───────── Ebooks ─────────
  const ebooks = [
    {
      seller: sellers[3],
      cat: catEbooks[0],
      title: "Lancer son business au Bénin en 2026",
      price: 5000,
      author: "Daniel Sossou",
      pages: 120,
      desc: "Guide pratique pour entrepreneurs : statut juridique, fiscalité, financement, marketing local.",
    },
    {
      seller: sellers[3],
      cat: catEbooks[3],
      title: "Apprendre JavaScript — du débutant à confirmé",
      price: 7500,
      author: "Daniel Sossou",
      pages: 280,
      desc: "Cours complet avec 50+ exercices corrigés, projets concrets (to-do, API, dashboard).",
    },
    {
      seller: sellers[4],
      cat: catEbooks[1],
      title: "Soins naturels africains — recettes du karité",
      price: 3500,
      author: "Sandra Kakpo",
      pages: 70,
      desc: "40 recettes DIY pour peau et cheveux à base d'ingrédients 100% africains.",
    },
    {
      seller: sellers[2],
      cat: catEbooks[1],
      title: "Mindset d'entrepreneur africain",
      price: 4000,
      author: "Maryse Dossou",
      pages: 90,
      desc: "Outils mentaux, gestion du stress et stratégies pour bâtir une entreprise durable.",
    },
    {
      seller: sellers[3],
      cat: catEbooks[2],
      title: "Mathématiques Terminale — exercices corrigés",
      price: 2500,
      author: "Koffi Aguidi",
      pages: 180,
      desc: "300 exercices classés par thème, corrigés détaillés, préparation BAC.",
    },
  ];

  for (let i = 0; i < ebooks.length; i++) {
    const e = ebooks[i];
    await prisma.ebook.create({
      data: {
        sellerId: e.seller.id,
        categoryId: e.cat.id,
        title: e.title,
        slug: slugify(e.title) + "-" + i,
        description: e.desc,
        price: e.price,
        cover: `https://picsum.photos/seed/ebook-cover-${i}/600/800`,
        fileUrl: `/uploads/demo-ebook-${i}.pdf`, // placeholder
        pages: e.pages,
        author: e.author,
        status: "APPROVED",
        featured: i < 3,
        rating: 4.4 + Math.random() * 0.5,
        ratingCount: 10 + Math.floor(Math.random() * 100),
        soldCount: Math.floor(Math.random() * 200),
      },
    });
  }

  // A product pending validation
  await prisma.product.create({
    data: {
      sellerId: sellers[0].id,
      categoryId: catProducts[0].id,
      name: "Jupe longue wax — nouvelle collection (en attente)",
      slug: "jupe-longue-wax-nouvelle-collection-pending",
      description: "Nouveau modèle en attente de validation admin.",
      price: 15000,
      stock: 5,
      images: JSON.stringify([img(999)]),
      status: "PENDING",
    },
  });

  // A pending payout
  await prisma.payout.create({
    data: {
      sellerId: sellers[0].id,
      amount: 50000,
      provider: "MTN_MOMO",
      phone: sellers[0].phone,
      status: "PENDING",
    },
  });

  // Starter coupon
  await prisma.coupon.create({
    data: {
      code: "BIENVENUE10",
      sellerId: sellers[0].id,
      percent: 10,
      maxUses: 100,
    },
  });

  // A sample chat thread between client and seller[0]
  const thread = await prisma.chatThread.create({
    data: {
      buyerId: client.id,
      sellerId: sellers[0].id,
      subject: "Question sur la robe wax",
    },
  });
  await prisma.message.create({
    data: {
      threadId: thread.id,
      authorId: client.id,
      body: "Bonjour ! La robe wax est-elle disponible en taille M ?",
    },
  });
  await prisma.message.create({
    data: {
      threadId: thread.id,
      authorId: sellers[0].userId,
      body: "Bonjour, oui la taille M est disponible. Nous pouvons livrer à Cotonou dès demain 😊",
    },
  });

  console.log("✓ Seed complete.");
  console.log("   admin : admin@marketplace.bj / admin1234");
  console.log("   client: client@demo.bj / password");
  console.log("   vendeur: awa@boutique.bj / password (+ 5 autres)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

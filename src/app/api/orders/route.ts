import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword, createSession } from "@/lib/auth";
import { getSettings, computeCommission } from "@/lib/commission";
import { initiateMockPayment, type PaymentProvider } from "@/lib/payment";
import { buildOrderNumber, parseImages } from "@/lib/utils";
import crypto from "crypto";

const schema = z.object({
  items: z.array(
    z.object({
      kind: z.enum(["PRODUCT", "SERVICE", "EBOOK"]),
      id: z.string(),
      quantity: z.number().min(1).max(99),
    }),
  ).min(1),
  contact: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(6),
    email: z.string().email().optional().or(z.literal("")),
    address: z.string().optional(),
    city: z.string().optional(),
    note: z.string().optional(),
  }),
  payment: z.object({
    provider: z.enum(["MTN_MOMO", "MOOV_MONEY", "CELTIIS_CASH"]),
    phone: z.string().min(6),
  }),
});

const CITY_FEES: Record<string, number> = {
  Cotonou: 1500,
  "Abomey-Calavi": 2000,
  "Porto-Novo": 2500,
  Ouidah: 3000,
  Parakou: 5000,
  "Autre (national)": 5000,
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Données invalides." }, { status: 400 });
  }
  const { items: rawItems, contact, payment } = parsed.data;
  if (contact.email) {
    contact.email = contact.email.toLowerCase();
  }

  const aggregated = new Map<string, { kind: "PRODUCT" | "SERVICE" | "EBOOK"; id: string; quantity: number }>();
  for (const it of rawItems) {
    const key = `${it.kind}:${it.id}`;
    const prev = aggregated.get(key);
    if (prev) {
      if (it.kind === "PRODUCT") prev.quantity += it.quantity;
    } else {
      aggregated.set(key, { kind: it.kind, id: it.id, quantity: it.kind === "PRODUCT" ? it.quantity : 1 });
    }
  }
  const items = Array.from(aggregated.values());

  let user = await getCurrentUser();
  const isGuest = !user;
  if (!user) {
    if (!contact.email) {
      return NextResponse.json(
        { ok: false, error: "Email requis pour les invités." },
        { status: 400 },
      );
    }
    const existing = await prisma.user.findUnique({
      where: { email: contact.email },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        {
          ok: false,
          error: "Un compte existe déjà avec cet email. Veuillez vous connecter pour commander.",
        },
        { status: 409 },
      );
    }
  }

  const resolved: {
    kind: "PRODUCT" | "SERVICE" | "EBOOK";
    id: string;
    sellerId: string;
    name: string;
    image: string | null;
    unitPrice: number;
    quantity: number;
  }[] = [];

  let subtotal = 0;
  let hasPhysical = false;

  for (const it of items) {
    if (it.kind === "PRODUCT") {
      const p = await prisma.product.findUnique({ where: { id: it.id } });
      if (!p || p.status !== "APPROVED") {
        return NextResponse.json({ ok: false, error: `Produit indisponible` }, { status: 400 });
      }
      if (p.stock < it.quantity) {
        return NextResponse.json({ ok: false, error: `Stock insuffisant pour ${p.name}` }, { status: 400 });
      }
      resolved.push({
        kind: "PRODUCT",
        id: p.id,
        sellerId: p.sellerId,
        name: p.name,
        image: parseImages(p.images)[0] ?? null,
        unitPrice: p.price,
        quantity: it.quantity,
      });
      subtotal += p.price * it.quantity;
      hasPhysical = true;
    } else if (it.kind === "SERVICE") {
      const s = await prisma.service.findUnique({ where: { id: it.id } });
      if (!s || s.status !== "APPROVED") {
        return NextResponse.json({ ok: false, error: `Service indisponible` }, { status: 400 });
      }
      resolved.push({
        kind: "SERVICE",
        id: s.id,
        sellerId: s.sellerId,
        name: s.name,
        image: parseImages(s.images)[0] ?? null,
        unitPrice: s.price,
        quantity: 1,
      });
      subtotal += s.price;
    } else {
      const e = await prisma.ebook.findUnique({ where: { id: it.id } });
      if (!e || e.status !== "APPROVED") {
        return NextResponse.json({ ok: false, error: `Ebook indisponible` }, { status: 400 });
      }
      resolved.push({
        kind: "EBOOK",
        id: e.id,
        sellerId: e.sellerId,
        name: e.title,
        image: e.cover,
        unitPrice: e.price,
        quantity: 1,
      });
      subtotal += e.price;
    }
  }

  if (hasPhysical && (!contact.city || contact.city.length < 2)) {
    return NextResponse.json(
      { ok: false, error: "Ville requise pour la livraison." },
      { status: 400 },
    );
  }

  const settings = await getSettings();
  const shipping = !hasPhysical
    ? 0
    : subtotal >= settings.freeShippingFromXOF
    ? 0
    : CITY_FEES[contact.city!] ?? 5000;
  const total = subtotal + shipping;

  const commission = resolved.reduce(
    (acc, r) => acc + computeCommission(r.unitPrice * r.quantity, settings.commissionPercent),
    0,
  );

  if (isGuest) {
    try {
      user = await prisma.user.create({
        data: {
          email: contact.email!,
          name: contact.fullName,
          phone: contact.phone,
          city: hasPhysical ? contact.city : null,
          passwordHash: await hashPassword(crypto.randomBytes(16).toString("hex")),
          role: "CLIENT",
        },
        include: { seller: true },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return NextResponse.json(
          {
            ok: false,
            error: "Un compte existe déjà avec cet email. Veuillez vous connecter pour commander.",
          },
          { status: 409 },
        );
      }
      throw e;
    }
  }
  if (!user) {
    return NextResponse.json({ ok: false, error: "Utilisateur introuvable." }, { status: 500 });
  }

  const result = await initiateMockPayment({
    provider: payment.provider as PaymentProvider,
    phone: payment.phone,
    amount: total,
  });

  const baseOrderData = {
    number: buildOrderNumber(),
    userId: user.id,
    subtotal,
    shipping,
    commission,
    total,
    paymentProvider: payment.provider,
    paymentRef: result.ref,
    phone: contact.phone,
    shippingCity: hasPhysical ? contact.city! : "",
    shippingAddress: contact.address ?? "",
    items: {
      create: resolved.map((r) => ({
        kind: r.kind,
        sellerId: r.sellerId,
        productId: r.kind === "PRODUCT" ? r.id : null,
        serviceId: r.kind === "SERVICE" ? r.id : null,
        ebookId: r.kind === "EBOOK" ? r.id : null,
        name: r.name,
        image: r.image,
        price: r.unitPrice,
        quantity: r.quantity,
      })),
    },
  };

  if (!result.ok) {
    const order = await prisma.order.create({
      data: { ...baseOrderData, status: "PENDING", note: contact.note },
    });
    if (isGuest && user) await createSession(user);
    return NextResponse.json({ ok: true, orderId: order.id, status: "PENDING" });
  }

  let orderId: string;
  try {
    const created = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: { ...baseOrderData, status: "PAID", note: contact.note },
      });
      for (const r of resolved) {
        if (r.kind === "PRODUCT") {
          const dec = await tx.product.updateMany({
            where: { id: r.id, stock: { gte: r.quantity } },
            data: { stock: { decrement: r.quantity }, soldCount: { increment: r.quantity } },
          });
          if (dec.count === 0) throw new Error(`STOCK_INSUFFICIENT:${r.name}`);
        } else if (r.kind === "SERVICE") {
          await tx.service.update({ where: { id: r.id }, data: { soldCount: { increment: 1 } } });
        } else {
          await tx.ebook.update({ where: { id: r.id }, data: { soldCount: { increment: 1 } } });
          const token = crypto.randomBytes(24).toString("hex");
          const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);
          await tx.ebookDownloadToken.create({
            data: {
              token,
              ebookId: r.id,
              orderId: order.id,
              maxUses: 3,
              expiresAt,
            },
          });
        }
        const itemTotal = r.unitPrice * r.quantity;
        const itemCommission = computeCommission(itemTotal, settings.commissionPercent);
        const credit = itemTotal - itemCommission;
        await tx.seller.update({
          where: { id: r.sellerId },
          data: { balance: { increment: credit } },
        });
      }
      return order;
    });
    orderId = created.id;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    const isStock = msg.startsWith("STOCK_INSUFFICIENT:");
    const name = isStock ? msg.slice("STOCK_INSUFFICIENT:".length) || "article" : null;
    const noteSuffix = isStock
      ? `[Stock insuffisant sur ${name} — commande à revalider]`
      : `[Erreur de traitement — à revoir par l'admin]`;
    const fallback = await prisma.order.create({
      data: {
        ...baseOrderData,
        status: "PENDING",
        note: `${contact.note ?? ""}\n${noteSuffix}`.trim(),
      },
    });
    if (isGuest && user) await createSession(user);
    if (isStock) {
      return NextResponse.json(
        { ok: false, error: `Stock insuffisant pour ${name}`, orderId: fallback.id },
        { status: 409 },
      );
    }
    console.error("Order fulfillment failed", { orderId: fallback.id, msg });
    return NextResponse.json(
      {
        ok: false,
        error: "Erreur de traitement de la commande. Notre équipe a été notifiée.",
        orderId: fallback.id,
      },
      { status: 500 },
    );
  }

  if (isGuest && user) await createSession(user);

  return NextResponse.json({ ok: true, orderId, status: "PAID" });
}

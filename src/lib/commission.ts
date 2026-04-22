import { prisma } from "./prisma";

export async function getSettings() {
  let s = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!s) {
    s = await prisma.settings.create({ data: { id: 1 } });
  }
  return s;
}

export function computeCommission(subtotal: number, percent: number): number {
  return Math.round(subtotal * (percent / 100));
}

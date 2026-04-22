import { NextResponse } from "next/server";
import { getSettings } from "@/lib/commission";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await getSettings();
  return NextResponse.json({
    freeShippingFromXOF: s.freeShippingFromXOF,
    minPayoutAmount: s.minPayoutAmount,
    commissionPercent: s.commissionPercent,
  });
}

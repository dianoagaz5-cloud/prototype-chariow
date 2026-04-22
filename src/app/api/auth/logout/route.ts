import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST(req: Request) {
  clearSession();
  const accept = req.headers.get("accept") ?? "";
  if (accept.includes("text/html") || req.headers.get("content-type")?.includes("form")) {
    return NextResponse.redirect(new URL("/", req.url), { status: 303 });
  }
  return NextResponse.json({ ok: true });
}

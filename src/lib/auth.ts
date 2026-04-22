import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { User } from "@prisma/client";

export type UserRole = "CLIENT" | "VENDEUR" | "ADMIN";

function resolveSecret(): string {
  const fromEnv = process.env.AUTH_SECRET;
  if (fromEnv && fromEnv.length >= 32) return fromEnv;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET must be set to a value of at least 32 characters in production.",
    );
  }
  return "dev-secret-change-me-in-production-please-use-32-chars-or-more";
}

const SECRET = new TextEncoder().encode(resolveSecret());

const COOKIE_NAME = "mkt_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export type SessionPayload = {
  sub: string;
  role: UserRole;
  email: string;
  name: string;
};

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSession(user: User): Promise<string> {
  const token = await new SignJWT({
    role: user.role,
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_MAX_AGE}s`)
    .sign(SECRET);

  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return token;
}

export function clearSession() {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const { payload } = await jwtVerify(raw, SECRET);
    if (!payload.sub) return null;
    return {
      sub: String(payload.sub),
      role: payload.role as UserRole,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSessionPayload();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.sub },
    include: { seller: true },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role as UserRole)) throw new Error("FORBIDDEN");
  return user;
}

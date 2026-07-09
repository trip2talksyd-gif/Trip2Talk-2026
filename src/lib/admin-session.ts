import { createHmac, randomUUID, timingSafeEqual } from "crypto";

export type AdminRole = "trip_leader" | "cashier" | "owner";

export interface AdminSession {
  role: AdminRole;
  iat: number;
  exp: number;
}

export const ADMIN_COOKIE_NAME = "t2t_admin_session";
const SESSION_TTL_SECONDS = 8 * 60 * 60;

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return secret;
}

export function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function resolveRoleFromPin(pin: string): AdminRole | null {
  const pins: Array<{ env: string; role: AdminRole }> = [
    { env: "ADMIN_PIN_TRIP_LEADER", role: "trip_leader" },
    { env: "ADMIN_PIN_CASHIER", role: "cashier" },
    { env: "ADMIN_PIN_OWNER", role: "owner" },
  ];

  for (const { env, role } of pins) {
    const expected = process.env[env];
    if (expected && constantTimeEqual(pin, expected)) return role;
  }
  return null;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createSessionToken(role: AdminRole): string {
  const now = Math.floor(Date.now() / 1000);
  const session: AdminSession = {
    role,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined): AdminSession | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (!constantTimeEqual(signature, expected)) return null;
  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as AdminSession;
    if (session.exp < Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function roleAllows(
  role: AdminRole,
  allowed: AdminRole | AdminRole[],
): boolean {
  const list = Array.isArray(allowed) ? allowed : [allowed];
  if (role === "owner") return true;
  return list.includes(role);
}

export function generateBookingId(): string {
  return randomUUID();
}

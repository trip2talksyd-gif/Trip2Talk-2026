import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  createSessionToken,
  resolveRoleFromPin,
  sessionCookieOptions,
} from "@/lib/admin-session";

export async function POST(request: NextRequest) {
  let body: { pin?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  const pin = body.pin?.trim();
  if (!pin) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  const role = resolveRoleFromPin(pin);
  if (!role) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  const token = createSessionToken(role);
  const response = NextResponse.json({ ok: true, role });
  response.cookies.set(ADMIN_COOKIE_NAME, token, sessionCookieOptions());
  return response;
}

export async function GET() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ authenticated: false });
  return NextResponse.json({ authenticated: true });
}

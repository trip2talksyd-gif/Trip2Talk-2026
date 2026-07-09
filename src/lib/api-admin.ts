import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  type AdminRole,
  type AdminSession,
  roleAllows,
  verifySessionToken,
} from "@/lib/admin-session";

export function getAdminSessionFromRequest(
  request: NextRequest,
): AdminSession | null {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export function requireAdminRole(
  request: NextRequest,
  allowed: AdminRole | AdminRole[],
): AdminSession | NextResponse {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!roleAllows(session.role, allowed)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}

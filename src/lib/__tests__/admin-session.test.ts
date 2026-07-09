import { describe, expect, it, beforeEach, afterEach } from "vitest";

import {
  constantTimeEqual,
  createSessionToken,
  resolveRoleFromPin,
  verifySessionToken,
} from "@/lib/admin-session";

describe("admin-session", () => {
  const orig = { ...process.env };

  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = "test-secret-key-for-hmac-signing";
    process.env.ADMIN_PIN_OWNER = "9999";
    process.env.ADMIN_PIN_CASHIER = "4444";
    process.env.ADMIN_PIN_TRIP_LEADER = "1111";
  });

  afterEach(() => {
    process.env = { ...orig };
  });

  it("constantTimeEqual matches equal strings", () => {
    expect(constantTimeEqual("abc", "abc")).toBe(true);
    expect(constantTimeEqual("abc", "abd")).toBe(false);
    expect(constantTimeEqual("ab", "abc")).toBe(false);
  });

  it("resolveRoleFromPin maps pins without revealing role on mismatch", () => {
    expect(resolveRoleFromPin("9999")).toBe("owner");
    expect(resolveRoleFromPin("4444")).toBe("cashier");
    expect(resolveRoleFromPin("1111")).toBe("trip_leader");
    expect(resolveRoleFromPin("0000")).toBeNull();
  });

  it("creates and verifies session token", () => {
    const token = createSessionToken("cashier");
    const session = verifySessionToken(token);
    expect(session?.role).toBe("cashier");
    expect(session!.exp).toBeGreaterThan(session!.iat);
  });

  it("rejects tampered token", () => {
    const token = createSessionToken("owner");
    const tampered = token.slice(0, -2) + "xx";
    expect(verifySessionToken(tampered)).toBeNull();
  });
});

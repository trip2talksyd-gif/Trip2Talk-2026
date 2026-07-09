import { describe, expect, it } from "vitest";

function isHoneypotTriggered(website: string | undefined): boolean {
  return Boolean(website?.trim());
}

function isValidContactInput(input: {
  name?: string;
  email?: string;
  message?: string;
  website?: string;
}): boolean {
  if (isHoneypotTriggered(input.website)) return false;
  if (!input.name?.trim() || !input.email?.trim() || !input.message?.trim()) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email);
}

describe("contact form validation", () => {
  it("rejects honeypot field when filled", () => {
    expect(
      isValidContactInput({
        name: "Test",
        email: "a@b.com",
        message: "Hi",
        website: "http://spam.bot",
      }),
    ).toBe(false);
  });

  it("accepts valid input with empty honeypot", () => {
    expect(
      isValidContactInput({
        name: "Test",
        email: "a@b.com",
        message: "Hi",
        website: "",
      }),
    ).toBe(true);
  });
});

describe("company config", () => {
  it("exports exact contact details", async () => {
    const { COMPANY } = await import("@/config/company");
    expect(COMPANY.email).toBe("trip2talksyd@gmail.com");
    expect(COMPANY.phone).toBe("0452 044 382");
    expect(COMPANY.abn).toBe("81 951 461 769");
  });
});

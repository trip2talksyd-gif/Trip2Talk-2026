import { describe, expect, it } from "vitest";

const RETENTION_DAYS = 7;

function isDeparturePastRetention(endDate: string | null, today = new Date()): boolean {
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  const cutoffIso = cutoff.toISOString().slice(0, 10);
  return !!endDate && endDate <= cutoffIso;
}

describe("delete-compliance-docs retention logic", () => {
  it("flags departures ended 7+ days ago", () => {
    const today = new Date("2026-07-09");
    expect(isDeparturePastRetention("2026-07-01", today)).toBe(true);
    expect(isDeparturePastRetention("2026-07-03", today)).toBe(false);
    expect(isDeparturePastRetention(null, today)).toBe(false);
  });
});

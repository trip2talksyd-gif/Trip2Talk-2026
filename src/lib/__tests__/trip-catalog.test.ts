import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

import { parseTripSeedData } from "@/lib/seed/parse-trip-data";
import type { TripCatalog } from "@/lib/types/trip-catalog";

function loadSeedData(): TripCatalog {
  const seedPath = resolve(process.cwd(), "seed-data/trip2talk-v6-trip-data.json");
  return JSON.parse(readFileSync(seedPath, "utf8")) as TripCatalog;
}

describe("trip seed data parsing", () => {
  const catalog = loadSeedData();
  const parsed = parseTripSeedData(catalog.tripTemplates);

  it("loads 13 trip templates from seed-data JSON", () => {
    expect(catalog.tripTemplates).toHaveLength(13);
    expect(parsed.templates).toHaveLength(13);
  });

  it("seeds only departures with confirmed startDate", () => {
    expect(parsed.departures).toHaveLength(8);
    expect(parsed.departures.every((d) => d.startDate !== null)).toBe(true);
  });

  it("does not seed departures for seasonal_on_request trips", () => {
    const seasonal = [
      "KIA-1DAY",
      "SYD-1DAY",
      "PSP-1DAY",
      "SYD-MW-WIN",
      "LAV-ANB-1D",
      "BER-3D2N",
    ];
    for (const code of seasonal) {
      expect(parsed.departures.some((d) => d.tripCode === code)).toBe(false);
    }
  });

  it("seeds two CAN-2D1N departures", () => {
    const can = parsed.departures.filter((d) => d.tripCode === "CAN-2D1N");
    expect(can).toHaveLength(2);
  });

  it("flags TAS-3D2N date span vs 3D2N itinerary", () => {
    const tasFlag = parsed.flags.find(
      (f) => f.tripCode === "TAS-3D2N" && f.severity === "blocker",
    );
    expect(tasFlag).toBeDefined();
    expect(tasFlag!.message).toContain("3D2N");
  });

  it("flags BER-3D2N max seats confirmation", () => {
    const berFlags = parsed.flags.filter((f) => f.tripCode === "BER-3D2N");
    expect(berFlags.length).toBeGreaterThan(0);
  });
});

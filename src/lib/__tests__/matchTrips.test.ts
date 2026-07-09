import { describe, expect, it } from "vitest";

import { matchTrips } from "@/lib/matchTrips";
import type { MatchTags, TripTemplate } from "@/lib/types/database";

function makeTemplate(
  tripCode: string,
  matchTags: MatchTags,
  overrides: Partial<TripTemplate> = {},
): TripTemplate {
  return {
    tripCode,
    category: "multi-day",
    departureType: "fixed_group",
    nameTH: tripCode,
    tagline: "",
    highlights: [],
    itinerary: [],
    pricing: { standard: { amountAUD: 1000, note: "" } },
    basePriceAUD: 1000,
    depositRequiredAUD: 100,
    inclusions: [],
    exclusions: [],
    accommodationPolicy: null,
    promoImageRef: null,
    galleryUrl: "",
    active: true,
    matchTags,
    ...overrides,
  };
}

describe("matchTrips", () => {
  const templates = [
    makeTemplate("SYD-MW-WIN", {
      themes: ["milkyway", "beach"],
      bestMonths: [6, 7, 8],
      groupFit: "private-small",
      pricePoint: "budget",
      pace: "one-day",
    }),
    makeTemplate("TAS-LH-3D2N-WIN", {
      themes: ["aurora", "landscape", "mountain"],
      bestMonths: [6, 7, 8],
      groupFit: "flexible",
      pricePoint: "mid",
      pace: "multi-day-relaxed",
    }),
    makeTemplate("CAN-2D1N", {
      themes: ["flowers", "landscape"],
      bestMonths: [9, 10],
      groupFit: "private-small",
      pricePoint: "budget",
      pace: "multi-day-relaxed",
    }),
  ];

  it("ranks aurora winter trip for aurora + winter quiz answers", () => {
    const results = matchTrips(templates, {
      month: 7,
      themes: ["aurora", "landscape"],
      groupFit: "flexible",
      pricePoint: "mid",
      pace: "multi-day-relaxed",
    });

    expect(results[0]?.template.tripCode).toBe("TAS-LH-3D2N-WIN");
    expect(results.length).toBeGreaterThan(0);
  });

  it("ranks milky way day trip for winter milkyway quiz", () => {
    const results = matchTrips(templates, {
      month: 7,
      themes: ["milkyway"],
      groupFit: "private-small",
      pricePoint: "budget",
      pace: "one-day",
    });

    expect(results[0]?.template.tripCode).toBe("SYD-MW-WIN");
  });

  it("ranks canola trip for spring flowers quiz", () => {
    const results = matchTrips(templates, {
      month: 10,
      themes: ["flowers"],
      groupFit: "private-small",
      pricePoint: "budget",
      pace: "multi-day-relaxed",
    });

    expect(results[0]?.template.tripCode).toBe("CAN-2D1N");
  });
});

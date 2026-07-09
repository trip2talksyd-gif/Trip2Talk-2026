import { describe, expect, it } from "vitest";

import { getUnitPriceAud, getTotalPriceAud } from "@/lib/booking-pricing";
import type { TripTemplate } from "@/lib/types/firestore";

const baseTemplate: TripTemplate = {
  tripCode: "SYD-1DAY",
  category: "oneDay",
  departureType: "scheduled",
  nameTH: "Sydney One Day",
  tagline: "",
  highlights: [],
  itinerary: [],
  pricing: { standard: { amountAUD: 250, note: "" } },
  basePriceAUD: 250,
  depositRequiredAUD: 100,
  inclusions: [],
  exclusions: [],
  accommodationPolicy: null,
  promoImageRef: null,
  galleryUrl: "",
  active: true,
  maxSeatsBookable: 12,
  subPackages: [
    { id: "pkg-a", priceAUD: 320 },
    { id: "pkg-b", priceAUD: 280 },
  ],
};

describe("booking-pricing", () => {
  it("uses sub-package price when selected", () => {
    expect(getUnitPriceAud(baseTemplate, "pkg-a")).toBe(320);
    expect(getTotalPriceAud(baseTemplate, 2, "pkg-b")).toBe(560);
  });

  it("falls back to standard pricing", () => {
    expect(getUnitPriceAud(baseTemplate)).toBe(250);
  });
});

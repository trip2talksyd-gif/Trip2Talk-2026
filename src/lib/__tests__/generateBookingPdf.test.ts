import { describe, expect, it } from "vitest";

import { generateBookingPdf } from "@/lib/generateBookingPdf";
import type { Booking, TripDeparture, TripTemplate } from "@/lib/types/firestore";

const template: TripTemplate = {
  tripCode: "TEST-1DAY",
  category: "oneDay",
  departureType: "scheduled",
  nameTH: "ทริปทดสอบ",
  tagline: "Test trip",
  highlights: [],
  itinerary: [],
  pricing: { standard: { amountAUD: 299, note: "" } },
  basePriceAUD: 299,
  depositRequiredAUD: 100,
  inclusions: [],
  exclusions: [],
  accommodationPolicy: "No accommodation",
  cancellationPolicy: ["No refund on deposit"],
  depositPolicy: "AUD $100 non-refundable",
  promoImageRef: null,
  galleryUrl: "",
  active: true,
  maxSeatsBookable: 12,
};

const departure: TripDeparture = {
  tripCode: "TEST-1DAY",
  startDate: "2026-08-01",
  endDate: "2026-08-01",
  maxSeats: 12,
  seatsBooked: 2,
  status: "upcoming",
};

const booking: Booking & { id: string } = {
  id: "test-booking-001",
  tripCode: "TEST-1DAY",
  departureId: "TEST-1DAY__2026-08-01",
  customerName: "Test Customer",
  phone: "0400000000",
  email: "test@example.com",
  seatsBooked: 2,
  paymentMethod: "stripe",
  paymentStatus: "paid",
  stripePaymentIntentId: "pi_test",
  slipUrl: null,
  waiverAccepted: true,
  waiverAcceptedAt: "2026-07-09T00:00:00.000Z",
  waiverAcceptedIp: "127.0.0.1",
  complianceDocsUploaded: false,
  docsDeletedAt: null,
  totalPriceAud: 598,
  createdAt: "2026-07-09T00:00:00.000Z",
};

describe("generateBookingPdf", () => {
  it("produces a non-empty PDF buffer", async () => {
    const bytes = await generateBookingPdf({ booking, template, departure });
    expect(bytes.byteLength).toBeGreaterThan(500);
    const header = String.fromCharCode(...bytes.slice(0, 5));
    expect(header).toBe("%PDF-");
  });
});

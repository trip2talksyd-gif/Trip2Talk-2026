import { PDFParse } from "pdf-parse";
import { describe, expect, it } from "vitest";

import {
  generateBookingPdf,
  generateBookingPdfResult,
} from "@/lib/generateBookingPdf";
import type { Booking, TripDeparture, TripTemplate } from "@/lib/types/firestore";

const baseTemplate: TripTemplate = {
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
  accommodationPolicy: "ไม่มีที่พักในทริปวันเดียว",
  cancellationPolicy: ["ไม่คืนเงินมัดจำ"],
  depositPolicy: "มัดจำ AUD $100 ไม่คืน",
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

const baseBooking: Booking & { id: string } = {
  id: "test-booking-001",
  tripCode: "TEST-1DAY",
  departureId: "TEST-1DAY__2026-08-01",
  customerName: "สมชาย ใจดี",
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

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const parser = new PDFParse({ data: bytes });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}

describe("generateBookingPdf", () => {
  it("produces a non-empty PDF buffer", async () => {
    const bytes = await generateBookingPdf({
      booking: baseBooking,
      template: baseTemplate,
      departure,
    });
    expect(bytes.byteLength).toBeGreaterThan(500);
    const header = String.fromCharCode(...bytes.slice(0, 5));
    expect(header).toBe("%PDF-");
  });

  it("embeds Noto Sans Thai Regular and Bold fonts", async () => {
    const { embeddedFontNames } = await generateBookingPdfResult({
      booking: baseBooking,
      template: baseTemplate,
      departure,
    });
    expect(embeddedFontNames.some((n) => /NotoSansThai-Regular/i.test(n))).toBe(
      true,
    );
    expect(embeddedFontNames.some((n) => /NotoSansThai-Bold/i.test(n))).toBe(
      true,
    );
  });

  it("renders Thai customer and trip names without replacement question marks", async () => {
    const bytes = await generateBookingPdf({
      booking: baseBooking,
      template: baseTemplate,
      departure,
    });

    const text = await extractPdfText(bytes);

    expect(text).toContain("สมชาย");
    expect(text).toContain("ทริปทดสอบ");
    expect(text).not.toContain("?");
  });
});

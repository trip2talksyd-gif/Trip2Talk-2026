import fs from "fs";
import path from "path";

import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

import type { Booking, TripDeparture, TripTemplate } from "@/lib/types/firestore";
import { formatThaiDate } from "@/lib/booking-pricing";

export interface BookingPdfInput {
  booking: Booking & { id: string };
  template: TripTemplate;
  departure: TripDeparture | null;
}

export interface GenerateBookingPdfResult {
  bytes: Uint8Array;
  /** PDFFont.name values right after embed — no re-parse required */
  embeddedFontNames: string[];
}

const FONTS_DIR = path.join(process.cwd(), "assets", "fonts");

function loadFontFile(filename: string): Uint8Array {
  return new Uint8Array(fs.readFileSync(path.join(FONTS_DIR, filename)));
}

type LineFont = "thai" | "thaiBold" | "latin" | "latinBold";

export async function generateBookingPdfResult(
  input: BookingPdfInput,
): Promise<GenerateBookingPdfResult> {
  const { booking, template, departure } = input;
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const thai = await pdf.embedFont(loadFontFile("NotoSansThai-Regular.ttf"));
  const thaiBold = await pdf.embedFont(loadFontFile("NotoSansThai-Bold.ttf"));
  const latin = await pdf.embedFont(StandardFonts.Helvetica);
  const latinBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const embeddedFontNames = [thai.name, thaiBold.name, latin.name, latinBold.name];

  const fonts: Record<LineFont, PDFFont> = {
    thai,
    thaiBold,
    latin,
    latinBold,
  };

  const page = pdf.addPage([595, 842]);
  let y = 800;

  const line = (text: string, size = 11, fontKey: LineFont = "thai") => {
    page.drawText(text, {
      x: 50,
      y,
      size,
      font: fonts[fontKey],
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= size + 6;
  };

  line("Trip2Talk — Booking Confirmation", 18, "latinBold");
  line(`Booking ID: ${booking.id}`, 10, "latin");
  line(`Trip: ${template.tripCode} — ${template.nameTH}`, 12, "thaiBold");

  if (departure?.startDate) {
    const end = departure.endDate ? ` – ${formatThaiDate(departure.endDate)}` : "";
    line(`Departure: ${formatThaiDate(departure.startDate)}${end}`, 11, "thai");
  } else {
    line("Departure: On request / TBA", 11, "latin");
  }

  line(`Customer: ${booking.customerName}`, 11, "thai");
  line(`Seats: ${booking.seatsBooked}`, 11, "latin");
  line(
    `Total: AUD $${(booking.totalPriceAud ?? template.basePriceAUD * booking.seatsBooked).toFixed(2)}`,
    12,
    "latinBold",
  );

  y -= 10;
  line("Deposit & cancellation", 13, "latinBold");
  if (template.depositPolicy) {
    line(String(template.depositPolicy).slice(0, 90), 11, "thai");
  }
  line(`Non-refundable deposit: AUD $${template.depositRequiredAUD}`, 11, "latin");
  if (template.accommodationPolicy) {
    y -= 4;
    line("Accommodation policy:", 11, "latinBold");
    line(template.accommodationPolicy.slice(0, 85), 11, "thai");
  }
  if (template.cancellationPolicy?.length) {
    y -= 4;
    line("Cancellation:", 11, "latinBold");
    for (const item of template.cancellationPolicy.slice(0, 4)) {
      line(`• ${item}`.slice(0, 90), 11, "thai");
    }
  }

  y -= 10;
  line("Waiver", 13, "latinBold");
  line(
    booking.waiverAccepted
      ? `Travel & Trip Consent accepted at ${booking.waiverAcceptedAt ?? "—"}`
      : "Waiver not recorded",
    11,
    "thai",
  );

  y -= 20;
  line("Trip2Talk Sydney | trip2talksyd@gmail.com", 9, "latin");
  line("ABN 81 951 461 769", 9, "latin");

  return { bytes: await pdf.save(), embeddedFontNames };
}

export async function generateBookingPdf(
  input: BookingPdfInput,
): Promise<Uint8Array> {
  const { bytes } = await generateBookingPdfResult(input);
  return bytes;
}

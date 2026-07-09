import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import type { Booking, TripDeparture, TripTemplate } from "@/lib/types/firestore";
import { formatThaiDate } from "@/lib/booking-pricing";

export interface BookingPdfInput {
  booking: Booking & { id: string };
  template: TripTemplate;
  departure: TripDeparture | null;
}

export async function generateBookingPdf(
  input: BookingPdfInput,
): Promise<Uint8Array> {
  const { booking, template, departure } = input;
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  /** pdf-lib standard fonts only support WinAnsi — strip unsupported chars */
  const safe = (s: string) => s.replace(/[^\x20-\x7E\n]/g, "?").slice(0, 120);

  let y = 800;
  const line = (text: string, size = 11, useBold = false) => {
    page.drawText(safe(text), {
      x: 50,
      y,
      size,
      font: useBold ? bold : font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= size + 6;
  };

  line("Trip2Talk — Booking Confirmation", 18, true);
  line(`Booking ID: ${booking.id}`, 10);
  line(`Trip: ${template.tripCode} — ${template.nameTH}`, 12, true);

  if (departure?.startDate) {
    const end = departure.endDate ? ` – ${formatThaiDate(departure.endDate)}` : "";
    line(`Departure: ${formatThaiDate(departure.startDate)}${end}`);
  } else {
    line("Departure: On request / TBA");
  }

  line(`Customer: ${booking.customerName}`);
  line(`Seats: ${booking.seatsBooked}`);
  line(
    `Total: AUD $${(booking.totalPriceAud ?? template.basePriceAUD * booking.seatsBooked).toFixed(2)}`,
    12,
    true,
  );

  y -= 10;
  line("Deposit & cancellation", 13, true);
  if (template.depositPolicy) {
    line(String(template.depositPolicy).slice(0, 90));
  }
  line(`Non-refundable deposit: AUD $${template.depositRequiredAUD}`);
  if (template.accommodationPolicy) {
    y -= 4;
    line("Accommodation policy:", 11, true);
    line(template.accommodationPolicy.slice(0, 85));
  }
  if (template.cancellationPolicy?.length) {
    y -= 4;
    line("Cancellation:", 11, true);
    for (const item of template.cancellationPolicy.slice(0, 4)) {
      line(`• ${item}`.slice(0, 90));
    }
  }

  y -= 10;
  line("Waiver", 13, true);
  line(
    booking.waiverAccepted
      ? `Travel & Trip Consent accepted at ${booking.waiverAcceptedAt ?? "—"}`
      : "Waiver not recorded",
  );

  y -= 20;
  line("Trip2Talk Sydney | trip2talksyd@gmail.com", 9);
  line("ABN 81 951 461 769", 9);

  return pdf.save();
}

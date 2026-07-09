import { NextRequest, NextResponse } from "next/server";

import { generateBookingId } from "@/lib/admin-session";
import { getTotalPriceAud } from "@/lib/booking-pricing";
import {
  SeatLockError,
  createBookingWithSeatLock,
} from "@/lib/bookSeat";
import { getDepartureById, getTripTemplateByCode } from "@/lib/db/queries";
import {
  STORAGE_BUCKETS,
  createSignedUploadUrl,
} from "@/lib/supabase-storage";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    departureId,
    seats,
    customerName,
    phone,
    email,
    waiverAccepted,
    subPackage,
  } = body as {
    departureId?: string;
    seats?: number;
    customerName?: string;
    phone?: string;
    email?: string;
    waiverAccepted?: boolean;
    subPackage?: string;
  };

  if (
    !departureId ||
    !seats ||
    !customerName ||
    !phone ||
    !email ||
    !waiverAccepted
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const departure = await getDepartureById(departureId);
  if (!departure) {
    return NextResponse.json({ error: "Departure not found" }, { status: 404 });
  }
  const template = await getTripTemplateByCode(departure.tripCode);
  if (!template) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const totalPriceAud = getTotalPriceAud(template, seats, subPackage);
  const bookingId = generateBookingId();
  const now = new Date().toISOString();
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const slipPath = `${bookingId}/slip.jpg`;

  try {
    await createBookingWithSeatLock({
      departureId,
      bookingId,
      seatsRequested: seats,
      bookingData: {
        tripCode: departure.tripCode,
        departureId,
        customerName,
        phone,
        email,
        paymentMethod: "bank_slip",
        paymentStatus: "pending_verification",
        stripePaymentIntentId: null,
        slipUrl: null,
        waiverAccepted: true,
        waiverAcceptedAt: now,
        waiverAcceptedIp: clientIp,
        complianceDocsUploaded: false,
        docsDeletedAt: null,
        subPackage: subPackage ?? null,
        totalPriceAud,
        confirmationPdfPath: null,
      },
    });
  } catch (err) {
    if (err instanceof SeatLockError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 409 });
    }
    throw err;
  }

  const upload = await createSignedUploadUrl(
    STORAGE_BUCKETS.paymentSlips,
    slipPath,
  );

  return NextResponse.json({
    bookingId,
    totalPriceAud,
    upload: {
      bucket: STORAGE_BUCKETS.paymentSlips,
      ...upload,
    },
  });
}

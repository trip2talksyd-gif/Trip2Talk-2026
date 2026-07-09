import { NextRequest, NextResponse } from "next/server";

import { generateBookingId } from "@/lib/admin-session";
import { getTotalPriceAud } from "@/lib/booking-pricing";
import {
  SeatLockError,
  createBookingWithSeatLock,
} from "@/lib/bookSeat";
import {
  getDepartureById,
  getTripTemplateByCode,
  updateBooking,
} from "@/lib/db/queries";
import { audToCents, getStripe } from "@/lib/stripe";

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

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Card payments are not configured (STRIPE_SECRET_KEY missing)" },
      { status: 503 },
    );
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
        paymentMethod: "stripe",
        paymentStatus: "pending",
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

  const paymentIntent = await stripe.paymentIntents.create({
    amount: audToCents(totalPriceAud),
    currency: "aud",
    metadata: { bookingId, departureId, tripCode: departure.tripCode },
    receipt_email: email,
  });

  await updateBooking(bookingId, {
    stripe_payment_intent_id: paymentIntent.id,
  });

  return NextResponse.json({
    bookingId,
    clientSecret: paymentIntent.client_secret,
    totalPriceAud,
  });
}

import { NextRequest, NextResponse } from "next/server";

import { generateBookingId } from "@/lib/admin-session";
import { getTotalPriceAud } from "@/lib/booking-pricing";
import {
  SeatLockError,
  createBookingWithSeatLock,
} from "@/lib/bookSeat";
import { getAdminDb } from "@/lib/firebase-admin";
import { audToCents, getStripe } from "@/lib/stripe";
import type { TripTemplate } from "@/lib/types/firestore";

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

  const db = getAdminDb();
  const depSnap = await db.collection("tripDepartures").doc(departureId).get();
  if (!depSnap.exists) {
    return NextResponse.json({ error: "Departure not found" }, { status: 404 });
  }
  const departure = depSnap.data()!;
  const templateSnap = await db
    .collection("tripTemplates")
    .doc(departure.tripCode as string)
    .get();
  const template = templateSnap.data() as TripTemplate;
  const totalPriceAud = getTotalPriceAud(template, seats, subPackage);
  const bookingId = generateBookingId();
  const now = new Date().toISOString();
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  try {
    await createBookingWithSeatLock(db, {
      departureId,
      bookingId,
      seatsRequested: seats,
      bookingData: {
        tripCode: departure.tripCode as string,
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
    metadata: { bookingId, departureId, tripCode: departure.tripCode as string },
    receipt_email: email,
  });

  await db.collection("bookings").doc(bookingId).update({
    stripePaymentIntentId: paymentIntent.id,
  });

  return NextResponse.json({
    bookingId,
    clientSecret: paymentIntent.client_secret,
    totalPriceAud,
  });
}

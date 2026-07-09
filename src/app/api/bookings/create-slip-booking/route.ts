import { NextRequest, NextResponse } from "next/server";

import { generateBookingId } from "@/lib/admin-session";
import { getTotalPriceAud } from "@/lib/booking-pricing";
import {
  SeatLockError,
  createBookingWithSeatLock,
} from "@/lib/bookSeat";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  STORAGE_BUCKETS,
  createSignedUploadUrl,
} from "@/lib/supabase-storage";
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
  const slipPath = `${bookingId}/slip.jpg`;

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

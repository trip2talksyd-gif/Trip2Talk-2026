import { NextRequest, NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/api-admin";
import { createBookingWithSeatLock } from "@/lib/bookSeat";
import { generateBookingId } from "@/lib/admin-session";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  const auth = requireAdminRole(request, "owner");
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const {
    inquiryId,
    tripCode,
    startDate,
    endDate,
    maxSeats,
    customerName,
    phone,
    email,
    seats,
    totalPriceAud,
  } = body;

  if (!tripCode || !startDate || !customerName || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = getAdminDb();
  const departureId = `${tripCode}__${startDate}`;
  const depRef = db.collection("tripDepartures").doc(departureId);
  const depSnap = await depRef.get();

  if (!depSnap.exists) {
    await depRef.set({
      tripCode,
      startDate,
      endDate: endDate ?? null,
      maxSeats: maxSeats ?? 12,
      seatsBooked: 0,
      status: "upcoming",
    });
  }

  const bookingId = generateBookingId();
  await createBookingWithSeatLock(db, {
    departureId,
    bookingId,
    seatsRequested: seats ?? 1,
    bookingData: {
      tripCode,
      departureId,
      customerName,
      phone: phone ?? "",
      email,
      paymentMethod: "bank_slip",
      paymentStatus: "paid",
      stripePaymentIntentId: null,
      slipUrl: null,
      waiverAccepted: true,
      waiverAcceptedAt: new Date().toISOString(),
      waiverAcceptedIp: null,
      complianceDocsUploaded: false,
      docsDeletedAt: null,
      totalPriceAud: totalPriceAud ?? 0,
      confirmationPdfPath: null,
    },
  });

  if (inquiryId) {
    await db.collection("booking_inquiries").doc(inquiryId).update({ status: "confirmed" });
  }

  return NextResponse.json({ ok: true, bookingId, departureId });
}

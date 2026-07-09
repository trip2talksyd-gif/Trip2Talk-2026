import { NextRequest, NextResponse } from "next/server";

import { verifyCronSecret } from "@/lib/cron-auth";
import { adjustTripSeats } from "@/lib/bookSeat";
import { getAdminDb } from "@/lib/firebase-admin";

const EXPIRY_HOURS = 48;

/**
 * Hourly cron: cancel pending_verification bank-slip bookings older than 48h
 * and release their seats via the transaction-guarded adjustTripSeats().
 */
export async function GET(request: NextRequest) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const db = getAdminDb();
  const cutoff = new Date(Date.now() - EXPIRY_HOURS * 60 * 60 * 1000);

  const bookingsSnap = await db
    .collection("bookings")
    .where("paymentStatus", "==", "pending_verification")
    .get();

  const expired: string[] = [];

  for (const bookingDoc of bookingsSnap.docs) {
    const booking = bookingDoc.data();
    const createdAt = new Date(booking.createdAt as string);
    if (createdAt > cutoff) continue;

    const seatsBooked = Number(booking.seatsBooked ?? 1);
    const tripQuery = await db
      .collection("trips")
      .where("tripCode", "==", booking.tripCode)
      .limit(1)
      .get();

    if (!tripQuery.empty) {
      const tripDoc = tripQuery.docs[0]!;
      await adjustTripSeats(db, {
        tripId: tripDoc.id,
        delta: -seatsBooked,
      });
    }

    await bookingDoc.ref.update({
      paymentStatus: "failed",
      expiredAt: new Date().toISOString(),
    });

    expired.push(bookingDoc.id);
  }

  console.log(
    `[cron/expire-pending-slips] Expired ${expired.length} booking(s):`,
    expired,
  );

  return NextResponse.json({
    ok: true,
    expiredCount: expired.length,
    expiredBookingIds: expired,
  });
}

import { NextRequest, NextResponse } from "next/server";

import { adjustDepartureSeats } from "@/lib/bookSeat";
import { verifyCronSecret } from "@/lib/cron-auth";
import { getAdminDb } from "@/lib/firebase-admin";

const EXPIRY_HOURS = 48;

/**
 * Hourly cron: expire pending_verification bank-slip bookings after 48h,
 * release seats via transaction-guarded adjustDepartureSeats().
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
    const departureId = booking.departureId as string | undefined;

    if (departureId) {
      await adjustDepartureSeats(db, {
        departureId,
        delta: -seatsBooked,
      });
    }

    await bookingDoc.ref.update({
      paymentStatus: "expired",
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

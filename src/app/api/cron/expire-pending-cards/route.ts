import { NextRequest, NextResponse } from "next/server";

import { releaseBookingSeats } from "@/lib/bookSeat";
import { verifyCronSecret } from "@/lib/cron-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { getStripe } from "@/lib/stripe";

const EXPIRY_MINUTES = 30;

/**
 * Every 15 min: expire pending Stripe card bookings after 30 min,
 * cancel PaymentIntent server-side, release seats.
 */
export async function GET(request: NextRequest) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const db = getAdminDb();
  const stripe = getStripe();
  const cutoff = new Date(Date.now() - EXPIRY_MINUTES * 60 * 1000);

  const bookingsSnap = await db
    .collection("bookings")
    .where("paymentStatus", "==", "pending")
    .where("paymentMethod", "==", "stripe")
    .get();

  const expired: string[] = [];

  for (const bookingDoc of bookingsSnap.docs) {
    const booking = bookingDoc.data();
    const createdAt = new Date(booking.createdAt as string);
    if (createdAt > cutoff) continue;

    const piId = booking.stripePaymentIntentId as string | null;
    if (piId && stripe) {
      try {
        await stripe.paymentIntents.cancel(piId);
      } catch (err) {
        console.warn(`[expire-pending-cards] Could not cancel PI ${piId}:`, err);
      }
    }

    const seatsBooked = Number(booking.seatsBooked ?? 1);
    const departureId = booking.departureId as string | undefined;
    if (departureId) {
      await releaseBookingSeats(db, { departureId, seatsToRelease: seatsBooked });
    }

    await bookingDoc.ref.update({
      paymentStatus: "expired",
      expiredAt: new Date().toISOString(),
    });
    expired.push(bookingDoc.id);
  }

  return NextResponse.json({
    ok: true,
    expiredCount: expired.length,
    expiredBookingIds: expired,
  });
}

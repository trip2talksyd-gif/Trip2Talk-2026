import { NextRequest, NextResponse } from "next/server";

import { releaseBookingSeats } from "@/lib/bookSeat";
import { verifyCronSecret } from "@/lib/cron-auth";
import { mapBooking } from "@/lib/db/mappers";
import { updateBooking } from "@/lib/db/queries";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";

const EXPIRY_MINUTES = 30;

export async function GET(request: NextRequest) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const stripe = getStripe();
  const cutoff = new Date(Date.now() - EXPIRY_MINUTES * 60 * 1000).toISOString();

  const { data, error } = await getSupabaseAdmin()
    .from("bookings")
    .select("*")
    .eq("payment_status", "pending")
    .eq("payment_method", "stripe")
    .lt("created_at", cutoff);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const expired: string[] = [];

  for (const row of data ?? []) {
    const booking = mapBooking(row);
    const piId = booking.stripePaymentIntentId;
    if (piId && stripe) {
      try {
        await stripe.paymentIntents.cancel(piId);
      } catch (err) {
        console.warn(`[expire-pending-cards] Could not cancel PI ${piId}:`, err);
      }
    }

    if (booking.departureId) {
      await releaseBookingSeats({
        departureId: booking.departureId,
        seatsToRelease: booking.seatsBooked,
      });
    }

    await updateBooking(booking.id, { payment_status: "expired" });
    expired.push(booking.id);
  }

  return NextResponse.json({
    ok: true,
    expiredCount: expired.length,
    expiredBookingIds: expired,
  });
}

import { NextRequest, NextResponse } from "next/server";

import { adjustDepartureSeats } from "@/lib/bookSeat";
import { verifyCronSecret } from "@/lib/cron-auth";
import { mapBooking } from "@/lib/db/mappers";
import { updateBooking } from "@/lib/db/queries";
import { getSupabaseAdmin } from "@/lib/supabase";

const EXPIRY_HOURS = 48;

export async function GET(request: NextRequest) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const cutoff = new Date(Date.now() - EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from("bookings")
    .select("*")
    .eq("payment_status", "pending_verification")
    .lt("created_at", cutoff);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const expired: string[] = [];

  for (const row of data ?? []) {
    const booking = mapBooking(row);
    if (booking.departureId) {
      await adjustDepartureSeats({
        departureId: booking.departureId,
        delta: -booking.seatsBooked,
      });
    }
    await updateBooking(booking.id, { payment_status: "expired" });
    expired.push(booking.id);
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

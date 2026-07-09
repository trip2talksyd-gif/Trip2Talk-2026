import { NextRequest, NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/api-admin";
import { getBookingById } from "@/lib/db/queries";
import {
  STORAGE_BUCKETS,
  createSignedDownloadUrl,
} from "@/lib/supabase-storage";

export async function GET(request: NextRequest) {
  const auth = requireAdminRole(request, ["cashier", "owner", "trip_leader"]);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("bookingId");
  const type = searchParams.get("type") ?? "passport";

  if (!bookingId) {
    return NextResponse.json({ error: "bookingId required" }, { status: 400 });
  }

  const bucket =
    type === "slip"
      ? STORAGE_BUCKETS.paymentSlips
      : STORAGE_BUCKETS.passportDocuments;

  const booking = await getBookingById(bookingId);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const path =
    type === "slip"
      ? booking.slipUrl ?? `${bookingId}/slip.jpg`
      : `${bookingId}/passport.jpg`;

  const url = await createSignedDownloadUrl(bucket, path);
  return NextResponse.json({ url });
}

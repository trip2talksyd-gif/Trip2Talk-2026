import { NextRequest, NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/api-admin";
import { getAdminDb } from "@/lib/firebase-admin";
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

  const db = getAdminDb();
  const snap = await db.collection("bookings").doc(bookingId).get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const booking = snap.data()!;
  const path =
    type === "slip"
      ? (booking.slipUrl as string) ?? `${bookingId}/slip.jpg`
      : `${bookingId}/passport.jpg`;

  const url = await createSignedDownloadUrl(bucket, path);
  return NextResponse.json({ url });
}

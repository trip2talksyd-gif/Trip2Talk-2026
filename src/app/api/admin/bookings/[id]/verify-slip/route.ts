import { NextRequest, NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/api-admin";
import { fulfillPaidBooking } from "@/lib/fulfill-booking";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = requireAdminRole(request, ["cashier", "owner"]);
  if (auth instanceof NextResponse) return auth;

  const db = getAdminDb();
  const bookingRef = db.collection("bookings").doc(params.id);
  const snap = await bookingRef.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const booking = snap.data()!;
  if (booking.paymentStatus !== "pending_verification") {
    return NextResponse.json({ error: "Booking not pending verification" }, { status: 400 });
  }

  await bookingRef.update({
    paymentStatus: "paid",
    verifiedAt: new Date().toISOString(),
    verifiedBy: auth.role,
  });
  await fulfillPaidBooking(params.id, db);

  return NextResponse.json({ ok: true });
}

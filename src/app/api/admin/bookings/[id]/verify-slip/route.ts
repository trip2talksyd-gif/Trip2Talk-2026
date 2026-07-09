import { NextRequest, NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/api-admin";
import { fulfillPaidBooking } from "@/lib/fulfill-booking";
import { getBookingById, updateBooking } from "@/lib/db/queries";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = requireAdminRole(request, ["cashier", "owner"]);
  if (auth instanceof NextResponse) return auth;

  const booking = await getBookingById(params.id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.paymentStatus !== "pending_verification") {
    return NextResponse.json({ error: "Booking not pending verification" }, { status: 400 });
  }

  await updateBooking(params.id, {
    payment_status: "paid",
  });
  await fulfillPaidBooking(params.id);

  return NextResponse.json({ ok: true });
}

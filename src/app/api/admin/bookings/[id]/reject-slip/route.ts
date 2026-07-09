import { NextRequest, NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/api-admin";
import { releaseBookingSeats } from "@/lib/bookSeat";
import { getBookingById, updateBooking } from "@/lib/db/queries";
import { sendCustomerEmail } from "@/lib/resend";

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

  await releaseBookingSeats({
    departureId: booking.departureId,
    seatsToRelease: booking.seatsBooked,
  });

  await updateBooking(params.id, {
    payment_status: "failed",
  });

  await sendCustomerEmail({
    to: booking.email,
    subject: "Trip2Talk — ไม่สามารถยืนยันสลิปได้",
    html: `
      <p>สวัสดีค่ะคุณ ${booking.customerName},</p>
      <p>เราไม่สามารถยืนยันสลิปการโอนเงินของคุณได้ กรุณาอัปโหลดสลิปใหม่หรือชำระด้วยบัตรเครดิต</p>
      <p>หากมีคำถาม ติดต่อ trip2talksyd@gmail.com</p>
    `,
  });

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/api-admin";
import { releaseBookingSeats } from "@/lib/bookSeat";
import { getAdminDb } from "@/lib/firebase-admin";
import { sendCustomerEmail } from "@/lib/resend";

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

  await releaseBookingSeats(db, {
    departureId: booking.departureId as string,
    seatsToRelease: Number(booking.seatsBooked ?? 1),
  });

  await bookingRef.update({
    paymentStatus: "failed",
    rejectedAt: new Date().toISOString(),
    rejectedBy: auth.role,
  });

  await sendCustomerEmail({
    to: booking.email as string,
    subject: "Trip2Talk — ไม่สามารถยืนยันสลิปได้",
    html: `
      <p>สวัสดีค่ะคุณ ${booking.customerName},</p>
      <p>เราไม่สามารถยืนยันสลิปการโอนเงินของคุณได้ กรุณาอัปโหลดสลิปใหม่หรือชำระด้วยบัตรเครดิต</p>
      <p>หากมีคำถาม ติดต่อ trip2talksyd@gmail.com</p>
    `,
  });

  return NextResponse.json({ ok: true });
}

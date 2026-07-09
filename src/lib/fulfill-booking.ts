import type { Firestore } from "firebase-admin/firestore";

import { generateBookingPdf } from "@/lib/generateBookingPdf";
import { getAdminDb } from "@/lib/firebase-admin";
import { sendCustomerEmail } from "@/lib/resend";
import {
  STORAGE_BUCKETS,
  getSupabaseStorageAdmin,
} from "@/lib/supabase-storage";
import type { Booking, TripDeparture, TripTemplate } from "@/lib/types/firestore";

export async function fulfillPaidBooking(
  bookingId: string,
  db: Firestore = getAdminDb(),
): Promise<{ pdfPath: string | null }> {
  const bookingRef = db.collection("bookings").doc(bookingId);
  const bookingSnap = await bookingRef.get();
  if (!bookingSnap.exists) {
    throw new Error(`Booking ${bookingId} not found`);
  }

  const booking = { id: bookingSnap.id, ...bookingSnap.data() } as Booking & {
    id: string;
  };

  const templateSnap = await db
    .collection("tripTemplates")
    .doc(booking.tripCode)
    .get();
  const template = templateSnap.data() as TripTemplate;

  let departure: TripDeparture | null = null;
  if (booking.departureId) {
    const depSnap = await db
      .collection("tripDepartures")
      .doc(booking.departureId)
      .get();
    if (depSnap.exists) departure = depSnap.data() as TripDeparture;
  }

  const pdfBytes = await generateBookingPdf({ booking, template, departure });
  const pdfPath = `${bookingId}/confirmation.pdf`;

  const supabase = getSupabaseStorageAdmin();
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.bookingConfirmations)
    .upload(pdfPath, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    console.error("[fulfillPaidBooking] PDF upload failed:", uploadError.message);
  } else {
    await bookingRef.update({ confirmationPdfPath: pdfPath });
  }

  const { data: signed } = await supabase.storage
    .from(STORAGE_BUCKETS.bookingConfirmations)
    .createSignedUrl(pdfPath, 7 * 24 * 60 * 60);

  await sendCustomerEmail({
    to: booking.email,
    subject: `Trip2Talk — ยืนยันการจอง ${template.nameTH}`,
    html: `
      <p>สวัสดีค่ะคุณ ${booking.customerName},</p>
      <p>การชำระเงินของคุณได้รับการยืนยันแล้ว สำหรับทริป <strong>${template.nameTH}</strong>.</p>
      <p>จำนวนที่นั่ง: ${booking.seatsBooked}</p>
      ${signed?.signedUrl ? `<p><a href="${signed.signedUrl}">ดาวน์โหลดใบยืนยันการจอง (PDF)</a></p>` : ""}
      <p>กรุณาอัปโหลดเอกสารประจำตัวที่ <a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/booking/${bookingId}/upload-documents">หน้าอัปโหลดเอกสาร</a></p>
      <p>ขอบคุณค่ะ — Trip2Talk</p>
    `,
    attachment:
      uploadError || !pdfBytes
        ? undefined
        : {
            filename: `Trip2Talk-${booking.tripCode}-confirmation.pdf`,
            content: Buffer.from(pdfBytes).toString("base64"),
          },
  });

  return { pdfPath: uploadError ? null : pdfPath };
}

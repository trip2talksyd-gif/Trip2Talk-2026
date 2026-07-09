import { generateBookingPdf } from "@/lib/generateBookingPdf";
import {
  getBookingById,
  getDepartureById,
  getTripTemplateByCode,
  updateBooking,
} from "@/lib/db/queries";
import { sendCustomerEmail } from "@/lib/resend";
import { getSupabaseAdmin } from "@/lib/supabase";
import { STORAGE_BUCKETS } from "@/lib/supabase-storage";

export async function fulfillPaidBooking(
  bookingId: string,
): Promise<{ pdfPath: string | null }> {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }

  const template = await getTripTemplateByCode(booking.tripCode);
  if (!template) {
    throw new Error(`Trip template ${booking.tripCode} not found`);
  }

  const departure = booking.departureId
    ? await getDepartureById(booking.departureId)
    : null;

  const pdfBytes = await generateBookingPdf({
    booking,
    template,
    departure,
  });
  const pdfPath = `${bookingId}/confirmation.pdf`;

  const supabase = getSupabaseAdmin();
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.bookingConfirmations)
    .upload(pdfPath, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    console.error("[fulfillPaidBooking] PDF upload failed:", uploadError.message);
  } else {
    await updateBooking(bookingId, { confirmation_pdf_path: pdfPath });
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

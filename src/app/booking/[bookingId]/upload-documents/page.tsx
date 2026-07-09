import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { DocumentUploadClient } from "@/components/booking/DocumentUploadClient";
import { getBookingById } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function UploadDocumentsPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const booking = await getBookingById(params.bookingId);
  if (!booking) notFound();

  if (booking.paymentStatus !== "paid") {
    redirect(`/trips/${booking.tripCode}`);
  }

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      <div className="mx-auto max-w-xl px-4 py-12">
        <h1 className="font-serif text-2xl">อัปโหลดเอกสารประจำตัว</h1>
        <p className="mt-4 text-sm text-white/70 leading-relaxed">
          เพื่อความปลอดภัยและการจัดการทริป เราต้องการสำเนาพาสปอร์ตหรือบัตรประชาชนของผู้เดินทาง
          เอกสารจะถูกเก็บอย่างปลอดภัยและ<strong> จะถูกลบอัตโนมัติประมาณ 7 วันหลังทริปสิ้นสุด</strong>{" "}
          ตามนโยบายความเป็นส่วนตัวของ Trip2Talk
        </p>
        <p className="mt-2 text-sm text-white/50">
          การจอง: {params.bookingId} — {booking.customerName}
        </p>

        {booking.complianceDocsUploaded ? (
          <p className="mt-8 rounded-xl bg-green-900/30 p-4 text-green-200">
            อัปโหลดเอกสารเรียบร้อยแล้ว
          </p>
        ) : (
          <DocumentUploadClient bookingId={params.bookingId} />
        )}

        <Link href="/trips" className="mt-8 inline-block text-sm text-white/60 underline">
          กลับหน้าทริป
        </Link>
      </div>
    </main>
  );
}

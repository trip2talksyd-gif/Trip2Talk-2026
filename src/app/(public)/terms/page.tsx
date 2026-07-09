import type { Metadata } from "next";
import Link from "next/link";

import { COMPANY } from "@/config/company";

export const metadata: Metadata = {
  title: "ข้อกำหนดการใช้บริการ",
  description: "ข้อกำหนดการใช้บริการ Trip2Talk — มัดจำ การยกเลิก และความปลอดภัยระหว่างทริป",
  openGraph: {
    title: "ข้อกำหนดการใช้บริการ | Trip2Talk",
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link href="/" className="text-sm text-white/60 hover:text-white">
          ← หน้าแรก
        </Link>
        <h1 className="mt-6 text-3xl font-semibold">ข้อกำหนดการใช้บริการ</h1>
        <p className="mt-2 text-sm text-white/50">อัปเดตล่าสุด: กรกฎาคม 2026</p>

        <div className="mt-10 space-y-8 text-base leading-relaxed text-white/85">
          <section>
            <h2 className="text-xl font-medium text-white">มัดจำและการยกเลิก</h2>
            <p className="mt-3">
              Trip2Talk ใช้นโยบายมัดจำที่<strong>ไม่คืนเงิน</strong>เป็นหลัก
              (โดยทั่วไป AUD $100 ต่อการจอง หรือตามที่ระบุในแต่ละทริป)
            </p>
            <p className="mt-3">
              <strong>เงื่อนไขเฉพาะทริป</strong> ที่ระบุในหน้ารายละเอียดทริป
              (เช่น นโยบายยกเลิก มัดจำ ที่พัก) มีผลเหนือข้อความทั่วไปในหน้านี้
              กรุณาอ่านก่อนจองทุกครั้ง
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white">ประกันการเดินทาง</h2>
            <p className="mt-3">
              ลูกค้ามีหน้าที่จัดหาประกันการเดินทางของตนเอง
              เว้นแต่ทริปนั้นๆ จะระบุในรายการสิ่งที่รวม (inclusions) ว่ามีประกันให้
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white">ที่พักแบบแชร์/หอพัก</h2>
            <p className="mt-3">
              ทริปบางรายการอาจใช้ที่พักแบบแชร์หรือหอพักตามที่ระบุในนโยบายที่พักของทริป
              การจองถือว่าคุณยอมรับรูปแบบที่พักดังกล่าว
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white">ความปลอดภัยและคำแนะนำ Trip Leader</h2>
            <p className="mt-3">
              ลูกค้าต้องปฏิบัติตามคำแนะนำด้านความปลอดภัยจาก Trip Leader ตลอดทริป
              ทริปบางเส้นทางมีข้อควรระวังเฉพาะ — เช่น ทริป BER-3D2N เกี่ยวกับก้อนหินริมน้ำ
              ระดับน้ำขึ้นลง และการสวมรองเท้าที่เหมาะสม — โปรดอ่าน safety notes
              ในหน้ารายละเอียดทริปก่อนเดินทาง
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white">การยอมรับข้อตกลงการเดินทาง</h2>
            <p className="mt-3">
              การจองออนไลน์ต้องยอมรับ Travel &amp; Trip Consent ก่อนชำระเงิน
              ซึ่งครอบคลุมความเสี่ยงและเงื่อนไขการเข้าร่วมทริป
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white">ติดต่อ</h2>
            <p className="mt-3">
              {COMPANY.email} · {COMPANY.phone} · ABN {COMPANY.abn}
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}

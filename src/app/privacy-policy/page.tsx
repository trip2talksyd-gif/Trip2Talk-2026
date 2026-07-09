import type { Metadata } from "next";
import Link from "next/link";

import { COMPANY } from "@/config/company";

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว",
  description: "นโยบายความเป็นส่วนตัวของ Trip2Talk — การเก็บ ใช้ และลบข้อมูลส่วนบุคคล",
  openGraph: {
    title: "นโยบายความเป็นส่วนตัว | Trip2Talk",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link href="/" className="text-sm text-white/60 hover:text-white">
          ← หน้าแรก
        </Link>
        <h1 className="mt-6 text-3xl font-semibold">นโยบายความเป็นส่วนตัว</h1>
        <p className="mt-2 text-sm text-white/50">อัปเดตล่าสุด: กรกฎาคม 2026</p>

        <div className="mt-10 space-y-8 text-base leading-relaxed text-white/85">
          <section>
            <h2 className="text-xl font-medium text-white">ข้อมูลที่เราเก็บ</h2>
            <p className="mt-3">
              เมื่อคุณจองทริปหรือติดต่อเรา เราอาจเก็บข้อมูลดังนี้:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>ชื่อ นามสกุล เบอร์โทร และอีเมล</li>
              <li>
                ข้อมูลการชำระเงิน — การชำระด้วยบัตรดำเนินการผ่าน Stripe
                เราไม่เก็บหมายเลขบัตรเต็มบนเซิร์ฟเวอร์ของเรา
              </li>
              <li>สลิปโอนเงิน (สำหรับการชำระแบบโอน) — เก็บเป็นไฟล์ในระบบจัดเก็บไฟล์</li>
              <li>
                สำเนาพาสปอร์ตหรือบัตรประชาชน — สำหรับทริปที่ต้องใช้เอกสารยืนยันตัวตน
                หลังชำระเงินแล้ว
              </li>
              <li>ข้อความที่คุณส่งผ่านแบบฟอร์มติดต่อ</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white">ที่เก็บข้อมูล</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong>Firebase Firestore</strong> — ข้อมูลการจอง ทริป ข้อความติดต่อ
                และข้อมูลดำเนินงาน
              </li>
              <li>
                <strong>Supabase Storage</strong> — ไฟล์ เช่น สลิปโอนเงิน เอกสารประจำตัว
                และ PDF ยืนยันการจอง
              </li>
              <li>
                <strong>Stripe</strong> — ประมวลผลการชำระด้วยบัตร (โหมดทดสอบ/จริงตามการตั้งค่า)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white">เอกสารประจำตัว (พาสปอร์ต/บัตร)</h2>
            <p className="mt-3">
              ไฟล์พาสปอร์ตหรือบัตรประชาชนจะถูกลบอัตโนมัติประมาณ{" "}
              <strong>7 วันหลังทริปสิ้นสุด</strong> ตามนโยบายความปลอดภัยของเรา
              (ระบบลบอัตโนมัติจะเปิดใช้หลังตรวจสอบโดยทีมงาน)
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white">การเข้าถึงข้อมูล</h2>
            <p className="mt-3">
              เฉพาะเจ้าหน้าที่ Trip2Talk ที่ได้รับอนุญาตเท่านั้นที่เข้าถึงข้อมูลการจองและไฟล์
              ผ่านระบบแอดมินที่ป้องกันด้วย PIN — ไม่มีการเปิดเผยสาธารณะ
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white">ติดต่อเรื่องความเป็นส่วนตัว</h2>
            <p className="mt-3">
              หากมีคำถามหรือขอให้ลบข้อมูล กรุณาอีเมล{" "}
              <a href={`mailto:${COMPANY.email}`} className="underline">
                {COMPANY.email}
              </a>
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}

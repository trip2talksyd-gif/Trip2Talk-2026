import Link from "next/link";

import { TripFinderClient } from "@/components/trip-finder/TripFinderClient";
import { fetchActiveTemplatesWithMatchTags } from "@/lib/trips-server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "หาทริปที่ใช่",
  description: "Trip Matcher — ตอบคำถามสั้นๆ แล้วเราจะแนะนำทริปถ่ายภาพที่เหมาะกับคุณ",
};

export default async function TripFinderPage() {
  const templates = await fetchActiveTemplatesWithMatchTags();

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Link href="/" className="text-sm text-white/60 hover:text-white">
          ← หน้าแรก
        </Link>
        <h1 className="mt-4 font-serif text-3xl">หาทริปที่ใช่สำหรับคุณ</h1>
        <p className="mt-3 text-white/70">
          ตอบคำถาม 5 ข้อ แล้วเราจะจับคู่ทริปจากข้อมูลจริงของ Trip2Talk — ไม่ใช้ AI ไม่มีค่าใช้จ่ายเพิ่ม
        </p>
        <div className="mt-10">
          <TripFinderClient templates={templates} />
        </div>
      </div>
    </main>
  );
}

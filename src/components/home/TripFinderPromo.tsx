import Link from "next/link";

export function TripFinderPromo() {
  return (
    <section className="border-b border-white/10 bg-[#0a1628] px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-[#C8A84B]">Trip Matcher</p>
          <h2 className="mt-1 font-serif text-2xl text-white">หาทริปที่ใช่สำหรับคุณ</h2>
          <p className="mt-2 max-w-xl text-sm text-white/65">
            ตอบคำถาม 5 ข้อ แล้วเราจะแนะนำทริปที่ตรงกับเดือน สไตล์ถ่ายภาพ และงบของคุณ
          </p>
        </div>
        <Link
          href="/trip-finder"
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-white/90 px-8 text-sm font-medium text-black transition-colors hover:bg-white"
        >
          เริ่มค้นหาทริป
        </Link>
      </div>
    </section>
  );
}

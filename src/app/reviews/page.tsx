import type { Metadata } from "next";
import Link from "next/link";

import { ReviewCard, ReviewsEmpty } from "@/components/reviews/ReviewCard";
import { fetchApprovedReviews } from "@/server/reviews-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "รีวิว",
  description: "รีวิวจากลูกค้า Trip2Talk — ประสบการณ์ทริปถ่ายภาพทั่วออสเตรเลีย",
  openGraph: {
    title: "รีวิว | Trip2Talk",
    description: "รีวิวจากลูกค้า Trip2Talk",
  },
};

export default async function ReviewsPage() {
  const reviews = await fetchApprovedReviews();

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Link href="/" className="text-sm text-white/60 hover:text-white">
          ← หน้าแรก
        </Link>
        <h1
          className="mt-4 font-serif text-4xl"
          style={{ fontFamily: "var(--font-instrument-serif), var(--font-noto-serif-thai), serif" }}
        >
          รีวิวจากลูกค้า
        </h1>
        <p className="mt-2 text-white/70">
          เสียงจากผู้ที่เดินทางกับเรา — รีวิปคัดสรรโดยทีมงาน Trip2Talk
        </p>

        <div className="mt-10 space-y-6">
          {reviews.length === 0 ? (
            <ReviewsEmpty />
          ) : (
            reviews.map((r) => <ReviewCard key={r.id} review={r} />)
          )}
        </div>
      </div>
    </main>
  );
}

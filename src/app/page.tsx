import type { Metadata } from "next";

import { CtaSection } from "@/components/cta/CtaSection";
import { FeaturedTrips } from "@/components/home/FeaturedTrips";
import { HomeHero } from "@/components/home/HomeHero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ReviewsPreview } from "@/components/home/ReviewsPreview";
import { fetchFeaturedTrips } from "@/server/home-data";
import { fetchApprovedReviews } from "@/server/reviews-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "หน้าแรก",
  description:
    "Trip2Talk — ทริปถ่ายภาพทั่วออสเตรเลีย คนขับ Trip Leader และช่างภาพในทีมเดียว จองออนไลน์ได้เลย",
  openGraph: {
    title: "หน้าแรก | Trip2Talk",
    description:
      "เก็บทุกโมเมนต์ ทุกทริป ให้กลายเป็นภาพในตำนาน — จองทริปถ่ายภาพกับ Trip2Talk",
  },
};

export default async function Home() {
  const [featured, reviews] = await Promise.all([
    fetchFeaturedTrips(4),
    fetchApprovedReviews(3),
  ]);

  return (
    <main className="min-h-screen bg-[#0a1628]">
      <HomeHero />
      <FeaturedTrips trips={featured} />
      <HowItWorks />
      <ReviewsPreview reviews={reviews} />
      <CtaSection />
    </main>
  );
}

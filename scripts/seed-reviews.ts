import { config } from "dotenv";
import { resolve } from "path";

import { getSupabaseAdmin } from "../src/lib/supabase";

config({ path: resolve(process.cwd(), ".env.local") });

const PLACEHOLDER_REVIEWS = [
  {
    customer_name: "นุ่น ส.",
    trip_code: "MEL-4D3N",
    rating: 5,
    review_text:
      "ได้รูปสวยมาก ช่างภาพแนะนำมุมดีมาก ไม่ต้องกังวลเรื่องขับรถเองเลย ทริปนี้คุ้มมากค่ะ",
    photo_url: null,
    approved: true,
  },
  {
    customer_name: "James T.",
    trip_code: "ULU-4D3N",
    rating: 5,
    review_text:
      "Uluru at sunrise was incredible. The photo guidance made all the difference — came home with shots I never thought I could take.",
    photo_url: null,
    approved: true,
  },
  {
    customer_name: "พลอย ว.",
    trip_code: "SYD-MW-WIN",
    rating: 5,
    review_text:
      "ทางช้างเผือกชัดมาก! ทีมงานช่วยตั้งคamera ให้ทุกคน ได้รูปสวยกลับบ้านเต็มกระเป๋า",
    photo_url: null,
    approved: true,
  },
  {
    customer_name: "Michael L.",
    trip_code: "PSP-1DAY",
    rating: 4,
    review_text:
      "Great day trip to Port Stephens. Small group meant plenty of time at each spot. Would recommend for anyone wanting quality photos without the hassle.",
    photo_url: null,
    approved: true,
  },
  {
    customer_name: "แอน ก.",
    trip_code: "CAN-2D1N",
    rating: 5,
    review_text:
      "ทุ่งคาโนล่าสวยมาก ได้รูปโปรไฟล์สวยๆ กลับมาเยอะเลย กลุ่มเล็กๆ สบายดี",
    photo_url: null,
    approved: true,
  },
];

async function main() {
  console.log("Trip2Talk v7 — seed reviews (PLACEHOLDER — replace before launch)\n");
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("reviews").insert(PLACEHOLDER_REVIEWS);
  if (error) throw new Error(error.message);

  console.log(`  ✓ inserted ${PLACEHOLDER_REVIEWS.length} placeholder reviews`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

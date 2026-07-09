/**
 * PLACEHOLDER REVIEWS — replace with real customer reviews before public launch,
 * or wire up an admin UI to manage this collection.
 */
import { config } from "dotenv";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { resolve } from "path";

import type { Review } from "../src/types/review";

config({ path: resolve(process.cwd(), ".env.local") });

const PLACEHOLDER_REVIEWS: Review[] = [
  {
    customerName: "คุณนภา",
    tripCode: "CAN-2D1N",
    rating: 5,
    text: "ได้ภพทะเลและหินปูนสวยมาก ทีมงานช่วยจัดมุมถ่ายตลอดทาง ประทับใจมากค่ะ",
    photoUrl: null,
    approved: true,
    createdAt: "2026-06-01T00:00:00.000Z",
  },
  {
    customerName: "คุณธีรพงษ์",
    tripCode: "TAS-3D2N",
    rating: 5,
    text: "ทริปถ่ายดาวและแสงเหนือสุดยอด Trip Leader ดูแลดีและสอนถ่ายภาพให้ด้วย",
    photoUrl: null,
    approved: true,
    createdAt: "2026-05-15T00:00:00.000Z",
  },
  {
    customerName: "คุณพิมพ์",
    tripCode: "MEL-4D3N",
    rating: 4,
    text: "ได้ภาพเมืองและชายหาดสวย กลุ่มเล็กเดินทางสะดวก แนะนำสำหรับคนชอบถ่ายภาพ",
    photoUrl: null,
    approved: true,
    createdAt: "2026-04-20T00:00:00.000Z",
  },
  {
    customerName: "คุณอร",
    tripCode: null,
    rating: 5,
    text: "บริการเป็นกันเอง ได้ภาพกลับบ้านเยอะมาก อยากไปอีกครั้งแน่นอน",
    photoUrl: null,
    approved: true,
    createdAt: "2026-03-10T00:00:00.000Z",
  },
  {
    customerName: "คุณวิชัย",
    tripCode: "ULU-4D3N",
    rating: 5,
    text: "ทริปทะเลทรายและโดมเต็นท์ประทับใจมาก แสงเช้าเย็นสวยทุกวัน",
    photoUrl: null,
    approved: true,
    createdAt: "2026-02-01T00:00:00.000Z",
  },
];

function initFirebase() {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Missing Firebase Admin env vars");
    }
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }
  return getFirestore();
}

async function main() {
  const db = initFirebase();
  console.log("Trip2Talk V6 — seed PLACEHOLDER reviews\n");
  console.log(
    "⚠ PLACEHOLDER REVIEWS — replace before public launch (see script header)\n",
  );

  const batch = db.batch();
  const col = db.collection("reviews");

  for (const review of PLACEHOLDER_REVIEWS) {
    const ref = col.doc();
    batch.set(ref, review);
    console.log(`  ✓ ${ref.id} — ${review.customerName}`);
  }

  await batch.commit();
  console.log(`\nSeeded ${PLACEHOLDER_REVIEWS.length} reviews.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

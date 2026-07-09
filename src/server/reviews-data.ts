import { getAdminDb } from "@/lib/firebase-admin";
import type { Review, ReviewDoc } from "@/types/review";

export async function fetchApprovedReviews(limit?: number): Promise<ReviewDoc[]> {
  const db = getAdminDb();
  let query = db
    .collection("reviews")
    .where("approved", "==", true)
    .orderBy("createdAt", "desc") as FirebaseFirestore.Query;

  if (limit) query = query.limit(limit);

  const snap = await query.get();
  const tripNames = new Map<string, string>();

  const reviews: ReviewDoc[] = [];
  for (const doc of snap.docs) {
    const data = doc.data() as Review;
    let tripNameTH: string | null = null;
    if (data.tripCode) {
      if (!tripNames.has(data.tripCode)) {
        const t = await db.collection("tripTemplates").doc(data.tripCode).get();
        tripNames.set(data.tripCode, t.exists ? (t.data()?.nameTH as string) : data.tripCode);
      }
      tripNameTH = tripNames.get(data.tripCode) ?? null;
    }
    reviews.push({ id: doc.id, ...data, tripNameTH });
  }
  return reviews;
}

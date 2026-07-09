import { mapReview, mapTripTemplate } from "@/lib/db/mappers";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { ReviewDoc } from "@/types/review";

export async function fetchApprovedReviews(limit = 20): Promise<ReviewDoc[]> {
  const supabase = getSupabaseAdmin();

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  const docs = (reviews ?? []).map(mapReview);
  const tripCodes = Array.from(
    new Set(docs.map((r) => r.tripCode).filter(Boolean) as string[]),
  );

  const nameByCode = new Map<string, string>();
  if (tripCodes.length > 0) {
    const { data: templates } = await supabase
      .from("trip_templates")
      .select("trip_code, name_th")
      .in("trip_code", tripCodes);

    for (const t of templates ?? []) {
      nameByCode.set(t.trip_code, t.name_th);
    }
  }

  return docs.map((r) => ({
    ...r,
    tripNameTH: r.tripCode ? nameByCode.get(r.tripCode) ?? null : null,
  }));
}

export async function fetchAllApprovedReviewsForPage(): Promise<ReviewDoc[]> {
  return fetchApprovedReviews(100);
}

export { mapTripTemplate };

import { fetchActiveCatalog, tripImageUrl } from "@/lib/trips-server";

export async function fetchFeaturedTrips(limit = 4) {
  const catalog = await fetchActiveCatalog();
  return catalog
    .sort((a, b) => {
      const aScore = a.nearestDeparture?.startDate ? 1 : 0;
      const bScore = b.nearestDeparture?.startDate ? 1 : 0;
      return bScore - aScore;
    })
    .slice(0, limit)
    .map((t) => ({
      ...t,
      imageUrl: tripImageUrl(t.template.promoImageRef),
    }));
}

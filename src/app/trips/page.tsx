import { TripsCatalogClient } from "@/components/trips/TripsCatalogClient";
import { fetchActiveCatalog, tripImageUrl } from "@/lib/trips-server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ทริปทั้งหมด | Trip2Talk",
  description: "ดูทริปถ่ายภาพทั้งหมดของ Trip2Talk — จองออนไลน์",
};

export default async function TripsPage() {
  const catalog = await fetchActiveCatalog();
  const trips = catalog.map((t) => ({
    ...t,
    imageUrl: tripImageUrl(t.template.promoImageRef),
  }));

  return <TripsCatalogClient trips={trips} />;
}

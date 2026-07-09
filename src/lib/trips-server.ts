import { getAdminDb } from "@/lib/firebase-admin";
import { publicTripPhotoUrl } from "@/lib/supabase-storage";
import type { TripDeparture, TripTemplate } from "@/lib/types/firestore";

export interface CatalogTrip {
  template: TripTemplate;
  nearestDeparture: TripDeparture | null;
  departureId: string | null;
  seatsRemaining: number | null;
}

export async function fetchActiveCatalog(): Promise<CatalogTrip[]> {
  const db = getAdminDb();
  const [templatesSnap, departuresSnap] = await Promise.all([
    db.collection("tripTemplates").where("active", "==", true).get(),
    db.collection("tripDepartures").get(),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const departuresByTrip = new Map<string, Array<{ id: string; dep: TripDeparture }>>();

  for (const doc of departuresSnap.docs) {
    const dep = doc.data() as TripDeparture;
    const list = departuresByTrip.get(dep.tripCode) ?? [];
    list.push({ id: doc.id, dep });
    departuresByTrip.set(dep.tripCode, list);
  }

  return templatesSnap.docs
    .map((doc) => {
      const template = doc.data() as TripTemplate;
      const deps = (departuresByTrip.get(template.tripCode) ?? [])
        .filter((d) => d.dep.startDate && d.dep.startDate >= today && d.dep.status !== "cancelled")
        .sort((a, b) => (a.dep.startDate! > b.dep.startDate! ? 1 : -1));

      const nearest = deps[0] ?? null;
      return {
        template,
        nearestDeparture: nearest?.dep ?? null,
        departureId: nearest?.id ?? null,
        seatsRemaining: nearest
          ? nearest.dep.maxSeats - nearest.dep.seatsBooked
          : null,
      };
    })
    .filter((t) => t.template.tripCode !== "PRIVATE-1DAY");
}

export async function fetchTripByCode(tripCode: string): Promise<{
  template: TripTemplate;
  departures: Array<{ id: string; dep: TripDeparture }>;
} | null> {
  const db = getAdminDb();
  const templateSnap = await db.collection("tripTemplates").doc(tripCode).get();
  if (!templateSnap.exists) return null;

  const today = new Date().toISOString().slice(0, 10);
  const depsSnap = await db
    .collection("tripDepartures")
    .where("tripCode", "==", tripCode)
    .get();

  const departures = depsSnap.docs
    .map((d) => ({ id: d.id, dep: d.data() as TripDeparture }))
    .filter((d) => !d.dep.startDate || d.dep.startDate >= today)
    .sort((a, b) => {
      if (!a.dep.startDate) return 1;
      if (!b.dep.startDate) return -1;
      return a.dep.startDate > b.dep.startDate ? 1 : -1;
    });

  return { template: templateSnap.data() as TripTemplate, departures };
}

export function tripImageUrl(promoImageRef: string | null): string {
  if (!promoImageRef) return "/images/cta-horizon-placeholder.png";
  try {
    return publicTripPhotoUrl(promoImageRef);
  } catch {
    return "/images/cta-horizon-placeholder.png";
  }
}

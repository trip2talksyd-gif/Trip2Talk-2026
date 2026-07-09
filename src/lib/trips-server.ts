import { mapTripDeparture, mapTripTemplate } from "@/lib/db/mappers";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { TripDeparture, TripTemplate } from "@/lib/types/database";

export interface CatalogTrip {
  template: TripTemplate;
  nearestDeparture: TripDeparture | null;
  departureId: string | null;
  seatsRemaining: number | null;
}

export async function fetchActiveCatalog(): Promise<CatalogTrip[]> {
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: templates, error: tErr }, { data: departures, error: dErr }] =
    await Promise.all([
      supabase.from("trip_templates").select("*").eq("active", true),
      supabase.from("trip_departures").select("*"),
    ]);

  if (tErr) throw new Error(tErr.message);
  if (dErr) throw new Error(dErr.message);

  const departuresByTrip = new Map<
    string,
    Array<{ id: string; dep: TripDeparture }>
  >();

  for (const row of departures ?? []) {
    const dep = mapTripDeparture(row);
    const list = departuresByTrip.get(dep.tripCode) ?? [];
    list.push({ id: row.id, dep });
    departuresByTrip.set(dep.tripCode, list);
  }

  return (templates ?? [])
    .map((row) => {
      const template = mapTripTemplate(row);
      const deps = (departuresByTrip.get(template.tripCode) ?? [])
        .filter(
          (d) =>
            d.dep.startDate &&
            d.dep.startDate >= today &&
            d.dep.status !== "cancelled",
        )
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
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);

  const { data: templateRow, error: tErr } = await supabase
    .from("trip_templates")
    .select("*")
    .eq("trip_code", tripCode)
    .maybeSingle();

  if (tErr) throw new Error(tErr.message);
  if (!templateRow) return null;

  const { data: depRows, error: dErr } = await supabase
    .from("trip_departures")
    .select("*")
    .eq("trip_code", tripCode);

  if (dErr) throw new Error(dErr.message);

  const departures = (depRows ?? [])
    .map((row) => ({ id: row.id, dep: mapTripDeparture(row) }))
    .filter((d) => !d.dep.startDate || d.dep.startDate >= today)
    .sort((a, b) => {
      if (!a.dep.startDate) return 1;
      if (!b.dep.startDate) return -1;
      return a.dep.startDate > b.dep.startDate ? 1 : -1;
    });

  return { template: mapTripTemplate(templateRow), departures };
}

export { tripImageUrl } from "@/lib/trip-images";

export async function fetchActiveTemplatesWithMatchTags(): Promise<
  TripTemplate[]
> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("trip_templates")
    .select("*")
    .eq("active", true);

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapTripTemplate);
}

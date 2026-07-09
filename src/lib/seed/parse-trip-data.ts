import type { TripTemplate as CatalogTemplate } from "@/lib/types/trip-catalog";
import type {
  TripDepartureSeedDoc,
  TripPricingNotes,
  TripTemplate,
} from "@/lib/types/firestore";

export interface DataQualityFlag {
  tripCode: string;
  severity: "warning" | "blocker";
  message: string;
}

export interface SeedParseResult {
  templates: TripTemplate[];
  departures: TripDepartureSeedDoc[];
  flags: DataQualityFlag[];
}

const DEFAULT_MAX_SEATS = 6;

function mapPricing(pricing: CatalogTemplate["pricing"]): TripPricingNotes {
  const notes: TripPricingNotes = {};
  for (const [key, tier] of Object.entries(pricing)) {
    notes[key] = { amountAUD: tier.amountAUD, note: tier.note };
  }
  return notes;
}

export function catalogTemplateToFirestore(
  raw: CatalogTemplate,
): TripTemplate {
  return {
    tripCode: raw.tripCode,
    category: raw.category,
    departureType: raw.departureType,
    nameTH: raw.nameTH,
    tagline: raw.tagline,
    highlights: raw.highlights ?? [],
    itinerary: raw.itinerary ?? [],
    pricing: mapPricing(raw.pricing),
    basePriceAUD:
      raw.pricing.standard?.amountAUD ??
      raw.pricing.weekday?.amountAUD ??
      Object.values(raw.pricing)[0]?.amountAUD ??
      0,
    depositRequiredAUD: raw.depositPolicy?.includes("$100") ? 100 : 100,
    inclusions: raw.inclusions,
    exclusions: raw.exclusions,
    accommodationPolicy: raw.accommodationPolicy ?? null,
    cancellationPolicy: raw.cancellationPolicy ?? null,
    depositPolicy: raw.depositPolicy ?? null,
    safetyNotes: raw.safetyNotes ?? null,
    subPackages: raw.subPackages ?? null,
    seasonalItineraries: raw.seasonalItineraries ?? null,
    seasonalWindowText: raw.seasonalWindowText ?? null,
    travelTime: raw.travelTime ?? null,
    maxMembersText: raw.maxMembersText ?? null,
    maxSeatsBookable: raw.maxSeatsBookable,
    maxSeatsFlag: raw.maxSeatsFlag ?? null,
    additionalNote: raw.additionalNote ?? null,
    hashtags: raw.hashtags ?? null,
    seasonNote: raw.seasonNote ?? null,
    flightInfo: raw.flightInfo ?? null,
    promoImageRef: raw.promoImageRef ?? null,
    galleryUrl: "",
    active: raw.active,
  };
}

export function departureDocId(tripCode: string, startDate: string): string {
  return `${tripCode}__${startDate}`;
}

function daySpanInclusive(start: string, end: string): number {
  const s = new Date(`${start}T00:00:00Z`).getTime();
  const e = new Date(`${end}T00:00:00Z`).getTime();
  return Math.round((e - s) / 86_400_000) + 1;
}

export function collectDataQualityFlags(
  rawTemplates: CatalogTemplate[],
): DataQualityFlag[] {
  const flags: DataQualityFlag[] = [];

  for (const t of rawTemplates) {
    if (t.maxSeatsBookable === null) {
      flags.push({
        tripCode: t.tripCode,
        severity: "blocker",
        message:
          "maxSeatsBookable is null in source data — confirm a seat cap before going live.",
      });
    }

    if (t.maxSeatsFlag) {
      flags.push({
        tripCode: t.tripCode,
        severity: "warning",
        message: t.maxSeatsFlag,
      });
    }

    if (t.tripCode === "TAS-3D2N") {
      for (const d of t.knownDepartures) {
        if (d.startDate && d.endDate) {
          const span = daySpanInclusive(d.startDate, d.endDate);
          if (span > 4) {
            flags.push({
              tripCode: "TAS-3D2N",
              severity: "blocker",
              message: `Seeded departure ${d.startDate}–${d.endDate} spans ${span} calendar days but the trip is labeled 3D2N (3 days / 2 nights). Confirm correct dates with Saen before enabling bookings.`,
            });
          }
        }
      }
    }

    for (const d of t.knownDepartures) {
      if (d.note?.includes("ยืนยันปี") || d.note?.includes("confirm year")) {
        flags.push({
          tripCode: t.tripCode,
          severity: "warning",
          message: `Departure ${d.startDate ?? "TBA"}: ${d.note} (assumed 2026 in seed).`,
        });
      }
    }
  }

  return flags;
}

export function expandDeparturesFromTemplate(
  raw: CatalogTemplate,
): TripDepartureSeedDoc[] {
  const bookable = raw.knownDepartures.filter((d) => d.startDate);

  return bookable.map((departure) => {
    const startDate = departure.startDate!;
    const maxSeats =
      departure.maxSeats ??
      raw.maxSeatsBookable ??
      DEFAULT_MAX_SEATS;

    return {
      docId: departureDocId(raw.tripCode, startDate),
      tripCode: raw.tripCode,
      startDate,
      endDate: departure.endDate ?? null,
      maxSeats,
      seatsBooked: departure.seatsBooked ?? 0,
      status: "upcoming" as const,
    };
  });
}

export function parseTripSeedData(rawTemplates: CatalogTemplate[]): SeedParseResult {
  const templates = rawTemplates.map(catalogTemplateToFirestore);
  const departures = rawTemplates.flatMap(expandDeparturesFromTemplate);
  const flags = collectDataQualityFlags(rawTemplates);

  return { templates, departures, flags };
}

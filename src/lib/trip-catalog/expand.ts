import type { TripTemplate } from "@/lib/types/trip-catalog";
import type { Trip, TripSeedDoc } from "@/lib/types/firestore";

const DEFAULT_MAX_SEATS = 6;

/** Extract English title from parentheses at end of Thai name, e.g. "(Victoria Photo Trip)". */
export function extractEnglishTitle(nameTH: string): string {
  const match = nameTH.match(/\(([^)]+)\)\s*$/);
  return match?.[1]?.trim() ?? nameTH;
}

export function flattenItinerary(
  entries: TripTemplate["itinerary"] = [],
): string {
  return entries
    .map((entry) => {
      const prefix = entry.day
        ? `Day ${entry.day}`
        : entry.time
          ? entry.time
          : "";
      return prefix ? `${prefix}: ${entry.text}` : entry.text;
    })
    .join("\n");
}

function primaryPrice(template: TripTemplate): number {
  const tier =
    template.pricing.standard ??
    template.pricing.weekday ??
    template.pricing.peakSeason;
  return tier?.amountAUD ?? 0;
}

function secondaryPrice(template: TripTemplate): number {
  return (
    template.pricing.private?.amountAUD ??
    template.pricing.weekend?.amountAUD ??
    primaryPrice(template)
  );
}

function resolveMaxSeats(
  template: TripTemplate,
  departureMax?: number,
): number {
  return (
    departureMax ??
    template.maxSeatsBookable ??
    DEFAULT_MAX_SEATS
  );
}

function buildBaseTripFields(template: TripTemplate): Omit<
  Trip,
  "maxSeats" | "seatsBooked" | "fixedDate" | "endDate"
> {
  const pricingNotes: Trip["pricingNotes"] = {};
  for (const [key, tier] of Object.entries(template.pricing)) {
    pricingNotes[key] = {
      amountAUD: tier.amountAUD,
      note: tier.note,
    };
  }

  return {
    tripCode: template.tripCode,
    category: template.category,
    departureType: template.departureType,
    title: extractEnglishTitle(template.nameTH),
    titleTH: template.nameTH,
    tagline: template.tagline,
    description: template.tagline,
    highlights: template.highlights ?? [],
    itinerary: template.itinerary ?? [],
    itineraryText: flattenItinerary(template.itinerary),
    inclusions: template.inclusions,
    exclusions: template.exclusions,
    accommodationPolicy: template.accommodationPolicy ?? null,
    priceAdult: primaryPrice(template),
    priceChild: secondaryPrice(template),
    pricingNotes,
    heroImageUrl: template.promoImageRef
      ? `trip-photos/${template.promoImageRef}`
      : "",
    galleryUrl: "",
    promoImageRef: template.promoImageRef ?? null,
    seasonalWindowText: template.seasonalWindowText ?? null,
    maxMembersText: template.maxMembersText ?? null,
    active: template.active,
  };
}

function tripDocId(tripCode: string, startDate: string | null): string {
  return startDate ? `${tripCode}__${startDate}` : `${tripCode}__tba`;
}

/**
 * Expands catalog templates into bookable Firestore trip docs.
 * One doc per known departure with a startDate; seasonal/on-request trips
 * without departures get a single Date TBA doc.
 */
export function expandTemplateToTripDocs(template: TripTemplate): TripSeedDoc[] {
  const base = buildBaseTripFields(template);
  const bookableDepartures = template.knownDepartures.filter(
    (d) => d.startDate,
  );

  if (bookableDepartures.length === 0) {
    return [
      {
        ...base,
        docId: tripDocId(template.tripCode, null),
        maxSeats: resolveMaxSeats(template),
        seatsBooked: 0,
        fixedDate: null,
        endDate: null,
      },
    ];
  }

  return bookableDepartures.map((departure) => {
    const startDate = departure.startDate!;
    let endDate = departure.endDate ?? null;

    // TAS-3D2N: source had 6-day range for a 3D2N trip — corrected to 3 nights
    if (template.tripCode === "TAS-3D2N" && startDate === "2026-03-16") {
      endDate = "2026-03-18";
    }

    return {
      ...base,
      docId: tripDocId(template.tripCode, startDate),
      maxSeats: resolveMaxSeats(template, departure.maxSeats),
      seatsBooked: departure.seatsBooked ?? 0,
      fixedDate: startDate,
      endDate,
    };
  });
}

export function expandCatalogToTripDocs(
  templates: TripTemplate[],
): TripSeedDoc[] {
  return templates.flatMap(expandTemplateToTripDocs);
}

/** Flags copy that uses banned brand words (Tour, Guide, ทัวร์, ไกด์). */
export function findBrandViolations(
  text: string,
  neverUse: string[],
): string[] {
  const found: string[] = [];
  for (const word of neverUse) {
    if (text.includes(word)) {
      found.push(word);
    }
  }
  return found;
}

export function auditTemplateBrandLanguage(
  template: TripTemplate,
  neverUse: string[],
): { tripCode: string; violations: string[] } {
  const blob = JSON.stringify(template);
  return {
    tripCode: template.tripCode,
    violations: findBrandViolations(blob, neverUse),
  };
}

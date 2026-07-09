export type TripCategory =
  | "multi-day"
  | "one-day"
  | "one-day-multi-package";

export type DepartureType = "fixed_group" | "seasonal_on_request";

export interface TripHighlight {
  title: string;
  description: string;
}

export interface TripItineraryEntry {
  day?: number | string;
  time?: string;
  text: string;
}

export interface KnownDeparture {
  startDate: string | null;
  endDate?: string | null;
  maxSeats?: number;
  seatsBooked?: number;
  rateType?: string;
  note?: string;
  flag?: string;
}

export interface PricingTier {
  amountAUD: number;
  note: string;
  amountRangeAUD?: [number, number];
}

export interface TripTemplate {
  tripCode: string;
  category: TripCategory;
  departureType: DepartureType;
  nameTH: string;
  tagline: string;
  durationDays?: number;
  seasonalWindowText?: string;
  travelTime?: string;
  maxMembersText: string;
  maxSeatsBookable: number | null;
  maxSeatsFlag?: string;
  knownDepartures: KnownDeparture[];
  highlights?: TripHighlight[];
  itinerary?: TripItineraryEntry[];
  seasonalItineraries?: Array<{
    season: string;
    monthsTH: string;
    description: string;
    route: string;
  }>;
  subPackages?: Array<Record<string, unknown>>;
  pricing: Record<string, PricingTier>;
  inclusions: string[];
  exclusions: string[];
  accommodationPolicy?: string | null;
  depositPolicy?: string;
  cancellationPolicy?: string[];
  additionalNote?: string;
  safetyNotes?: string[];
  hashtags?: string[];
  seasonNote?: string;
  flightInfo?: Record<string, unknown>;
  promoImageRef?: string | null;
  active: boolean;
}

export interface TripCatalog {
  company: {
    email: string;
    abn: string;
    brandRules: {
      neverUse: string[];
      alwaysUse: string[];
    };
  };
  tripTemplates: TripTemplate[];
  privateOneDayCustom?: Record<string, unknown>;
}

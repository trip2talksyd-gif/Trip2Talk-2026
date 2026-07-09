import type { TripHighlight, TripItineraryEntry } from "@/lib/types/trip-catalog";

export interface TripPricingNotes {
  [tier: string]: { amountAUD: number; note: string };
}

/** One Firestore `trips` document — one fixed departure date (or Date TBA). */
export interface Trip {
  tripCode: string;
  category: string;
  departureType: string;
  title: string;
  titleTH: string;
  tagline: string;
  description: string;
  highlights: TripHighlight[];
  itinerary: TripItineraryEntry[];
  itineraryText: string;
  inclusions: string[];
  exclusions: string[];
  accommodationPolicy: string | null;
  priceAdult: number;
  priceChild: number;
  pricingNotes: TripPricingNotes;
  maxSeats: number;
  seatsBooked: number;
  /** null = not bookable anywhere in UI ("Date TBA") */
  fixedDate: string | null;
  endDate: string | null;
  heroImageUrl: string;
  galleryUrl: string;
  promoImageRef: string | null;
  seasonalWindowText: string | null;
  maxMembersText: string | null;
  active: boolean;
}

export type PaymentMethod = "stripe" | "bank_slip";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "pending_verification"
  | "failed"
  | "refunded";

export interface Booking {
  tripCode: string;
  customerName: string;
  phone: string;
  email: string;
  seatsBooked: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId: string | null;
  slipUrl: string | null;
  waiverAccepted: boolean;
  complianceDocsUploaded: boolean;
  docsDeletedAt: string | null;
  createdAt: string;
}

export interface StaffProfile {
  pinCode: string | null;
  pinHash: string | null;
  fullName: string;
  role: "OWNER" | "MANAGER" | "TRIP_LEADER" | "CASHIER";
  phone: string | null;
  email: string | null;
}

export interface StaffCommissionLedgerEntry {
  staffId: string | null;
  tripId: string | null;
  amountAud: number;
  note: string | null;
  createdAt: string;
}

export interface Expense {
  amountAud: number;
  atoCategory: string;
  vendorName: string;
  hasGst: boolean;
  gstAmountAud: number;
  createdAt: string;
}

export interface InsuranceAlert {
  itemName: string;
  itemType: string;
  expiryDate: string;
  isActive: boolean;
}

export type BookingWriteData = Omit<Booking, "seatsBooked" | "createdAt">;

export interface TripSeedDoc extends Trip {
  /** Deterministic Firestore doc id */
  docId: string;
}

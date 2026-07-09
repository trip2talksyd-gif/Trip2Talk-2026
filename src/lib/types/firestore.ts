import type { TripHighlight, TripItineraryEntry } from "@/lib/types/trip-catalog";

export interface TripPricingNotes {
  [tier: string]: { amountAUD: number; note: string };
}

/** Static trip content — one doc per trip code in `tripTemplates`. */
export interface TripTemplate {
  tripCode: string;
  category: string;
  departureType: string;
  nameTH: string;
  tagline: string;
  highlights: TripHighlight[];
  itinerary: TripItineraryEntry[];
  pricing: TripPricingNotes;
  basePriceAUD: number;
  /** Strict no-refund deposit — defaults to $100 AUD from master dataset */
  depositRequiredAUD: number;
  inclusions: string[];
  exclusions: string[];
  accommodationPolicy: string | null;
  cancellationPolicy?: string[] | null;
  depositPolicy?: string | null;
  safetyNotes?: string[] | null;
  subPackages?: Array<Record<string, unknown>> | null;
  seasonalItineraries?: Array<Record<string, unknown>> | null;
  seasonalWindowText?: string | null;
  travelTime?: string | null;
  maxMembersText?: string | null;
  maxSeatsBookable: number | null;
  maxSeatsFlag?: string | null;
  additionalNote?: string | null;
  hashtags?: string[] | null;
  seasonNote?: string | null;
  flightInfo?: Record<string, unknown> | null;
  promoImageRef: string | null;
  galleryUrl: string;
  active: boolean;
}

export type DepartureStatus = "upcoming" | "full" | "completed" | "cancelled";

/** Bookable instance — one doc per departure in `tripDepartures`. */
export interface TripDeparture {
  tripCode: string;
  startDate: string | null;
  endDate: string | null;
  maxSeats: number;
  seatsBooked: number;
  status: DepartureStatus;
  assignedTripLeaderId?: string | null;
}

export type PaymentMethod = "stripe" | "bank_slip";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "pending_verification"
  | "failed"
  | "refunded"
  | "expired";

export interface Booking {
  tripCode: string;
  departureId: string;
  customerName: string;
  phone: string;
  email: string;
  seatsBooked: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId: string | null;
  slipUrl: string | null;
  waiverAccepted: boolean;
  waiverAcceptedAt: string | null;
  waiverAcceptedIp: string | null;
  complianceDocsUploaded: boolean;
  docsDeletedAt: string | null;
  subPackage?: string | null;
  totalPriceAud?: number | null;
  confirmationPdfPath?: string | null;
  createdAt: string;
}

export interface StaffProfile {
  pinCode: string | null;
  pinHash: string | null;
  fullName: string;
  role: "OWNER" | "MANAGER" | "TRIP_LEADER" | "CASHIER";
  phone: string | null;
  email: string | null;
  commissionRatePct?: number | null;
}

export interface StaffCommissionLedgerEntry {
  staffId: string | null;
  tripCode: string | null;
  departureId: string | null;
  amountAud: number;
  note: string | null;
  createdAt: string;
}

export interface Expense {
  tripCode: string | null;
  date: string;
  amountAud: number;
  description: string;
  receiptStorageUrl: string | null;
  enteredBy: string | null;
  atoCategory?: string;
  vendorName?: string;
  hasGst?: boolean;
  gstAmountAud?: number;
  createdAt: string;
}

export interface InsuranceAlert {
  itemName: string;
  itemType: string;
  expiryDate: string;
  isActive: boolean;
}

export type CompanyDocumentType =
  | "Public Liability Insurance"
  | "Vehicle Rego"
  | "Driver Authority"
  | "other";

export interface CompanyDocument {
  docType: CompanyDocumentType;
  documentLabel: string;
  expiryDate: string;
  ownerNote: string | null;
  active: boolean;
  lastAlertSentAt?: string | null;
}

export type BookingInquiryStatus = "new" | "quoted" | "confirmed" | "declined";

export interface BookingInquiry {
  customerName: string;
  phone: string;
  email: string;
  preferredRoute: number;
  preferredDateRange: string;
  notes: string | null;
  status: BookingInquiryStatus;
  createdAt: string;
}

export type BookingWriteData = Omit<Booking, "seatsBooked" | "createdAt">;

export interface TripDepartureSeedDoc extends TripDeparture {
  docId: string;
}

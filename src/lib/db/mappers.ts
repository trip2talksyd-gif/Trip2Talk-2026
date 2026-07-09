import type {
  Booking,
  BookingInquiry,
  CompanyDocument,
  Expense,
  MatchTags,
  TripDeparture,
  TripTemplate,
} from "@/lib/types/database";
import type { Review } from "@/types/review";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function mapTripTemplate(row: Record<string, any>): TripTemplate {
  return {
    tripCode: row.trip_code,
    category: row.category,
    departureType: row.departure_type,
    nameTH: row.name_th,
    tagline: row.tagline,
    highlights: row.highlights ?? [],
    itinerary: row.itinerary ?? [],
    pricing: row.pricing ?? {},
    basePriceAUD: Number(row.base_price_aud ?? 0),
    depositRequiredAUD: Number(row.deposit_required_aud ?? 100),
    inclusions: row.inclusions ?? [],
    exclusions: row.exclusions ?? [],
    accommodationPolicy: row.accommodation_policy ?? null,
    cancellationPolicy: row.cancellation_policy ?? null,
    depositPolicy: row.deposit_policy ?? null,
    safetyNotes: row.safety_notes ?? null,
    subPackages: row.sub_packages ?? null,
    seasonalItineraries: row.seasonal_itineraries ?? null,
    seasonalWindowText: row.seasonal_window_text ?? null,
    travelTime: row.travel_time ?? null,
    maxMembersText: row.max_members_text ?? null,
    maxSeatsBookable: row.max_seats_bookable ?? null,
    maxSeatsFlag: row.max_seats_flag ?? null,
    additionalNote: row.additional_note ?? null,
    hashtags: row.hashtags ?? null,
    seasonNote: row.season_note ?? null,
    flightInfo: row.flight_info ?? null,
    matchTags: (row.match_tags as MatchTags | null) ?? null,
    promoImageRef: row.promo_image_ref ?? null,
    galleryUrl: row.gallery_url ?? "",
    active: row.active ?? true,
  };
}

export function tripTemplateToRow(
  template: TripTemplate,
  matchTags?: MatchTags | null,
): Record<string, unknown> {
  return {
    trip_code: template.tripCode,
    category: template.category,
    departure_type: template.departureType,
    name_th: template.nameTH,
    tagline: template.tagline,
    max_members_text: template.maxMembersText,
    max_seats_bookable: template.maxSeatsBookable,
    max_seats_flag: template.maxSeatsFlag,
    season_note: template.seasonNote,
    seasonal_window_text: template.seasonalWindowText,
    travel_time: template.travelTime,
    highlights: template.highlights,
    itinerary: template.itinerary,
    pricing: template.pricing,
    base_price_aud: template.basePriceAUD,
    deposit_required_aud: template.depositRequiredAUD,
    inclusions: template.inclusions,
    exclusions: template.exclusions,
    accommodation_policy: template.accommodationPolicy,
    cancellation_policy: template.cancellationPolicy,
    deposit_policy: template.depositPolicy,
    safety_notes: template.safetyNotes,
    sub_packages: template.subPackages,
    seasonal_itineraries: template.seasonalItineraries,
    additional_note: template.additionalNote,
    hashtags: template.hashtags,
    flight_info: template.flightInfo,
    promo_image_ref: template.promoImageRef,
    gallery_url: template.galleryUrl,
    match_tags: matchTags ?? template.matchTags ?? null,
    active: template.active,
  };
}

export function mapTripDeparture(row: Record<string, any>): TripDeparture {
  return {
    tripCode: row.trip_code,
    startDate: row.start_date ?? null,
    endDate: row.end_date ?? null,
    maxSeats: row.max_seats,
    seatsBooked: row.seats_booked,
    status: row.status,
    assignedTripLeaderId: row.assigned_trip_leader_id ?? null,
  };
}

export function departureToRow(
  departure: TripDeparture,
  id: string,
): Record<string, unknown> {
  return {
    id,
    trip_code: departure.tripCode,
    start_date: departure.startDate,
    end_date: departure.endDate,
    max_seats: departure.maxSeats,
    seats_booked: departure.seatsBooked,
    status: departure.status,
    assigned_trip_leader_id: departure.assignedTripLeaderId ?? null,
  };
}

export function mapBooking(row: Record<string, any>): Booking & { id: string } {
  return {
    id: row.id,
    tripCode: row.trip_code,
    departureId: row.departure_id,
    customerName: row.customer_name,
    phone: row.phone,
    email: row.email,
    seatsBooked: row.seats_booked,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    stripePaymentIntentId: row.stripe_payment_intent_id ?? null,
    slipUrl: row.slip_url ?? null,
    waiverAccepted: row.waiver_accepted,
    waiverAcceptedAt: row.waiver_accepted_at ?? null,
    waiverAcceptedIp: row.waiver_accepted_ip ?? null,
    complianceDocsUploaded: row.compliance_docs_uploaded ?? false,
    docsDeletedAt: row.docs_deleted_at ?? null,
    subPackage: row.sub_package ?? null,
    totalPriceAud: row.total_price_aud != null ? Number(row.total_price_aud) : null,
    confirmationPdfPath: row.confirmation_pdf_path ?? null,
    createdAt: row.created_at,
  };
}

export function bookingToRow(
  bookingId: string,
  data: Omit<Booking, "createdAt"> & { seatsBooked: number },
): Record<string, unknown> {
  return {
    id: bookingId,
    trip_code: data.tripCode,
    departure_id: data.departureId,
    customer_name: data.customerName,
    phone: data.phone,
    email: data.email,
    seats_booked: data.seatsBooked,
    payment_method: data.paymentMethod,
    payment_status: data.paymentStatus,
    stripe_payment_intent_id: data.stripePaymentIntentId,
    slip_url: data.slipUrl,
    waiver_accepted: data.waiverAccepted,
    waiver_accepted_at: data.waiverAcceptedAt,
    waiver_accepted_ip: data.waiverAcceptedIp,
    sub_package: data.subPackage ?? null,
    total_price_aud: data.totalPriceAud ?? null,
    confirmation_pdf_path: data.confirmationPdfPath ?? null,
    compliance_docs_uploaded: data.complianceDocsUploaded,
    docs_deleted_at: data.docsDeletedAt,
  };
}

export function mapReview(row: Record<string, any>): Review & { id: string } {
  return {
    id: row.id,
    customerName: row.customer_name,
    tripCode: row.trip_code ?? null,
    rating: row.rating,
    text: row.review_text,
    photoUrl: row.photo_url ?? null,
    approved: row.approved,
    createdAt: row.created_at,
  };
}

export function mapBookingInquiry(
  row: Record<string, any>,
): BookingInquiry & { id: string } {
  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    email: row.email,
    preferredRoute: row.preferred_route,
    preferredDateRange: row.preferred_date_range ?? "",
    notes: row.notes ?? null,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function mapCompanyDocument(
  row: Record<string, any>,
): CompanyDocument & { id: string } {
  return {
    id: row.id,
    docType: row.doc_type,
    documentLabel: row.document_label,
    expiryDate: row.expiry_date,
    ownerNote: row.owner_note ?? null,
    active: row.active,
    lastAlertSentAt: row.last_alert_sent_at ?? null,
  };
}

export function mapExpense(row: Record<string, any>): Expense & { id: string } {
  return {
    id: row.id,
    tripCode: row.trip_code ?? null,
    date: row.expense_date,
    amountAud: Number(row.amount_aud),
    description: row.description,
    receiptStorageUrl: row.receipt_storage_url ?? null,
    enteredBy: row.entered_by ?? null,
    atoCategory: row.ato_category ?? undefined,
    vendorName: row.vendor_name ?? undefined,
    hasGst: row.has_gst ?? undefined,
    gstAmountAud:
      row.gst_amount_aud != null ? Number(row.gst_amount_aud) : undefined,
    createdAt: row.created_at,
  };
}

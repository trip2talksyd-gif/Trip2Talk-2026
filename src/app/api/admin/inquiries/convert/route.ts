import { NextRequest, NextResponse } from "next/server";

import { generateBookingId } from "@/lib/admin-session";
import { requireAdminRole } from "@/lib/api-admin";
import { createBookingWithSeatLock } from "@/lib/bookSeat";
import { departureToRow } from "@/lib/db/mappers";
import { getDepartureById } from "@/lib/db/queries";
import { departureSeedId } from "@/lib/seed/parse-trip-data";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const auth = requireAdminRole(request, "owner");
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const {
    inquiryId,
    tripCode,
    startDate,
    endDate,
    maxSeats,
    customerName,
    phone,
    email,
    seats,
    totalPriceAud,
  } = body;

  if (!tripCode || !startDate || !customerName || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const departureId = departureSeedId(tripCode, startDate);
  const existing = await getDepartureById(departureId);

  if (!existing) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("trip_departures").upsert(
      departureToRow(
        {
          tripCode,
          startDate,
          endDate: endDate ?? null,
          maxSeats: maxSeats ?? 12,
          seatsBooked: 0,
          status: "upcoming",
        },
        departureId,
      ),
      { onConflict: "id" },
    );
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const bookingId = generateBookingId();
  await createBookingWithSeatLock({
    departureId,
    bookingId,
    seatsRequested: seats ?? 1,
    bookingData: {
      tripCode,
      departureId,
      customerName,
      phone: phone ?? "",
      email,
      paymentMethod: "bank_slip",
      paymentStatus: "paid",
      stripePaymentIntentId: null,
      slipUrl: null,
      waiverAccepted: true,
      waiverAcceptedAt: new Date().toISOString(),
      waiverAcceptedIp: null,
      complianceDocsUploaded: false,
      docsDeletedAt: null,
      totalPriceAud: totalPriceAud ?? 0,
      confirmationPdfPath: null,
    },
  });

  if (inquiryId) {
    await getSupabaseAdmin()
      .from("booking_inquiries")
      .update({ status: "confirmed" })
      .eq("id", inquiryId);
  }

  return NextResponse.json({ ok: true, bookingId, departureId });
}

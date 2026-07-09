import { NextRequest, NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/api-admin";
import { mapBooking } from "@/lib/db/mappers";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const auth = requireAdminRole(request, "owner");
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const tripCode = searchParams.get("tripCode");
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let query = getSupabaseAdmin()
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (tripCode) query = query.eq("trip_code", tripCode);
  if (status) query = query.eq("payment_status", status);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = [
    "bookingId,tripCode,departureId,customerName,email,phone,seats,paymentMethod,paymentStatus,totalPriceAud,complianceDocsUploaded,createdAt",
  ];

  for (const row of data ?? []) {
    const b = mapBooking(row);
    const created = b.createdAt;
    if (from && created < from) continue;
    if (to && created > `${to}T23:59:59`) continue;
    rows.push(
      [
        b.id,
        b.tripCode,
        b.departureId,
        `"${String(b.customerName).replace(/"/g, '""')}"`,
        b.email,
        b.phone,
        b.seatsBooked,
        b.paymentMethod,
        b.paymentStatus,
        b.totalPriceAud ?? "",
        b.complianceDocsUploaded,
        created,
      ].join(","),
    );
  }

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="trip2talk-bookings.csv"',
    },
  });
}

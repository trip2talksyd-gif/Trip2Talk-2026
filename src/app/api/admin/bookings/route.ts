import { NextRequest, NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/api-admin";
import { mapBooking } from "@/lib/db/mappers";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const auth = requireAdminRole(request, ["cashier", "owner", "trip_leader"]);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const tripCode = searchParams.get("tripCode");
  const status = searchParams.get("status");

  let query = getSupabaseAdmin()
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (tripCode) query = query.eq("trip_code", tripCode);
  if (status) query = query.eq("payment_status", status);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const bookings = (data ?? []).map(mapBooking);
  return NextResponse.json({ bookings });
}

import { NextRequest, NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/api-admin";
import { mapBookingInquiry } from "@/lib/db/mappers";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const auth = requireAdminRole(request, "owner");
  if (auth instanceof NextResponse) return auth;

  const { data, error } = await getSupabaseAdmin()
    .from("booking_inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    inquiries: (data ?? []).map(mapBookingInquiry),
  });
}

export async function PATCH(request: NextRequest) {
  const auth = requireAdminRole(request, "owner");
  if (auth instanceof NextResponse) return auth;

  const { id, status } = await request.json();
  if (!id || !status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin()
    .from("booking_inquiries")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

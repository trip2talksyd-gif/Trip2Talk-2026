import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { customerName, phone, email, preferredRoute, preferredDateRange, notes } =
    body as {
      customerName?: string;
      phone?: string;
      email?: string;
      preferredRoute?: number;
      preferredDateRange?: string;
      notes?: string;
    };

  if (!customerName || !phone || !email || !preferredRoute) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("booking_inquiries").insert({
    customer_name: customerName,
    phone,
    email,
    preferred_route: preferredRoute,
    preferred_date_range: preferredDateRange ?? "",
    notes: notes ?? null,
    status: "new",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

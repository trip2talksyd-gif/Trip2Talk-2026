import { NextRequest, NextResponse } from "next/server";

import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    customerName,
    phone,
    email,
    preferredRoute,
    preferredDateRange,
    notes,
  } = body;

  if (!customerName || !phone || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = getAdminDb();
  const ref = await db.collection("booking_inquiries").add({
    customerName,
    phone,
    email,
    preferredRoute: Number(preferredRoute ?? 0),
    preferredDateRange: preferredDateRange ?? "",
    notes: notes ?? null,
    status: "new",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, inquiryId: ref.id });
}

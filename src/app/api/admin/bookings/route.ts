import { NextRequest, NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/api-admin";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  const auth = requireAdminRole(request, ["cashier", "owner", "trip_leader"]);
  if (auth instanceof NextResponse) return auth;

  const db = getAdminDb();
  const { searchParams } = new URL(request.url);
  const tripCode = searchParams.get("tripCode");
  const status = searchParams.get("status");

  let query = db.collection("bookings").orderBy("createdAt", "desc").limit(100) as FirebaseFirestore.Query;
  if (tripCode) query = query.where("tripCode", "==", tripCode);
  if (status) query = query.where("paymentStatus", "==", status);

  const snap = await query.get();
  const bookings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ bookings });
}

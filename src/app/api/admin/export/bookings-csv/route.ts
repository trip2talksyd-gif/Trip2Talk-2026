import { NextRequest, NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/api-admin";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  const auth = requireAdminRole(request, "owner");
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const tripCode = searchParams.get("tripCode");
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const db = getAdminDb();
  let query = db.collection("bookings").orderBy("createdAt", "desc") as FirebaseFirestore.Query;

  if (tripCode) query = query.where("tripCode", "==", tripCode);
  if (status) query = query.where("paymentStatus", "==", status);

  const snap = await query.limit(500).get();
  const rows = ["bookingId,tripCode,departureId,customerName,email,phone,seats,paymentMethod,paymentStatus,totalPriceAud,complianceDocsUploaded,createdAt"];

  for (const doc of snap.docs) {
    const b = doc.data();
    const created = String(b.createdAt ?? "");
    if (from && created < from) continue;
    if (to && created > to + "T23:59:59") continue;
    rows.push(
      [
        doc.id,
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

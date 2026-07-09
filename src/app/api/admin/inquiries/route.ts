import { NextRequest, NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/api-admin";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  const auth = requireAdminRole(request, "owner");
  if (auth instanceof NextResponse) return auth;

  const db = getAdminDb();
  const snap = await db.collection("booking_inquiries").orderBy("createdAt", "desc").limit(50).get();
  return NextResponse.json({
    inquiries: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
  });
}

export async function PATCH(request: NextRequest) {
  const auth = requireAdminRole(request, "owner");
  if (auth instanceof NextResponse) return auth;

  const { id, status } = await request.json();
  if (!id || !status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }

  await getAdminDb().collection("booking_inquiries").doc(id).update({ status });
  return NextResponse.json({ ok: true });
}

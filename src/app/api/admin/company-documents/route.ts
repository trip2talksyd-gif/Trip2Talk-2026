import { NextRequest, NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/api-admin";
import { getAdminDb } from "@/lib/firebase-admin";

const EXPIRY_DAYS = 30;

export async function GET(request: NextRequest) {
  const auth = requireAdminRole(request, "owner");
  if (auth instanceof NextResponse) return auth;

  const db = getAdminDb();
  const snap = await db.collection("company_documents").get();
  const soon = new Date();
  soon.setDate(soon.getDate() + EXPIRY_DAYS);

  const docs = snap.docs.map((d) => {
    const data = d.data();
    const expiry = new Date(data.expiryDate as string);
    return {
      id: d.id,
      ...data,
      expiringSoon: expiry <= soon,
    };
  });

  return NextResponse.json({ documents: docs });
}

export async function POST(request: NextRequest) {
  const auth = requireAdminRole(request, "owner");
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const db = getAdminDb();
  const ref = await db.collection("company_documents").add({
    docType: body.docType,
    documentLabel: body.documentLabel,
    expiryDate: body.expiryDate,
    ownerNote: body.ownerNote ?? null,
    active: body.active ?? true,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ id: ref.id });
}

export async function PATCH(request: NextRequest) {
  const auth = requireAdminRole(request, "owner");
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = getAdminDb();
  const { id, ...updates } = body;
  await db.collection("company_documents").doc(id).update(updates);
  return NextResponse.json({ ok: true });
}

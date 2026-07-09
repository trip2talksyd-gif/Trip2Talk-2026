import { NextRequest, NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@/lib/api-admin";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  STORAGE_BUCKETS,
  type StorageBucket,
  getSupabaseStorageAdmin,
} from "@/lib/supabase-storage";

const ALLOWED_BUCKETS = new Set<string>([
  STORAGE_BUCKETS.paymentSlips,
  STORAGE_BUCKETS.passportDocuments,
  STORAGE_BUCKETS.expenseReceipts,
]);

async function objectExists(bucket: StorageBucket, path: string): Promise<boolean> {
  const supabase = getSupabaseStorageAdmin();
  const folder = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
  const name = path.includes("/") ? path.slice(path.lastIndexOf("/") + 1) : path;
  const { data, error } = await supabase.storage.from(bucket).list(folder, { search: name });
  if (error) return false;
  return (data ?? []).some((f) => f.name === name);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    bucket,
    path,
    bookingId,
    expenseMeta,
  } = body as {
    bucket?: string;
    path?: string;
    bookingId?: string;
    expenseMeta?: {
      tripCode?: string;
      date?: string;
      amountAud?: number;
      description?: string;
    };
  };

  if (!bucket || !path || !ALLOWED_BUCKETS.has(bucket)) {
    return NextResponse.json({ error: "Invalid bucket or path" }, { status: 400 });
  }

  const exists = await objectExists(bucket as StorageBucket, path);
  if (!exists) {
    return NextResponse.json({ error: "Upload not found in storage" }, { status: 404 });
  }

  const db = getAdminDb();
  const session = getAdminSessionFromRequest(request);

  if (bucket === STORAGE_BUCKETS.paymentSlips && bookingId) {
    await db.collection("bookings").doc(bookingId).update({
      slipUrl: path,
      slipUploadedAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, field: "slipUrl" });
  }

  if (bucket === STORAGE_BUCKETS.passportDocuments && bookingId) {
    const bookingSnap = await db.collection("bookings").doc(bookingId).get();
    if (!bookingSnap.exists) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (bookingSnap.data()?.paymentStatus !== "paid") {
      return NextResponse.json({ error: "Payment required" }, { status: 403 });
    }
    await db.collection("bookings").doc(bookingId).update({
      complianceDocsUploaded: true,
      complianceDocsUploadedAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, field: "complianceDocsUploaded" });
  }

  if (bucket === STORAGE_BUCKETS.expenseReceipts && session) {
    const meta = expenseMeta ?? {};
    await db.collection("expenses").add({
      tripCode: meta.tripCode ?? null,
      date: meta.date ?? new Date().toISOString().slice(0, 10),
      amountAud: Number(meta.amountAud ?? 0),
      description: meta.description ?? "Receipt upload",
      receiptStorageUrl: path,
      enteredBy: session.role,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, field: "expense" });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

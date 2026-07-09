import { NextRequest, NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@/lib/api-admin";
import { getBookingById, updateBooking } from "@/lib/db/queries";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  STORAGE_BUCKETS,
  type StorageBucket,
} from "@/lib/supabase-storage";

const ALLOWED_BUCKETS = new Set<string>([
  STORAGE_BUCKETS.paymentSlips,
  STORAGE_BUCKETS.passportDocuments,
  STORAGE_BUCKETS.expenseReceipts,
]);

async function objectExists(bucket: StorageBucket, path: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
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

  const session = getAdminSessionFromRequest(request);

  if (bucket === STORAGE_BUCKETS.paymentSlips && bookingId) {
    await updateBooking(bookingId, { slip_url: path });
    return NextResponse.json({ ok: true, field: "slipUrl" });
  }

  if (bucket === STORAGE_BUCKETS.passportDocuments && bookingId) {
    const booking = await getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.paymentStatus !== "paid") {
      return NextResponse.json({ error: "Payment required" }, { status: 403 });
    }
    await updateBooking(bookingId, { compliance_docs_uploaded: true });
    return NextResponse.json({ ok: true, field: "complianceDocsUploaded" });
  }

  if (bucket === STORAGE_BUCKETS.expenseReceipts && session) {
    const meta = expenseMeta ?? {};
    const { error } = await getSupabaseAdmin().from("expenses").insert({
      trip_code: meta.tripCode ?? null,
      expense_date: meta.date ?? new Date().toISOString().slice(0, 10),
      amount_aud: Number(meta.amountAud ?? 0),
      description: meta.description ?? "Receipt upload",
      receipt_storage_url: path,
      entered_by: session.role,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, field: "expense" });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

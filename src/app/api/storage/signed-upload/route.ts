import { NextRequest, NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@/lib/api-admin";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  STORAGE_BUCKETS,
  type StorageBucket,
  createSignedUploadUrl,
} from "@/lib/supabase-storage";

const ALLOWED_BUCKETS = new Set<string>([
  STORAGE_BUCKETS.paymentSlips,
  STORAGE_BUCKETS.passportDocuments,
  STORAGE_BUCKETS.expenseReceipts,
  STORAGE_BUCKETS.bookingConfirmations,
]);

function validatePathForBucket(
  bucket: StorageBucket,
  path: string,
  bookingId?: string,
  isAdmin?: boolean,
): boolean {
  if (bucket === STORAGE_BUCKETS.paymentSlips) {
    return !!bookingId && path.startsWith(`${bookingId}/`);
  }
  if (bucket === STORAGE_BUCKETS.passportDocuments) {
    return !!bookingId && path.startsWith(`${bookingId}/`);
  }
  if (bucket === STORAGE_BUCKETS.expenseReceipts) {
    return !!isAdmin;
  }
  if (bucket === STORAGE_BUCKETS.bookingConfirmations) {
    return false;
  }
  return false;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { bucket, path, bookingId } = body as {
    bucket?: string;
    path?: string;
    bookingId?: string;
  };

  if (!bucket || !path || !ALLOWED_BUCKETS.has(bucket)) {
    return NextResponse.json({ error: "Invalid bucket or path" }, { status: 400 });
  }

  const session = getAdminSessionFromRequest(request);
  const isAdmin = !!session;

  if (bucket === STORAGE_BUCKETS.expenseReceipts && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (
    (bucket === STORAGE_BUCKETS.paymentSlips ||
      bucket === STORAGE_BUCKETS.passportDocuments) &&
    bookingId
  ) {
    const db = getAdminDb();
    const bookingSnap = await db.collection("bookings").doc(bookingId).get();
    if (!bookingSnap.exists) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    const booking = bookingSnap.data()!;
    if (bucket === STORAGE_BUCKETS.passportDocuments && booking.paymentStatus !== "paid") {
      return NextResponse.json({ error: "Payment required first" }, { status: 403 });
    }
  }

  if (!validatePathForBucket(bucket as StorageBucket, path, bookingId, isAdmin)) {
    return NextResponse.json({ error: "Path not authorized" }, { status: 403 });
  }

  const upload = await createSignedUploadUrl(bucket as StorageBucket, path);
  return NextResponse.json({ bucket, ...upload });
}

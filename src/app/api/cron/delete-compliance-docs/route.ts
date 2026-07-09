import { NextRequest, NextResponse } from "next/server";

import { verifyCronSecret } from "@/lib/cron-auth";
import { getAdminDb, getAdminStorage } from "@/lib/firebase-admin";

const RETENTION_DAYS = 7;

/**
 * Daily cron: delete passport/ID docs 7+ days after trip fixedDate,
 * reset compliance flags on affected bookings.
 */
export async function GET(request: NextRequest) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const db = getAdminDb();
  const bucket = getAdminStorage().bucket();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  const cutoffIso = cutoff.toISOString().slice(0, 10);

  const tripsSnap = await db.collection("trips").get();
  const expiredTripCodes = new Set<string>();

  for (const tripDoc of tripsSnap.docs) {
    const fixedDate = tripDoc.data().fixedDate as string | null;
    if (fixedDate && fixedDate <= cutoffIso) {
      expiredTripCodes.add(tripDoc.data().tripCode as string);
    }
  }

  const bookingsSnap = await db
    .collection("bookings")
    .where("complianceDocsUploaded", "==", true)
    .get();

  const deleted: string[] = [];

  for (const bookingDoc of bookingsSnap.docs) {
    const booking = bookingDoc.data();
    if (!expiredTripCodes.has(booking.tripCode as string)) continue;

    const prefix = `passport-documents/${bookingDoc.id}/`;
    const [files] = await bucket.getFiles({ prefix });

    for (const file of files) {
      await file.delete();
      deleted.push(file.name);
    }

    await bookingDoc.ref.update({
      complianceDocsUploaded: false,
      docsDeletedAt: new Date().toISOString(),
    });
  }

  console.log(
    `[cron/delete-compliance-docs] Deleted ${deleted.length} file(s):`,
    deleted,
  );

  return NextResponse.json({
    ok: true,
    filesDeleted: deleted.length,
    deletedPaths: deleted,
  });
}

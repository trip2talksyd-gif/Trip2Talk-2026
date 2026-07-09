import { NextRequest, NextResponse } from "next/server";

import { verifyCronSecret } from "@/lib/cron-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { getOwnerAlertEmail, sendOwnerAlertEmail } from "@/lib/resend";
import {
  deleteStorageFolder,
  STORAGE_BUCKETS,
} from "@/lib/supabase-storage";

const RETENTION_DAYS = 7;

/**
 * Daily cron: delete passport/ID docs 7+ days after departure endDate,
 * reset compliance flags, email Owner summary via Resend.
 */
export async function GET(request: NextRequest) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const db = getAdminDb();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  const cutoffIso = cutoff.toISOString().slice(0, 10);

  const departuresSnap = await db.collection("tripDepartures").get();
  const expiredDepartureIds = new Set<string>();

  for (const doc of departuresSnap.docs) {
    const endDate = doc.data().endDate as string | null;
    if (endDate && endDate <= cutoffIso) {
      expiredDepartureIds.add(doc.id);
    }
  }

  const bookingsSnap = await db
    .collection("bookings")
    .where("complianceDocsUploaded", "==", true)
    .get();

  const deleted: string[] = [];
  const affectedBookings: string[] = [];

  for (const bookingDoc of bookingsSnap.docs) {
    const booking = bookingDoc.data();
    const departureId = booking.departureId as string | undefined;
    if (!departureId || !expiredDepartureIds.has(departureId)) continue;

    const folderPrefix = bookingDoc.id;
    const removed = await deleteStorageFolder(
      STORAGE_BUCKETS.passportDocuments,
      folderPrefix,
    );
    deleted.push(...removed);

    await bookingDoc.ref.update({
      complianceDocsUploaded: false,
      docsDeletedAt: new Date().toISOString(),
    });
    affectedBookings.push(bookingDoc.id);
  }

  console.log(
    `[cron/delete-compliance-docs] Deleted ${deleted.length} file(s):`,
    deleted,
  );

  if (deleted.length > 0) {
    await sendOwnerAlertEmail({
      to: getOwnerAlertEmail(),
      subject: `Trip2Talk — ${deleted.length} compliance doc(s) deleted`,
      html: `<p>Passport/ID files deleted after ${RETENTION_DAYS}-day retention:</p><ul>${deleted.map((p) => `<li>${p}</li>`).join("")}</ul><p>Bookings affected: ${affectedBookings.join(", ")}</p>`,
    });
  }

  return NextResponse.json({
    ok: true,
    filesDeleted: deleted.length,
    deletedPaths: deleted,
    affectedBookings,
  });
}

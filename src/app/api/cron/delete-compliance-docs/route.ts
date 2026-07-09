import { NextRequest, NextResponse } from "next/server";

import { verifyCronSecret } from "@/lib/cron-auth";
import { mapBooking } from "@/lib/db/mappers";
import { updateBooking } from "@/lib/db/queries";
import { getOwnerAlertEmail, sendOwnerAlertEmail } from "@/lib/resend";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  deleteStorageFolder,
  STORAGE_BUCKETS,
} from "@/lib/supabase-storage";

const RETENTION_DAYS = 7;

export async function GET(request: NextRequest) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const supabase = getSupabaseAdmin();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  const cutoffIso = cutoff.toISOString().slice(0, 10);

  const { data: departures } = await supabase.from("trip_departures").select("id, end_date");
  const expiredDepartureIds = new Set<string>();

  for (const dep of departures ?? []) {
    if (dep.end_date && dep.end_date <= cutoffIso) {
      expiredDepartureIds.add(dep.id);
    }
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("compliance_docs_uploaded", true);

  const deleted: string[] = [];
  const affectedBookings: string[] = [];

  for (const row of bookings ?? []) {
    const booking = mapBooking(row);
    if (!expiredDepartureIds.has(booking.departureId)) continue;

    const removed = await deleteStorageFolder(
      STORAGE_BUCKETS.passportDocuments,
      booking.id,
    );
    deleted.push(...removed);

    await updateBooking(booking.id, {
      compliance_docs_uploaded: false,
      docs_deleted_at: new Date().toISOString(),
    });
    affectedBookings.push(booking.id);
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

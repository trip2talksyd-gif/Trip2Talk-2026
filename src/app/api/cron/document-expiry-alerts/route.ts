import { NextRequest, NextResponse } from "next/server";

import { verifyCronSecret } from "@/lib/cron-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { getOwnerAlertEmail, sendOwnerAlertEmail } from "@/lib/resend";

const ALERT_WINDOW_DAYS = 30;

/**
 * Daily cron: email Owner when company_documents expire within 30 days.
 * Dedupes: skips docs already alerted today (lastAlertSentAt).
 */
export async function GET(request: NextRequest) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const db = getAdminDb();
  const today = new Date().toISOString().slice(0, 10);
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + ALERT_WINDOW_DAYS);
  const horizonIso = horizon.toISOString().slice(0, 10);

  const docsSnap = await db
    .collection("company_documents")
    .where("active", "==", true)
    .get();

  const expiring: Array<{ id: string; label: string; expiryDate: string }> = [];

  for (const doc of docsSnap.docs) {
    const data = doc.data();
    const expiryDate = data.expiryDate as string;
    if (expiryDate > horizonIso) continue;

    const lastAlert = data.lastAlertSentAt as string | null | undefined;
    if (lastAlert?.slice(0, 10) === today) continue;

    expiring.push({
      id: doc.id,
      label: data.documentLabel as string,
      expiryDate,
    });
  }

  if (expiring.length > 0) {
    await sendOwnerAlertEmail({
      to: getOwnerAlertEmail(),
      subject: `Trip2Talk — ${expiring.length} company document(s) expiring soon`,
      html: `<p>The following company documents expire within ${ALERT_WINDOW_DAYS} days:</p><ul>${expiring.map((d) => `<li><strong>${d.label}</strong> — ${d.expiryDate}</li>`).join("")}</ul>`,
    });

    for (const item of expiring) {
      await db.collection("company_documents").doc(item.id).update({
        lastAlertSentAt: new Date().toISOString(),
      });
    }
  }

  console.log(
    `[cron/document-expiry-alerts] Alerted on ${expiring.length} document(s)`,
  );

  return NextResponse.json({
    ok: true,
    alertedCount: expiring.length,
    documents: expiring,
  });
}

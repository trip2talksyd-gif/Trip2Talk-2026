import { NextRequest, NextResponse } from "next/server";

import { verifyCronSecret } from "@/lib/cron-auth";
import { mapCompanyDocument } from "@/lib/db/mappers";
import { getOwnerAlertEmail, sendOwnerAlertEmail } from "@/lib/resend";
import { getSupabaseAdmin } from "@/lib/supabase";

const ALERT_WINDOW_DAYS = 30;

export async function GET(request: NextRequest) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + ALERT_WINDOW_DAYS);
  const horizonIso = horizon.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("company_documents")
    .select("*")
    .eq("active", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const expiring: Array<{ id: string; label: string; expiryDate: string }> = [];

  for (const row of data ?? []) {
    const doc = mapCompanyDocument(row);
    if (doc.expiryDate > horizonIso) continue;

    const lastAlert = doc.lastAlertSentAt;
    if (lastAlert?.slice(0, 10) === today) continue;

    expiring.push({
      id: doc.id,
      label: doc.documentLabel,
      expiryDate: doc.expiryDate,
    });
  }

  if (expiring.length > 0) {
    await sendOwnerAlertEmail({
      to: getOwnerAlertEmail(),
      subject: `Trip2Talk — ${expiring.length} company document(s) expiring soon`,
      html: `<p>The following company documents expire within ${ALERT_WINDOW_DAYS} days:</p><ul>${expiring.map((d) => `<li><strong>${d.label}</strong> — ${d.expiryDate}</li>`).join("")}</ul>`,
    });

    for (const item of expiring) {
      await supabase
        .from("company_documents")
        .update({ last_alert_sent_at: new Date().toISOString() })
        .eq("id", item.id);
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

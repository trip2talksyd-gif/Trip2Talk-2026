/**
 * Resend email helper — no-ops when RESEND_API_KEY is unset (local dev).
 * Confirm later: set RESEND_API_KEY + OWNER_ALERT_EMAIL in Vercel env.
 */

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  attachment?: { filename: string; content: string };
}

async function sendEmail(
  params: SendEmailParams,
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "Trip2Talk <noreply@chapter99solutions.com.au>";

  if (!apiKey) {
    console.warn("[resend] RESEND_API_KEY not set — skipping email send");
    return { sent: false, reason: "RESEND_API_KEY not configured" };
  }

  const body: Record<string, unknown> = {
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
  };
  if (params.attachment) {
    body.attachments = [params.attachment];
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend API error ${res.status}: ${text}`);
  }

  return { sent: true };
}

export async function sendOwnerAlertEmail(
  params: SendEmailParams,
): Promise<{ sent: boolean; reason?: string }> {
  return sendEmail(params);
}

export async function sendCustomerEmail(
  params: SendEmailParams,
): Promise<{ sent: boolean; reason?: string }> {
  return sendEmail(params);
}

export function getOwnerAlertEmail(): string {
  return (
    process.env.OWNER_ALERT_EMAIL ??
    process.env.COMPANY_EMAIL ??
    "trip2talksyd@gmail.com"
  );
}

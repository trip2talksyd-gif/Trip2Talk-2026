import { NextRequest, NextResponse } from "next/server";

import { getAdminDb } from "@/lib/firebase-admin";
import { getOwnerAlertEmail, sendOwnerAlertEmail } from "@/lib/resend";

export async function POST(request: NextRequest) {
  let body: {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    website?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (body.website?.trim()) {
    return NextResponse.json({ error: "Rejected" }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const phone = body.phone?.trim() ?? "";
  const message = body.message?.trim();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "อีเมลไม่ถูกต้อง" }, { status: 400 });
  }

  const db = getAdminDb();
  await db.collection("contact_messages").add({
    name,
    email,
    phone,
    message,
    status: "new",
    createdAt: new Date().toISOString(),
  });

  await sendOwnerAlertEmail({
    to: getOwnerAlertEmail(),
    subject: `Trip2Talk — ข้อความติดต่อจาก ${name}`,
    html: `
      <p><strong>ชื่อ:</strong> ${name}</p>
      <p><strong>อีเมล:</strong> ${email}</p>
      <p><strong>โทร:</strong> ${phone || "—"}</p>
      <p><strong>ข้อความ:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `,
  });

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/api-admin";
import { mapCompanyDocument } from "@/lib/db/mappers";
import { getSupabaseAdmin } from "@/lib/supabase";

const EXPIRY_DAYS = 30;

export async function GET(request: NextRequest) {
  const auth = requireAdminRole(request, "owner");
  if (auth instanceof NextResponse) return auth;

  const { data, error } = await getSupabaseAdmin()
    .from("company_documents")
    .select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const soon = new Date();
  soon.setDate(soon.getDate() + EXPIRY_DAYS);

  const docs = (data ?? []).map((row) => {
    const doc = mapCompanyDocument(row);
    const expiry = new Date(doc.expiryDate);
    return {
      ...doc,
      expiringSoon: expiry <= soon,
    };
  });

  return NextResponse.json({ documents: docs });
}

export async function POST(request: NextRequest) {
  const auth = requireAdminRole(request, "owner");
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const { data, error } = await getSupabaseAdmin()
    .from("company_documents")
    .insert({
      doc_type: body.docType,
      document_label: body.documentLabel,
      expiry_date: body.expiryDate,
      owner_note: body.ownerNote ?? null,
      active: body.active ?? true,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

export async function PATCH(request: NextRequest) {
  const auth = requireAdminRole(request, "owner");
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { id, docType, documentLabel, expiryDate, ownerNote, active } = body;
  const { error } = await getSupabaseAdmin()
    .from("company_documents")
    .update({
      ...(docType !== undefined ? { doc_type: docType } : {}),
      ...(documentLabel !== undefined ? { document_label: documentLabel } : {}),
      ...(expiryDate !== undefined ? { expiry_date: expiryDate } : {}),
      ...(ownerNote !== undefined ? { owner_note: ownerNote } : {}),
      ...(active !== undefined ? { active } : {}),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

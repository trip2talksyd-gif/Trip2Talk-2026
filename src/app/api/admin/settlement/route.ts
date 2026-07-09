import { NextRequest, NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/api-admin";
import { calculateSettlement } from "@/lib/calculateSettlement";

export async function POST(request: NextRequest) {
  const auth = requireAdminRole(request, "owner");
  if (auth instanceof NextResponse) return auth;

  const { departureId, commissionRatePct } = await request.json();
  if (!departureId) {
    return NextResponse.json({ error: "departureId required" }, { status: 400 });
  }

  const result = await calculateSettlement(departureId, commissionRatePct ?? 15);
  return NextResponse.json(result);
}

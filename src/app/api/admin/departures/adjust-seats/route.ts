import { NextRequest, NextResponse } from "next/server";

import { requireAdminRole } from "@/lib/api-admin";
import { adjustDepartureSeats, SeatLockError } from "@/lib/bookSeat";

export async function POST(request: NextRequest) {
  const auth = requireAdminRole(request, "owner");
  if (auth instanceof NextResponse) return auth;

  const { departureId, delta } = await request.json();
  if (!departureId || typeof delta !== "number") {
    return NextResponse.json({ error: "departureId and delta required" }, { status: 400 });
  }

  try {
    const newSeats = await adjustDepartureSeats({ departureId, delta });
    return NextResponse.json({ ok: true, seatsBooked: newSeats });
  } catch (err) {
    if (err instanceof SeatLockError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}

import type { SupabaseClient } from "@supabase/supabase-js";

import { bookingToRow } from "@/lib/db/mappers";
import { getDepartureById } from "@/lib/db/queries";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { BookingWriteData, TripDeparture } from "@/lib/types/database";

export type SeatLockErrorCode =
  | "DEPARTURE_NOT_FOUND"
  | "NOT_BOOKABLE"
  | "OVERBOOKED"
  | "INVALID_SEATS"
  | "DEPARTURE_CANCELLED";

export class SeatLockError extends Error {
  constructor(
    message: string,
    public readonly code: SeatLockErrorCode,
  ) {
    super(message);
    this.name = "SeatLockError";
  }
}

export interface CreateBookingParams {
  departureId: string;
  bookingId: string;
  seatsRequested: number;
  bookingData: BookingWriteData;
}

export interface AdjustSeatsParams {
  departureId: string;
  delta: number;
}

function mapRpcError(message: string): SeatLockError {
  if (message.includes("NOT_BOOKABLE")) {
    return new SeatLockError(
      "This departure is not bookable (Date TBA — inbox to inquire).",
      "NOT_BOOKABLE",
    );
  }
  if (message.includes("DEPARTURE_CANCELLED")) {
    return new SeatLockError("This departure has been cancelled.", "DEPARTURE_CANCELLED");
  }
  if (message.includes("DEPARTURE_NOT_FOUND")) {
    return new SeatLockError("Departure not found.", "DEPARTURE_NOT_FOUND");
  }
  if (message.includes("INVALID_SEATS")) {
    return new SeatLockError("Seat count must be at least 1.", "INVALID_SEATS");
  }
  if (message.includes("SEAT_LOCK_FAILED")) {
    return new SeatLockError("This departure is fully booked.", "OVERBOOKED");
  }
  return new SeatLockError(message, "OVERBOOKED");
}

function validatePreLock(
  departure: TripDeparture,
  seatsRequested: number,
): void {
  if (seatsRequested <= 0) {
    throw new SeatLockError("Seat count must be at least 1.", "INVALID_SEATS");
  }
  if (departure.status === "cancelled") {
    throw new SeatLockError("This departure has been cancelled.", "DEPARTURE_CANCELLED");
  }
  if (departure.startDate === null) {
    throw new SeatLockError(
      "This departure is not bookable (Date TBA — inbox to inquire).",
      "NOT_BOOKABLE",
    );
  }
  const remaining = departure.maxSeats - departure.seatsBooked;
  if (seatsRequested > remaining) {
    throw new SeatLockError(
      remaining > 0
        ? `Only ${remaining} seat${remaining === 1 ? "" : "s"} remaining.`
        : "This departure is fully booked.",
      "OVERBOOKED",
    );
  }
}

async function rpcReserveSeats(
  client: SupabaseClient,
  departureId: string,
  seats: number,
): Promise<void> {
  const { error } = await client.rpc("reserve_seats", {
    p_departure_id: departureId,
    p_seats: seats,
  });
  if (error) throw mapRpcError(error.message);
}

async function rpcReleaseSeats(
  client: SupabaseClient,
  departureId: string,
  seats: number,
): Promise<void> {
  const { error } = await client.rpc("release_seats", {
    p_departure_id: departureId,
    p_seats: seats,
  });
  if (error) throw mapRpcError(error.message);
}

/**
 * Atomically locks seats via Postgres RPC and creates a booking row.
 */
export async function createBookingWithSeatLock(
  params: CreateBookingParams,
  client: SupabaseClient = getSupabaseAdmin(),
): Promise<void> {
  const departure = await getDepartureById(params.departureId, client);
  if (!departure) {
    throw new SeatLockError("Departure not found.", "DEPARTURE_NOT_FOUND");
  }

  validatePreLock(departure, params.seatsRequested);

  await rpcReserveSeats(client, params.departureId, params.seatsRequested);

  const { error: insertError } = await client.from("bookings").insert(
    bookingToRow(params.bookingId, {
      ...params.bookingData,
      departureId: params.departureId,
      seatsBooked: params.seatsRequested,
    }),
  );

  if (insertError) {
    await rpcReleaseSeats(client, params.departureId, params.seatsRequested).catch(
      () => undefined,
    );
    throw new Error(insertError.message);
  }
}

/** Admin seat adjustment (+/-) using reserve/release RPCs. */
export async function adjustDepartureSeats(
  params: AdjustSeatsParams,
  client: SupabaseClient = getSupabaseAdmin(),
): Promise<number> {
  const departure = await getDepartureById(params.departureId, client);
  if (!departure) {
    throw new SeatLockError("Departure not found.", "DEPARTURE_NOT_FOUND");
  }

  if (params.delta === 0) return departure.seatsBooked;

  if (params.delta > 0) {
    validatePreLock(departure, params.delta);
    await rpcReserveSeats(client, params.departureId, params.delta);
  } else {
    const releaseCount = Math.abs(params.delta);
    if (departure.seatsBooked - releaseCount < 0) {
      throw new SeatLockError(
        "Cannot reduce seats booked below zero.",
        "INVALID_SEATS",
      );
    }
    await rpcReleaseSeats(client, params.departureId, releaseCount);
  }

  const updated = await getDepartureById(params.departureId, client);
  return updated?.seatsBooked ?? departure.seatsBooked + params.delta;
}

/** @deprecated Use adjustDepartureSeats */
export const adjustTripSeats = adjustDepartureSeats;

export async function releaseBookingSeats(
  params: { departureId: string; seatsToRelease: number },
  client: SupabaseClient = getSupabaseAdmin(),
): Promise<number> {
  return adjustDepartureSeats(
    { departureId: params.departureId, delta: -params.seatsToRelease },
    client,
  );
}

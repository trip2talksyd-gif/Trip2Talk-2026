import type {
  DocumentReference,
  Firestore,
  Transaction,
} from "firebase-admin/firestore";

import type { BookingWriteData, Trip } from "@/lib/types/firestore";

export type SeatLockErrorCode =
  | "TRIP_NOT_FOUND"
  | "NOT_BOOKABLE"
  | "OVERBOOKED"
  | "INVALID_SEATS";

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
  tripId: string;
  bookingId: string;
  seatsRequested: number;
  bookingData: BookingWriteData;
}

export interface AdjustSeatsParams {
  tripId: string;
  delta: number;
}

function readTrip(transaction: Transaction, tripRef: DocumentReference) {
  return transaction.get(tripRef);
}

function validateSeatRequest(
  trip: Trip,
  seatsRequested: number,
): { newSeatsBooked: number } {
  if (seatsRequested <= 0) {
    throw new SeatLockError("Seat count must be at least 1.", "INVALID_SEATS");
  }

  if (trip.fixedDate === null) {
    throw new SeatLockError(
      "This trip is not bookable yet (Date TBA).",
      "NOT_BOOKABLE",
    );
  }

  const remaining = trip.maxSeats - trip.seatsBooked;
  const newSeatsBooked = trip.seatsBooked + seatsRequested;

  if (newSeatsBooked > trip.maxSeats) {
    throw new SeatLockError(
      remaining > 0
        ? `Only ${remaining} seat${remaining === 1 ? "" : "s"} remaining.`
        : "This trip is fully booked.",
      "OVERBOOKED",
    );
  }

  return { newSeatsBooked };
}

/**
 * Atomically locks seats and creates a booking doc.
 * All booking writes MUST go through this function (never client-side).
 */
export async function createBookingWithSeatLock(
  db: Firestore,
  params: CreateBookingParams,
): Promise<void> {
  const tripRef = db.collection("trips").doc(params.tripId);
  const bookingRef = db.collection("bookings").doc(params.bookingId);

  await db.runTransaction(async (transaction) => {
    const tripSnap = await readTrip(transaction, tripRef);

    if (!tripSnap.exists) {
      throw new SeatLockError("Trip not found.", "TRIP_NOT_FOUND");
    }

    const trip = tripSnap.data() as Trip;
    const { newSeatsBooked } = validateSeatRequest(trip, params.seatsRequested);

    transaction.update(tripRef, { seatsBooked: newSeatsBooked });
    transaction.set(bookingRef, {
      ...params.bookingData,
      seatsBooked: params.seatsRequested,
      createdAt: new Date().toISOString(),
    });
  });
}

/**
 * Admin Co-Host Terminal seat adjustment (+/-).
 * Uses the same transaction guard — never raw update().
 */
export async function adjustTripSeats(
  db: Firestore,
  params: AdjustSeatsParams,
): Promise<number> {
  const tripRef = db.collection("trips").doc(params.tripId);

  return db.runTransaction(async (transaction) => {
    const tripSnap = await readTrip(transaction, tripRef);

    if (!tripSnap.exists) {
      throw new SeatLockError("Trip not found.", "TRIP_NOT_FOUND");
    }

    const trip = tripSnap.data() as Trip;
    const newSeatsBooked = trip.seatsBooked + params.delta;

    if (newSeatsBooked < 0) {
      throw new SeatLockError(
        "Cannot reduce seats booked below zero.",
        "INVALID_SEATS",
      );
    }

    if (newSeatsBooked > trip.maxSeats) {
      throw new SeatLockError(
        `Cannot exceed max seats (${trip.maxSeats}).`,
        "OVERBOOKED",
      );
    }

    transaction.update(tripRef, { seatsBooked: newSeatsBooked });
    return newSeatsBooked;
  });
}

import type {
  DocumentReference,
  Firestore,
  Transaction,
} from "firebase-admin/firestore";

import type { BookingWriteData, TripDeparture } from "@/lib/types/firestore";

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

function readDeparture(
  transaction: Transaction,
  departureRef: DocumentReference,
) {
  return transaction.get(departureRef);
}

function computeDepartureStatus(
  departure: TripDeparture,
  newSeatsBooked: number,
): TripDeparture["status"] {
  if (departure.status === "cancelled" || departure.status === "completed") {
    return departure.status;
  }
  if (newSeatsBooked >= departure.maxSeats) return "full";
  return "upcoming";
}

function validateSeatRequest(
  departure: TripDeparture,
  seatsRequested: number,
): { newSeatsBooked: number; newStatus: TripDeparture["status"] } {
  if (seatsRequested <= 0) {
    throw new SeatLockError("Seat count must be at least 1.", "INVALID_SEATS");
  }

  if (departure.status === "cancelled") {
    throw new SeatLockError(
      "This departure has been cancelled.",
      "DEPARTURE_CANCELLED",
    );
  }

  if (departure.startDate === null) {
    throw new SeatLockError(
      "This departure is not bookable (Date TBA — inbox to inquire).",
      "NOT_BOOKABLE",
    );
  }

  const remaining = departure.maxSeats - departure.seatsBooked;
  const newSeatsBooked = departure.seatsBooked + seatsRequested;

  if (newSeatsBooked > departure.maxSeats) {
    throw new SeatLockError(
      remaining > 0
        ? `Only ${remaining} seat${remaining === 1 ? "" : "s"} remaining.`
        : "This departure is fully booked.",
      "OVERBOOKED",
    );
  }

  return {
    newSeatsBooked,
    newStatus: computeDepartureStatus(departure, newSeatsBooked),
  };
}

/**
 * Atomically locks seats on a tripDepartures doc and creates a booking.
 * All booking writes MUST go through this function (never client-side).
 */
export async function createBookingWithSeatLock(
  db: Firestore,
  params: CreateBookingParams,
): Promise<void> {
  const departureRef = db.collection("tripDepartures").doc(params.departureId);
  const bookingRef = db.collection("bookings").doc(params.bookingId);

  await db.runTransaction(async (transaction) => {
    const departureSnap = await readDeparture(transaction, departureRef);

    if (!departureSnap.exists) {
      throw new SeatLockError("Departure not found.", "DEPARTURE_NOT_FOUND");
    }

    const departure = departureSnap.data() as TripDeparture;
    const { newSeatsBooked, newStatus } = validateSeatRequest(
      departure,
      params.seatsRequested,
    );

    transaction.update(departureRef, {
      seatsBooked: newSeatsBooked,
      status: newStatus,
    });
    transaction.set(bookingRef, {
      ...params.bookingData,
      departureId: params.departureId,
      seatsBooked: params.seatsRequested,
      createdAt: new Date().toISOString(),
    });
  });
}

/**
 * Admin seat adjustment (+/-). Same transaction guard — never raw update().
 */
export async function adjustDepartureSeats(
  db: Firestore,
  params: AdjustSeatsParams,
): Promise<number> {
  const departureRef = db.collection("tripDepartures").doc(params.departureId);

  return db.runTransaction(async (transaction) => {
    const departureSnap = await readDeparture(transaction, departureRef);

    if (!departureSnap.exists) {
      throw new SeatLockError("Departure not found.", "DEPARTURE_NOT_FOUND");
    }

    const departure = departureSnap.data() as TripDeparture;
    const newSeatsBooked = departure.seatsBooked + params.delta;

    if (newSeatsBooked < 0) {
      throw new SeatLockError(
        "Cannot reduce seats booked below zero.",
        "INVALID_SEATS",
      );
    }

    if (newSeatsBooked > departure.maxSeats) {
      throw new SeatLockError(
        `Cannot exceed max seats (${departure.maxSeats}).`,
        "OVERBOOKED",
      );
    }

    transaction.update(departureRef, {
      seatsBooked: newSeatsBooked,
      status: computeDepartureStatus(departure, newSeatsBooked),
    });
    return newSeatsBooked;
  });
}

/** @deprecated Use adjustDepartureSeats */
export const adjustTripSeats = adjustDepartureSeats;

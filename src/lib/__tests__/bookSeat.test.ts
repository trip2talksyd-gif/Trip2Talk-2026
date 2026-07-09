import { describe, expect, it } from "vitest";

import {
  adjustDepartureSeats,
  createBookingWithSeatLock,
} from "@/lib/bookSeat";
import type { TripDeparture } from "@/lib/types/firestore";

interface MockDoc {
  exists: boolean;
  data: () => TripDeparture | undefined;
}

/** Mock Firestore with serialized transactions (simulates concurrent race safety). */
function createMockFirestore(initialDeparture: TripDeparture) {
  let departureState = { ...initialDeparture };
  const bookings = new Map<string, Record<string, unknown>>();
  let transactionQueue: Promise<unknown> = Promise.resolve();

  const departureRef = { id: "dep-1", path: "tripDepartures/dep-1" };
  const bookingCollection = {
    doc: (id: string) => ({ id, path: `bookings/${id}` }),
  };

  const runSerializedTransaction = async (
    fn: (transaction: {
      get: (ref: { path: string }) => Promise<MockDoc>;
      update: (ref: { path: string }, data: Partial<TripDeparture>) => void;
      set: (ref: { id: string }, data: Record<string, unknown>) => void;
    }) => Promise<unknown>,
  ) => {
    const run = async () => {
      const pendingUpdates: Array<{
        ref: { path: string };
        data: Partial<TripDeparture>;
      }> = [];
      const pendingSets: Array<{
        ref: { id: string };
        data: Record<string, unknown>;
      }> = [];

      const transaction = {
        get: async (ref: { path: string }): Promise<MockDoc> => {
          if (ref.path === departureRef.path) {
            return {
              exists: true,
              data: () => ({ ...departureState }),
            };
          }
          return { exists: false, data: () => undefined };
        },
        update: (ref: { path: string }, data: Partial<TripDeparture>) => {
          pendingUpdates.push({ ref, data });
        },
        set: (ref: { id: string }, data: Record<string, unknown>) => {
          pendingSets.push({ ref, data });
        },
      };

      const result = await fn(transaction);

      for (const { data } of pendingUpdates) {
        departureState = { ...departureState, ...data };
      }
      for (const { ref, data } of pendingSets) {
        bookings.set(ref.id, data);
      }

      return result;
    };

    transactionQueue = transactionQueue.then(run, run);
    return transactionQueue;
  };

  const db = {
    collection: (name: string) => {
      if (name === "tripDepartures") {
        return { doc: () => departureRef };
      }
      if (name === "bookings") {
        return bookingCollection;
      }
      throw new Error(`Unexpected collection: ${name}`);
    },
    runTransaction: runSerializedTransaction,
    __getDepartureState: () => departureState,
    __getBookings: () => bookings,
  };

  return db;
}

const baseDeparture: TripDeparture = {
  tripCode: "TAS-3D2N",
  startDate: "2026-03-16",
  endDate: "2026-03-21",
  maxSeats: 6,
  seatsBooked: 5,
  status: "upcoming",
};

const sampleBooking = {
  tripCode: "TAS-3D2N",
  departureId: "dep-1",
  customerName: "Jane Doe",
  phone: "+61400000000",
  email: "jane@example.com",
  paymentMethod: "stripe" as const,
  paymentStatus: "pending" as const,
  stripePaymentIntentId: "pi_test",
  slipUrl: null,
  waiverAccepted: true,
  waiverAcceptedAt: "2026-01-01T00:00:00.000Z",
  waiverAcceptedIp: "127.0.0.1",
  complianceDocsUploaded: false,
  docsDeletedAt: null,
};

describe("createBookingWithSeatLock", () => {
  it("rejects overbooking when seatsBooked + requestedSeats > maxSeats", async () => {
    const db = createMockFirestore(baseDeparture);

    await expect(
      createBookingWithSeatLock(db as never, {
        departureId: "dep-1",
        bookingId: "booking-1",
        seatsRequested: 2,
        bookingData: sampleBooking,
      }),
    ).rejects.toMatchObject({
      name: "SeatLockError",
      code: "OVERBOOKED",
      message: "Only 1 seat remaining.",
    });

    expect(db.__getDepartureState().seatsBooked).toBe(5);
    expect(db.__getBookings().size).toBe(0);
  });

  it("locks seats and creates booking when capacity allows", async () => {
    const db = createMockFirestore({ ...baseDeparture, seatsBooked: 4 });

    await createBookingWithSeatLock(db as never, {
      departureId: "dep-1",
      bookingId: "booking-ok",
      seatsRequested: 2,
      bookingData: sampleBooking,
    });

    expect(db.__getDepartureState().seatsBooked).toBe(6);
    expect(db.__getDepartureState().status).toBe("full");
    expect(db.__getBookings().get("booking-ok")?.seatsBooked).toBe(2);
  });

  it("rejects booking when startDate is null (Date TBA)", async () => {
    const db = createMockFirestore({
      ...baseDeparture,
      startDate: null,
      seatsBooked: 0,
    });

    await expect(
      createBookingWithSeatLock(db as never, {
        departureId: "dep-1",
        bookingId: "booking-tba",
        seatsRequested: 1,
        bookingData: sampleBooking,
      }),
    ).rejects.toMatchObject({ code: "NOT_BOOKABLE" });
  });

  it("rejects concurrent bookings that would exceed capacity (race)", async () => {
    const db = createMockFirestore({ ...baseDeparture, seatsBooked: 5, maxSeats: 6 });

    const attempt = (id: string) =>
      createBookingWithSeatLock(db as never, {
        departureId: "dep-1",
        bookingId: id,
        seatsRequested: 1,
        bookingData: { ...sampleBooking },
      });

    const [first, second] = await Promise.allSettled([
      attempt("race-a"),
      attempt("race-b"),
    ]);

    const fulfilled = [first, second].filter((r) => r.status === "fulfilled");
    const rejected = [first, second].filter((r) => r.status === "rejected");

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(db.__getDepartureState().seatsBooked).toBe(6);
    expect(db.__getBookings().size).toBe(1);
  });
});

describe("adjustDepartureSeats", () => {
  it("refuses to push seatsBooked above maxSeats", async () => {
    const db = createMockFirestore({ ...baseDeparture, seatsBooked: 6 });

    await expect(
      adjustDepartureSeats(db as never, { departureId: "dep-1", delta: 1 }),
    ).rejects.toMatchObject({ code: "OVERBOOKED" });

    expect(db.__getDepartureState().seatsBooked).toBe(6);
  });

  it("allows decrement within bounds", async () => {
    const db = createMockFirestore(baseDeparture);

    const next = await adjustDepartureSeats(db as never, {
      departureId: "dep-1",
      delta: -1,
    });

    expect(next).toBe(4);
    expect(db.__getDepartureState().seatsBooked).toBe(4);
  });
});

import { describe, expect, it } from "vitest";

import {
  adjustTripSeats,
  createBookingWithSeatLock,
} from "@/lib/bookSeat";
import type { Trip } from "@/lib/types/firestore";

interface MockDoc {
  exists: boolean;
  data: () => Trip | undefined;
}

function createMockFirestore(initialTrip: Trip) {
  let tripState = { ...initialTrip };
  const bookings = new Map<string, Record<string, unknown>>();

  const tripRef = { id: "trip-1", path: "trips/trip-1" };
  const bookingCollection = {
    doc: (id: string) => ({ id, path: `bookings/${id}` }),
  };

  const db = {
    collection: (name: string) => {
      if (name === "trips") {
        return { doc: () => tripRef };
      }
      if (name === "bookings") {
        return bookingCollection;
      }
      throw new Error(`Unexpected collection: ${name}`);
    },
    runTransaction: async (
      fn: (transaction: {
        get: (ref: { path: string }) => Promise<MockDoc>;
        update: (ref: { path: string }, data: Partial<Trip>) => void;
        set: (ref: { id: string }, data: Record<string, unknown>) => void;
      }) => Promise<unknown>,
    ) => {
      const pendingUpdates: Array<{ ref: { path: string }; data: Partial<Trip> }> =
        [];
      const pendingSets: Array<{
        ref: { id: string };
        data: Record<string, unknown>;
      }> = [];

      const transaction = {
        get: async (ref: { path: string }): Promise<MockDoc> => {
          if (ref.path === tripRef.path) {
            return {
              exists: true,
              data: () => ({ ...tripState }),
            };
          }
          return { exists: false, data: () => undefined };
        },
        update: (ref: { path: string }, data: Partial<Trip>) => {
          pendingUpdates.push({ ref, data });
        },
        set: (ref: { id: string }, data: Record<string, unknown>) => {
          pendingSets.push({ ref, data });
        },
      };

      const result = await fn(transaction);

      for (const { data } of pendingUpdates) {
        tripState = { ...tripState, ...data };
      }
      for (const { ref, data } of pendingSets) {
        bookings.set(ref.id, data);
      }

      return result;
    },
    __getTripState: () => tripState,
    __getBookings: () => bookings,
  };

  return db;
}

const baseTrip: Trip = {
  tripCode: "TAS-3D2N",
  category: "multi-day",
  departureType: "fixed_group",
  title: "Tasmania Mini Aurora Hunt",
  titleTH: "ทริปพร้อมช่างภาพ สัมผัสประวัติศาสตร์ ศิลปะ และตามล่าแสงใต้เมือง Hobart",
  tagline: "Premium Tasmania photo trip",
  description: "3D2N photo trip",
  highlights: [],
  itinerary: [],
  itineraryText: "",
  inclusions: [],
  exclusions: [],
  accommodationPolicy: null,
  priceAdult: 1350,
  priceChild: 1350,
  pricingNotes: {},
  maxSeats: 6,
  seatsBooked: 5,
  fixedDate: "2026-03-16",
  endDate: "2026-03-18",
  heroImageUrl: "",
  galleryUrl: "",
  promoImageRef: null,
  seasonalWindowText: null,
  maxMembersText: null,
  active: true,
};

const sampleBooking = {
  tripCode: "TAS-3D2N",
  customerName: "Jane Doe",
  phone: "+61400000000",
  email: "jane@example.com",
  paymentMethod: "stripe" as const,
  paymentStatus: "pending" as const,
  stripePaymentIntentId: "pi_test",
  slipUrl: null,
  waiverAccepted: true,
  complianceDocsUploaded: false,
  docsDeletedAt: null,
};

describe("createBookingWithSeatLock", () => {
  it("rejects overbooking when seatsBooked + requestedSeats > maxSeats", async () => {
    const db = createMockFirestore(baseTrip);

    await expect(
      createBookingWithSeatLock(db as never, {
        tripId: "trip-1",
        bookingId: "booking-1",
        seatsRequested: 2,
        bookingData: sampleBooking,
      }),
    ).rejects.toMatchObject({
      name: "SeatLockError",
      code: "OVERBOOKED",
      message: "Only 1 seat remaining.",
    });

    expect(db.__getTripState().seatsBooked).toBe(5);
    expect(db.__getBookings().size).toBe(0);
  });

  it("locks seats and creates booking when capacity allows", async () => {
    const db = createMockFirestore({ ...baseTrip, seatsBooked: 4 });

    await createBookingWithSeatLock(db as never, {
      tripId: "trip-1",
      bookingId: "booking-ok",
      seatsRequested: 2,
      bookingData: sampleBooking,
    });

    expect(db.__getTripState().seatsBooked).toBe(6);
    expect(db.__getBookings().get("booking-ok")?.seatsBooked).toBe(2);
  });

  it("rejects booking when fixedDate is null (Date TBA)", async () => {
    const db = createMockFirestore({ ...baseTrip, fixedDate: null, seatsBooked: 0 });

    await expect(
      createBookingWithSeatLock(db as never, {
        tripId: "trip-1",
        bookingId: "booking-tba",
        seatsRequested: 1,
        bookingData: sampleBooking,
      }),
    ).rejects.toMatchObject({
      code: "NOT_BOOKABLE",
    });
  });
});

describe("adjustTripSeats", () => {
  it("refuses to push seatsBooked above maxSeats", async () => {
    const db = createMockFirestore({ ...baseTrip, seatsBooked: 6 });

    await expect(
      adjustTripSeats(db as never, { tripId: "trip-1", delta: 1 }),
    ).rejects.toMatchObject({
      code: "OVERBOOKED",
    });

    expect(db.__getTripState().seatsBooked).toBe(6);
  });

  it("allows decrement within bounds", async () => {
    const db = createMockFirestore(baseTrip);

    const next = await adjustTripSeats(db as never, {
      tripId: "trip-1",
      delta: -1,
    });

    expect(next).toBe(4);
    expect(db.__getTripState().seatsBooked).toBe(4);
  });
});

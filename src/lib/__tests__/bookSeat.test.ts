import { describe, expect, it, vi } from "vitest";

import {
  adjustDepartureSeats,
  createBookingWithSeatLock,
} from "@/lib/bookSeat";
import type { TripDeparture } from "@/lib/types/database";

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

function createMockSupabase(initialDeparture: TripDeparture) {
  let departureState = { id: "dep-1", ...initialDeparture };
  const bookings = new Map<string, Record<string, unknown>>();
  let rpcQueue: Promise<unknown> = Promise.resolve();

  const runSerialized = (fn: () => Promise<unknown>) => {
    rpcQueue = rpcQueue.then(fn, fn);
    return rpcQueue;
  };

  const client = {
    from: (table: string) => {
      if (table === "bookings") {
        return {
          insert: async (row: Record<string, unknown>) => {
            bookings.set(String(row.id), row);
            return { error: null };
          },
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    },
    rpc: (name: string, args: { p_departure_id: string; p_seats: number }) =>
      runSerialized(async () => {
        if (name === "reserve_seats") {
          const remaining = departureState.maxSeats - departureState.seatsBooked;
          if (
            departureState.startDate === null ||
            departureState.status === "cancelled" ||
            args.p_seats > remaining
          ) {
            return {
              error: {
                message:
                  departureState.startDate === null
                    ? "NOT_BOOKABLE"
                    : "SEAT_LOCK_FAILED: not enough capacity",
              },
            };
          }
          departureState = {
            ...departureState,
            seatsBooked: departureState.seatsBooked + args.p_seats,
            status:
              departureState.seatsBooked + args.p_seats >= departureState.maxSeats
                ? "full"
                : "upcoming",
          };
          return { error: null };
        }
        if (name === "release_seats") {
          departureState = {
            ...departureState,
            seatsBooked: Math.max(0, departureState.seatsBooked - args.p_seats),
            status: "upcoming",
          };
          return { error: null };
        }
        return { error: { message: "unknown rpc" } };
      }),
    __getDepartureState: () => departureState,
    __getBookings: () => bookings,
  };

  vi.doMock("@/lib/db/queries", () => ({
    getDepartureById: async () => ({ ...departureState }),
  }));

  return client;
}

vi.mock("@/lib/db/queries", () => ({
  getDepartureById: vi.fn(),
}));

import { getDepartureById } from "@/lib/db/queries";

describe("createBookingWithSeatLock (Supabase RPC)", () => {
  it("rejects overbooking when seatsBooked + requestedSeats > maxSeats", async () => {
    const mock = createMockSupabase(baseDeparture);
    vi.mocked(getDepartureById).mockResolvedValue({ id: "dep-1", ...baseDeparture });

    await expect(
      createBookingWithSeatLock(
        {
          departureId: "dep-1",
          bookingId: "booking-1",
          seatsRequested: 2,
          bookingData: sampleBooking,
        },
        mock as never,
      ),
    ).rejects.toMatchObject({
      name: "SeatLockError",
      code: "OVERBOOKED",
    });

    expect(mock.__getBookings().size).toBe(0);
  });

  it("locks seats and creates booking when capacity allows", async () => {
    const mock = createMockSupabase({ ...baseDeparture, seatsBooked: 4 });
    vi.mocked(getDepartureById).mockImplementation(async () => ({
      id: "dep-1",
      ...mock.__getDepartureState(),
    }));

    await createBookingWithSeatLock(
      {
        departureId: "dep-1",
        bookingId: "booking-ok",
        seatsRequested: 2,
        bookingData: sampleBooking,
      },
      mock as never,
    );

    expect(mock.__getDepartureState().seatsBooked).toBe(6);
    expect(mock.__getBookings().get("booking-ok")?.seats_booked).toBe(2);
  });

  it("rejects booking when startDate is null (Date TBA)", async () => {
    vi.mocked(getDepartureById).mockResolvedValue({
      id: "dep-1",
      ...baseDeparture,
      startDate: null,
      seatsBooked: 0,
    });
    const mock = createMockSupabase({ ...baseDeparture, startDate: null, seatsBooked: 0 });

    await expect(
      createBookingWithSeatLock(
        {
          departureId: "dep-1",
          bookingId: "booking-tba",
          seatsRequested: 1,
          bookingData: sampleBooking,
        },
        mock as never,
      ),
    ).rejects.toMatchObject({ code: "NOT_BOOKABLE" });
  });

  it("rejects concurrent bookings that would exceed capacity (race)", async () => {
    const mock = createMockSupabase({ ...baseDeparture, seatsBooked: 5, maxSeats: 6 });
    vi.mocked(getDepartureById).mockImplementation(async () => ({
      id: "dep-1",
      ...mock.__getDepartureState(),
    }));

    const attempt = (id: string) =>
      createBookingWithSeatLock(
        {
          departureId: "dep-1",
          bookingId: id,
          seatsRequested: 1,
          bookingData: { ...sampleBooking },
        },
        mock as never,
      );

    const [first, second] = await Promise.allSettled([
      attempt("race-a"),
      attempt("race-b"),
    ]);

    const fulfilled = [first, second].filter((r) => r.status === "fulfilled");
    const rejected = [first, second].filter((r) => r.status === "rejected");

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(mock.__getDepartureState().seatsBooked).toBe(6);
    expect(mock.__getBookings().size).toBe(1);
  });
});

describe("adjustDepartureSeats", () => {
  it("refuses to push seatsBooked above maxSeats", async () => {
    const mock = createMockSupabase({ ...baseDeparture, seatsBooked: 6 });
    vi.mocked(getDepartureById).mockResolvedValue({ id: "dep-1", ...baseDeparture, seatsBooked: 6 });

    await expect(
      adjustDepartureSeats({ departureId: "dep-1", delta: 1 }, mock as never),
    ).rejects.toMatchObject({ code: "OVERBOOKED" });
  });

  it("allows decrement within bounds", async () => {
    const mock = createMockSupabase(baseDeparture);
    vi.mocked(getDepartureById).mockImplementation(async () => ({
      id: "dep-1",
      ...mock.__getDepartureState(),
    }));

    const next = await adjustDepartureSeats(
      { departureId: "dep-1", delta: -1 },
      mock as never,
    );

    expect(next).toBe(4);
  });
});

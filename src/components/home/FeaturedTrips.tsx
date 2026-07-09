import Link from "next/link";

import { TripCard } from "@/components/trips/TripCard";
import type { TripDeparture, TripTemplate } from "@/lib/types/database";

interface FeaturedTripsProps {
  trips: Array<{
    template: TripTemplate;
    nearestDeparture: TripDeparture | null;
    seatsRemaining: number | null;
    imageUrl: string;
  }>;
}

export function FeaturedTrips({ trips }: FeaturedTripsProps) {
  return (
    <section className="bg-[#0a1628] px-4 py-20 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              className="font-serif text-3xl"
              style={{ fontFamily: "var(--font-instrument-serif), var(--font-noto-serif-thai), serif" }}
            >
              ทริปแนะนำ
            </h2>
            <p className="mt-2 text-white/60">ทริปถัดไปที่เปิดจอง — หรือทริปยอดนิยมของเรา</p>
          </div>
          <Link href="/trips" className="text-sm text-white/70 underline hover:text-white">
            ดูทั้งหมด
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trips.map((trip) => (
            <TripCard key={trip.template.tripCode} {...trip} />
          ))}
        </div>
      </div>
    </section>
  );
}

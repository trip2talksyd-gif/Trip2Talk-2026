"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { CATEGORY_FILTERS, formatThaiDate, getUnitPriceAud } from "@/lib/booking-pricing";
import type { TripDeparture, TripTemplate } from "@/lib/types/database";

interface CatalogTrip {
  template: TripTemplate;
  nearestDeparture: TripDeparture | null;
  departureId: string | null;
  seatsRemaining: number | null;
  imageUrl: string;
}

export function TripsCatalogClient({ trips }: { trips: CatalogTrip[] }) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return trips;
    const cat = CATEGORY_FILTERS.find((c) => c.key === filter);
    if (!cat) return trips;
    return trips.filter((t) => cat.match(t.template.category));
  }, [trips, filter]);

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Link href="/" className="text-sm text-white/60 hover:text-white">
          ← หน้าแรก
        </Link>
        <h1 className="mt-4 font-serif text-4xl">ทริปทั้งหมด</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="text-white/70">เลือกทริปถ่ายภาพทั่วออสเตรเลียกับ Trip2Talk</p>
          <Link
            href="/trip-finder"
            className="rounded-full border border-white/30 px-4 py-1.5 text-xs text-white/80 hover:border-white/50 hover:text-white"
          >
            หาทริปที่ใช่สำหรับคุณ →
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-4 py-2 text-xs ${filter === "all" ? "bg-white text-black" : "bg-white/10"}`}
          >
            ทั้งหมด
          </button>
          {CATEGORY_FILTERS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setFilter(c.key)}
              className={`rounded-full px-4 py-2 text-xs ${filter === c.key ? "bg-white text-black" : "bg-white/10"}`}
            >
              {c.label}
            </button>
          ))}
          <Link
            href="/trips/private"
            className="rounded-full bg-white/10 px-4 py-2 text-xs hover:bg-white/20"
          >
            ทริปส่วนตัว 1 วัน
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ template, nearestDeparture, seatsRemaining, imageUrl }) => {
            const departureType = template.departureType;
            let dateLabel = "แจ้งวันที่เร็วๆ นี้";
            if (departureType?.includes("onRequest") || departureType?.includes("OnRequest")) {
              dateLabel = "เปิดจองได้ตลอด";
            } else if (nearestDeparture?.startDate) {
              dateLabel = formatThaiDate(nearestDeparture.startDate);
            }

            return (
              <Link
                key={template.tripCode}
                href={`/trips/${template.tripCode}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur transition hover:border-white/25"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={template.nameTH}
                  className="h-44 w-full object-cover transition group-hover:scale-[1.02]"
                />
                <div className="p-4">
                  <h2 className="font-serif text-lg leading-snug">{template.nameTH}</h2>
                  <p className="mt-2 text-sm text-white/60">{dateLabel}</p>
                  {seatsRemaining !== null && (
                    <p className="mt-1 text-xs text-white/50">เหลือ {seatsRemaining} ที่นั่ง</p>
                  )}
                  <p className="mt-3 text-sm font-medium">
                    จาก AUD ${getUnitPriceAud(template).toLocaleString()}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}

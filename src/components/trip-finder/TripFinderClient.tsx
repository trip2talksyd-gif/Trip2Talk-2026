"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { TripCard } from "@/components/trips/TripCard";
import {
  PACE_LABELS,
  PRICE_LABELS,
  THEME_LABELS,
  formatMatchReason,
  matchTrips,
  type QuizAnswers,
} from "@/lib/matchTrips";
import { tripImageUrl } from "@/lib/trip-images";
import type { TripTemplate } from "@/lib/types/database";

const MONTHS = [
  { value: 1, label: "ม.ค." },
  { value: 2, label: "ก.พ." },
  { value: 3, label: "มี.ค." },
  { value: 4, label: "เม.ย." },
  { value: 5, label: "พ.ค." },
  { value: 6, label: "มิ.ย." },
  { value: 7, label: "ก.ค." },
  { value: 8, label: "ส.ค." },
  { value: 9, label: "ก.ย." },
  { value: 10, label: "ต.ค." },
  { value: 11, label: "พ.ย." },
  { value: 12, label: "ธ.ค." },
];

interface TripFinderClientProps {
  templates: TripTemplate[];
}

export function TripFinderClient({ templates }: TripFinderClientProps) {
  const [month, setMonth] = useState(3);
  const [themes, setThemes] = useState<string[]>(["landscape"]);
  const [groupFit, setGroupFit] = useState<QuizAnswers["groupFit"]>("private-small");
  const [pricePoint, setPricePoint] = useState<QuizAnswers["pricePoint"]>("mid");
  const [pace, setPace] = useState<QuizAnswers["pace"]>("multi-day-relaxed");
  const [submitted, setSubmitted] = useState(false);

  const results = useMemo(() => {
    if (!submitted) return [];
    return matchTrips(templates, { month, themes, groupFit, pricePoint, pace });
  }, [submitted, templates, month, themes, groupFit, pricePoint, pace]);

  function toggleTheme(theme: string) {
    setThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme],
    );
  }

  return (
    <div className="space-y-10">
      <section className="liquid-glass rounded-2xl p-6">
        <h2 className="font-serif text-xl">1. อยากไปช่วงเดือนไหน?</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {MONTHS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMonth(m.value)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                month === m.value ? "bg-white text-black" : "bg-white/10 text-white"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </section>

      <section className="liquid-glass rounded-2xl p-6">
        <h2 className="font-serif text-xl">2. ชอบถ่ายภาพแนวไหน?</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(THEME_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleTheme(key)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                themes.includes(key) ? "bg-white text-black" : "bg-white/10 text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="liquid-glass rounded-2xl p-6">
        <h2 className="font-serif text-xl">3. เดินทางกันกี่คน?</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              ["private-small", "Private กลุ่มเล็ก 4-6"],
              ["small-group", "กลุ่มเล็ก"],
              ["flexible", "ยืดหยุ่นได้"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setGroupFit(value)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                groupFit === value ? "bg-white text-black" : "bg-white/10 text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="liquid-glass rounded-2xl p-6">
        <h2 className="font-serif text-xl">4. งบประมาณโดยประมาณ?</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.entries(PRICE_LABELS) as [QuizAnswers["pricePoint"], string][]).map(
            ([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPricePoint(value)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  pricePoint === value ? "bg-white text-black" : "bg-white/10 text-white"
                }`}
              >
                {label}
              </button>
            ),
          )}
        </div>
      </section>

      <section className="liquid-glass rounded-2xl p-6">
        <h2 className="font-serif text-xl">5. อยากได้ทริปวันเดียวหรือหลายวัน?</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.entries(PACE_LABELS) as [QuizAnswers["pace"], string][]).map(
            ([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPace(value)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  pace === value ? "bg-white text-black" : "bg-white/10 text-white"
                }`}
              >
                {label}
              </button>
            ),
          )}
        </div>
      </section>

      <button
        type="button"
        onClick={() => setSubmitted(true)}
        className="w-full rounded-full bg-white/90 py-3 text-sm font-medium text-black"
      >
        ดูทริปที่ใช่สำหรับฉัน
      </button>

      {submitted && (
        <section>
          <h2 className="font-serif text-2xl">ทริปที่แนะนำสำหรับคุณ</h2>
          {results.length === 0 ? (
            <p className="mt-4 text-white/70">
              ยังไม่เจอทริปที่ตรงเป๊ะ —{" "}
              <Link href="/contact" className="underline">
                แชทกับเรา
              </Link>{" "}
              แล้วทีมงานจะช่วยแนะนำเพิ่มเติม
            </p>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map(({ template, matchedLabels }) => (
                <div key={template.tripCode}>
                  <p className="mb-2 text-sm text-[#C8A84B]">
                    {formatMatchReason(matchedLabels)}
                  </p>
                  <TripCard
                    template={template}
                    nearestDeparture={null}
                    seatsRemaining={null}
                    imageUrl={tripImageUrl(template.promoImageRef)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

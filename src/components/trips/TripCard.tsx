import Link from "next/link";

import { formatThaiDate, getUnitPriceAud } from "@/lib/booking-pricing";
import type { TripDeparture, TripTemplate } from "@/lib/types/firestore";

export interface TripCardProps {
  template: TripTemplate;
  nearestDeparture: TripDeparture | null;
  seatsRemaining: number | null;
  imageUrl: string;
}

export function TripCard({
  template,
  nearestDeparture,
  seatsRemaining,
  imageUrl,
}: TripCardProps) {
  const departureType = template.departureType;
  let dateLabel = "แจ้งวันที่เร็วๆ นี้";
  if (departureType?.includes("onRequest") || departureType?.includes("OnRequest")) {
    dateLabel = "เปิดจองได้ตลอด";
  } else if (nearestDeparture?.startDate) {
    dateLabel = formatThaiDate(nearestDeparture.startDate);
  }

  return (
    <Link
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
}

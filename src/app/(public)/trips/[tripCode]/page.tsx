import Link from "next/link";

import { CheckoutWidget } from "@/components/trips/CheckoutWidget";
import { formatThaiDate, getUnitPriceAud } from "@/lib/booking-pricing";
import { fetchTripByCode, tripImageUrl } from "@/lib/trips-server";

export const dynamic = "force-dynamic";

export default async function TripDetailPage({
  params,
}: {
  params: { tripCode: string };
}) {
  const data = await fetchTripByCode(params.tripCode);
  if (!data) {
    return (
      <main className="min-h-screen bg-[#0a1628] p-8 text-white">
        <p>ไม่พบทริปนี้</p>
        <Link href="/trips" className="text-white/70 underline">
          กลับหน้าทริปทั้งหมด
        </Link>
      </main>
    );
  }

  const { template, departures } = data;
  const hasBookable = departures.some((d) => d.dep.startDate);
  const firstDep = departures.find((d) => d.dep.startDate);
  const isSydOneDay = template.tripCode === "SYD-1DAY";
  const subPackages = (template.subPackages ?? []) as Array<{
    id?: string;
    name?: string;
    titleTH?: string;
    description?: string;
    priceAUD?: number;
  }>;

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Link href="/trips" className="text-sm text-white/60 hover:text-white">
          ← ทริปทั้งหมด
        </Link>

        <div className="mt-6 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tripImageUrl(template.promoImageRef)}
            alt={template.nameTH}
            className="h-64 w-full object-cover"
          />
        </div>

        <h1 className="mt-6 font-serif text-3xl">{template.nameTH}</h1>
        <p className="mt-2 text-white/70">{template.tagline}</p>

        {template.highlights?.length > 0 && (
          <section className="mt-8">
            <h2 className="font-serif text-xl">ไฮไลท์</h2>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              {template.highlights.map((h, i) => (
                <li key={i}>• {h.title}{h.description ? ` — ${h.description}` : ""}</li>
              ))}
            </ul>
          </section>
        )}

        {template.itinerary?.length > 0 && (
          <section className="mt-8">
            <h2 className="font-serif text-xl">รายการเดินทาง</h2>
            <div className="mt-3 space-y-3">
              {template.itinerary.map((day, i) => (
                <div key={i} className="rounded-xl bg-white/5 p-4 text-sm">
                  <p className="font-medium">{day.time ?? (day.day ? `Day ${day.day}` : `Stop ${i + 1}`)}</p>
                  <p className="mt-1 text-white/70">{day.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="font-serif text-xl">ราคา</h2>
          <p className="mt-2 text-lg">
            เริ่มต้น AUD ${getUnitPriceAud(template).toLocaleString()}
          </p>
          {template.depositPolicy && (
            <p className="mt-2 text-sm text-white/60">{String(template.depositPolicy)}</p>
          )}
        </section>

        {hasBookable && firstDep ? (
          <section className="mt-10">
            <h2 className="font-serif text-xl">จองทริป</h2>
            <p className="mt-1 text-sm text-white/60">
              วันออกเดินทางถัดไป: {formatThaiDate(firstDep.dep.startDate!)}
            </p>

            {isSydOneDay && subPackages.length > 0 ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {subPackages.map((pkg) => (
                  <div key={pkg.id ?? pkg.name} className="rounded-xl border border-white/10 p-4">
                    <p className="font-medium">{pkg.titleTH ?? pkg.name}</p>
                    <p className="mt-1 text-sm text-white/70">{pkg.description}</p>
                    <p className="mt-2 text-sm">
                      AUD ${(pkg.priceAUD ?? getUnitPriceAud(template)).toLocaleString()}
                    </p>
                    <div className="mt-4">
                      <CheckoutWidget
                        departureId={firstDep.id}
                        tripCode={template.tripCode}
                        maxSeats={firstDep.dep.maxSeats - firstDep.dep.seatsBooked}
                        subPackage={pkg.id ?? pkg.name}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <CheckoutWidget
                  departureId={firstDep.id}
                  tripCode={template.tripCode}
                  maxSeats={firstDep.dep.maxSeats - firstDep.dep.seatsBooked}
                />
              </div>
            )}
          </section>
        ) : (
          <section className="mt-10 rounded-2xl bg-white/5 p-6">
            <h2 className="font-serif text-xl">สอบถาม / เปิดจองตามคำขอ</h2>
            <p className="mt-2 text-sm text-white/70">
              ทริปนี้ยังไม่มีวันออกเดินทางที่ยืนยัน — กรุณาติดต่อ trip2talksyd@gmail.com
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

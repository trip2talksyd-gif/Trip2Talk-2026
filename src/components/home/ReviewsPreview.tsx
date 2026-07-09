import Link from "next/link";

import type { ReviewDoc } from "@/types/review";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400" aria-label={`${rating} จาก 5 ดาว`}>
      {"★".repeat(rating)}
      <span className="text-white/20">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function ReviewsPreview({ reviews }: { reviews: ReviewDoc[] }) {
  if (reviews.length === 0) return null;

  return (
    <section className="bg-[#0a1628] px-4 py-20 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2
            className="font-serif text-3xl"
            style={{ fontFamily: "var(--font-instrument-serif), var(--font-noto-serif-thai), serif" }}
          >
            เสียงจากลูกค้า
          </h2>
          <Link href="/reviews" className="text-sm text-white/70 underline hover:text-white">
            ดูรีวิวทั้งหมด
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <Stars rating={r.rating} />
              <p className="mt-4 text-sm leading-relaxed text-white/80">&ldquo;{r.text}&rdquo;</p>
              <p className="mt-4 text-sm font-medium">{r.customerName}</p>
              {r.tripNameTH && (
                <p className="text-xs text-white/50">{r.tripNameTH}</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

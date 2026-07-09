import type { ReviewDoc } from "@/types/review";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400" aria-label={`${rating} จาก 5 ดาว`}>
      {"★".repeat(rating)}
      <span className="text-white/20">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function ReviewCard({ review }: { review: ReviewDoc }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <Stars rating={review.rating} />
      <p className="mt-4 text-sm leading-relaxed text-white/85">&ldquo;{review.text}&rdquo;</p>
      <p className="mt-4 font-medium">{review.customerName}</p>
      {review.tripNameTH && (
        <p className="mt-1 text-xs text-white/50">ทริป: {review.tripNameTH}</p>
      )}
      {review.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={review.photoUrl}
          alt=""
          className="mt-4 h-32 w-full rounded-lg object-cover"
        />
      )}
    </article>
  );
}

export function ReviewsEmpty() {
  return (
    <p className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
      ยังไม่มีรีวิวที่เผยแพร่ — กลับมาดูใหม่เร็วๆ นี้
    </p>
  );
}

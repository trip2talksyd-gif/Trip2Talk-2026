/** Real customer quotes for the "What guests say" section on Trip Detail.
 * Empty on purpose — fake/invented reviews are misleading and risky (Australian
 * Consumer Law prohibits false testimonials). Add real ones here once พี่แสน
 * has quotes/screenshots from actual guests (Facebook comments, messages,
 * Google reviews, etc). Leave `tripCode` unset for a quote that can show on
 * any trip page; set it to pin a quote to one specific trip.
 */
export type Testimonial = {
  id: string
  name: string
  tripCode?: string
  quoteEn: string
  quoteTh?: string
  photoUrl?: string
}

export const TESTIMONIALS: Testimonial[] = [
  // Example shape — delete this comment and add real entries:
  // {
  //   id: 'nathiee-uluru-2026',
  //   name: 'Nathiee L.',
  //   tripCode: 'ULU-4D3N-SEP',
  //   quoteEn: 'Best trip I have done in Australia — the photos are amazing.',
  //   quoteTh: 'ทริปที่ดีที่สุดที่เคยไปในออสเตรเลีย รูปสวยมากๆ',
  //   photoUrl: 'https://.../guest-photo.jpg',
  // },
]

/** Trip-specific quotes first, falling back to general (no tripCode) quotes. */
export function getTestimonialsForTrip(tripCode: string, limit = 3): Testimonial[] {
  const specific = TESTIMONIALS.filter((t) => t.tripCode === tripCode)
  if (specific.length >= limit) return specific.slice(0, limit)
  const general = TESTIMONIALS.filter((t) => !t.tripCode)
  return [...specific, ...general].slice(0, limit)
}

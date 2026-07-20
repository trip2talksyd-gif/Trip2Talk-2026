import { useLang } from '../../hooks/useLang'
import type { Testimonial } from '../../data/testimonials'

type Props = {
  testimonials: Testimonial[]
}

/** Renders nothing until real quotes exist for this trip — see src/data/testimonials.ts. */
export default function TestimonialSection({ testimonials }: Props) {
  const { lang } = useLang()
  if (testimonials.length === 0) return null

  return (
    <section>
      <h2 className="font-serif text-lg text-ink">
        {lang === 'th' ? 'รีวิวจากลูกทริป' : 'What guests say'}
      </h2>
      <div className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1">
        {testimonials.map((item) => (
          <figure
            key={item.id}
            className="w-64 shrink-0 rounded-editorial border border-line bg-cream p-4"
          >
            <div className="flex items-center gap-2.5">
              {item.photoUrl ? (
                <img
                  src={item.photoUrl}
                  alt={item.name}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                  {item.name.charAt(0)}
                </span>
              )}
              <figcaption className="text-sm font-medium text-ink">{item.name}</figcaption>
            </div>
            <blockquote className="mt-2.5 text-sm leading-relaxed text-ink/80">
              “{lang === 'th' && item.quoteTh ? item.quoteTh : item.quoteEn}”
            </blockquote>
          </figure>
        ))}
      </div>
    </section>
  )
}

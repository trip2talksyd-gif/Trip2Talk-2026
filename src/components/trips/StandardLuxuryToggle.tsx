import BiDisplayHeading from '../ui/BiDisplayHeading'
import { useLang } from '../../hooks/useLang'
import type { Tour } from '../../types/tour'
import { isListedPriceHidden, listedLuxuryPriceAud } from '../../lib/toursApi'
import { getStayCopy, type StayTier } from '../../data/luxuryStay'

type Props = {
  tour: Tour
  value: StayTier
  onChange: (tier: StayTier) => void
}

export default function StandardLuxuryToggle({ tour, value, onChange }: Props) {
  const { lang } = useLang()
  const thaiPrimary = lang === 'th'
  const luxuryAud = listedLuxuryPriceAud(tour)
  if (luxuryAud == null) return null

  const copy = getStayCopy(tour.trip_code)
  const priceHidden = isListedPriceHidden(tour)
  const stay = copy ? (value === 'luxury' ? copy.luxury : copy.standard) : null

  const options: { id: StayTier; en: string; th: string }[] = [
    { id: 'standard', en: 'Standard', th: 'มาตรฐาน' },
    { id: 'luxury', en: 'Luxury', th: 'พรีเมียม' },
  ]

  return (
    <div className="rounded-[14px] border border-line bg-cream-app p-3">
      <BiDisplayHeading
        as="h2"
        thAs="p"
        en="Stay tier"
        th="ระดับที่พัก"
        className="mb-2"
        enClassName="text-[12px] font-semibold leading-snug text-teal-dark"
        thClassName="mt-0.5 text-[10px] font-medium text-ink-soft"
      />
      <div className="flex rounded-xl bg-mint-100 p-0.5" role="tablist" aria-label="Stay tier">
        {options.map((opt) => {
          const selected = value === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(opt.id)}
              className={`flex-1 rounded-[10px] px-2 py-1.5 text-center ${
                selected ? 'bg-teal-dark text-cream-app shadow-sm' : 'text-ink-soft'
              }`}
            >
              <span
                lang="en"
                className={`block font-display text-[11px] font-semibold ${selected ? '' : 'text-teal-dark'}`}
              >
                {opt.en}
              </span>
              <span
                lang="th"
                className={`mt-0.5 block overflow-visible font-serif text-[9px] leading-normal ${
                  selected ? 'text-cream-app/85' : 'text-ink-soft'
                }`}
              >
                {opt.th}
              </span>
            </button>
          )
        })}
      </div>

      {stay &&
        (thaiPrimary ? (
          <>
            <p lang="th" className="mt-2.5 overflow-visible font-serif text-[11px] leading-normal text-teal-dark">
              {stay.th}
            </p>
            <p lang="en" className="mt-0.5 font-display text-[10px] leading-snug text-ink-soft">
              {stay.en}
            </p>
          </>
        ) : (
          <>
            <p lang="en" className="mt-2.5 font-display text-[11px] leading-snug text-teal-dark">
              {stay.en}
            </p>
            <p lang="th" className="mt-0.5 overflow-visible font-serif text-[10px] leading-normal text-ink-soft">
              {stay.th}
            </p>
          </>
        ))}

      {value === 'luxury' && copy &&
        (thaiPrimary ? (
          <>
            <p lang="th" className="mt-2 overflow-visible font-serif text-[10.5px] font-medium leading-normal text-orange">
              {copy.luxuryUpgradeNote.th}
            </p>
            <p lang="en" className="mt-0.5 font-display text-[9.5px] leading-snug text-ink-soft">
              {copy.luxuryUpgradeNote.en}
            </p>
          </>
        ) : (
          <>
            <p lang="en" className="mt-2 font-display text-[10.5px] font-medium leading-snug text-orange">
              {copy.luxuryUpgradeNote.en}
            </p>
            <p lang="th" className="mt-0.5 overflow-visible font-serif text-[9.5px] leading-normal text-ink-soft">
              {copy.luxuryUpgradeNote.th}
            </p>
          </>
        ))}

      {priceHidden && (
        thaiPrimary ? (
          <>
            <p lang="th" className="mt-2 overflow-visible font-serif text-[10px] leading-normal text-ink-soft">
              ทริปนี้ยังไม่เปิดจองออนไลน์ — ตัวเลขพรีเมียมเป็นเพียงเรทตั้งต้น ไม่ใช่ราคาที่คิดเงินตอนนี้
            </p>
            <p lang="en" className="mt-0.5 font-display text-[9px] leading-snug text-ink-soft">
              Not open for online booking — Luxury is an indicative list price, not a charge today.
            </p>
          </>
        ) : (
          <>
            <p lang="en" className="mt-2 font-display text-[10px] leading-snug text-ink-soft">
              Not open for online booking — Luxury is an indicative list price, not a charge today.
            </p>
            <p lang="th" className="mt-0.5 overflow-visible font-serif text-[9px] leading-normal text-ink-soft">
              ทริปนี้ยังไม่เปิดจองออนไลน์ — ตัวเลขพรีเมียมเป็นเพียงเรทตั้งต้น ไม่ใช่ราคาที่คิดเงินตอนนี้
            </p>
          </>
        )
      )}
    </div>
  )
}

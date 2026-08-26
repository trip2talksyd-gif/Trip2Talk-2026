import BiDisplayHeading from '../ui/BiDisplayHeading'
import { useLang } from '../../hooks/useLang'
import type { Tour } from '../../types/tour'
import { formatAud, listedLuxuryPriceAud } from '../../lib/toursApi'
import { getStayCopy } from '../../data/luxuryStay'

type Props = { tour: Tour }

/** Secondary upsell under the Standard list price — not a selector. */
export default function LuxuryUpgradeCard({ tour }: Props) {
  const { lang } = useLang()
  const luxuryAud = listedLuxuryPriceAud(tour)
  if (luxuryAud == null) return null
  const copy = getStayCopy(tour.trip_code)
  const thaiPrimary = lang === 'th'

  return (
    <div className="mt-3 rounded-[12px] border border-line bg-cream-app/80 px-3 py-2.5">
      <BiDisplayHeading
        as="p"
        thAs="p"
        en="Luxury Upgrade — Private Room"
        th="อัปเกรดพรีเมียม — ห้องส่วนตัว"
        enClassName="text-[11px] font-semibold leading-snug text-teal-dark"
        thClassName="mt-0.5 text-[10px] font-medium text-ink-soft"
      />
      <p className="mt-1 font-display text-[15px] font-semibold text-ink">
        {formatAud(luxuryAud)}
        <span className="ml-1 text-[10px] font-medium text-ink-soft">
          {lang === 'th' ? 'AUD / คน จ่ายเต็ม' : 'AUD / person, pay in full'}
        </span>
      </p>
      {copy &&
        (thaiPrimary ? (
          <>
            <p lang="th" className="mt-1 overflow-visible font-serif text-[11px] leading-normal text-ink/80">
              {copy.luxury.th}
            </p>
            <p lang="en" className="mt-0.5 font-display text-[10px] leading-snug text-ink-soft">
              {copy.luxury.en}
            </p>
          </>
        ) : (
          <>
            <p lang="en" className="mt-1 font-display text-[11px] leading-snug text-ink/80">
              {copy.luxury.en}
            </p>
            <p lang="th" className="mt-0.5 overflow-visible font-serif text-[10px] leading-normal text-ink-soft">
              {copy.luxury.th}
            </p>
          </>
        ))}
    </div>
  )
}

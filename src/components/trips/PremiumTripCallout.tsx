import { Link } from 'react-router-dom'
import { Camera, Luggage } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { PREMIUM_MODEL_CALLOUT, PREMIUM_PACK_CALLOUT } from '../../data/tripTiers'

type Props = {
  tripCode: string
}

export default function PremiumTripCallout({ tripCode }: Props) {
  const { lang } = useLang()

  return (
    <div className="space-y-3">
      <div className="flex gap-3 rounded-editorial border border-gold/50 bg-gold/15 p-4">
        <Camera className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" />
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-gold-dark/80">
            {lang === 'th' ? 'ไฮไลท์พิเศษ' : 'Featured'}
          </p>
          <p className="mt-1 text-sm font-medium leading-relaxed text-gold-dark">
            {lang === 'th' ? PREMIUM_MODEL_CALLOUT.th : PREMIUM_MODEL_CALLOUT.en}
          </p>
        </div>
      </div>

      <div className="flex gap-3 rounded-editorial border border-deep-green/20 bg-deep-green/5 p-4">
        <Luggage className="mt-0.5 h-5 w-5 shrink-0 text-deep-green" />
        <p className="text-sm leading-relaxed text-brand-dark/80">
          {lang === 'th' ? PREMIUM_PACK_CALLOUT.th : PREMIUM_PACK_CALLOUT.en}{' '}
          <Link
            to={`/trips/${tripCode}/prep`}
            className="font-medium text-deep-green underline underline-offset-2"
          >
            {lang === 'th' ? 'เตรียมตัวก่อนเดินทาง →' : 'Trip Preparation →'}
          </Link>
        </p>
      </div>
    </div>
  )
}

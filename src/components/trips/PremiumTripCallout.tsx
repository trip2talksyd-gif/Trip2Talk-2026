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
      <div className="flex gap-3 rounded-editorial border border-teal-600/40 bg-teal-500/15 p-4">
        <Camera className="mt-0.5 h-5 w-5 shrink-0 text-teal-800" />
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-teal-700/80">
            {lang === 'th' ? 'ไฮไลท์พิเศษ' : 'Featured'}
          </p>
          <p className="mt-1 text-sm font-medium leading-relaxed text-teal-800">
            {lang === 'th' ? PREMIUM_MODEL_CALLOUT.th : PREMIUM_MODEL_CALLOUT.en}
          </p>
        </div>
      </div>

      <div className="flex gap-3 rounded-editorial border border-line bg-mint-100 p-4">
        <Luggage className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
        <p className="text-sm leading-relaxed text-ink/80">
          {lang === 'th' ? PREMIUM_PACK_CALLOUT.th : PREMIUM_PACK_CALLOUT.en}{' '}
          <Link
            to={`/trips/${tripCode}/prep`}
            className="font-medium text-teal-700 underline underline-offset-2"
          >
            {lang === 'th' ? 'เตรียมตัวก่อนเดินทาง →' : 'Trip Preparation →'}
          </Link>
        </p>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { Camera } from 'lucide-react'
import { useLang } from '../../hooks/useLang'

/**
 * Temporary stub so the Home promo banner has a real target.
 * Full Photo Guide hub (Phase 4) is not built yet — do not expand this page
 * into the real guides until asked.
 */
export default function PhotoGuideComingSoonPage() {
  const { lang, t } = useLang()

  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/15 text-teal-600">
        <Camera className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <h1 className="mt-4 font-serif text-2xl text-ink">{t('home.promo.title')}</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        {lang === 'th'
          ? 'คู่มือโพสท่า / ตั้งค่ากล้อง / ถ่ายด้วยมือถือ — กำลังจัดทำ จะเปิดเร็วๆ นี้'
          : 'Posing, camera settings, and mobile photography guides are on the way. Coming soon.'}
      </p>
      <Link to="/" className="btn-embossed mt-8 inline-flex">
        {lang === 'th' ? 'กลับหน้าแรก' : 'Back home'}
      </Link>
    </div>
  )
}

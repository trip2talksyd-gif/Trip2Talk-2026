import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { CONTACT_CHANNELS } from '../../data/contactChannels'
import { formatAud, lookupMyTrip, type MyTripLookupResult } from '../../lib/toursApi'
import { isValidEmail, normalizeAuMobile } from '../../lib/validation'

const messengerHref =
  CONTACT_CHANNELS.find((c) => c.id === 'messenger')?.href ?? 'https://m.me/61586534972406'

const STATUS_LABEL: Record<string, { en: string; th: string }> = {
  pending_payment: { en: 'Deposit pending', th: 'รอชำระมัดจำ' },
  deposit_paid: { en: 'Deposit paid', th: 'ชำระมัดจำแล้ว' },
  fully_paid: { en: 'Fully paid', th: 'ชำระครบแล้ว' },
  cancelled: { en: 'Cancelled', th: 'ยกเลิก' },
  no_show: { en: 'No-show', th: 'ไม่มาตามนัด' },
}

export default function MyTripPage() {
  const { lang, t } = useLang()
  const [reference, setReference] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<MyTripLookupResult | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)

    const ref = reference.trim()
    const em = email.trim()
    const ph = phone.trim()

    if (!ref) {
      setError(t('myTrip.error.reference'))
      return
    }
    if (!em && !ph) {
      setError(t('myTrip.error.contact'))
      return
    }
    if (em && !isValidEmail(em)) {
      setError(t('myTrip.error.email'))
      return
    }

    setLoading(true)
    try {
      const data = await lookupMyTrip({
        reference: ref,
        email: em || undefined,
        phone: ph ? normalizeAuMobile(ph) : undefined,
      })
      if (!data.found || !data.booking) {
        setError(t('myTrip.notFound'))
        return
      }
      setResult(data)
    } catch {
      setError(t('myTrip.rpcMissing'))
    } finally {
      setLoading(false)
    }
  }

  const booking = result?.booking
  const balance =
    booking != null ? Math.max(0, booking.price_aud - booking.amount_paid_aud) : 0
  const statusLabel = booking
    ? STATUS_LABEL[booking.booking_status]?.[lang] ?? booking.booking_status
    : ''

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">{t('nav.myTrip')}</h1>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{t('myTrip.subtitle')}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-editorial border border-line bg-mint-100 p-4">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-ink-soft">
            {t('booking.reference')}
          </span>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="T2T-TAS-3D2N-…"
            className="mt-1 w-full rounded-editorial border border-line bg-cream px-3 py-2.5 text-sm text-ink outline-none focus:border-teal-600"
            autoComplete="off"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-ink-soft">
            {t('form.email')}
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-editorial border border-line bg-cream px-3 py-2.5 text-sm text-ink outline-none focus:border-teal-600"
            autoComplete="email"
          />
        </label>

        <p className="text-center text-[11px] uppercase tracking-wider text-ink-soft">{t('myTrip.or')}</p>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-ink-soft">
            {t('form.phone')}
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="04XX XXX XXX"
            className="mt-1 w-full rounded-editorial border border-line bg-cream px-3 py-2.5 text-sm text-ink outline-none focus:border-teal-600"
            autoComplete="tel"
          />
        </label>

        {error && <p className="text-sm text-coral">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full !bg-teal-900 !text-cream disabled:opacity-50"
        >
          {loading ? t('common.loading') : t('myTrip.lookup')}
        </button>
      </form>

      {booking && (
        <div className="mt-6 space-y-4">
          <article className="rounded-editorial border border-line bg-cream p-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-soft">
              {booking.trip_code}
            </p>
            <h2 className="mt-1 font-serif text-xl text-ink">
              {lang === 'th' ? booking.name_th : booking.name_en}
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              {booking.first_name_en} {booking.last_name_en}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-ink-soft">
                  {t('myTrip.status')}
                </dt>
                <dd className="mt-0.5 font-medium text-ink">{statusLabel}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-ink-soft">
                  {t('myTrip.departure')}
                </dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {booking.departure_date ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-ink-soft">
                  {t('myTrip.paid')}
                </dt>
                <dd className="mt-0.5 font-medium text-teal-600">
                  {formatAud(booking.amount_paid_aud)}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-ink-soft">
                  {t('myTrip.balance')}
                </dt>
                <dd className="mt-0.5 font-medium text-ink">{formatAud(balance)}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-ink-soft">
                  {t('booking.deposit')}
                </dt>
                <dd className="mt-0.5 font-medium text-ink">{formatAud(booking.deposit_aud)}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-ink-soft">
                  {t('myTrip.tripTotal')}
                </dt>
                <dd className="mt-0.5 font-medium text-ink">{formatAud(booking.price_aud)}</dd>
              </div>
            </dl>

            <Link
              to={`/trips/${booking.trip_code}`}
              className="mt-4 inline-block text-xs font-medium uppercase tracking-wider text-teal-600"
            >
              {t('btn.viewTrip')} →
            </Link>
          </article>

          <a
            href={messengerHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-editorial border border-line bg-teal-900 px-4 py-3 text-cream"
          >
            <MessageCircle className="h-5 w-5 shrink-0 text-teal-400" />
            <span className="text-sm leading-snug">{t('myTrip.messageUs')}</span>
          </a>
        </div>
      )}
    </div>
  )
}

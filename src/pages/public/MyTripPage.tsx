import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { CONTACT_CHANNELS } from '../../data/contactChannels'
import BookingJourneyTimeline from '../../components/booking/BookingJourneyTimeline'
import { formatAud, lookupMyTrip, type MyTripLookupResult } from '../../lib/toursApi'
import { isValidEmail } from '../../lib/validation'
import type { BookingStatus } from '../../types/tour'

const facebookHref =
  CONTACT_CHANNELS.find((c) => c.id === 'facebook')?.href ??
  'https://www.facebook.com/profile.php?id=61586534972406'

const STATUS_LABEL: Record<string, { en: string; th: string }> = {
  pending_payment: { en: 'Deposit pending', th: 'รอชำระมัดจำ' },
  deposit_paid: { en: 'Deposit paid', th: 'ชำระมัดจำแล้ว' },
  fully_paid: { en: 'Fully paid', th: 'ชำระครบแล้ว' },
  cancelled: { en: 'Cancelled', th: 'ยกเลิก' },
  no_show: { en: 'No-show', th: 'ไม่มาตามนัด' },
}

const STATUS_BADGE: Record<string, string> = {
  pending_payment: 'bg-teal-500/20 text-ink',
  deposit_paid: 'bg-teal-900 text-cream',
  fully_paid: 'bg-teal-700 text-cream',
  cancelled: 'bg-coral/15 text-coral',
  no_show: 'bg-ink-soft/15 text-ink-soft',
}

export default function MyTripPage() {
  const { lang, t } = useLang()
  const [reference, setReference] = useState('')
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<MyTripLookupResult | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)

    const ref = reference.trim()
    const contactValue = contact.trim()

    if (!ref) {
      setError(t('myTrip.error.reference'))
      return
    }
    if (!contactValue) {
      setError(t('myTrip.error.contact'))
      return
    }
    if (contactValue.includes('@') && !isValidEmail(contactValue)) {
      setError(t('myTrip.error.email'))
      return
    }

    setLoading(true)
    try {
      const data = await lookupMyTrip({
        tripCodeOrReference: ref,
        contact: contactValue,
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
  const statusBadge = booking
    ? STATUS_BADGE[booking.booking_status] ?? 'bg-mint-100 text-ink'
    : ''

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">{t('nav.myTrip')}</h1>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{t('myTrip.subtitle')}</p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-editorial border border-line bg-mint-100 p-4"
      >
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-ink-soft">
            {t('myTrip.refOrCode')}
          </span>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="T2T-TAS-3D2N-… or TAS-3D2N"
            className="mt-1 w-full rounded-editorial border border-line bg-cream px-3 py-2.5 text-sm text-ink outline-none focus:border-teal-600"
            autoComplete="off"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-ink-soft">
            {t('myTrip.contact')}
          </span>
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={lang === 'th' ? 'อีเมล หรือ เบอร์โทร' : 'Email or phone'}
            className="mt-1 w-full rounded-editorial border border-line bg-cream px-3 py-2.5 text-sm text-ink outline-none focus:border-teal-600"
            autoComplete="email"
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
        <div className="mt-6 space-y-5">
          <article className="rounded-editorial border border-line bg-cream p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-soft">
                  {booking.trip_code}
                </p>
                <h2 className="mt-1 font-serif text-xl text-ink">
                  {lang === 'th' ? booking.name_th : booking.name_en}
                </h2>
                <p className="mt-1 text-sm text-ink-soft">
                  {booking.first_name_en} {booking.last_name_en}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${statusBadge}`}
              >
                {statusLabel}
              </span>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-ink-soft">
                  {t('myTrip.departure')}
                </dt>
                <dd className="mt-0.5 font-medium text-ink">{booking.departure_date ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-ink-soft">
                  {t('booking.reference')}
                </dt>
                <dd className="mt-0.5 font-mono text-xs font-medium text-ink">
                  {booking.reference ?? '—'}
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
            href={facebookHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-editorial border border-line bg-teal-900 px-4 py-3 text-cream"
          >
            <MessageCircle className="h-5 w-5 shrink-0 text-teal-400" />
            <span className="text-sm leading-snug">{t('myTrip.messageUs')}</span>
          </a>

          <BookingJourneyTimeline
            bookingStatus={booking.booking_status as BookingStatus}
            className="rounded-editorial border border-line bg-cream p-4"
          />
        </div>
      )}
    </div>
  )
}

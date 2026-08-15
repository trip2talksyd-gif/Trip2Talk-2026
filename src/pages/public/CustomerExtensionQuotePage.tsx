import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import {
  createSquareCheckout,
  formatAud,
  formatDate,
  lookupPublicExtensionQuote,
  type PublicExtensionQuoteLookup,
} from '../../lib/toursApi'
import BiDisplayHeading from '../../components/ui/BiDisplayHeading'
import BiText from '../../components/ui/BiText'
import PayIdDepositPanel from '../../components/booking/PayIdDepositPanel'
import SquareCardElement from '../../components/booking/SquareCardElement'

export default function CustomerExtensionQuotePage() {
  const { token = '' } = useParams()
  const [params] = useSearchParams()
  const { lang, t } = useLang()
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [lookup, setLookup] = useState<PublicExtensionQuoteLookup | null>(null)
  const [errorKind, setErrorKind] = useState<'not_found' | 'cancelled' | 'other'>('other')
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  function reload() {
    lookupPublicExtensionQuote(token)
      .then((data) => {
        setLookup(data)
        setState('ready')
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : ''
        setErrorKind(msg === 'booking_cancelled' ? 'cancelled' : msg === 'not_found' ? 'not_found' : 'other')
        setState('error')
      })
  }

  useEffect(() => {
    let cancelled = false
    lookupPublicExtensionQuote(token)
      .then((data) => {
        if (cancelled) return
        setLookup(data)
        setState('ready')
      })
      .catch((err) => {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : ''
        setErrorKind(msg === 'booking_cancelled' ? 'cancelled' : msg === 'not_found' ? 'not_found' : 'other')
        setState('error')
      })
    return () => {
      cancelled = true
    }
  }, [token, params.get('paid')])

  if (state === 'loading') {
    return <p className="p-6 text-sm text-ink-soft">{t('quote.loading')}</p>
  }

  if (state === 'error' || !lookup) {
    return (
      <div className="rounded-xl border border-teal-600/40 bg-teal-500/10 p-4 text-sm text-ink">
        <BiText
          en={
            errorKind === 'cancelled'
              ? 'This booking was cancelled. The quotation link is no longer valid.'
              : 'This quotation link is invalid. Ask Trip2Talk staff for a new link.'
          }
          th={
            errorKind === 'cancelled'
              ? 'การจองนี้ถูกยกเลิกแล้ว ลิงก์ใบเสนอราคาใช้ไม่ได้'
              : 'ลิงก์ใบเสนอราคาไม่ถูกต้อง ขอลิงก์ใหม่จากเจ้าหน้าที่ Trip2Talk'
          }
          thClassName="mt-1 block font-thai text-ink-soft"
        />
        <Link to="/" className="mt-2 block text-teal-700 underline">
          Home / หน้าแรก
        </Link>
      </div>
    )
  }

  const showPay = lookup.payable && lookup.status === 'pending'

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-6">
      <BiDisplayHeading
        en="Written quotation — extra trip days"
        th="ใบเสนอราคา — วันทริปเพิ่ม"
        enClassName="font-display text-2xl font-semibold tracking-tight text-ink"
        thClassName="mt-1 text-sm text-ink-soft"
      />
      <BiText
        as="p"
        className="text-sm text-ink-soft"
        en="Pay the full quoted amount at least 10 days before departure."
        th="ต้องชำระยอดเต็มตามใบเสนอราคาอย่างน้อย 10 วันก่อนวันเดินทาง"
      />

      <div className="rounded-xl border border-line bg-white p-4 text-sm text-ink">
        <p className="font-semibold">
          {lookup.first_name_en} {lookup.last_name_en}
        </p>
        <p className="mt-0.5 text-[12px] text-ink-soft">
          {lookup.trip_name_en || lookup.trip_code}
          {lookup.booking_reference ? ` · ${lookup.booking_reference}` : ''}
        </p>
        <dl className="mt-3 space-y-2 text-[13px]">
          <div className="flex justify-between gap-3">
            <dt className="text-ink-soft">{t('quote.extraDays')}</dt>
            <dd className="font-semibold">+{lookup.extra_days}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-soft">{t('quote.price')}</dt>
            <dd className="font-semibold">{formatAud(lookup.price_difference_aud)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-soft">{t('quote.deadline')}</dt>
            <dd className="font-semibold">{formatDate(lookup.payment_deadline, lang)}</dd>
          </div>
        </dl>
        {lookup.quote_note ? (
          <div className="mt-3 border-t border-line pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
              {t('quote.note')}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed">{lookup.quote_note}</p>
          </div>
        ) : null}
      </div>

      {lookup.status === 'paid' ? (
        <div className="rounded-xl border border-teal-600/40 bg-teal-500/10 p-4">
          <BiText
            as="p"
            className="text-sm text-ink"
            en="Payment received. Your trip is extended by the quoted extra days."
            th="ชำระแล้ว ทริปของคุณขยายตามจำนวนวันในใบเสนอราคา"
          />
        </div>
      ) : null}

      {lookup.status === 'pending' && params.get('paid') === '1' && lookup.payable ? (
        <p className="text-[12px] text-ink-soft">
          {lang === 'th'
            ? 'กำลังยืนยันการชำระกับ Square — รีเฟรชหน้านี้ในอีกสักครู่'
            : 'Confirming Square payment — refresh this page in a moment.'}
        </p>
      ) : null}

      {lookup.status === 'expired' || (lookup.status === 'pending' && !lookup.payable) ? (
        <div className="rounded-xl border border-coral/40 bg-coral/10 p-4">
          <BiText
            as="p"
            className="text-sm text-ink"
            en="This quotation expired unpaid. The extra days are cancelled. Your trip stays at the originally booked duration."
            th="ใบเสนอราคานี้เลยกำหนดแล้วและยังไม่ชำระ วันเพิ่มถูกยกเลิก ทริปของคุณยังเป็นจำนวนวันเดิมตามที่จอง"
          />
        </div>
      ) : null}

      {lookup.status === 'cancelled' ? (
        <div className="rounded-xl border border-line bg-card p-4">
          <BiText
            as="p"
            className="text-sm text-ink"
            en="This quotation was cancelled by Trip2Talk staff."
            th="เจ้าหน้าที่ Trip2Talk ยกเลิกใบเสนอราคานี้แล้ว"
          />
        </div>
      ) : null}

      {showPay ? (
        <>
          <BiText
            as="p"
            className="text-[12px] leading-relaxed text-ink-soft"
            en="Pay the full quoted amount by the deadline. Partial payment is not accepted. If unpaid by this deadline the extension is cancelled automatically — no on-site negotiation."
            th="ต้องโอนยอดเต็มตามใบเสนอราคาภายในกำหนด ไม่รับชำระบางส่วน ถ้าไม่ชำระภายในกำหนด ส่วนขยายจะถูกยกเลิกอัตโนมัติ — ไม่มีการต่อรองหน้างาน"
          />

          <BiText
            as="p"
            className="text-sm font-semibold text-ink"
            en="Pay now"
            th="ชำระตอนนี้"
          />

          <SquareCardElement
            amountAud={lookup.price_difference_aud}
            bookingReference={lookup.booking_reference ?? undefined}
            quoteToken={token}
            givenName={lookup.first_name_en}
            familyName={lookup.last_name_en}
            onPaid={() => reload()}
          />

          <button
            type="button"
            disabled={checkoutBusy}
            onClick={() => {
              setCheckoutBusy(true)
              setCheckoutError('')
              createSquareCheckout({
                quote_token: token,
                redirect_base: window.location.origin,
              })
                .then((result) => {
                  window.location.href = result.url
                })
                .catch((err) => {
                  const msg = err instanceof Error ? err.message : ''
                  setCheckoutError(msg || t('quote.invalid'))
                })
                .finally(() => setCheckoutBusy(false))
            }}
            className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] font-semibold text-ink disabled:opacity-50"
          >
            {checkoutBusy ? t('quote.loading') : t('quote.afterpay')}
          </button>
          {checkoutError ? (
            <p className="text-[11px] text-coral" role="alert">
              {checkoutError}
            </p>
          ) : null}

          <PayIdDepositPanel
            purpose="extension"
            amountAud={lookup.price_difference_aud}
            paymentReference={lookup.booking_reference}
          />
        </>
      ) : null}

      <Link to="/" className="block text-sm text-teal-700 underline">
        Home / หน้าแรก
      </Link>
    </div>
  )
}

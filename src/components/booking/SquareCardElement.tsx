import { useEffect, useRef, useState } from 'react'
import { useLang } from '../../hooks/useLang'
import { fetchSquarePaymentConfig, chargeSquareCardToken, createSquareCheckout } from '../../lib/toursApi'
import SquareAcceptedPaymentIcons, { AfterpayIcon } from './SquareAcceptedPaymentIcons'

/** Matches square-create-payment CARD_SURCHARGE_RATE. Display only — server recomputes. */
export const CARD_SURCHARGE_RATE = 0.02

type SquareBillingContact = { givenName?: string; familyName?: string; email?: string }

type SquareVerificationDetails = {
  amount: string
  currencyCode: string
  intent: 'CHARGE'
  billingContact?: SquareBillingContact
}

type SquareCard = {
  attach: (selector: string) => Promise<void>
  destroy: () => Promise<void>
  tokenize: () => Promise<{
    status: string
    token?: string
    errors?: { message?: string }[]
  }>
}

type SquarePayments = {
  card: () => Promise<SquareCard>
  verifyBuyer: (
    token: string,
    details: SquareVerificationDetails,
  ) => Promise<{ token?: string } | undefined>
}

declare global {
  interface Window {
    Square?: {
      payments: (applicationId: string, locationId: string) => Promise<SquarePayments> | SquarePayments
    }
  }
}

function squareSdkUrl(environment: 'sandbox' | 'production') {
  return environment === 'production'
    ? 'https://web.squarecdn.com/v1/square.js'
    : 'https://sandbox.web.squarecdn.com/v1/square.js'
}

function loadSquareSdk(environment: 'sandbox' | 'production'): Promise<void> {
  const src = squareSdkUrl(environment)
  const existing = document.querySelector<HTMLScriptElement>(`script[data-square-sdk="${environment}"]`)
  if (existing && window.Square) return Promise.resolve()
  return new Promise((resolve, reject) => {
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Square SDK failed to load')), {
        once: true,
      })
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.dataset.squareSdk = environment
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Square SDK failed to load'))
    document.head.appendChild(script)
  })
}

function formatChargeAud(amount: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function cents(aud: number) {
  return Math.round(Number(aud) * 100)
}

function fromCents(value: number) {
  return value / 100
}

function withSurchargeCents(baseCents: number) {
  return Math.round(baseCents * (1 + CARD_SURCHARGE_RATE))
}

type AmountChoice = 'deposit' | 'full'

type Props = {
  amountAud: number
  depositAud?: number
  listedPriceAud?: number
  alreadyPaidAud?: number
  showAmountOptions?: boolean
  bookingReference?: string
  quoteToken?: string
  email?: string
  phone?: string
  givenName?: string
  familyName?: string
  onPaid: () => void
}

export default function SquareCardElement({
  amountAud,
  depositAud,
  listedPriceAud,
  alreadyPaidAud = 0,
  showAmountOptions = false,
  bookingReference,
  quoteToken,
  email,
  phone,
  givenName,
  familyName,
  onPaid,
}: Props) {
  const { lang } = useLang()
  const cardRef = useRef<SquareCard | null>(null)
  const paymentsRef = useRef<SquarePayments | null>(null)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [error, setError] = useState('')
  const [choice, setChoice] = useState<AmountChoice>('deposit')

  const deposit = Number(depositAud ?? amountAud)
  const listed = Number(listedPriceAud ?? amountAud)
  const remaining = Math.max(0, fromCents(cents(listed) - cents(alreadyPaidAud || 0)))
  const baseAud = showAmountOptions ? (choice === 'full' ? remaining : deposit) : Number(amountAud)
  const baseCents = cents(baseAud)
  const totalCents = showAmountOptions ? withSurchargeCents(baseCents) : baseCents
  const surchargeCents = totalCents - baseCents
  const totalAud = fromCents(totalCents)

  useEffect(() => {
    let cancelled = false

    async function mount() {
      try {
        const config = await fetchSquarePaymentConfig()
        await loadSquareSdk(config.environment)
        if (cancelled || !window.Square) {
          throw new Error('Square.js not available')
        }
        const payments = await window.Square.payments(config.applicationId, config.locationId)
        const card = await payments.card()
        await card.attach('#t2t-square-card')
        if (cancelled) {
          await card.destroy()
          return
        }
        paymentsRef.current = payments
        cardRef.current = card
        setReady(true)
      } catch (err) {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : ''
        setError(
          /square_not_configured|SQUARE_APPLICATION_ID|SQUARE_LOCATION_ID/i.test(msg)
            ? lang === 'th'
              ? 'ยังไม่ได้ตั้ง Square Web Payments — ใช้ PayID ไปก่อนได้'
              : 'Square Web Payments is not configured yet — you can still pay by PayID.'
            : lang === 'th'
              ? 'โหลดฟอร์มบัตรไม่สำเร็จ — ลองใหม่หรือใช้ PayID'
              : 'Could not load the card form — try again or use PayID.',
        )
      }
    }

    void mount()
    return () => {
      cancelled = true
      const card = cardRef.current
      cardRef.current = null
      paymentsRef.current = null
      if (card) void card.destroy()
    }
  }, [lang])

  async function handlePay() {
    const card = cardRef.current
    const payments = paymentsRef.current
    if (!card || !payments || busy) return

    if (!Number.isFinite(totalAud) || totalCents < 1) {
      setError(lang === 'th' ? 'ยอดชำระไม่ถูกต้อง' : 'Enter a valid payment amount.')
      return
    }

    setBusy(true)
    setError('')
    try {
      const tokenResult = await card.tokenize()
      if (tokenResult.status !== 'OK' || !tokenResult.token) {
        const detail = tokenResult.errors?.[0]?.message
        setError(
          detail ||
            (lang === 'th' ? 'กรอกบัตรไม่ครบหรือไม่ถูกต้อง' : 'Card details were incomplete or invalid.'),
        )
        setBusy(false)
        return
      }

      const verificationDetails: SquareVerificationDetails = {
        amount: totalAud.toFixed(2),
        currencyCode: 'AUD',
        intent: 'CHARGE',
        billingContact: {
          givenName,
          familyName,
          email,
        },
      }
      const verifyResult = await payments.verifyBuyer(tokenResult.token, verificationDetails)
      const verificationToken =
        typeof verifyResult?.token === 'string' && verifyResult.token.trim()
          ? verifyResult.token.trim()
          : undefined

      if (!quoteToken && !bookingReference) {
        setError(
          lang === 'th' ? 'ไม่พบข้อมูลการชำระ' : 'Missing payment reference.',
        )
        setBusy(false)
        return
      }

      const charged = await chargeSquareCardToken({
        booking_reference: bookingReference,
        quote_token: quoteToken,
        source_id: tokenResult.token,
        buyer_email: email,
        verification_token: verificationToken,
        amount_kind: showAmountOptions ? choice : undefined,
      })
      if (charged.status === 'COMPLETED' || charged.status === 'APPROVED') {
        if (!charged.booking_synced) {
          setError(
            lang === 'th'
              ? 'ชำระกับ Square สำเร็จ แต่ยังไม่บันทึกการจอง — กดชำระอีกครั้งเพื่อซิงค์ (ไม่ตัดบัตรซ้ำ)'
              : 'Square charged, but the booking is not marked paid yet — tap Pay again to sync (you will not be charged twice).',
          )
          return
        }
        onPaid()
        return
      }
      setError(
        lang === 'th'
          ? 'Square ยังไม่ยืนยันยอด — รอสักครู่หรือใช้ PayID'
          : 'Square has not confirmed the charge yet — wait a moment or use PayID.',
      )
    } catch (err) {
      const detail = err instanceof Error ? err.message : ''
      setError(
        lang === 'th'
          ? `ชำระไม่สำเร็จ${detail ? ` (${detail})` : ''} — ใช้ PayID ได้`
          : `Payment failed${detail ? ` (${detail})` : ''} — you can still pay by PayID.`,
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleAfterpay() {
    if (!showAmountOptions || checkoutBusy || busy || baseCents < 1) return
    if (!bookingReference) {
      setError(lang === 'th' ? 'ไม่พบข้อมูลการชำระ' : 'Missing payment reference.')
      return
    }
    setCheckoutBusy(true)
    setError('')
    try {
      const result = await createSquareCheckout({
        booking_reference: bookingReference,
        amount_kind: choice,
        buyer_email: email,
        buyer_phone: phone,
        redirect_base: window.location.origin,
      })
      window.location.href = result.url
    } catch (err) {
      const detail = err instanceof Error ? err.message : ''
      setError(
        lang === 'th'
          ? `เปิด Afterpay ไม่สำเร็จ${detail ? ` (${detail})` : ''} — ใช้บัตรหรือ PayID ได้`
          : `Could not open Afterpay${detail ? ` (${detail})` : ''} — you can still pay by card or PayID.`,
      )
      setCheckoutBusy(false)
    }
  }

  const payDisabled = !ready || busy || checkoutBusy || totalCents < 1
  const baseLabel =
    showAmountOptions && choice === 'full'
      ? lang === 'th'
        ? 'ยอดเต็มคงเหลือ'
        : 'Balance'
      : lang === 'th'
        ? 'มัดจำ'
        : 'Deposit'

  return (
    <div className="rounded-xl border border-line bg-white p-3">
      <p className="text-[12px] font-semibold text-ink">
        {lang === 'th'
          ? 'บัตรเครดิต/เดบิต (Visa / Mastercard — ใช้บัตรต่างประเทศได้ ผ่าน Square)'
          : 'Credit/debit card (Visa / Mastercard — international OK, via Square)'}
      </p>
      <SquareAcceptedPaymentIcons />

      {showAmountOptions && (
        <fieldset className="mt-3 space-y-2">
          <legend className="text-[11px] font-bold text-ink">
            {lang === 'th' ? 'ยอดที่ชำระด้วยบัตร' : 'Card payment amount'}
          </legend>
          <label
            className={`flex cursor-pointer items-start gap-2 rounded-[10px] border px-3 py-2 ${
              choice === 'deposit' ? 'border-teal-600 bg-mint-100' : 'border-line'
            }`}
          >
            <input
              type="radio"
              name="t2t-square-amount"
              checked={choice === 'deposit'}
              onChange={() => setChoice('deposit')}
              className="mt-0.5 accent-teal-700"
            />
            <span className="text-[11px] font-semibold text-ink">
              {lang === 'th'
                ? `ชำระมัดจำ — ${formatChargeAud(deposit)} AUD`
                : `Pay Deposit — ${formatChargeAud(deposit)} AUD`}
            </span>
          </label>
          <label
            className={`flex cursor-pointer items-start gap-2 rounded-[10px] border px-3 py-2 ${
              choice === 'full' ? 'border-teal-600 bg-mint-100' : 'border-line'
            }`}
          >
            <input
              type="radio"
              name="t2t-square-amount"
              checked={choice === 'full'}
              onChange={() => setChoice('full')}
              className="mt-0.5 accent-teal-700"
            />
            <span className="text-[11px] font-semibold text-ink">
              {lang === 'th'
                ? `จ่ายเต็ม — ${formatChargeAud(remaining)} AUD`
                : `Pay in Full — ${formatChargeAud(remaining)} AUD`}
            </span>
          </label>
        </fieldset>
      )}

      {showAmountOptions && (
        <div className="mt-3 space-y-1 rounded-[10px] border border-line bg-cream px-3 py-2.5 text-[11px] text-ink">
          <div className="flex justify-between gap-2">
            <span>{baseLabel}</span>
            <span className="font-semibold">{formatChargeAud(fromCents(baseCents))}</span>
          </div>
          <div className="flex justify-between gap-2 text-ink-soft">
            <span>{lang === 'th' ? 'ค่าธรรมเนียมบัตร (2%)' : 'Card surcharge (2%)'}</span>
            <span>{formatChargeAud(fromCents(surchargeCents))}</span>
          </div>
          <div className="flex justify-between gap-2 border-t border-dashed border-line pt-1.5 font-bold">
            <span>{lang === 'th' ? 'ยอดที่ตัดบัตร' : 'Total charged'}</span>
            <span>{formatChargeAud(totalAud)}</span>
          </div>
        </div>
      )}

      <div id="t2t-square-card" className="mt-3 min-h-[90px]" />
      {error && (
        <p className="mt-2 text-[11px] text-coral" role="alert">
          {error}
        </p>
      )}
      <button
        type="button"
        disabled={payDisabled}
        onClick={() => void handlePay()}
        className="book-btn flip-cta cta-shine mt-3 w-full disabled:opacity-50"
      >
        {busy
          ? lang === 'th'
            ? 'กำลังชำระ…'
            : 'Processing…'
          : !ready
            ? lang === 'th'
              ? 'กำลังโหลดฟอร์มบัตร…'
              : 'Loading card form…'
            : lang === 'th'
              ? `ชำระบัตร ${formatChargeAud(totalAud)}`
              : `Pay card ${formatChargeAud(totalAud)}`}
      </button>
      {showAmountOptions && (
        <p className="mt-2 text-[10px] leading-relaxed text-ink-soft">
          {lang === 'th'
            ? 'บัตรเครดิต/เดบิตมีค่าธรรมเนียมดำเนินการ 2% โอน PayID/ธนาคารเพื่อไม่เสียค่าธรรมเนียมนี้'
            : 'A 2% card processing fee applies to credit/debit card payments. Pay by PayID/bank transfer to avoid this fee.'}
        </p>
      )}

      {showAmountOptions && (
        <div className="mt-3 rounded-[10px] border border-line bg-white px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-ink">
            <AfterpayIcon labelled={false} />
            <span>{lang === 'th' ? 'Afterpay / Clearpay' : 'Afterpay / Clearpay'}</span>
          </p>
          <p className="mt-1 text-[10px] leading-relaxed text-ink-soft">
            {lang === 'th'
              ? `ยอด Afterpay ${formatChargeAud(fromCents(baseCents))} — ไม่บวกค่าธรรมเนียมบัตร 2%`
              : `Afterpay charges ${formatChargeAud(fromCents(baseCents))} — no 2% card surcharge.`}
          </p>
          <button
            type="button"
            disabled={checkoutBusy || busy || baseCents < 1}
            onClick={() => void handleAfterpay()}
            className="mt-2 w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-[12px] font-semibold text-ink disabled:opacity-50"
          >
            {checkoutBusy
              ? lang === 'th'
                ? 'กำลังเปิด Afterpay…'
                : 'Opening Afterpay…'
              : lang === 'th'
                ? `ชำระด้วย Afterpay ${formatChargeAud(fromCents(baseCents))}`
                : `Pay with Afterpay ${formatChargeAud(fromCents(baseCents))}`}
          </button>
        </div>
      )}
      <p className="mt-2 text-[10px] leading-relaxed text-ink-soft">
        {lang === 'th'
          ? 'หมายเลขบัตรไม่ผ่านเซิร์ฟเวอร์ของเรา — Square เป็นผู้เก็บและยืนยันยอด สถานะมัดจำอัปเดตจากเซิร์ฟเวอร์เท่านั้น'
          : 'We never see your raw card number. Square tokenizes and confirms the charge. Deposit status is updated server-side only.'}
      </p>
    </div>
  )
}

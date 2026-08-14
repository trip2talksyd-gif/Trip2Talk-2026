import { useEffect, useRef, useState } from 'react'
import { useLang } from '../../hooks/useLang'
import { formatAud, fetchSquarePaymentConfig, chargeSquareCardToken } from '../../lib/toursApi'
import SquareAcceptedPaymentIcons from './SquareAcceptedPaymentIcons'

type SquareCard = {
  attach: (selector: string) => Promise<void>
  destroy: () => Promise<void>
  tokenize: (opts?: {
    billingContact?: { givenName?: string; familyName?: string; email?: string }
  }) => Promise<{
    status: string
    token?: string
    errors?: { message?: string }[]
  }>
}

type SquarePayments = {
  card: () => Promise<SquareCard>
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

type Props = {
  amountAud: number
  bookingReference?: string
  quoteToken?: string
  email?: string
  givenName?: string
  familyName?: string
  onPaid: () => void
}

export default function SquareCardElement({
  amountAud,
  bookingReference,
  quoteToken,
  email,
  givenName,
  familyName,
  onPaid,
}: Props) {
  const { lang } = useLang()
  const cardRef = useRef<SquareCard | null>(null)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

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
      if (card) void card.destroy()
    }
  }, [lang])

  async function handlePay() {
    const card = cardRef.current
    if (!card || busy) return
    setBusy(true)
    setError('')
    try {
      const tokenResult = await card.tokenize({
        billingContact: {
          givenName,
          familyName,
          email,
        },
      })
      if (tokenResult.status !== 'OK' || !tokenResult.token) {
        const detail = tokenResult.errors?.[0]?.message
        setError(
          detail ||
            (lang === 'th' ? 'กรอกบัตรไม่ครบหรือไม่ถูกต้อง' : 'Card details were incomplete or invalid.'),
        )
        setBusy(false)
        return
      }

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

  return (
    <div className="rounded-xl border border-line bg-white p-3">
      <p className="text-[12px] font-semibold text-ink">
        {lang === 'th'
          ? 'บัตรเครดิต/เดบิต (Visa / Mastercard — ใช้บัตรต่างประเทศได้ ผ่าน Square)'
          : 'Credit/debit card (Visa / Mastercard — international OK, via Square)'}
      </p>
      <SquareAcceptedPaymentIcons />
      <div id="t2t-square-card" className="mt-3 min-h-[90px]" />
      {error && (
        <p className="mt-2 text-[11px] text-coral" role="alert">
          {error}
        </p>
      )}
      <button
        type="button"
        disabled={!ready || busy}
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
              ? `ชำระบัตร ${formatAud(amountAud)}`
              : `Pay card ${formatAud(amountAud)}`}
      </button>
      <p className="mt-2 text-[10px] leading-relaxed text-ink-soft">
        {lang === 'th'
          ? 'หมายเลขบัตรไม่ผ่านเซิร์ฟเวอร์ของเรา — Square เป็นผู้เก็บและยืนยันยอด สถานะมัดจำอัปเดตจากเซิร์ฟเวอร์เท่านั้น'
          : 'We never see your raw card number. Square tokenizes and confirms the charge. Deposit status is updated server-side only.'}
      </p>
    </div>
  )
}

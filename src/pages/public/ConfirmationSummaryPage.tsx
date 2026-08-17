import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, Circle } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import {
  getConfirmationSummary,
  markConfirmationDepositPaid,
  patchConfirmationSummary,
  type ConfirmationSummaryData,
} from '../../lib/waiverSession'
import { formatAud, formatDate, lookupMyTrip } from '../../lib/toursApi'
import { isInPersonCardMethod, remainingTripBalanceAud } from '../../lib/paymentCredit'
import { FACEBOOK_PAGE_URL } from '../../data/contactChannels'
import BiText from '../../components/ui/BiText'
import { useToast } from '../../components/ui/Toast'
import BrandLogo from '../../components/brand/BrandLogo'
import type { TranslationKey } from '../../i18n/translations'

function statusMeansDepositPaid(status: string | undefined): boolean {
  return status === 'deposit_paid' || status === 'fully_paid'
}

/** Next-steps copy must follow stored payment_method, not default to PayID. */
function confirmationPayKind(
  method: string | null | undefined,
  optimisticPaid: boolean,
): 'afterpay' | 'card' | 'payid' {
  const m = (method ?? '').trim().toLowerCase()
  if (m === 'afterpay') return 'afterpay'
  if (m === 'square' || m === 'card_in_person') return 'card'
  if (optimisticPaid) return 'card'
  return 'payid'
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Customer Confirmation Summary — DISTINCT from Tax Invoice.
 * Never includes passport, medical, emergency contact, or other sensitive fields.
 */
export default function ConfirmationSummaryPage() {
  const { tt, lang } = useLang()
  const { toast } = useToast()
  const [params] = useSearchParams()
  const ref = params.get('ref') ?? undefined
  const squareReturn = params.get('square') === '1'
  const paidReturn = params.get('paid') === '1'
  const optimisticPaid = squareReturn || paidReturn
  const [data, setData] = useState<ConfirmationSummaryData | null>(() => {
    const summary = getConfirmationSummary(ref)
    if (!summary) return null
    if (optimisticPaid && !summary.depositPaid) {
      return markConfirmationDepositPaid(summary.bookingReference) ?? {
        ...summary,
        depositPaid: true,
      }
    }
    return summary
  })
  const [confirmingLive, setConfirmingLive] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const summary = getConfirmationSummary(ref)
    const bookingRef = summary?.bookingReference ?? ref?.trim()
    const contact = summary?.lookupContact?.trim()
    if (!bookingRef || !contact) return
    const liveRef = bookingRef
    const liveContact = contact

    let cancelled = false

    async function refreshFromLive() {
      const attempts = squareReturn || paidReturn ? 8 : 1
      if (squareReturn || paidReturn) setConfirmingLive(true)
      try {
        for (let i = 0; i < attempts; i++) {
          if (cancelled) return
          const result = await lookupMyTrip({
            tripCodeOrReference: liveRef,
            contact: liveContact,
          })
          if (cancelled) return
          const method = result.booking?.payment_method ?? null
          const livePatch: Partial<ConfirmationSummaryData> = {}
          if (method) livePatch.paymentMethod = method
          if (result.booking) {
            livePatch.priceAud = result.booking.price_aud
            livePatch.depositAud = result.booking.deposit_aud
            livePatch.amountPaidAud = result.booking.amount_paid_aud
            livePatch.bookingStatus = result.booking.booking_status
          }
          if (Object.keys(livePatch).length > 0) {
            const patched = patchConfirmationSummary(liveRef, livePatch)
            if (patched) setData(patched)
            else setData((prev) => (prev ? { ...prev, ...livePatch } : prev))
          }
          if (statusMeansDepositPaid(result.booking?.booking_status)) {
            const next = markConfirmationDepositPaid(liveRef)
            if (next) {
              setData({ ...next, ...livePatch })
            } else {
              setData((prev) =>
                prev
                  ? {
                      ...prev,
                      depositPaid: true,
                      ...livePatch,
                    }
                  : prev,
              )
            }
            return
          }
          if (i < attempts - 1) await sleep(2500)
        }
      } catch {
        /* Keep session / optimistic checklist if lookup is unavailable. */
      } finally {
        if (!cancelled) setConfirmingLive(false)
      }
    }

    void refreshFromLive()
    return () => {
      cancelled = true
    }
  }, [ref, squareReturn, paidReturn])

  const title = tt('confirm.title')
  const subtitle = tt('confirm.subtitle')
  const noInvoice = tt('confirm.noInvoice')
  const nextTitle = tt('confirm.nextTitle')
  const downloadBi = tt('confirm.download')
  const emailBi = tt('confirm.email')

  async function handleDownload() {
    if (!cardRef.current || !data) return
    setDownloading(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      })
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = `trip2talk-confirmation-${data.bookingReference}.png`
      a.click()
    } catch {
      toast('Download failed', 'error')
    } finally {
      setDownloading(false)
    }
  }

  function handleGmail() {
    if (!data) return
    const subject = `Trip2Talk Confirmation — ${data.bookingReference}`
    const body = [
      'Hi Trip2Talk,',
      '',
      `Here is my booking confirmation summary: ${data.bookingReference}`,
      `Trip: ${data.tripNameEn} (${data.tripCode})`,
      data.departureDate ? `Date: ${data.departureDate}` : '',
      '',
      '(Please attach the PNG summary — download it first, then attach here.)',
      '',
      'Note: this is NOT a tax invoice — invoices are sent separately per payment.',
    ]
      .filter(Boolean)
      .join('\n')
    const url = `https://mail.google.com/mail/?view=cm&fs=1&authuser=${encodeURIComponent(
      'trip2talksyd@gmail.com',
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-line bg-card p-5 text-center">
        <BiText
          en="No confirmation found in this browser session."
          th="ไม่พบสรุปการยืนยันในเซสชันนี้"
          className="text-sm text-ink"
          thClassName="mt-1 block font-thai text-ink-soft"
        />
        <Link to="/trips" className="mt-3 inline-block text-teal-700 underline">
          Explore trips
        </Link>
      </div>
    )
  }

  // Was: PayID "transfer deposit" copy unless depositPaid AND Square — so Square/Afterpay
  // guests still saw PayID bank instructions whenever the session had not flipped paid yet.
  const payKind = confirmationPayKind(data.paymentMethod, optimisticPaid)
  const cardDepositReceived = payKind !== 'payid' && (optimisticPaid || Boolean(data.depositPaid))

  const remainingBalance = cardDepositReceived
    ? remainingTripBalanceAud({
        priceAud: data.priceAud,
        depositAud: data.depositAud,
        amountPaidAud: data.amountPaidAud,
        paymentMethod: data.paymentMethod === 'afterpay'
          ? 'afterpay'
          : isInPersonCardMethod(data.paymentMethod)
            ? 'card_in_person'
            : 'square',
        bookingStatus:
          data.bookingStatus ?? (data.depositPaid ? 'deposit_paid' : 'pending_payment'),
      })
    : null

  const remainingCopy =
    remainingBalance == null
      ? null
      : {
          en: tt('confirm.next.card.remaining').en.replace('{amount}', formatAud(remainingBalance)),
          th: tt('confirm.next.card.remaining').th.replace('{amount}', formatAud(remainingBalance)),
        }

  const firstNextKey: TranslationKey =
    payKind === 'afterpay'
      ? 'confirm.next.afterpay.1'
      : payKind === 'card'
        ? data.depositPaid || optimisticPaid
          ? 'confirm.next.card.1'
          : 'confirm.next.card.pending'
        : 'confirm.next.1'
  const nextStepKeys: TranslationKey[] = [firstNextKey, 'confirm.next.2', 'confirm.next.3']

  const checks: { done: boolean; en: string; th: string; pendingLabel?: boolean }[] = [
    {
      done: data.depositPaid,
      en: tt('confirm.check.deposit').en,
      th: tt('confirm.check.deposit').th,
    },
    {
      done: data.waiverSigned,
      en: tt('confirm.check.waiver').en,
      th: tt('confirm.check.waiver').th,
    },
    {
      done: data.safetyInfoOnFile,
      en: tt('confirm.check.safety').en,
      th: tt('confirm.check.safety').th,
    },
    {
      done: !data.facebookMessagePending,
      en: tt('confirm.check.facebook').en,
      th: tt('confirm.check.facebook').th,
      pendingLabel: true,
    },
  ]

  return (
    <div className="mx-auto max-w-lg space-y-3 pb-8">
      {(squareReturn || paidReturn) && (
        <div className="rounded-xl border border-teal-600/40 bg-mint-100 px-3 py-2.5 text-[12px] text-ink">
          <BiText
            en={
              confirmingLive
                ? 'Thanks — Square reported a successful payment. Confirming it on your booking…'
                : 'Thanks — Square reported a successful payment. Your deposit is marked paid.'
            }
            th={
              confirmingLive
                ? 'ขอบคุณ — Square ยืนยันการชำระแล้ว กำลังตรวจสถานะการจอง…'
                : 'ขอบคุณ — Square ยืนยันการชำระแล้ว รายการมัดจำถูกทำเครื่องหมายว่าจ่ายแล้ว'
            }
            thClassName="mt-0.5 block font-thai text-[11px] text-ink-soft"
          />
        </div>
      )}
      <div className="flex flex-wrap gap-2 print:hidden">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {downloading ? '…' : downloadBi.en}
          <span className="mt-0.5 block font-thai text-[10px] font-medium opacity-90">
            {downloadBi.th}
          </span>
        </button>
        <button
          type="button"
          onClick={handleGmail}
          className="flex-1 rounded-xl border border-teal-700/40 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800"
        >
          {emailBi.en}
          <span className="mt-0.5 block font-thai text-[10px] font-medium opacity-90">
            {emailBi.th}
          </span>
        </button>
      </div>

      <div
        ref={cardRef}
        className="rounded-2xl border border-line bg-white p-5 text-ink shadow-sm"
      >
        <div className="flex items-center gap-3 border-b border-line pb-4">
          <BrandLogo size="lg" tone="light" />
          <div>
            <BiText
              as="h1"
              en={title.en}
              th={title.th}
              className="font-serif text-lg font-bold text-ink"
              thClassName="mt-0.5 block font-thai text-[11px] font-medium text-ink-soft"
            />
            <BiText
              as="p"
              en={subtitle.en}
              th={subtitle.th}
              className="text-[11px] text-ink-soft"
              thClassName="mt-0.5 block font-thai text-[10px]"
            />
          </div>
        </div>

        <p className="mt-4 rounded-xl bg-mint-100/70 px-3 py-2 font-mono text-sm font-bold tracking-wide text-teal-900">
          {data.bookingReference}
        </p>

        <div className="mt-4 flex gap-3 rounded-xl border border-line bg-mint-50/50 p-3">
          {data.coverImageUrl ? (
            <img
              src={data.coverImageUrl}
              alt=""
              className="h-16 w-16 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-teal-700/15 text-xs font-bold text-teal-800">
              T2T
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink">{data.tripNameEn}</p>
            <p className="truncate font-thai text-[11px] text-ink-soft">{data.tripNameTh}</p>
            <p className="mt-1 text-[11px] text-ink-soft">
              {data.durationLabel}
              {data.departureDate
                ? ` · ${formatDate(data.departureDate, lang)}`
                : ''}
            </p>
          </div>
        </div>

        <ul className="mt-5 space-y-2.5">
          {checks.map((c, i) => (
            <li
              key={c.en}
              className={`flex items-start gap-2.5 rounded-xl px-3 py-2.5 ${
                c.done ? 'bg-teal-50' : 'bg-amber-50'
              }`}
            >
              {c.done ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" strokeWidth={3} />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              )}
              <span className="text-[12px] font-semibold text-ink">
                {c.done ? `✓ ${c.en}` : `${i + 1}. ${c.en}${c.pendingLabel ? ' — pending' : ''}`}
                <span className="mt-0.5 block font-thai text-[10px] font-medium text-ink-soft">
                  {c.done ? `✓ ${c.th}` : `${i + 1}. ${c.th}${c.pendingLabel ? ' — รอดำเนินการ' : ''}`}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5">
          <BiText
            as="h2"
            en={nextTitle.en}
            th={nextTitle.th}
            className="text-[13px] font-bold text-ink"
            thClassName="mt-0.5 block font-thai text-[11px] font-medium text-ink-soft"
          />
          <ol className="mt-2 list-decimal space-y-2 pl-4 text-[12px] text-ink">
            {nextStepKeys.map((key) => {
              const bi = tt(key)
              return (
                <li key={key}>
                  {bi.en}
                  <span className="mt-0.5 block font-thai text-[10px] text-ink-soft">{bi.th}</span>
                </li>
              )
            })}
            {remainingCopy ? (
              <li>
                {remainingCopy.en}
                <span className="mt-0.5 block font-thai text-[10px] text-ink-soft">
                  {remainingCopy.th}
                </span>
              </li>
            ) : null}
          </ol>
        </div>

        <p className="mt-5 rounded-xl border border-dashed border-line px-3 py-2 text-[11px] text-ink-soft">
          {noInvoice.en}
          <span className="mt-0.5 block font-thai text-[10px]">{noInvoice.th}</span>
        </p>

        <a
          href={FACEBOOK_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block rounded-xl bg-[#1877F2] px-4 py-3 text-center text-sm font-bold text-white"
        >
          Message us on Facebook
          <span className="mt-0.5 block font-thai text-[10px] font-medium opacity-90">
            ทัก Facebook หาเรา
          </span>
        </a>
      </div>
    </div>
  )
}

import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import { patchConfirmationSummary, setWaiverSigned } from '../../lib/waiverSession'
import { insertWaiverSignature } from '../../lib/toursApi'
import { useToast } from '../../components/ui/Toast'
import BiText from '../../components/ui/BiText'
import WaiverForm from '../../components/waiver/WaiverForm'

export default function WaiverPage() {
  const { lang, tt } = useLang()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const tripCode = params.get('trip') ?? ''
  const bookingRef = params.get('ref')?.trim() ?? ''
  const tripsBi = tt('nav.trips')
  const successBi = tt('common.success')

  if (!tripCode) {
    return (
      <div className="rounded-xl border border-teal-600/40 bg-teal-500/10 p-4 text-sm text-ink">
        <BiText
          en="Please select a trip before signing the waiver."
          th="กรุณาเลือกทริปก่อนลงนาม waiver"
          thClassName="mt-1 block font-thai text-ink-soft"
        />
        <Link to="/trips" className="mt-2 block text-teal-700 underline">
          {tripsBi.en} / {tripsBi.th}
        </Link>
      </div>
    )
  }

  return (
    <WaiverForm
      tripCode={tripCode}
      backTo={
        bookingRef
          ? `/booking/confirmation?ref=${encodeURIComponent(bookingRef)}`
          : `/trips/${tripCode}`
      }
      headingNote={
        bookingRef
          ? `Booking ${bookingRef} — sign after your deposit to finish the legal step.`
          : undefined
      }
      headingNoteTh={
        bookingRef ? `การจอง ${bookingRef} — ลงนามเอกสารทางกฎหมายหลังชำระมัดจำ` : undefined
      }
      onSubmit={async (payload) => {
        setWaiverSigned(tripCode, {
          tripCode,
          signedName: payload.signedName,
          signedAt: payload.signedAt,
          clauses: payload.clauses,
        })
        try {
          await insertWaiverSignature({
            trip_code: tripCode,
            signed_name: payload.signedName,
            signed_at: payload.signedAt,
            clauses: payload.clauses,
            locale: lang,
            // booking_id UUID is not returned from public insertBooking (RLS return=minimal).
            booking_id: null,
          })
        } catch (err) {
          console.error('[WaiverPage] failed to persist waiver signature:', err)
        }
        if (bookingRef) {
          patchConfirmationSummary(bookingRef, { waiverSigned: true })
        }
        toast(successBi.en, 'success')
        navigate(
          bookingRef
            ? `/booking/confirmation?ref=${encodeURIComponent(bookingRef)}`
            : `/trips/${tripCode}`,
        )
      }}
    />
  )
}

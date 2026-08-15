import { useEffect, useState } from 'react'
import { setMarketingPhotoOptOut } from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import type { TourBooking } from '../../types/tour'
import { StaffButton, StaffCheckRow, StaffField, StaffInput } from './staffUi'

function formatWhen(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString('en-AU', {
    timeZone: 'Australia/Sydney',
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function MarketingPhotoOptOutCard({
  booking,
  onUpdated,
  onSessionExpired,
  toast,
}: {
  booking: TourBooking
  onUpdated: (next: TourBooking) => void
  onSessionExpired: () => void
  toast: (msg: string, kind: 'success' | 'error') => void
}) {
  const opted = Boolean(booking.marketing_photo_opt_out)
  const [note, setNote] = useState(booking.marketing_photo_opt_out_note ?? '')
  const [busy, setBusy] = useState(false)
  const when = formatWhen(booking.marketing_photo_opt_out_at)

  useEffect(() => {
    setNote(booking.marketing_photo_opt_out_note ?? '')
  }, [booking.id, booking.marketing_photo_opt_out_note])

  async function save(nextOpted: boolean) {
    setBusy(true)
    try {
      const updated = await setMarketingPhotoOptOut({
        bookingId: booking.id,
        optedOut: nextOpted,
        note: note.trim() || undefined,
      })
      onUpdated(updated)
      toast(
        nextOpted ? 'Marketing photo opt-out saved' : 'Marketing photo opt-out cleared',
        'success',
      )
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        onSessionExpired()
        return
      }
      toast('Could not save photo opt-out', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-near-black-green p-3">
      <StaffCheckRow
        checked={opted}
        onChange={(next) => {
          if (!busy) void save(next)
        }}
        tone={opted ? 'warning' : 'default'}
      >
        Opted out of marketing photos
        <span className="mt-0.5 block text-[11px] text-cream-muted">
          ปฏิเสธการใช้รูปทริปเพื่อการตลาด — guest emailed before departure
        </span>
      </StaffCheckRow>
      {opted && when ? (
        <p className="text-[11px] text-amber-200/90">Recorded {when} (Sydney)</p>
      ) : null}
      <StaffField label="Note (who emailed / booking ref)">
        <StaffInput
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          disabled={busy}
          placeholder="e.g. Email from guest 15 Aug — recorded by cashier"
        />
      </StaffField>
      <StaffButton
        type="button"
        variant="secondary"
        disabled={busy}
        onClick={() => void save(opted)}
        className="text-xs uppercase tracking-wider"
      >
        {busy ? 'Saving…' : opted ? 'Update note' : 'Save note'}
      </StaffButton>
    </div>
  )
}

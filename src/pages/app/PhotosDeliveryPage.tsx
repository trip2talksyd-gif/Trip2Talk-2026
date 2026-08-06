import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import {
  fetchPhotosPending,
  markPhotosDelivered,
  type PhotoDeliveryStage,
  type PhotosPendingRow,
} from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import {
  countdownState,
  FULL_ALBUM_DEADLINE_DAYS,
  HIGHLIGHT_DEADLINE_DAYS,
  tripDeliveryUrgencyScore,
  type DeliveryCountdownState,
} from '../../lib/photoDelivery'
import { ListRowSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import { useToast } from '../../components/ui/Toast'
import {
  StaffButton,
  StaffCard,
  StaffInput,
  StaffMain,
  StaffPageHeader,
  staffShellClass,
} from '../../components/app/staffUi'

function DeadlineBadge({
  label,
  state,
}: {
  label: string
  state: DeliveryCountdownState
}) {
  if (state.kind === 'delivered') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-teal-500/40 bg-teal-500/15 px-2.5 py-1 text-[10px] font-semibold text-teal-300">
        <Check className="h-3 w-3" strokeWidth={2.5} />
        {label}: Delivered
      </span>
    )
  }
  if (state.kind === 'overdue') {
    return (
      <span className="inline-flex items-center rounded-full border border-coral/50 bg-coral/20 px-2.5 py-1 text-[10px] font-bold text-coral">
        {label}: Overdue by {state.days} day{state.days === 1 ? '' : 's'}
      </span>
    )
  }
  if (state.kind === 'remaining') {
    const urgent = state.days <= 2
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
          urgent
            ? 'border-amber-400/50 bg-amber-500/20 text-amber-200'
            : 'border-white/15 bg-white/5 text-cream-muted'
        }`}
      >
        {label}: {state.days} day{state.days === 1 ? '' : 's'} left
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-cream-muted">
      {label}: —
    </span>
  )
}

function guestHighlightDone(g: PhotosPendingRow): boolean {
  return Boolean(g.highlight_photos_delivered || g.photos_delivered)
}

function guestFullDone(g: PhotosPendingRow): boolean {
  return Boolean(g.full_photos_delivered || g.photos_delivered)
}

/** Ended trips with highlight/full album outstanding — dual SLA countdowns for editors. */
export default function PhotosDeliveryPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [rows, setRows] = useState<PhotosPendingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [galleryByTrip, setGalleryByTrip] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    fetchPhotosPending()
      .then(setRows)
      .catch((err) => {
        if (err instanceof StaffSessionExpiredError) {
          navigate('/app')
          return
        }
        setError('Could not load photo delivery list — apply migration + redeploy staff-api')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  useEffect(() => {
    load()
  }, [load])

  const byTrip = useMemo(() => {
    const map = new Map<string, PhotosPendingRow[]>()
    for (const r of rows) {
      const list = map.get(r.trip_code) ?? []
      list.push(r)
      map.set(r.trip_code, list)
    }
    const entries = [...map.entries()].map(([tripCode, guests]) => {
      const endDate =
        guests[0]?.tour && 'end_date' in guests[0].tour
          ? String(guests[0].tour.end_date ?? '')
          : ''
      const highlightPending = guests.some((g) => !guestHighlightDone(g))
      const fullPending = guests.some((g) => !guestFullDone(g))
      const urgency = tripDeliveryUrgencyScore({
        endDate: endDate || null,
        highlightPending,
        fullPending,
      })
      return { tripCode, guests, endDate, highlightPending, fullPending, urgency }
    })
    entries.sort((a, b) => a.urgency - b.urgency)
    return entries
  }, [rows])

  async function markTrip(tripCode: string, stage: PhotoDeliveryStage) {
    setBusy(`${tripCode}:${stage}`)
    try {
      await markPhotosDelivered({
        tripCode,
        allOnTrip: true,
        stage,
        galleryLink: galleryByTrip[tripCode]?.trim() || undefined,
      })
      toast(
        stage === 'highlight'
          ? 'Highlight album marked delivered for all guests'
          : 'Full album marked delivered — review window can start (Phase H)',
        'success',
      )
      load()
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast('Update failed', 'error')
    } finally {
      setBusy(null)
    }
  }

  async function markOne(id: string, tripCode: string, stage: PhotoDeliveryStage) {
    setBusy(`${id}:${stage}`)
    try {
      await markPhotosDelivered({
        bookingId: id,
        stage,
        galleryLink: galleryByTrip[tripCode]?.trim() || undefined,
      })
      toast(stage === 'highlight' ? 'Highlight marked' : 'Full album marked', 'success')
      load()
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast('Update failed', 'error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className={staffShellClass}>
      <StaffPageHeader
        backTo="/app/staff"
        backLabel="← Staff"
        title="Photo delivery"
        subtitle={
          <>
            Highlight within 3 days of trip end · Full album within 30 days (hard deadline). Most
            urgent first. Full delivery starts the review-request window.
            <span className="mt-0.5 block font-thai">
              ไฮไลท์ภายใน 3 วัน · อัลบั้มเต็มภายใน 30 วัน — เรียงตามความเร่งด่วน
            </span>
          </>
        }
      />

      <StaffMain className="space-y-4">
        {loading && <ListRowSkeleton />}
        {error && !loading && <PageError message={error} onRetry={load} dark />}
        {!loading && !error && byTrip.length === 0 && (
          <p className="text-sm text-cream-muted">All caught up — no pending photo deliveries</p>
        )}

        {byTrip.map(({ tripCode, guests, endDate, highlightPending, fullPending }) => {
          const meta = guests[0]?.tour
          const tripHighlightDone = !highlightPending
          const tripFullDone = !fullPending
          const highlightState = countdownState(
            tripHighlightDone,
            guests.find((g) => guestHighlightDone(g))?.highlight_photos_delivered_at ??
              guests.find((g) => guestHighlightDone(g))?.photos_delivered_at,
            endDate || null,
            HIGHLIGHT_DEADLINE_DAYS,
          )
          const fullState = countdownState(
            tripFullDone,
            guests.find((g) => guestFullDone(g))?.full_photos_delivered_at ??
              guests.find((g) => guestFullDone(g))?.photos_delivered_at,
            endDate || null,
            FULL_ALBUM_DEADLINE_DAYS,
          )

          return (
            <StaffCard
              key={tripCode}
              className={
                highlightState.kind === 'overdue' || fullState.kind === 'overdue'
                  ? 'border-coral/40 bg-coral/5'
                  : 'border-amber-500/30 bg-amber-500/5'
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-cream">
                    {meta && 'name_en' in meta && meta.name_en
                      ? String(meta.name_en)
                      : tripCode}
                  </h2>
                  <p className="text-[11px] text-cream-muted">
                    {tripCode}
                    {endDate ? ` · ended ${endDate}` : ''} · {guests.length} guest(s)
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <DeadlineBadge label="Highlight album" state={highlightState} />
                    <DeadlineBadge label="Full album" state={fullState} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 sm:items-end">
                  {!tripHighlightDone && (
                    <StaffButton
                      className="!w-auto px-3 py-1.5 text-[11px]"
                      disabled={busy === `${tripCode}:highlight`}
                      onClick={() => void markTrip(tripCode, 'highlight')}
                    >
                      Mark highlight delivered
                    </StaffButton>
                  )}
                  {!tripFullDone && (
                    <StaffButton
                      variant="secondary"
                      className="!w-auto px-3 py-1.5 text-[11px]"
                      disabled={busy === `${tripCode}:full`}
                      onClick={() => void markTrip(tripCode, 'full')}
                    >
                      Mark full album delivered
                    </StaffButton>
                  )}
                </div>
              </div>
              <StaffInput
                value={galleryByTrip[tripCode] ?? guests.find((g) => g.gallery_link)?.gallery_link ?? ''}
                onChange={(e) =>
                  setGalleryByTrip((prev) => ({ ...prev, [tripCode]: e.target.value }))
                }
                placeholder="Gallery / Drive link (optional)"
                className="mt-2 w-full text-xs"
              />
              <ul className="mt-2 space-y-1">
                {guests.map((g) => {
                  const hl = guestHighlightDone(g)
                  const full = guestFullDone(g)
                  return (
                    <li
                      key={g.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-card px-2.5 py-1.5 text-[12px]"
                    >
                      <span>
                        {g.first_name_en} {g.last_name_en}
                        <span className="ml-2 text-[10px] text-cream-muted">
                          {hl ? 'HL ✓' : 'HL pending'} · {full ? 'Full ✓' : 'Full pending'}
                        </span>
                      </span>
                      <span className="flex gap-2">
                        {!hl && (
                          <button
                            type="button"
                            disabled={busy === `${g.id}:highlight`}
                            onClick={() => void markOne(g.id, tripCode, 'highlight')}
                            className="text-[10px] font-semibold text-teal-500 underline disabled:opacity-50"
                          >
                            Highlight done
                          </button>
                        )}
                        {!full && (
                          <button
                            type="button"
                            disabled={busy === `${g.id}:full`}
                            onClick={() => void markOne(g.id, tripCode, 'full')}
                            className="text-[10px] font-semibold text-amber underline disabled:opacity-50"
                          >
                            Full done
                          </button>
                        )}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </StaffCard>
          )
        })}
      </StaffMain>
    </div>
  )
}

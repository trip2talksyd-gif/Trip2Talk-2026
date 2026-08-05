import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  fetchPhotosPending,
  markPhotosDelivered,
  type PhotosPendingRow,
} from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import { ListRowSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import { useToast } from '../../components/ui/Toast'

/** Trips ended but photos not yet marked delivered — feeds Phase H review timer. */
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
        setError('Could not load photo delivery list')
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
    return [...map.entries()]
  }, [rows])

  async function markTrip(tripCode: string) {
    setBusy(tripCode)
    try {
      await markPhotosDelivered({
        tripCode,
        allOnTrip: true,
        galleryLink: galleryByTrip[tripCode]?.trim() || undefined,
      })
      toast('Photos marked delivered — review requests can fire after 2–3 days', 'success')
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

  async function markOne(id: string, tripCode: string) {
    setBusy(id)
    try {
      await markPhotosDelivered({
        bookingId: id,
        galleryLink: galleryByTrip[tripCode]?.trim() || undefined,
      })
      toast('Marked delivered', 'success')
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
    <div className="min-h-svh bg-near-black-green text-cream">
      <header className="border-b border-white/8 px-4 py-4">
        <Link to="/app/staff" className="text-sm text-gold">
          ← Staff
        </Link>
        <h1 className="mt-2 font-serif text-lg">Photo delivery</h1>
        <p className="mt-1 text-[11px] text-cream-muted">
          Ended trips still waiting for gallery delivery. Marking delivered starts the review-request
          window (Phase H).
          <span className="mt-0.5 block font-thai">
            ทริปจบแล้วที่ยังไม่ส่งรูป — ติ๊กส่งแล้วเพื่อเริ่มนับเวลาขอรีวิว
          </span>
        </p>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        {loading && <ListRowSkeleton />}
        {error && !loading && <PageError message={error} onRetry={load} dark />}
        {!loading && !error && byTrip.length === 0 && (
          <p className="text-sm text-cream-muted">All caught up — no pending photo deliveries</p>
        )}

        {byTrip.map(([tripCode, guests]) => {
          const meta = guests[0]?.tour
          return (
            <section
              key={tripCode}
              className="rounded-editorial border border-amber-500/30 bg-amber-500/5 p-3"
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
                    {meta && 'end_date' in meta && meta.end_date
                      ? ` · ended ${String(meta.end_date)}`
                      : ''}{' '}
                    · {guests.length} guest(s)
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy === tripCode}
                  onClick={() => void markTrip(tripCode)}
                  className="rounded-lg bg-gold px-3 py-1.5 text-[11px] font-bold text-near-black-green disabled:opacity-50"
                >
                  Mark all delivered
                </button>
              </div>
              <input
                value={galleryByTrip[tripCode] ?? ''}
                onChange={(e) =>
                  setGalleryByTrip((prev) => ({ ...prev, [tripCode]: e.target.value }))
                }
                placeholder="Gallery / Drive link (optional)"
                className="mt-2 w-full rounded-lg border border-white/15 bg-near-black-green px-2.5 py-1.5 text-xs text-cream"
              />
              <ul className="mt-2 space-y-1">
                {guests.map((g) => (
                  <li
                    key={g.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-surface-card px-2.5 py-1.5 text-[12px]"
                  >
                    <span>
                      {g.first_name_en} {g.last_name_en}
                    </span>
                    <button
                      type="button"
                      disabled={busy === g.id}
                      onClick={() => void markOne(g.id, tripCode)}
                      className="text-[10px] font-semibold text-gold underline disabled:opacity-50"
                    >
                      Delivered
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </main>
    </div>
  )
}

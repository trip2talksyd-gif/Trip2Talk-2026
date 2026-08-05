import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { completeOutbound, fetchOutboundQueue } from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import type { StaffOutboundItem } from '../../types/tour'
import { ListRowSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import { useToast } from '../../components/ui/Toast'

const KIND_LABEL: Record<string, string> = {
  trip_reminder_7d: '7-day reminder',
  trip_reminder_1d: '1-day reminder',
  review_request: 'Review request',
  waitlist_spot: 'Waitlist seat open',
}

/** Staff-facing free-tier notification queue (Messenger / Gmail deep links). */
export default function OutboundQueuePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [items, setItems] = useState<StaffOutboundItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'pending' | 'done' | 'all'>('pending')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    fetchOutboundQueue(filter === 'all' ? 'all' : filter)
      .then(setItems)
      .catch((err) => {
        if (err instanceof StaffSessionExpiredError) {
          navigate('/app')
          return
        }
        setError('Could not load outbound queue — apply migration + redeploy staff-api')
      })
      .finally(() => setLoading(false))
  }, [filter, navigate])

  useEffect(() => {
    load()
  }, [load])

  async function markDone(id: string, status: 'done' | 'skipped') {
    try {
      await completeOutbound(id, status)
      toast(status === 'done' ? 'Marked sent' : 'Skipped', 'success')
      load()
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast('Update failed', 'error')
    }
  }

  return (
    <div className="min-h-svh bg-near-black-green text-cream">
      <header className="border-b border-white/8 px-4 py-4">
        <Link to="/app/staff" className="text-sm text-gold">
          ← Staff
        </Link>
        <h1 className="mt-2 font-serif text-lg">Outbound reminders</h1>
        <p className="mt-1 text-[11px] text-cream-muted">
          Free-tier channel — open Messenger/Gmail, then mark done. No paid email service.
          <span className="mt-0.5 block font-thai">
            ช่องทางฟรี — เปิด Messenger/Gmail แล้วกดส่งแล้ว ไม่ใช้บริการอีเมลเสียเงิน
          </span>
        </p>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        <div className="flex gap-2">
          {(['pending', 'done', 'all'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                filter === f ? 'bg-gold text-near-black-green' : 'border border-white/15 text-cream-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading && <ListRowSkeleton />}
        {error && !loading && <PageError message={error} onRetry={load} dark />}

        {!loading && !error && items.length === 0 && (
          <p className="text-sm text-cream-muted">Queue empty</p>
        )}

        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-editorial border border-white/10 bg-surface-card p-3 text-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gold">
                    {KIND_LABEL[item.kind] ?? item.kind}
                  </p>
                  <p className="mt-1 font-semibold text-cream">{item.customer_name}</p>
                  <p className="text-[11px] text-cream-muted">
                    {item.trip_code} · {item.customer_phone ?? '—'} · {item.customer_email ?? '—'}
                  </p>
                </div>
                <span className="text-[10px] text-cream-muted">{item.status}</span>
              </div>
              <p className="mt-2 text-[12px] text-cream/90">{item.subject}</p>
              {item.deep_link && (
                <a
                  href={item.deep_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-[11px] text-gold underline"
                >
                  {item.deep_link}
                </a>
              )}
              {item.status === 'pending' && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.messenger_url && (
                    <a
                      href={item.messenger_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-[#1877F2] px-3 py-1.5 text-[11px] font-bold text-white"
                    >
                      Messenger
                    </a>
                  )}
                  {item.gmail_url && (
                    <a
                      href={item.gmail_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 text-[11px] font-bold text-gold"
                    >
                      Gmail
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => void markDone(item.id, 'done')}
                    className="rounded-lg bg-gold px-3 py-1.5 text-[11px] font-bold text-near-black-green"
                  >
                    Mark sent
                  </button>
                  <button
                    type="button"
                    onClick={() => void markDone(item.id, 'skipped')}
                    className="rounded-lg border border-white/20 px-3 py-1.5 text-[11px] text-cream-muted"
                  >
                    Skip
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}

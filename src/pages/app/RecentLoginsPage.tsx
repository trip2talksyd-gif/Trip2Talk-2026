import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchRecentLogins } from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import type { StaffLoginRow } from '../../types/tour'
import { ListRowSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'

/** Owner-only: recent staff PIN logins (visibility, not a security overhaul). */
export default function RecentLoginsPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<StaffLoginRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    fetchRecentLogins()
      .then(setRows)
      .catch((err) => {
        if (err instanceof StaffSessionExpiredError) {
          navigate('/app')
          return
        }
        setError('Could not load logins — apply migration + redeploy verify-pin')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="min-h-svh bg-near-black-green text-cream">
      <header className="border-b border-white/8 px-4 py-4">
        <Link to="/app/owner" className="text-sm text-gold">
          ← Owner
        </Link>
        <h1 className="mt-2 font-serif text-lg">Recent logins</h1>
        <p className="mt-1 text-[11px] text-cream-muted">
          Who opened a staff session (PIN), when, and best-effort IP / device.
          <span className="mt-0.5 block font-thai">
            ใครล็อกอินด้วย PIN เมื่อไหร่ และ IP/อุปกรณ์เท่าที่เก็บได้
          </span>
        </p>
      </header>

      <main className="mx-auto max-w-2xl space-y-3 px-4 py-6">
        {loading && <ListRowSkeleton />}
        {error && !loading && <PageError message={error} onRetry={load} dark />}
        {!loading && !error && rows.length === 0 && (
          <p className="text-sm text-cream-muted">No sessions yet</p>
        )}
        <ul className="space-y-2">
          {rows.map((r, i) => (
            <li
              key={`${r.staff_id}-${r.created_at}-${i}`}
              className="rounded-editorial border border-white/10 bg-surface-card px-3 py-2.5 text-sm"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-semibold text-cream">
                  {r.full_name}{' '}
                  <span className="text-[10px] font-medium uppercase text-gold">{r.role}</span>
                </p>
                <p className="text-[11px] text-cream-muted">
                  {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
              <p className="mt-1 text-[11px] text-cream-muted">
                IP: {r.ip_address ?? '—'}
              </p>
              {r.user_agent && (
                <p className="mt-0.5 truncate text-[10px] text-cream-muted/80" title={r.user_agent}>
                  {r.user_agent}
                </p>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}

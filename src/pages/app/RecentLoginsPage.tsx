import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchRecentLogins } from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import type { StaffLoginRow } from '../../types/tour'
import { ListRowSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import {
  StaffCard,
  StaffMain,
  StaffPageHeader,
  staffShellClass,
} from '../../components/app/staffUi'

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
    <div className={staffShellClass}>
      <StaffPageHeader
        backTo="/app/owner"
        backLabel="← Owner"
        title="Recent logins"
        subtitle={
          <>
            Who opened a staff session (PIN), when, and best-effort IP / device.
            <span className="mt-0.5 block font-thai">
              ใครล็อกอินด้วย PIN เมื่อไหร่ และ IP/อุปกรณ์เท่าที่เก็บได้
            </span>
          </>
        }
      />

      <StaffMain className="space-y-3">
        {loading && <ListRowSkeleton />}
        {error && !loading && <PageError message={error} onRetry={load} dark />}
        {!loading && !error && rows.length === 0 && (
          <p className="text-sm text-cream-muted">No sessions yet</p>
        )}
        <ul className="space-y-2">
          {rows.map((r, i) => (
            <li key={`${r.staff_id}-${r.created_at}-${i}`}>
              <StaffCard className="text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-semibold text-cream">
                    {r.full_name}{' '}
                    <span className="text-[10px] font-medium uppercase text-teal-500">{r.role}</span>
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
              </StaffCard>
            </li>
          ))}
        </ul>
      </StaffMain>
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import {
  listStaffProfiles,
  resetStaffPin,
  type StaffProfileRow,
} from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import { DashboardCardSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import { useToast } from '../../components/ui/Toast'
import {
  staffShellClass,
  StaffPageHeader,
  StaffMain,
  StaffCard,
  StaffButton,
} from '../../components/app/staffUi'

type RevealedPin = {
  staffId: string
  fullName: string
  pin: string
}

export default function StaffPinAdminPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [staff, setStaff] = useState<StaffProfileRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resettingId, setResettingId] = useState<string | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<StaffProfileRow | null>(null)
  const [revealed, setRevealed] = useState<RevealedPin | null>(null)
  const [copied, setCopied] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    listStaffProfiles()
      .then(setStaff)
      .catch((err) => {
        if (err instanceof StaffSessionExpiredError) {
          navigate('/app')
          return
        }
        console.error('[StaffPinAdminPage] load failed')
        setError('Could not load staff list')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  useEffect(() => {
    load()
  }, [load])

  async function handleConfirmReset() {
    if (!confirmTarget || resettingId) return
    const target = confirmTarget
    setConfirmTarget(null)
    setResettingId(target.id)
    setCopied(false)
    try {
      const result = await resetStaffPin(target.id)
      // Do not toast/log the PIN — only show in one-time modal.
      setRevealed({
        staffId: result.staff_id,
        fullName: result.full_name || target.full_name,
        pin: result.pin,
      })
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast(err instanceof Error ? err.message : 'Reset failed', 'error')
    } finally {
      setResettingId(null)
    }
  }

  async function copyPin() {
    if (!revealed) return
    try {
      await navigator.clipboard.writeText(revealed.pin)
      setCopied(true)
    } catch {
      toast('Could not copy — select the PIN manually', 'error')
    }
  }

  return (
    <div className={staffShellClass}>
      <StaffPageHeader
        backTo="/app/owner"
        backLabel="← Owner Dashboard"
        title="Staff PIN admin"
        subtitle="OWNER only · Reset generates a new 4-digit PIN (shown once)"
      />

      <StaffMain className="space-y-4">
        {loading && <DashboardCardSkeleton />}
        {error && !loading && <PageError message={error} onRetry={load} dark />}

        {!loading && !error && (
          <ul className="space-y-2">
            {staff.length === 0 && (
              <li>
                <StaffCard className="text-sm text-cream-muted">No staff profiles found</StaffCard>
              </li>
            )}
            {staff.map((row) => {
              const busy = resettingId === row.id
              return (
                <li key={row.id}>
                  <StaffCard className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-cream">{row.full_name}</p>
                      <p className="truncate text-xs text-cream-muted">
                        {row.role}
                        {row.active === false ? ' · inactive' : ''}
                      </p>
                    </div>
                    <StaffButton
                      variant="secondary"
                      disabled={busy || resettingId !== null}
                      onClick={() => setConfirmTarget(row)}
                      className="shrink-0 px-3 py-1.5 text-xs"
                    >
                      {busy ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                          Resetting…
                        </span>
                      ) : (
                        'Reset PIN'
                      )}
                    </StaffButton>
                  </StaffCard>
                </li>
              )
            })}
          </ul>
        )}
      </StaffMain>

      {confirmTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-pin-confirm-title"
        >
          <StaffCard className="w-full max-w-md p-5 shadow-xl">
            <h2 id="reset-pin-confirm-title" className="font-serif text-base text-cream">
              Reset PIN for {confirmTarget.full_name}?
            </h2>
            <p className="mt-2 text-sm text-cream-muted">
              This cannot be undone. Their current sessions will be signed out. A new PIN will be
              shown once — copy it before closing.
            </p>
            <div className="mt-5 flex gap-2">
              <StaffButton
                variant="secondary"
                onClick={() => setConfirmTarget(null)}
                className="flex-1"
              >
                Cancel
              </StaffButton>
              <StaffButton onClick={() => void handleConfirmReset()} className="flex-1">
                Reset PIN
              </StaffButton>
            </div>
          </StaffCard>
        </div>
      )}

      {revealed && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-pin-reveal-title"
        >
          <StaffCard className="w-full max-w-md border-teal-500/40 p-5 shadow-xl">
            <h2 id="reset-pin-reveal-title" className="font-serif text-base text-cream">
              New PIN for {revealed.fullName}
            </h2>
            <p className="mt-2 rounded-lg border border-coral/40 bg-coral/10 px-3 py-2 text-sm text-coral">
              Copy this now — it will not be shown again.
            </p>
            <p className="mt-4 text-center font-mono text-4xl font-bold tracking-[0.35em] text-teal-500">
              {revealed.pin}
            </p>
            <div className="mt-5 flex gap-2">
              <StaffButton
                variant="secondary"
                onClick={() => void copyPin()}
                className="flex-1"
              >
                {copied ? 'Copied' : 'Copy PIN'}
              </StaffButton>
              <StaffButton
                onClick={() => {
                  setRevealed(null)
                  setCopied(false)
                }}
                className="flex-1"
              >
                Done
              </StaffButton>
            </div>
          </StaffCard>
        </div>
      )}
    </div>
  )
}

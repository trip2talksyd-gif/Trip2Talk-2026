import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import {
  fetchPaymentReconciliationIssues,
  formatAud,
  resolvePaymentReconciliationIssue,
  retryPaymentReconciliationIssue,
  type PaymentReconciliationIssue,
} from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import { useToast } from '../ui/Toast'
import { StaffButton, StaffCard } from './staffUi'

export default function PaymentReconciliationBanner() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [issues, setIssues] = useState<PaymentReconciliationIssue[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(() => {
    const role = sessionStorage.getItem('staff_role') ?? ''
    if (!['OWNER', 'MANAGER', 'CASHIER'].includes(role)) {
      setIssues([])
      return
    }
    fetchPaymentReconciliationIssues()
      .then(setIssues)
      .catch((err) => {
        if (err instanceof StaffSessionExpiredError) {
          navigate('/app')
          return
        }
        setIssues([])
      })
  }, [navigate])

  useEffect(() => {
    load()
  }, [load])

  async function retry(id: string) {
    setBusyId(id)
    try {
      await retryPaymentReconciliationIssue(id)
      toast('Synced booking from Square payment', 'success')
      load()
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast('Retry failed — keep this row until the booking shows paid', 'error')
    } finally {
      setBusyId(null)
    }
  }

  async function ack(id: string) {
    setBusyId(id)
    try {
      await resolvePaymentReconciliationIssue(id, 'staff_ack')
      load()
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast('Could not dismiss issue', 'error')
    } finally {
      setBusyId(null)
    }
  }

  if (issues.length === 0) return null

  return (
    <StaffCard className="border-coral/45 [background:linear-gradient(145deg,rgba(226,115,74,0.22),rgba(32,54,60,0.92)_50%,rgba(22,38,43,0.96))]">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-coral">
        <ShieldAlert className="h-4 w-4" strokeWidth={2.25} aria-hidden />
        Square payment mismatch / ยอด Square ไม่ตรงการจอง ({issues.length})
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-cream-muted">
        Card was charged at Square but the booking may still show pending. Retry sync first — it
        will not charge again.
      </p>
      <ul className="mt-3 space-y-2">
        {issues.map((issue) => (
          <li
            key={issue.id}
            className="rounded-xl border border-white/10 bg-near-black-green/60 px-3 py-2"
          >
            <p className="text-xs font-medium text-cream">
              {issue.booking_reference}
              {issue.amount_cents ? ` · ${formatAud(issue.amount_cents / 100)}` : ''}
            </p>
            <p className="mt-0.5 break-all text-[10px] text-cream-muted">
              {issue.reason}
              {issue.source ? ` · ${issue.source}` : ''}
              {issue.external_payment_id ? ` · ${issue.external_payment_id}` : ''}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <StaffButton
                type="button"
                disabled={busyId === issue.id}
                onClick={() => void retry(issue.id)}
                className="w-auto px-3 py-1.5 text-xs uppercase tracking-wider"
              >
                Retry sync
              </StaffButton>
              <StaffButton
                type="button"
                variant="secondary"
                disabled={busyId === issue.id}
                onClick={() => void ack(issue.id)}
                className="w-auto px-3 py-1.5 text-xs uppercase tracking-wider"
              >
                Dismiss
              </StaffButton>
            </div>
          </li>
        ))}
      </ul>
    </StaffCard>
  )
}

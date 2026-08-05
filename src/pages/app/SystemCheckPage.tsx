import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { supabase, supabaseConfig } from '../../lib/supabase'
import {
  StaffButton,
  StaffCard,
  StaffMain,
  StaffPageHeader,
  staffShellClass,
} from '../../components/app/staffUi'

type CheckStatus = 'pending' | 'ok' | 'fail'

interface CheckRow {
  label: string
  status: CheckStatus
  detail: string
}

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === 'pending') {
    return <span className="inline-block h-4 w-4 animate-pulse rounded-full bg-white/20" />
  }
  if (status === 'ok') {
    return <CheckCircle2 className="h-5 w-5 text-emerald-400" />
  }
  return <XCircle className="h-5 w-5 text-coral" />
}

export default function SystemCheckPage() {
  const [checks, setChecks] = useState<CheckRow[]>([
    { label: 'Supabase URL configured', status: 'pending', detail: '' },
    { label: 'Anon key configured', status: 'pending', detail: '' },
    { label: 'Tours table readable (anon)', status: 'pending', detail: '' },
  ])
  const [running, setRunning] = useState(true)

  const runChecks = useCallback(async () => {
    setRunning(true)
    const next: CheckRow[] = []

    const urlOk = Boolean(supabaseConfig.url)
    next.push({
      label: 'Supabase URL configured',
      status: urlOk ? 'ok' : 'fail',
      detail: urlOk ? supabaseConfig.url : 'VITE_SUPABASE_URL is empty',
    })

    const keyOk = Boolean(supabaseConfig.anonKey)
    next.push({
      label: 'Anon key configured',
      status: keyOk ? 'ok' : 'fail',
      detail: keyOk ? `${supabaseConfig.anonKey.slice(0, 12)}…` : 'VITE_SUPABASE_ANON_KEY is empty',
    })

    if (!urlOk || !keyOk) {
      next.push({
        label: 'Tours table readable (anon)',
        status: 'fail',
        detail: 'Skipped — env vars missing',
      })
      setChecks(next)
      setRunning(false)
      return
    }

    try {
      const { count, error } = await supabase
        .from('tours')
        .select('*', { count: 'exact', head: true })

      if (error) {
        next.push({
          label: 'Tours table readable (anon)',
          status: 'fail',
          detail: error.message,
        })
      } else {
        next.push({
          label: 'Tours table readable (anon)',
          status: 'ok',
          detail: `count = ${count ?? 0}`,
        })
      }
    } catch (err) {
      next.push({
        label: 'Tours table readable (anon)',
        status: 'fail',
        detail: err instanceof Error ? err.message : String(err),
      })
    }

    setChecks(next)
    setRunning(false)
  }, [])

  useEffect(() => {
    runChecks()
  }, [runChecks])

  const allOk = checks.every((c) => c.status === 'ok')

  return (
    <div className={staffShellClass}>
      <StaffPageHeader
        backTo="/app/staff"
        backLabel="← Staff"
        title="System check"
        subtitle="Post-deploy Supabase connectivity"
      />

      <StaffMain className="max-w-lg space-y-4">
        <ul className="space-y-3">
          {checks.map((check) => (
            <li key={check.label}>
              <StaffCard className="flex items-start gap-3">
                <StatusIcon status={check.status} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-cream">{check.label}</p>
                  <p className="mt-1 break-all text-xs text-cream-muted">{check.detail || '…'}</p>
                </div>
              </StaffCard>
            </li>
          ))}
        </ul>

        <p
          className={`rounded-2xl px-4 py-3 text-center text-sm font-medium ${
            running
              ? 'bg-white/5 text-cream-muted'
              : allOk
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'bg-coral/15 text-coral'
          }`}
        >
          {running ? 'Running checks…' : allOk ? 'All checks passed' : 'One or more checks failed'}
        </p>

        <StaffButton onClick={runChecks} disabled={running}>
          Re-run checks
        </StaffButton>
      </StaffMain>
    </div>
  )
}

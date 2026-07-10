import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'
import { supabase, supabaseConfig } from '../../lib/supabase'

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
    <div className="min-h-svh bg-near-black-green text-cream">
      <header className="border-b border-white/8 px-4 py-4">
        <Link to="/app/staff" className="text-sm text-gold">
          ← Staff
        </Link>
        <h1 className="mt-2 font-serif text-lg text-cream">System check</h1>
        <p className="text-sm text-cream-muted">Post-deploy Supabase connectivity</p>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 py-6">
        <ul className="space-y-3">
          {checks.map((check) => (
            <li
              key={check.label}
              className="flex items-start gap-3 rounded-editorial border border-white/8 bg-surface-card p-4"
            >
              <StatusIcon status={check.status} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-cream">{check.label}</p>
                <p className="mt-1 break-all text-xs text-cream-muted">{check.detail || '…'}</p>
              </div>
            </li>
          ))}
        </ul>

        <p
          className={`rounded-editorial px-4 py-3 text-center text-sm font-medium ${
            running
              ? 'bg-white/5 text-cream-muted'
              : allOk
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'bg-coral/15 text-coral'
          }`}
        >
          {running ? 'Running checks…' : allOk ? 'All checks passed' : 'One or more checks failed'}
        </p>

        <button
          type="button"
          onClick={runChecks}
          disabled={running}
          className="w-full rounded-editorial bg-gold py-2.5 text-sm font-medium text-gold-dark disabled:opacity-50"
        >
          Re-run checks
        </button>
      </main>
    </div>
  )
}

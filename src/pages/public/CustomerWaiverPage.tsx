import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import {
  lookupPublicWaiver,
  submitPublicWaiver,
  type PublicWaiverLookup,
} from '../../lib/toursApi'
import { useToast } from '../../components/ui/Toast'
import BiText from '../../components/ui/BiText'
import WaiverForm from '../../components/waiver/WaiverForm'
import { WAIVER_CLAUSES } from '../../data/risks'

function clauseIds(clauses: PublicWaiverLookup['clauses']): string[] {
  if (Array.isArray(clauses)) return clauses.map(String)
  if (clauses && typeof clauses === 'object') return Object.keys(clauses)
  return []
}

export default function CustomerWaiverPage() {
  const { token = '' } = useParams()
  const { lang, tt } = useLang()
  const { toast } = useToast()
  const [state, setState] = useState<'loading' | 'open' | 'completed' | 'error'>('loading')
  const [lookup, setLookup] = useState<PublicWaiverLookup | null>(null)
  const [errorKind, setErrorKind] = useState<'not_found' | 'cancelled' | 'other'>('other')
  const successBi = tt('common.success')

  useEffect(() => {
    let cancelled = false
    lookupPublicWaiver(token)
      .then((data) => {
        if (cancelled) return
        setLookup(data)
        setState(data.status === 'completed' ? 'completed' : 'open')
      })
      .catch((err) => {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : ''
        setErrorKind(msg === 'booking_cancelled' ? 'cancelled' : msg === 'not_found' ? 'not_found' : 'other')
        setState('error')
      })
    return () => {
      cancelled = true
    }
  }, [token])

  if (state === 'loading') {
    return (
      <p className="p-6 text-sm text-ink-soft">
        Loading waiver… / กำลังโหลดเอกสารยินยอม
      </p>
    )
  }

  if (state === 'error' || !lookup) {
    return (
      <div className="rounded-xl border border-teal-600/40 bg-teal-500/10 p-4 text-sm text-ink">
        <BiText
          en={
            errorKind === 'cancelled'
              ? 'This booking was cancelled. The waiver link is no longer valid.'
              : 'This waiver link is invalid or has expired. Ask Trip2Talk staff for a new link.'
          }
          th={
            errorKind === 'cancelled'
              ? 'การจองนี้ถูกยกเลิกแล้ว ลิงก์ waiver ใช้ไม่ได้'
              : 'ลิงก์ waiver ไม่ถูกต้องหรือหมดอายุแล้ว ขอลิงก์ใหม่จากเจ้าหน้าที่ Trip2Talk'
          }
          thClassName="mt-1 block font-thai text-ink-soft"
        />
        <Link to="/" className="mt-2 block text-teal-700 underline">
          Home / หน้าแรก
        </Link>
      </div>
    )
  }

  if (state === 'completed') {
    const ids = clauseIds(lookup.clauses)
    const titles = ids.map((id) => WAIVER_CLAUSES.en.find((c) => c.id === id)?.title ?? id)
    const when = lookup.signed_at
      ? new Date(lookup.signed_at).toLocaleString('en-AU', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : ''
    return (
      <div className="waiver-shell space-y-4 pb-8">
        <h1 className="font-serif text-xl text-ink">
          Waiver already submitted
          <span className="mt-1 block font-thai text-sm font-medium text-ink-soft">
            ส่งเอกสารยินยอมแล้ว
          </span>
        </h1>
        <p className="text-sm text-ink-soft">
          This link is now read-only. Contact Trip2Talk staff if you need a change.
          <span className="mt-1 block font-thai">
            ลิงก์นี้ดูได้อย่างเดียวแล้ว หากต้องแก้ไขให้ติดต่อเจ้าหน้าที่
          </span>
        </p>
        <div className="rounded-2xl border border-line bg-card p-4 text-sm">
          <p className="font-semibold text-ink">{lookup.signed_name}</p>
          <p className="mt-1 text-ink-soft">
            {lookup.booking_reference ? `Ref ${lookup.booking_reference} · ` : ''}
            {lookup.trip_code}
          </p>
          {when ? <p className="mt-1 text-ink-soft">Submitted {when}</p> : null}
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Agreed terms / ข้อตกลง
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[13px] text-ink">
            {titles.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  const defaultName = `${lookup.first_name_en} ${lookup.last_name_en}`.trim()

  return (
    <WaiverForm
      tripCode={lookup.trip_code}
      defaultSignedName={defaultName}
      onSubmit={async (payload) => {
        await submitPublicWaiver({
          token,
          signed_name: payload.signedName,
          clauses: payload.clauses,
          locale: lang,
          safety: payload.safety,
          flight: payload.flight,
        })
        toast(successBi.en, 'success')
        setLookup({
          ...lookup,
          status: 'completed',
          signed_name: payload.signedName,
          signed_at: payload.signedAt,
          clauses: payload.clauses,
        })
        setState('completed')
      }}
    />
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createBookingFlight,
  listBookingFlights,
  rebookBookingFlight,
  updateBookingFlight,
} from '../../lib/toursApi'
import {
  airportCity,
  flightSheetLine,
  formatFlightLocal,
  historyFlights,
  isoToZonedLocal,
  iataCode,
  zonedLocalToIso,
  type BookingFlight,
  type FlightLeg,
} from '../../lib/bookingFlights'
import { StaffApiError, StaffSessionExpiredError } from '../../lib/supabaseStaff'
import { useToast } from '../ui/Toast'
import { StaffButton, StaffField, StaffInput } from './staffUi'

const TZ_OPTIONS = ['Australia/Sydney', 'Australia/Melbourne', 'Pacific/Auckland', 'UTC']

const flightActionClass =
  '!border !border-solid !border-white/55 !bg-white/10 !text-cream hover:!bg-white/20'

type Draft = {
  leg: FlightLeg
  booked_by: 'customer' | 'trip2talk'
  missed_reason: '' | 'customer' | 'airline' | 'trip2talk' | 'other'
  airline: string
  flight_no: string
  from_airport: string
  to_airport: string
  depart_local: string
  arrive_local: string
  depart_tz: string
  arrive_tz: string
  pnr: string
  staff_note: string
}

const EMPTY: Draft = {
  leg: 'outbound',
  booked_by: 'customer',
  missed_reason: '',
  airline: '',
  flight_no: '',
  from_airport: '',
  to_airport: '',
  depart_local: '',
  arrive_local: '',
  depart_tz: 'Australia/Sydney',
  arrive_tz: 'Pacific/Auckland',
  pnr: '',
  staff_note: '',
}

function draftFromFlight(row: BookingFlight): Draft {
  return {
    leg: row.leg,
    booked_by: row.booked_by,
    missed_reason: '',
    airline: row.airline,
    flight_no: row.flight_no,
    from_airport: row.from_airport,
    to_airport: row.to_airport,
    depart_local: isoToZonedLocal(row.depart_at, row.depart_tz),
    arrive_local: isoToZonedLocal(row.arrive_at, row.arrive_tz),
    depart_tz: row.depart_tz,
    arrive_tz: row.arrive_tz,
    pnr: row.pnr ?? '',
    staff_note: row.staff_note ?? '',
  }
}

type Props = {
  bookingId: string
  bookingReference?: string | null
  canEdit: boolean
  onSessionExpired?: () => void
}

export default function BookingFlightsPanel({
  bookingId,
  bookingReference,
  canEdit,
  onSessionExpired,
}: Props) {
  const { toast } = useToast()
  const [rows, setRows] = useState<BookingFlight[]>([])
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'add' | 'edit' | 'rebook'>('add')
  const [targetId, setTargetId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [busy, setBusy] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [feeOffer, setFeeOffer] = useState<'' | 'customer' | 'trip2talk'>('')
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const node = formRef.current
    if (!node) return
    node.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    node.querySelector<HTMLElement>('select:not([disabled]), input:not([disabled])')?.focus()
  }, [open, draft.leg, mode])

  const load = useCallback(async () => {
    try {
      setRows(await listBookingFlights(bookingId))
      setLoadError(false)
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) onSessionExpired?.()
      else setLoadError(true)
    }
  }, [bookingId, onSessionExpired])

  useEffect(() => {
    let cancelled = false
    listBookingFlights(bookingId)
      .then((next) => {
        if (cancelled) return
        setRows(next)
        setLoadError(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (err instanceof StaffSessionExpiredError) onSessionExpired?.()
        else setLoadError(true)
      })
    return () => {
      cancelled = true
    }
  }, [bookingId, onSessionExpired])

  function startEdit(row: BookingFlight) {
    setMode('edit')
    setTargetId(row.id)
    setDraft(draftFromFlight(row))
    setOpen(true)
  }

  function startRebook(row: BookingFlight) {
    setMode('rebook')
    setTargetId(row.id)
    setDraft({ ...draftFromFlight(row), pnr: '', staff_note: '' })
    setOpen(true)
  }

  async function save() {
    setBusy(true)
    try {
      const payload = {
        booking_id: bookingId,
        leg: draft.leg,
        booked_by: draft.booked_by,
        airline: draft.airline.trim(),
        flight_no: draft.flight_no.toUpperCase().replace(/\s+/g, ''),
        from_airport: iataCode(draft.from_airport),
        to_airport: iataCode(draft.to_airport),
        depart_at: zonedLocalToIso(draft.depart_local, draft.depart_tz),
        arrive_at: zonedLocalToIso(draft.arrive_local, draft.arrive_tz),
        depart_tz: draft.depart_tz,
        arrive_tz: draft.arrive_tz,
        pnr: draft.pnr.trim() || null,
        staff_note: draft.staff_note.trim() || null,
      }
      if (mode === 'add') await createBookingFlight(payload)
      else if (mode === 'rebook' && targetId) {
        if (!draft.missed_reason) {
          toast('Choose why the flight was missed. / เลือกสาเหตุที่ตกเครื่อง', 'error')
          setBusy(false)
          return
        }
        await rebookBookingFlight(targetId, { ...payload, missed_reason: draft.missed_reason })
      }
      else if (targetId) await updateBookingFlight(targetId, payload)
      setFeeOffer(mode === 'rebook' && (draft.missed_reason === 'customer' || draft.missed_reason === 'trip2talk') ? draft.missed_reason : '')
      setOpen(false)
      await load()
      toast(mode === 'rebook' ? 'Rebooked / เปลี่ยนเที่ยวบินแล้ว' : 'Flight saved', 'success')
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        onSessionExpired?.()
        return
      }
      toast(err instanceof StaffApiError ? err.message : 'Flight save failed', 'error')
    } finally {
      setBusy(false)
    }
  }

  const feeHref = `/app/payments?q=${encodeURIComponent(bookingReference || bookingId.slice(0, 8))}&fee=1`

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gold">
        Flights <span className="font-thai normal-case tracking-normal">/ เที่ยวบิน</span>
      </p>
      {loadError && (
        <div className="rounded-lg border border-coral/40 px-2 py-1.5 text-[11px] text-cream">
          <p>Could not load flights / โหลดเที่ยวบินไม่สำเร็จ</p>
          <StaffButton type="button" variant="ghost" className={flightActionClass} onClick={() => void load()}>
            Retry / ลองอีกครั้ง
          </StaffButton>
        </div>
      )}
      {feeOffer === 'customer' && canEdit && (
        <Link to={feeHref} className="block text-[11px] text-gold underline">
          Add change fee / เพิ่มค่าเปลี่ยนตั๋ว
        </Link>
      )}
      {feeOffer === 'trip2talk' && canEdit && (
        <Link
          to={`/app/expenses/new?vendor=${encodeURIComponent('Flight change fee (Trip2Talk error)')}`}
          className="block text-[11px] text-gold underline"
        >
          Record as expense / บันทึกเป็นรายจ่าย
        </Link>
      )}
      {(['outbound', 'return'] as FlightLeg[]).map((leg) => {
        const legRows = rows.filter((row) => row.leg === leg)
        const current = [...legRows]
          .filter((row) => row.status !== 'missed' && row.status !== 'cancelled')
          .sort((a, b) => a.created_at.localeCompare(b.created_at))
          .at(-1) ?? null
        const history = historyFlights(rows, leg, current?.id ?? null)
        return (
          <div key={leg} className="rounded-lg border border-white/10 px-2 py-1.5 text-[11px] text-cream">
            <div className="flex items-center justify-between gap-2">
              <p className="text-cream-muted">{leg === 'outbound' ? 'Outbound / ขาไป' : 'Return / ขากลับ'}</p>
              {canEdit && (
                <StaffButton
                  type="button"
                  variant="ghost"
                  className={flightActionClass}
                  onClick={() => { setDraft({ ...EMPTY, leg }); setMode('add'); setTargetId(null); setOpen(true) }}
                >
                  Add flight / เพิ่มเที่ยวบิน
                </StaffButton>
              )}
            </div>
            {!loadError && !current && history.length === 0 && (
              <p className="mt-1 text-cream-muted">No flight / ยังไม่มีเที่ยวบิน</p>
            )}
            {current?.status === 'rebooked' && (
              <span className="mt-1 inline-block rounded-full bg-amber px-2 py-0.5 text-[9px] font-bold uppercase text-near-black-green">
                Rebooked / เปลี่ยนเที่ยวบิน
              </span>
            )}
            {current && (
              <p className="mt-1">
                <span className="mb-1 block text-[10px] text-gold">
                  {current.booked_by === 'trip2talk'
                    ? 'Booked by Trip2Talk / Trip2Talk จองให้'
                    : 'Booked by customer / ลูกค้าจองเอง'}
                </span>
                {flightSheetLine(current)}
                <span className="mt-0.5 block text-[10px] text-cream-muted">
                  {formatFlightLocal(current.depart_at, current.depart_tz)} {airportCity(current.from_airport)}
                  {' → '}
                  {formatFlightLocal(current.arrive_at, current.arrive_tz)} {airportCity(current.to_airport)}
                  {current.pnr ? ` · PNR ${current.pnr}` : ''}
                </span>
              </p>
            )}
            {canEdit && current && (
              <div className="mt-1 flex flex-wrap gap-1">
                <StaffButton type="button" variant="ghost" className={flightActionClass} onClick={() => startEdit(current)}>Edit / แก้ไข</StaffButton>
                <StaffButton type="button" variant="ghost" className={flightActionClass} onClick={() => startRebook(current)}>
                  Rebook / จองเที่ยวใหม่
                </StaffButton>
              </div>
            )}
            {history.length > 0 && (
              <details className="mt-1">
                <summary className="cursor-pointer text-[10px] text-cream-muted">History / ประวัติ</summary>
                <ul className="mt-1 space-y-1">
                  {history.map((row) => (
                    <li key={row.id} className="text-[10px] text-cream-muted">
                      {row.status} · {flightSheetLine(row)}
                    </li>
                  ))}
                </ul>
              </details>
            )}
            {open && draft.leg === leg && (
        <div ref={formRef} className="mt-2 grid gap-2 rounded-lg border border-white/10 p-2">
          <StaffField label="Leg / ขา">
            <select
              value={draft.leg}
              disabled={mode !== 'add'}
              onChange={(e) => setDraft({ ...draft, leg: e.target.value as FlightLeg })}
              className="w-full rounded-lg border border-white/15 bg-surface-card px-2 py-1 text-xs text-cream"
            >
              <option value="outbound">Outbound / ขาไป</option>
              <option value="return">Return / ขากลับ</option>
            </select>
          </StaffField>
          <StaffField label="Booked by / ใครจองตั๋ว">
            <select
              value={draft.booked_by}
              onChange={(e) => setDraft({ ...draft, booked_by: e.target.value as Draft['booked_by'] })}
              className="w-full rounded-lg border border-white/15 bg-surface-card px-2 py-1 text-xs text-cream"
            >
              <option value="customer">Customer / ลูกค้า</option>
              <option value="trip2talk">Trip2Talk</option>
            </select>
          </StaffField>
          {mode === 'rebook' && (
            <StaffField label="Missed reason / สาเหตุที่ตกเครื่อง">
              <select
                value={draft.missed_reason}
                onChange={(e) => setDraft({ ...draft, missed_reason: e.target.value as Draft['missed_reason'] })}
                className="w-full rounded-lg border border-white/15 bg-surface-card px-2 py-1 text-xs text-cream"
              >
                <option value="">Select / เลือก</option>
                <option value="customer">Customer / ลูกค้า</option>
                <option value="airline">Airline / สายการบิน</option>
                <option value="trip2talk">Trip2Talk</option>
                <option value="other">Other / อื่นๆ</option>
              </select>
            </StaffField>
          )}
          <StaffField label="Airline / สายการบิน">
            <StaffInput value={draft.airline} onChange={(e) => setDraft({ ...draft, airline: e.target.value })} />
          </StaffField>
          <StaffField label="Flight no. / เลขเที่ยวบิน">
            <StaffInput
              value={draft.flight_no}
              onChange={(e) =>
                setDraft({ ...draft, flight_no: e.target.value.toUpperCase().replace(/\s+/g, '') })
              }
            />
          </StaffField>
          <StaffField label="From / ต้นทาง">
            <StaffInput
              value={draft.from_airport}
              onChange={(e) => setDraft({ ...draft, from_airport: iataCode(e.target.value) })}
            />
            <span className="mt-0.5 block text-[10px] text-cream-muted">IATA 3 letters e.g. SYD / ZQN</span>
          </StaffField>
          <StaffField label="To / ปลายทาง">
            <StaffInput
              value={draft.to_airport}
              onChange={(e) => setDraft({ ...draft, to_airport: iataCode(e.target.value) })}
            />
            <span className="mt-0.5 block text-[10px] text-cream-muted">IATA 3 letters e.g. SYD / ZQN</span>
          </StaffField>
          <StaffField label="Depart local / เวลาออก">
            <StaffInput type="datetime-local" value={draft.depart_local} onChange={(e) => setDraft({ ...draft, depart_local: e.target.value })} />
          </StaffField>
          <StaffField label="Depart timezone">
            <select
              value={draft.depart_tz}
              onChange={(e) => setDraft({ ...draft, depart_tz: e.target.value })}
              className="w-full rounded-lg border border-white/15 bg-surface-card px-2 py-1 text-xs text-cream"
            >
              {TZ_OPTIONS.map((tz) => (
                <option key={tz}>{tz}</option>
              ))}
            </select>
          </StaffField>
          <StaffField label="Arrive local / เวลาถึง">
            <StaffInput type="datetime-local" value={draft.arrive_local} onChange={(e) => setDraft({ ...draft, arrive_local: e.target.value })} />
          </StaffField>
          <StaffField label="Arrive timezone">
            <select
              value={draft.arrive_tz}
              onChange={(e) => setDraft({ ...draft, arrive_tz: e.target.value })}
              className="w-full rounded-lg border border-white/15 bg-surface-card px-2 py-1 text-xs text-cream"
            >
              {TZ_OPTIONS.map((tz) => (
                <option key={`a-${tz}`}>{tz}</option>
              ))}
            </select>
          </StaffField>
          <StaffField label="PNR">
            <StaffInput value={draft.pnr} onChange={(e) => setDraft({ ...draft, pnr: e.target.value })} />
          </StaffField>
          <StaffField label="Staff note / โน้ต">
            <StaffInput value={draft.staff_note} onChange={(e) => setDraft({ ...draft, staff_note: e.target.value })} />
          </StaffField>
          <div className="flex gap-2">
            <StaffButton type="button" disabled={busy} onClick={() => void save()}>
              {mode === 'rebook' ? 'Save rebook' : 'Save'}
            </StaffButton>
            <StaffButton type="button" variant="ghost" className={flightActionClass} onClick={() => setOpen(false)}>
              Cancel
            </StaffButton>
          </div>
        </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { fetchToursAdmin, formatAud, insertExpense } from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import type { Tour } from '../../types/tour'
import { useToast } from '../../components/ui/Toast'
import {
  staffShellClass,
  staffTabActiveClass,
  staffTabIdleClass,
  StaffPageHeader,
  StaffMain,
  StaffButton,
  StaffCard,
  StaffField,
  StaffCheckRow,
  StaffInput,
  StaffSelect,
} from '../../components/app/staffUi'

const ATO_CATEGORIES = [
  'Fuel',
  'Vehicle maintenance',
  'Accommodation',
  'Insurance',
  'Marketing',
  'Equipment',
  'Food & entertainment',
  'Bank fees',
  'Professional services',
  'Other',
] as const

type EntryMode = 'single' | 'bulk'

type BulkRow = {
  id: string
  date: string
  description: string
  amount: string
  hasGst: boolean
  gstAmount: string
  category: string
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function emptyRow(): BulkRow {
  return {
    id: crypto.randomUUID(),
    date: todayIso(),
    description: '',
    amount: '',
    hasGst: true,
    gstAmount: '',
    category: '',
  }
}

function gstFromAmount(amount: string): string {
  return Number(amount) > 0 ? (Number(amount) / 11).toFixed(2) : ''
}

export default function ExpenseEntryPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [mode, setMode] = useState<EntryMode>('single')
  const [amount, setAmount] = useState('')
  const [vendorName, setVendorName] = useState('')
  const [atoCategory, setAtoCategory] = useState<string>(ATO_CATEGORIES[0])
  const [hasGst, setHasGst] = useState(true)
  const [gstAmount, setGstAmount] = useState('')
  const [tripCode, setTripCode] = useState('')
  const [tours, setTours] = useState<Tour[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [bulkTripCode, setBulkTripCode] = useState('')
  const [bulkCategory, setBulkCategory] = useState<string>(ATO_CATEGORIES[0])
  const [bulkRows, setBulkRows] = useState<BulkRow[]>(() => [emptyRow(), emptyRow(), emptyRow()])

  useEffect(() => {
    fetchToursAdmin()
      .then((all) => setTours(all.filter((t) => t.status.toLowerCase() !== 'cancelled')))
      .catch(() => {
        /* trip picker is a nice-to-have — expense entry still works without it */
      })
  }, [])

  const amountValid = Number(amount) > 0
  const vendorValid = vendorName.trim().length > 0
  const isValid = amountValid && vendorValid

  const bulkTotal = useMemo(
    () => bulkRows.reduce((sum, row) => sum + (Number(row.amount) > 0 ? Number(row.amount) : 0), 0),
    [bulkRows],
  )

  function autoGst(nextAmount: string) {
    setAmount(nextAmount)
    if (hasGst && Number(nextAmount) > 0) {
      // AU GST is 1/11th of a GST-inclusive amount
      setGstAmount((Number(nextAmount) / 11).toFixed(2))
    }
  }

  function patchRow(id: string, patch: Partial<BulkRow>) {
    setBulkRows((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  function setRowAmount(id: string, nextAmount: string, hasGstNow: boolean) {
    patchRow(id, {
      amount: nextAmount,
      gstAmount: hasGstNow ? gstFromAmount(nextAmount) : '',
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!isValid) return

    setSubmitting(true)
    try {
      await insertExpense({
        description: vendorName.trim(),
        amount_aud: Number(amount),
        ato_category: atoCategory,
        expense_date: new Date().toISOString().slice(0, 10),
        gst_amount_aud: hasGst ? Number(gstAmount) || 0 : 0,
        receipt_url: null,
        created_by: null,
        trip_code: tripCode || null,
      })
      toast('Expense saved', 'success')
      navigate('/app/owner')
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      console.error('[ExpenseEntryPage] insert failed:', err)
      setError('Could not save expense — try again')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleBulkSave() {
    setError('')
    const valid: BulkRow[] = []
    let skipped = 0
    for (const row of bulkRows) {
      const desc = row.description.trim()
      const amt = Number(row.amount)
      if (!desc && !(amt > 0)) continue
      if (desc && amt > 0) {
        valid.push(row)
        continue
      }
      skipped += 1
    }

    if (valid.length === 0) {
      setError(
        skipped > 0
          ? '0 saved, rows skipped — missing amount or vendor'
          : 'Add at least one row with vendor and amount',
      )
      return
    }

    setSubmitting(true)
    let saved = 0
    try {
      for (const row of valid) {
        await insertExpense({
          description: row.description.trim(),
          amount_aud: Number(row.amount),
          ato_category: row.category || bulkCategory,
          expense_date: row.date || todayIso(),
          gst_amount_aud: row.hasGst ? Number(row.gstAmount) || 0 : 0,
          receipt_url: null,
          created_by: null,
          trip_code: bulkTripCode || null,
        })
        saved += 1
      }
      if (skipped > 0) {
        toast(`${saved} saved, ${skipped} skipped — missing amount`, 'success')
      } else {
        toast(`${saved} expenses saved`, 'success')
      }
      navigate('/app/owner')
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      console.error('[ExpenseEntryPage] bulk insert failed:', err)
      setError(
        saved > 0
          ? `${saved} saved, then one row failed — try again`
          : 'Could not save expenses — try again',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={staffShellClass}>
      <StaffPageHeader
        backTo="/app/owner"
        backLabel="← Owner Dashboard"
        title="Add Expense"
      />

      <StaffMain>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['single', 'Single entry / รายการเดียว'],
              ['bulk', 'Bulk entry / หลายรายการ'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setMode(id)
                setError('')
              }}
              className={mode === id ? staffTabActiveClass : staffTabIdleClass}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'single' && (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <StaffField
            label={
              <>
                Amount (AUD) <span className="text-coral">*</span>
              </>
            }
          >
            <StaffInput
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => autoGst(e.target.value)}
            />
          </StaffField>

          <StaffField
            label={
              <>
                Vendor / paid to <span className="text-coral">*</span>
              </>
            }
          >
            <StaffInput
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
            />
          </StaffField>

          <StaffField label="ทริป (ถ้ามี — เว้นว่างถ้าเป็นค่าใช้จ่ายทั่วไป)">
            <StaffSelect
              value={tripCode}
              onChange={(e) => setTripCode(e.target.value)}
            >
              <option value="">— ทั่วไป / ไม่ผูกกับทริป —</option>
              {tours.map((tr) => (
                <option key={tr.id} value={tr.trip_code}>
                  {tr.name_en} · {tr.trip_code}
                </option>
              ))}
            </StaffSelect>
          </StaffField>

          <StaffField label="ATO category">
            <StaffSelect
              value={atoCategory}
              onChange={(e) => setAtoCategory(e.target.value)}
            >
              {ATO_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </StaffSelect>
          </StaffField>

          <StaffCheckRow
            checked={hasGst}
            onChange={(next) => {
              setHasGst(next)
              if (!next) setGstAmount('')
            }}
          >
            Includes GST
          </StaffCheckRow>

          {hasGst && (
            <StaffField label="GST amount (AUD)">
              <StaffInput
                type="number"
                min="0"
                step="0.01"
                value={gstAmount}
                onChange={(e) => setGstAmount(e.target.value)}
              />
              <span className="mt-1 block text-xs text-cream-muted">
                Auto-filled at 1/11th of amount; adjust if different
              </span>
            </StaffField>
          )}

          {error && <p className="text-sm text-coral">{error}</p>}

          <StaffButton type="submit" disabled={!isValid || submitting}>
            {submitting ? 'Saving…' : 'Save expense'}
          </StaffButton>
        </form>
        )}

        {mode === 'bulk' && (
          <div className="space-y-5">
            <StaffField label="ทริป (ถ้ามี — ใช้ร่วมทุกแถว)">
              <StaffSelect
                value={bulkTripCode}
                onChange={(e) => setBulkTripCode(e.target.value)}
              >
                <option value="">— ทั่วไป / ไม่ผูกกับทริป —</option>
                {tours.map((tr) => (
                  <option key={tr.id} value={tr.trip_code}>
                    {tr.name_en} · {tr.trip_code}
                  </option>
                ))}
              </StaffSelect>
            </StaffField>

            <StaffField label="Default ATO category / หมวดเริ่มต้นทุกแถว">
              <StaffSelect
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
              >
                {ATO_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </StaffSelect>
            </StaffField>

            <div className="space-y-3">
              {bulkRows.map((row, index) => (
                <StaffCard key={row.id}>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-xs text-cream-muted">Row {index + 1}</p>
                    <StaffButton
                      variant="danger"
                      type="button"
                      disabled={bulkRows.length <= 1}
                      onClick={() => setBulkRows((rows) => rows.filter((r) => r.id !== row.id))}
                      aria-label={`Remove row ${index + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                    </StaffButton>
                  </div>
                  <div className="space-y-3">
                    <StaffField label="Date">
                      <StaffInput
                        type="date"
                        value={row.date}
                        onChange={(e) => patchRow(row.id, { date: e.target.value })}
                      />
                    </StaffField>
                    <StaffField label="Vendor / paid to">
                      <StaffInput
                        value={row.description}
                        onChange={(e) => patchRow(row.id, { description: e.target.value })}
                      />
                    </StaffField>
                    <StaffField label="Amount (AUD)">
                      <StaffInput
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.amount}
                        onChange={(e) => setRowAmount(row.id, e.target.value, row.hasGst)}
                      />
                    </StaffField>
                    <StaffCheckRow
                      checked={row.hasGst}
                      onChange={(next) =>
                        patchRow(row.id, {
                          hasGst: next,
                          gstAmount: next ? gstFromAmount(row.amount) : '',
                        })
                      }
                    >
                      Includes GST
                    </StaffCheckRow>
                    {row.hasGst && (
                      <StaffField label="GST amount (AUD)">
                        <StaffInput
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.gstAmount}
                          onChange={(e) => patchRow(row.id, { gstAmount: e.target.value })}
                        />
                      </StaffField>
                    )}
                    <StaffField label="ATO category override (optional)">
                      <StaffSelect
                        value={row.category}
                        onChange={(e) => patchRow(row.id, { category: e.target.value })}
                      >
                        <option value="">— use default ({bulkCategory}) —</option>
                        {ATO_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </StaffSelect>
                    </StaffField>
                  </div>
                </StaffCard>
              ))}
            </div>

            <StaffButton
              type="button"
              variant="secondary"
              onClick={() => setBulkRows((rows) => [...rows, emptyRow()])}
            >
              + Add row
            </StaffButton>

            <p className="text-sm text-cream">
              Running total{' '}
              <span className="font-medium text-teal-500">{formatAud(bulkTotal)}</span>
            </p>

            {error && <p className="text-sm text-coral">{error}</p>}

            <StaffButton type="button" disabled={submitting} onClick={() => void handleBulkSave()}>
              {submitting ? 'Saving…' : 'Save all expenses'}
            </StaffButton>
          </div>
        )}
      </StaffMain>
    </div>
  )
}

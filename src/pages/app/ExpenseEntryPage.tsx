import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchToursAdmin, insertExpense } from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import type { Tour } from '../../types/tour'
import { useToast } from '../../components/ui/Toast'
import {
  staffShellClass,
  StaffPageHeader,
  StaffMain,
  StaffButton,
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

export default function ExpenseEntryPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [amount, setAmount] = useState('')
  const [vendorName, setVendorName] = useState('')
  const [atoCategory, setAtoCategory] = useState<string>(ATO_CATEGORIES[0])
  const [hasGst, setHasGst] = useState(true)
  const [gstAmount, setGstAmount] = useState('')
  const [tripCode, setTripCode] = useState('')
  const [tours, setTours] = useState<Tour[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

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

  function autoGst(nextAmount: string) {
    setAmount(nextAmount)
    if (hasGst && Number(nextAmount) > 0) {
      // AU GST is 1/11th of a GST-inclusive amount
      setGstAmount((Number(nextAmount) / 11).toFixed(2))
    }
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

  return (
    <div className={staffShellClass}>
      <StaffPageHeader
        backTo="/app/owner"
        backLabel="← Owner Dashboard"
        title="Add Expense"
      />

      <StaffMain>
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
      </StaffMain>
    </div>
  )
}

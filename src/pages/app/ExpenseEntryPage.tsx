import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { insertExpense } from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import { useToast } from '../../components/ui/Toast'

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
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

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
    <div className="min-h-svh bg-near-black-green text-cream">
      <header className="border-b border-white/8 px-4 py-4">
        <Link to="/app/owner" className="text-sm text-gold">
          ← Owner Dashboard
        </Link>
        <h1 className="mt-2 font-serif text-lg text-cream">Add Expense</h1>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <label className="block">
            <span className="text-sm font-medium text-cream-muted">
              Amount (AUD) <span className="text-coral">*</span>
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => autoGst(e.target.value)}
              className="mt-1 w-full rounded-editorial border border-white/8 bg-surface-card px-3 py-2 text-sm text-cream"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-cream-muted">
              Vendor / paid to <span className="text-coral">*</span>
            </span>
            <input
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="mt-1 w-full rounded-editorial border border-white/8 bg-surface-card px-3 py-2 text-sm text-cream"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-cream-muted">ATO category</span>
            <select
              value={atoCategory}
              onChange={(e) => setAtoCategory(e.target.value)}
              className="mt-1 w-full rounded-editorial border border-white/8 bg-surface-card px-3 py-2 text-sm text-cream"
            >
              {ATO_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={hasGst}
              onChange={(e) => {
                setHasGst(e.target.checked)
                if (!e.target.checked) setGstAmount('')
              }}
            />
            <span className="text-sm text-cream-muted">Includes GST</span>
          </label>

          {hasGst && (
            <label className="block">
              <span className="text-sm font-medium text-cream-muted">GST amount (AUD)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={gstAmount}
                onChange={(e) => setGstAmount(e.target.value)}
                className="mt-1 w-full rounded-editorial border border-white/8 bg-surface-card px-3 py-2 text-sm text-cream"
              />
              <span className="mt-1 block text-xs text-cream-muted">
                Auto-filled at 1/11th of amount; adjust if different
              </span>
            </label>
          )}

          {error && <p className="text-sm text-coral">{error}</p>}

          <button
            type="submit"
            disabled={!isValid || submitting}
            className="w-full rounded-editorial bg-gold py-2.5 text-sm font-medium uppercase tracking-wider text-gold-dark transition-transform active:scale-95 disabled:opacity-40"
          >
            {submitting ? 'Saving…' : 'Save expense'}
          </button>
        </form>
      </main>
    </div>
  )
}

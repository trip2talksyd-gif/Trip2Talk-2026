import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

export type ApplyExtensionQuoteResult = {
  ok: boolean
  skipped?: boolean
  error?: string
  quote_id?: string
  status?: string
  extra_days_paid?: number
  amount_paid_aud?: number
}

function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
}

export async function expirePendingExtensionQuotes(): Promise<{ expired: number }> {
  const admin = adminClient()
  const { data, error } = await admin.rpc('expire_pending_extension_quotes')
  if (error) {
    console.error('[expire-extension-quotes]', error.message)
    return { expired: 0 }
  }
  const row = (data ?? {}) as { expired?: number }
  return { expired: Number(row.expired ?? 0) }
}

/** Idempotent paid-quote apply (Square webhook / card charge / staff PayID). */
export async function applyExtensionQuotePayment(opts: {
  quoteId: string
  amountCents: number
  paymentId: string
  paymentMethod?: string
  source?: string
}): Promise<ApplyExtensionQuoteResult> {
  const admin = adminClient()
  const paymentMethod = opts.paymentMethod || 'square'
  const source = opts.source || 'apply-extension-quote'

  try {
    const { data, error } = await admin.rpc('apply_extension_quote_payment', {
      p_quote_id: opts.quoteId,
      p_amount_cents: Math.round(opts.amountCents),
      p_payment_id: opts.paymentId,
      p_payment_method: paymentMethod,
    })
    if (error) {
      console.error(
        `[apply-extension-quote] RECONCILIATION_NEEDED quote_id=${opts.quoteId} payment_id=${opts.paymentId} source=${source} error=${error.message}`,
      )
      return { ok: false, error: error.message || 'apply_extension_quote_payment_failed' }
    }
    const row = (data ?? {}) as ApplyExtensionQuoteResult
    if (!row.ok) {
      console.error(
        `[apply-extension-quote] RECONCILIATION_NEEDED quote_id=${opts.quoteId} payment_id=${opts.paymentId} source=${source} error=${row.error ?? 'apply_failed'}`,
      )
    }
    return row
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error(
      `[apply-extension-quote] RECONCILIATION_NEEDED quote_id=${opts.quoteId} payment_id=${opts.paymentId} source=${source} error=${detail}`,
    )
    return { ok: false, error: detail }
  }
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function hexToUuid(hex: string): string | null {
  const h = hex.replace(/-/g, '').toLowerCase()
  if (!/^[0-9a-f]{32}$/.test(h)) return null
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`
}

/** Parse T2T-EXT-<uuid> note or EXT-<32hex> Square reference_id. */
export function extractExtensionQuoteId(opts: {
  note?: string | null
  referenceId?: string | null
}): string | null {
  const note = (opts.note ?? '').trim()
  const noteMatch = note.match(/^T2T-EXT-([0-9a-f-]{36})$/i)
  if (noteMatch?.[1] && UUID_RE.test(noteMatch[1])) return noteMatch[1].toLowerCase()

  const ref = (opts.referenceId ?? '').trim()
  const refMatch = ref.match(/^EXT-([0-9a-f]{32})$/i)
  if (refMatch?.[1]) return hexToUuid(refMatch[1])
  return null
}

/**
 * Vercel Cron entry (Hobby: once per day).
 * Proxies to Supabase Edge Function `cron-daily`.
 *
 * Gateway JWT: Authorization / apikey must be a Supabase anon (or service_role) key.
 * App auth: CRON_SECRET goes in ?secret= (matches cron-daily authorized()).
 *
 * Env (Vercel):
 *   VITE_SUPABASE_URL or SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY)
 *   CRON_SECRET (must match Edge Function secret)
 *
 * Schedule: 22:00 UTC ≈ morning Sydney (Hobby hour precision).
 */

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request): Promise<Response> {
  // Vercel Cron sends GET; also accept POST for manual triggers.
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405 })
  }

  const cronSecret = process.env.CRON_SECRET ?? ''
  const auth = req.headers.get('authorization') ?? ''
  const vercelCron = req.headers.get('x-vercel-cron')
  // Allow Vercel Cron header OR Bearer secret (manual / external).
  const ok =
    Boolean(vercelCron) ||
    (cronSecret && auth === `Bearer ${cronSecret}`) ||
    (!cronSecret && auth === '')

  if (!ok && cronSecret) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 })
  }

  const base =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    'https://bljhnelgmkulxwuhedbi.supabase.co'

  // Prefer anon key already used by the app; allow service_role if set on Vercel instead.
  const supabaseJwt =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ''

  if (!supabaseJwt) {
    return new Response(
      JSON.stringify({
        error: 'missing_supabase_key',
        detail: 'Set VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY on Vercel',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const url = new URL(`${base.replace(/\/$/, '')}/functions/v1/cron-daily`)
  if (cronSecret) url.searchParams.set('secret', cronSecret)

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supabaseJwt}`,
      apikey: supabaseJwt,
    },
  })

  const text = await res.text()
  return new Response(text, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  })
}

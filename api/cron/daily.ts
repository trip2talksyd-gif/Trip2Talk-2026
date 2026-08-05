/**
 * Vercel Cron entry (Hobby: once per day).
 * Proxies to Supabase Edge Function `cron-daily` with CRON_SECRET.
 *
 * Env (Vercel):
 *   VITE_SUPABASE_URL or SUPABASE_URL
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

  const url = `${base.replace(/\/$/, '')}/functions/v1/cron-daily`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cronSecret || process.env.VITE_SUPABASE_ANON_KEY || ''}`,
      apikey: process.env.VITE_SUPABASE_ANON_KEY || '',
    },
  })

  const text = await res.text()
  return new Response(text, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  })
}

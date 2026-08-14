// Trip2Talk — generate-caption Edge Function
//
// Accepts { image_url, post_type, token? } — fetches the image, sends it to
// Anthropic Claude with CLAUDE.md brand voice as the system prompt, returns
// { headline_options: string[], caption_fb: string }.
//
// Secrets: ANTHROPIC_API_KEY (required). SUPABASE_URL / SERVICE_ROLE_KEY
// auto-provided; used to validate staff session token when present.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { BRAND_VOICE } from './brandVoice.ts'
import { assertAiContentGenerationEnabled } from '../_shared/aiContentEnabled.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const MODEL = 'claude-sonnet-4-6'

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

async function loadBrandVoice(): Promise<string> {
  try {
    const fromFile = await Deno.readTextFile(new URL('./CLAUDE.md', import.meta.url))
    if (fromFile.trim()) return fromFile
  } catch {
    /* bundled CLAUDE.md may be absent — use TS mirror */
  }
  return BRAND_VOICE
}

function stripMarkdownFences(text: string): string {
  let s = text.trim()
  if (s.startsWith('```')) {
    s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/u, '')
  }
  return s.trim()
}

function uint8ToBase64(bytes: Uint8Array): string {
  // Chunk to avoid call-stack / argument limits on large images
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

async function assertStaffToken(token: string | undefined): Promise<boolean> {
  if (!token || typeof token !== 'string') return false
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const { data, error } = await admin
    .from('staff_sessions')
    .select('token, role, expires_at')
    .eq('token', token)
    .maybeSingle()
  if (error || !data) return false
  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) return false
  return data.role === 'OWNER'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  if (!ANTHROPIC_API_KEY) {
    return json({ error: 'missing_anthropic_api_key' }, 500)
  }

  let body: { image_url?: string; post_type?: string; token?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_request' }, 400)
  }

  const imageUrl = body.image_url
  const postType = body.post_type ?? 'value_content'
  if (typeof imageUrl !== 'string' || !/^https?:\/\//i.test(imageUrl)) {
    return json({ error: 'invalid_image_url' }, 400)
  }
  if (postType !== 'value_content' && postType !== 'trip_promo') {
    return json({ error: 'invalid_post_type' }, 400)
  }

  const ok = await assertStaffToken(body.token)
  if (!ok) return json({ error: 'unauthorized' }, 401)

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const gate = await assertAiContentGenerationEnabled(admin)
  if (!gate.ok) {
    return json({ error: gate.error, message: gate.message }, 403)
  }

  try {
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) return json({ error: 'image_fetch_failed' }, 400)
    const contentType = imgRes.headers.get('content-type') ?? 'image/jpeg'
    const mime = contentType.split(';')[0].trim() || 'image/jpeg'
    if (!mime.startsWith('image/')) return json({ error: 'not_an_image' }, 400)

    const bytes = new Uint8Array(await imgRes.arrayBuffer())
    if (bytes.byteLength === 0) return json({ error: 'empty_image' }, 400)
    if (bytes.byteLength > 8 * 1024 * 1024) return json({ error: 'image_too_large' }, 400)

    const base64 = uint8ToBase64(bytes)
    const brandVoice = await loadBrandVoice()

    const userPrompt =
      postType === 'value_content'
        ? `post_type is value_content. Write headline_options (3 Thai options) and caption_fb for this photo. No booking CTA.`
        : `post_type is trip_promo. Write headline_options (3 Thai options) and caption_fb for this photo.`

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: brandVoice,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mime, data: base64 },
              },
              { type: 'text', text: userPrompt },
            ],
          },
        ],
      }),
    })

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text()
      console.error('[generate-caption] Anthropic error', anthropicRes.status, errText)
      // Surface status + short Anthropic error type/message (never the API key).
      let anthropicType: string | undefined
      let anthropicMessage: string | undefined
      try {
        const parsed = JSON.parse(errText) as {
          error?: { type?: string; message?: string }
        }
        anthropicType = parsed?.error?.type
        anthropicMessage = parsed?.error?.message?.slice(0, 240)
      } catch {
        /* ignore */
      }
      return json(
        {
          error: 'anthropic_failed',
          anthropic_status: anthropicRes.status,
          anthropic_type: anthropicType ?? null,
          anthropic_message: anthropicMessage ?? null,
        },
        502,
      )
    }

    const anthropicBody = await anthropicRes.json()
    const textBlock = (anthropicBody.content ?? []).find(
      (b: { type?: string; text?: string }) => b.type === 'text' && typeof b.text === 'string',
    )
    if (!textBlock?.text) return json({ error: 'empty_model_response' }, 502)

    let parsed: { headline_options?: unknown; caption_fb?: unknown }
    try {
      parsed = JSON.parse(stripMarkdownFences(textBlock.text))
    } catch {
      console.error('[generate-caption] JSON parse failed', textBlock.text)
      return json({ error: 'invalid_model_json' }, 502)
    }

    const headline_options = Array.isArray(parsed.headline_options)
      ? parsed.headline_options.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      : []
    const caption_fb = typeof parsed.caption_fb === 'string' ? parsed.caption_fb.trim() : ''

    if (headline_options.length === 0 || !caption_fb) {
      return json({ error: 'incomplete_model_json' }, 502)
    }

    return json({ headline_options, caption_fb })
  } catch (err) {
    console.error('[generate-caption] failed', err)
    return json({ error: 'server_error' }, 500)
  }
})

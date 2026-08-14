import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

export const AI_CONTENT_DISABLED_MESSAGE = 'ฟีเจอร์นี้ถูกปิดชั่วคราวโดยเจ้าของร้าน'

export async function assertAiContentGenerationEnabled(
  admin: SupabaseClient,
): Promise<{ ok: true } | { ok: false; error: string; message: string }> {
  const { data, error } = await admin
    .from('app_settings')
    .select('ai_content_generation_enabled')
    .eq('id', 'default')
    .maybeSingle()

  if (error) {
    console.error('[app_settings] read failed', error)
    return {
      ok: false,
      error: 'settings_unavailable',
      message: 'อ่านการตั้งค่าไม่สำเร็จ',
    }
  }

  if (data && data.ai_content_generation_enabled === false) {
    return {
      ok: false,
      error: 'ai_content_disabled',
      message: AI_CONTENT_DISABLED_MESSAGE,
    }
  }

  return { ok: true }
}

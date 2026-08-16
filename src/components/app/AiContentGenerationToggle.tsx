import { useEffect, useState } from 'react'
import {
  fetchAppSettings,
  setAiContentGenerationEnabled,
} from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import { StaffCheckRow } from './staffUi'

type Props = {
  onSessionExpired: () => void
  onToast: (msg: string, tone?: 'success' | 'error') => void
  onChange?: (enabled: boolean) => void
}

export default function AiContentGenerationToggle({
  onSessionExpired,
  onToast,
  onChange,
}: Props) {
  const [enabled, setEnabled] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchAppSettings()
      .then((s) => {
        if (cancelled) return
        setEnabled(s.ai_content_generation_enabled)
        onChange?.(s.ai_content_generation_enabled)
        setLoaded(true)
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof StaffSessionExpiredError) {
          onSessionExpired()
          return
        }
        onToast('โหลดการตั้งค่า AI ไม่สำเร็จ', 'error')
        setLoaded(true)
      })
    return () => {
      cancelled = true
    }
    // Load once on mount — parent callbacks are stable enough for this settings fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function toggle(next: boolean) {
    if (saving || !loaded) return
    setSaving(true)
    const prev = enabled
    setEnabled(next)
    onChange?.(next)
    try {
      const updated = await setAiContentGenerationEnabled(next)
      setEnabled(updated.ai_content_generation_enabled)
      onChange?.(updated.ai_content_generation_enabled)
      onToast(
        updated.ai_content_generation_enabled
          ? 'เปิดสร้าง content ด้วย AI แล้ว'
          : 'ปิดสร้าง content ด้วย AI แล้ว — จะไม่เรียก Anthropic',
        'success',
      )
    } catch (err) {
      setEnabled(prev)
      onChange?.(prev)
      if (err instanceof StaffSessionExpiredError) {
        onSessionExpired()
        return
      }
      onToast('บันทึกการตั้งค่าไม่สำเร็จ', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <StaffCheckRow
      checked={enabled}
      onChange={(next) => void toggle(next)}
      tone={enabled ? 'default' : 'warning'}
      className={saving || !loaded ? 'pointer-events-none opacity-60' : ''}
    >
      สร้าง content ด้วย AI (เปิด/ปิด)
      <span className="mt-0.5 block text-xs text-cream-muted">
        {enabled
          ? 'Trip Manager เรียก Anthropic ตามปกติ'
          : 'ปิดชั่วคราว — ประหยัดเครดิต Anthropic'}
      </span>
    </StaffCheckRow>
  )
}

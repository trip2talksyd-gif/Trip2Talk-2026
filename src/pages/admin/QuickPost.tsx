import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Camera, Loader2 } from 'lucide-react'
import {
  fetchAppSettings,
  generateCaption,
  insertContentPostDraft,
  uploadContentPhoto,
} from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import {
  CONTENT_TARGET_ACCOUNTS,
  type ContentTargetAccount,
} from '../../data/facebookDestinations'
import { useToast } from '../../components/ui/Toast'
import {
  StaffButton,
  StaffCard,
  StaffMain,
  StaffPageHeader,
  staffShellClass,
} from '../../components/app/staffUi'

type Phase = 'idle' | 'compressing' | 'uploading' | 'generating' | 'saving' | 'done'

export default function QuickPost() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [targetAccount, setTargetAccount] = useState<ContentTargetAccount | ''>('')
  const [aiContentEnabled, setAiContentEnabled] = useState(true)

  useEffect(() => {
    fetchAppSettings()
      .then((s) => setAiContentEnabled(s.ai_content_generation_enabled))
      .catch((err) => {
        if (err instanceof StaffSessionExpiredError) {
          navigate('/app')
        }
      })
  }, [navigate])

  const busy =
    phase === 'compressing' ||
    phase === 'uploading' ||
    phase === 'generating' ||
    phase === 'saving'

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!aiContentEnabled) {
      toast('ฟีเจอร์นี้ถูกปิดชั่วคราวโดยเจ้าของร้าน', 'error')
      return
    }

    if (!targetAccount) {
      toast('เลือกปลายทางโพสต์ก่อนอัปโหลด', 'error')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast('กรุณาเลือกรูปภาพ', 'error')
      return
    }

    setPhase('compressing')
    const localPreview = URL.createObjectURL(file)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return localPreview
    })

    try {
      let imageUrl: string
      try {
        imageUrl = await uploadContentPhoto(file, setPhase)
      } catch (err) {
        console.error('[QuickPost] upload failed:', err)
        if (err instanceof StaffSessionExpiredError) throw err
        toast('อัปโหลดรูปไม่สำเร็จ ลองอีกครั้ง', 'error')
        setPhase('idle')
        return
      }

      setPhase('generating')
      let generated: { headline_options: string[]; caption_fb: string }
      try {
        generated = await generateCaption(imageUrl, 'value_content')
      } catch (err) {
        console.error('[QuickPost] generate-caption failed:', err)
        if (err instanceof StaffSessionExpiredError) throw err
        const raw = err instanceof Error ? err.message : ''
        const captionMsg =
          raw === 'missing_anthropic_api_key'
            ? 'ยังไม่ได้ตั้ง ANTHROPIC_API_KEY ใน Edge Secrets — ติดต่อเจ้าของระบบ'
            : raw && !/^generate-caption failed:\s*\d+$/i.test(raw)
              ? `สร้างแคปชันไม่สำเร็จ: ${raw}`
              : 'สร้างแคปชันไม่สำเร็จ ลองอีกครั้ง'
        toast(captionMsg, 'error')
        setPhase('idle')
        return
      }

      setPhase('saving')
      try {
        await insertContentPostDraft({
          post_type: 'value_content',
          trip_id: null,
          photo_urls: [imageUrl],
          headline_options: generated.headline_options,
          caption_fb: generated.caption_fb,
          target_account: targetAccount,
          group_id: targetAccount === 'group_thaiaus' ? '1631889741218502' : null,
        })
      } catch (err) {
        console.error('[QuickPost] insert draft failed:', err)
        if (err instanceof StaffSessionExpiredError) throw err
        toast('บันทึกร่างไม่สำเร็จ ลองอีกครั้ง', 'error')
        setPhase('idle')
        return
      }

      setPhase('done')
      toast('โพสต์ร่างแล้ว', 'success')
    } catch (err) {
      console.error('[QuickPost] failed:', err)
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast('เกิดข้อผิดพลาด ลองอีกครั้ง', 'error')
      setPhase('idle')
    }
  }

  function reset() {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setPhase('idle')
  }

  const statusLabel =
    phase === 'compressing'
      ? 'กำลังย่อรูป…'
      : phase === 'uploading'
      ? 'กำลังอัปโหลดรูป…'
      : phase === 'generating'
        ? 'กำลังเขียนแคปชัน…'
        : phase === 'saving'
          ? 'กำลังบันทึกร่าง…'
          : null

  return (
    <div className={staffShellClass}>
      <StaffPageHeader
        backTo="/app/owner"
        backLabel="← แดชบอร์ดเจ้าของ"
        title="Quick Post"
        subtitle="เลือกปลายทาง → อัปโหลดรูป → AI ร่างแคปชัน → ไปรีวิว"
      />

      <StaffMain className="flex max-w-md flex-col gap-6 py-8">
        {!aiContentEnabled && (
          <StaffCard className="border-amber/40 bg-amber/10 text-sm text-cream">
            ฟีเจอร์นี้ถูกปิดชั่วคราวโดยเจ้าของร้าน — เปิดได้ที่ Owner Dashboard หรือ Trip Manager
          </StaffCard>
        )}
        {phase === 'done' ? (
          <div className="space-y-6 text-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt=""
                className="mx-auto aspect-square w-full max-w-xs rounded-2xl object-cover"
              />
            ) : (
              <StaffCard className="mx-auto flex aspect-square w-full max-w-xs items-center justify-center bg-surface-card/50">
                <Loader2 className="h-8 w-8 animate-spin text-teal-500" aria-hidden />
              </StaffCard>
            )}
            <p className="text-base text-cream">โพสต์ร่างแล้ว ไปดูที่หน้ารีวิว</p>
            <Link to="/app/content-review" className="block">
              <StaffButton className="min-h-14 text-base">ไปหน้ารีวิว</StaffButton>
            </Link>
            <StaffButton variant="secondary" className="min-h-12 text-sm" onClick={reset}>
              อัปโหลดรูปอื่น
            </StaffButton>
          </div>
        ) : (
          <>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-cream-muted">
                ปลายทางโพสต์ <span className="text-coral">*</span>
              </legend>
              <ul className="space-y-2">
                {CONTENT_TARGET_ACCOUNTS.map((opt) => (
                  <li key={opt.id}>
                    <StaffCard
                      selected={targetAccount === opt.id}
                      className="cursor-pointer has-[:disabled]:opacity-60"
                    >
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="radio"
                          name="target_account"
                          value={opt.id}
                          checked={targetAccount === opt.id}
                          disabled={busy}
                          onChange={() => setTargetAccount(opt.id)}
                          className="staff-check mt-1 shrink-0"
                        />
                        <span>
                          <span className="block text-sm text-cream">{opt.label}</span>
                          <span className="block text-xs text-cream-muted">
                            {opt.mode === 'graph' ? 'Graph auto-publish' : 'Manual copy/post'}
                          </span>
                        </span>
                      </label>
                    </StaffCard>
                  </li>
                ))}
              </ul>
            </fieldset>

            {previewUrl && (
              <img
                src={previewUrl}
                alt=""
                className="mx-auto aspect-square w-full max-w-xs rounded-2xl object-cover opacity-90"
              />
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              disabled={busy || !targetAccount || !aiContentEnabled}
              onChange={(e) => void handleFile(e)}
            />

            <StaffButton
              className="min-h-16 gap-3 text-lg"
              disabled={busy || !targetAccount || !aiContentEnabled}
              onClick={() => {
                if (!aiContentEnabled) {
                  toast('ฟีเจอร์นี้ถูกปิดชั่วคราวโดยเจ้าของร้าน', 'error')
                  return
                }
                if (!targetAccount) {
                  toast('เลือกปลายทางโพสต์ก่อน', 'error')
                  return
                }
                inputRef.current?.click()
              }}
            >
              {busy ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
                  {statusLabel}
                </>
              ) : (
                <>
                  <Camera className="h-6 w-6" aria-hidden />
                  {targetAccount
                    ? aiContentEnabled
                      ? 'อัปโหลดรูป'
                      : 'AI ถูกปิดชั่วคราว'
                    : 'เลือกปลายทางก่อน'}
                </>
              )}
            </StaffButton>

            {busy && (
              <StaffCard
                className="flex flex-col items-center gap-3 py-8"
                role="status"
                aria-live="polite"
                aria-busy="true"
              >
                <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
                <p className="text-sm text-cream-muted">{statusLabel}</p>
              </StaffCard>
            )}

            {!busy && !previewUrl && (
              <p className="text-center text-sm text-cream-muted">
                เลือกปลายทาง แล้วแตะปุ่มเพื่อถ่ายหรือเลือกรูป
              </p>
            )}
          </>
        )}
      </StaffMain>
    </div>
  )
}

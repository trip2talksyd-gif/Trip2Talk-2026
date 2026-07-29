import { useRef, useState, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Camera, Loader2 } from 'lucide-react'
import {
  generateCaption,
  insertContentPostDraft,
  uploadContentPhoto,
} from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import { useToast } from '../../components/ui/Toast'

type Phase = 'idle' | 'uploading' | 'generating' | 'saving' | 'done'

export default function QuickPost() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const busy = phase === 'uploading' || phase === 'generating' || phase === 'saving'

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast('กรุณาเลือกรูปภาพ', 'error')
      return
    }

    setPhase('uploading')
    const localPreview = URL.createObjectURL(file)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return localPreview
    })

    try {
      let imageUrl: string
      try {
        imageUrl = await uploadContentPhoto(file)
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
        toast('สร้างแคปชันไม่สำเร็จ ลองอีกครั้ง', 'error')
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
    phase === 'uploading'
      ? 'กำลังอัปโหลดรูป…'
      : phase === 'generating'
        ? 'กำลังเขียนแคปชัน…'
        : phase === 'saving'
          ? 'กำลังบันทึกร่าง…'
          : null

  return (
    <div className="min-h-svh bg-near-black-green text-cream">
      <header className="border-b border-white/8 px-4 py-4">
        <Link to="/app/owner" className="text-sm text-gold">
          ← แดชบอร์ดเจ้าของ
        </Link>
        <h1 className="mt-2 font-serif text-lg text-cream">Quick Post</h1>
        <p className="mt-1 text-sm text-cream-muted">
          อัปโหลดรูป → AI ร่างแคปชัน → ไปรีวิวทีหลัง
        </p>
      </header>

      <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-8">
        {phase === 'done' ? (
          <div className="space-y-6 text-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt=""
                className="mx-auto aspect-square w-full max-w-xs rounded-editorial object-cover"
              />
            ) : (
              <div className="mx-auto flex aspect-square w-full max-w-xs items-center justify-center rounded-editorial border border-white/8 bg-surface-card/50">
                <Loader2 className="h-8 w-8 animate-spin text-gold" aria-hidden />
              </div>
            )}
            <p className="text-base text-cream">โพสต์ร่างแล้ว ไปดูที่หน้ารีวิว</p>
            <Link
              to="/admin/content-review"
              className="inline-flex min-h-14 w-full items-center justify-center rounded-editorial border border-gold/40 bg-gold/15 px-4 text-base font-medium text-gold"
            >
              ไปหน้ารีวิว
            </Link>
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-editorial border border-white/15 px-4 text-sm text-cream-muted"
            >
              อัปโหลดรูปอื่น
            </button>
          </div>
        ) : (
          <>
            {previewUrl && (
              <img
                src={previewUrl}
                alt=""
                className="mx-auto aspect-square w-full max-w-xs rounded-editorial object-cover opacity-90"
              />
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              disabled={busy}
              onChange={(e) => void handleFile(e)}
            />

            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="flex min-h-16 w-full items-center justify-center gap-3 rounded-editorial border border-gold/40 bg-gold/15 px-4 text-lg font-medium text-gold transition-colors hover:bg-gold/25 disabled:opacity-60"
            >
              {busy ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
                  {statusLabel}
                </>
              ) : (
                <>
                  <Camera className="h-6 w-6" aria-hidden />
                  อัปโหลดรูป
                </>
              )}
            </button>

            {busy && (
              <div
                className="flex flex-col items-center gap-3 rounded-editorial border border-white/8 bg-surface-card/40 py-8"
                role="status"
                aria-live="polite"
                aria-busy="true"
              >
                <Loader2 className="h-10 w-10 animate-spin text-gold" />
                <p className="text-sm text-cream-muted">{statusLabel}</p>
              </div>
            )}

            {!busy && !previewUrl && (
              <p className="text-center text-sm text-cream-muted">
                แตะปุ่มด้านบนเพื่อถ่ายหรือเลือกรูปจากเครื่อง
              </p>
            )}
          </>
        )}
      </main>
    </div>
  )
}

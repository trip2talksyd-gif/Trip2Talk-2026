import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Download, ExternalLink, ImagePlus, Loader2 } from 'lucide-react'
import {
  approveContentPost,
  fetchDraftContentPosts,
  fetchManualPendingContentPosts,
  formatDate,
  listTripPhotoUrls,
  markContentPostPosted,
  rejectContentPost,
  uploadContentPhoto,
} from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import type { ContentPost } from '../../types/tour'
import {
  isManualTargetAccount,
  targetAccountLabel,
  targetAccountOpenUrl,
} from '../../data/facebookDestinations'
import { getGalleryPhotosForTrip, photoSrc } from '../../data/galleryPhotos'
import { ListRowSkeleton } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import {
  StaffButton,
  StaffCard,
  StaffMain,
  StaffPageHeader,
  staffShellClass,
} from '../../components/app/staffUi'

const MAX_PHOTOS = 4

/** Seed drafts used placehold.co — never treat those as publishable photos. */
function isUsablePhotoUrl(url: string | null | undefined): boolean {
  const u = (url ?? '').trim()
  if (!u) return false
  if (!/^https?:\/\//i.test(u)) return false
  if (/placehold\.co/i.test(u)) return false
  if (/via\.placeholder\.com/i.test(u)) return false
  if (/dummyimage\.com/i.test(u)) return false
  if (/picsum\.photos/i.test(u)) return false
  return true
}

/** Real destination gallery + trip cover for Content Review photo picking. */
function galleryUrlsForTrip(tripCode: string | null | undefined, coverUrl?: string | null): string[] {
  const urls: string[] = []
  if (isUsablePhotoUrl(coverUrl)) urls.push(coverUrl!.trim())
  if (tripCode) {
    for (const photo of getGalleryPhotosForTrip(tripCode)) {
      const src = photoSrc(photo)
      if (isUsablePhotoUrl(src)) urls.push(src)
    }
  }
  return [...new Set(urls)]
}

type CardDraft = {
  selectedHeadline: string
  caption: string
  selectedUrls: string[]
  availableUrls: string[]
  photosLoading: boolean
  busy: boolean
}

function fullCaption(post: ContentPost, draftCaption?: string): string {
  const headline = (post.selected_headline || '').trim()
  const body = (draftCaption ?? post.caption_fb ?? '').trim()
  if (headline && body) return `${headline}\n\n${body}`
  return headline || body
}

function initialDraft(post: ContentPost): CardDraft {
  const options = post.headline_options
  const selectedHeadline =
    post.selected_headline && options.includes(post.selected_headline)
      ? post.selected_headline
      : (options[0] ?? '')
  const seedPhotos = (post.photo_urls ?? []).filter(isUsablePhotoUrl).slice(0, MAX_PHOTOS)
  const noTrip = !post.trip_id
  const needsStoragePicker = !noTrip
  return {
    selectedHeadline,
    caption: post.caption_fb ?? '',
    selectedUrls: seedPhotos,
    availableUrls: noTrip ? [...new Set(seedPhotos)] : [],
    photosLoading: needsStoragePicker,
    busy: false,
  }
}

async function downloadImagesIndividually(urls: string[]) {
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const ext = blob.type.split('/')[1] || 'jpg'
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `fb-group-${i + 1}.${ext}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(a.href)
      // Brief gap so browsers don't coalesce downloads
      await new Promise((r) => setTimeout(r, 250))
    } catch (err) {
      console.error('[ContentReview] download failed', url, err)
    }
  }
}

/** Approved Group post — manual tools only (no Graph API). */
function ManualGroupCard({
  post,
  onPosted,
}: {
  post: ContentPost
  onPosted: () => void
}) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  const caption = fullCaption(post)
  const photos = post.photo_urls ?? []
  const openUrl = targetAccountOpenUrl(post.target_account, post.group_id)
  const openLabel = 'Open Group'

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(caption)
      toast('คัดลอกแคปชันแล้ว', 'success')
    } catch {
      toast('คัดลอกไม่สำเร็จ', 'error')
    }
  }

  async function downloadImages() {
    if (!photos.length) {
      toast('ไม่มีรูปให้ดาวน์โหลด', 'info')
      return
    }
    toast(`กำลังดาวน์โหลด ${photos.length} รูป…`, 'info')
    await downloadImagesIndividually(photos)
  }

  async function handleMarkPosted() {
    setBusy(true)
    try {
      await markContentPostPosted(post.id)
      toast('บันทึกว่าโพสต์แล้ว', 'success')
      onPosted()
    } catch (err) {
      console.error('[ContentReview] mark posted failed:', err)
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast('บันทึกไม่สำเร็จ ลองอีกครั้ง', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="space-y-4 rounded-editorial border border-gold/30 bg-gold/5 p-4">
      <header className="flex flex-wrap items-center gap-2">
        <span className="inline-block rounded-editorial border border-gold/40 bg-gold/15 px-2.5 py-1 text-xs font-medium text-gold">
          Manual · {targetAccountLabel(post.target_account)}
        </span>
        <span className="text-xs text-cream-muted">approved_pending_manual_post</span>
      </header>

      {post.selected_headline ? (
        <h2 className="font-serif text-base text-cream">{post.selected_headline}</h2>
      ) : null}

      <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-editorial border border-white/8 bg-near-black-green/50 px-3 py-2 text-sm text-cream">
        {caption || '—'}
      </pre>

      {photos.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {photos.map((url) => (
            <li key={url} className="overflow-hidden rounded-editorial border border-white/8">
              <img src={url} alt="" className="aspect-square w-full object-cover" loading="lazy" />
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => void copyCaption()}
          className="rounded-editorial border border-white/15 bg-near-black-green px-4 py-2.5 text-sm font-medium text-cream hover:border-gold/40"
        >
          Copy Caption
        </button>
        <button
          type="button"
          onClick={() => void downloadImages()}
          className="inline-flex items-center justify-center gap-2 rounded-editorial border border-white/15 bg-near-black-green px-4 py-2.5 text-sm font-medium text-cream hover:border-gold/40"
        >
          <Download className="h-4 w-4" aria-hidden />
          Download Images
        </button>
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-editorial border border-[#1877F2]/40 bg-[#1877F2]/15 px-4 py-2.5 text-sm font-medium text-[#8AB4F8] no-underline hover:bg-[#1877F2]/25"
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
          {openLabel}
        </a>
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleMarkPosted()}
          className="rounded-editorial border border-gold/40 bg-gold/15 px-4 py-2.5 text-sm font-medium text-gold hover:bg-gold/25 disabled:opacity-50 sm:ml-auto"
        >
          {busy ? 'กำลังบันทึก…' : 'Mark as Posted'}
        </button>
      </div>
    </article>
  )
}

function ReviewCard({
  post,
  draft,
  onDraftChange,
  onDismiss,
  onRestore,
  onManualApproved,
}: {
  post: ContentPost
  draft: CardDraft
  onDraftChange: (next: Partial<CardDraft>) => void
  onDismiss: () => void
  onRestore: () => void
  onManualApproved: (post: ContentPost) => void
}) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const tour = post.tours
  const noTrip = !post.trip_id
  const isManual = isManualTargetAccount(post.target_account)
  const canAddMore = draft.selectedUrls.length < MAX_PHOTOS

  useEffect(() => {
    if (noTrip || !post.trip_id) {
      onDraftChange({ photosLoading: false })
      return
    }

    let cancelled = false
    const seedSelected = draft.selectedUrls.filter(isUsablePhotoUrl)
    const tripId = post.trip_id
    const tripCode = tour?.trip_code
    const coverUrl = tour?.cover_image_url ?? null
    const fromGallery = galleryUrlsForTrip(tripCode, coverUrl)

    ;(async () => {
      try {
        const fromStorage = (await listTripPhotoUrls(tripId)).filter(isUsablePhotoUrl)
        if (cancelled) return
        const merged = [...new Set([...seedSelected, ...fromGallery, ...fromStorage])]
        onDraftChange({
          availableUrls: merged,
          photosLoading: false,
          selectedUrls: seedSelected.filter((u) => merged.includes(u)),
        })
      } catch (err) {
        console.error('[ContentReview] listTripPhotoUrls failed:', err)
        if (cancelled) return
        // Gallery still works even if Storage list fails
        const merged = [...new Set([...seedSelected, ...fromGallery])]
        onDraftChange({
          availableUrls: merged,
          photosLoading: false,
          selectedUrls: seedSelected.filter((u) => merged.includes(u)),
        })
        if (fromGallery.length === 0) {
          toast('โหลดรูปทริปไม่สำเร็จ', 'error')
        }
      }
    })()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.trip_id, noTrip, tour?.trip_code, tour?.cover_image_url])

  function togglePhoto(url: string) {
    if (!isUsablePhotoUrl(url)) {
      toast('รูปนี้ใช้ไม่ได้ — เลือกรูปจริงจากแกลเลอรีหรืออัปโหลด', 'error')
      return
    }
    const has = draft.selectedUrls.includes(url)
    if (has) {
      onDraftChange({ selectedUrls: draft.selectedUrls.filter((u) => u !== url) })
      return
    }
    if (draft.selectedUrls.length >= MAX_PHOTOS) {
      toast(`เลือกได้สูงสุด ${MAX_PHOTOS} รูป`, 'info')
      return
    }
    onDraftChange({ selectedUrls: [...draft.selectedUrls, url] })
  }

  async function handleUploadFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith('image/'))
    e.target.value = ''
    if (!files.length) {
      toast('กรุณาเลือกรูปภาพ', 'error')
      return
    }

    const slots = MAX_PHOTOS - draft.selectedUrls.length
    if (slots <= 0) {
      toast(`เลือกได้สูงสุด ${MAX_PHOTOS} รูป`, 'info')
      return
    }

    const toUpload = files.slice(0, slots)
    if (files.length > slots) {
      toast(`อัปโหลดได้เพิ่มอีก ${slots} รูป (สูงสุด ${MAX_PHOTOS})`, 'info')
    }

    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of toUpload) {
        uploaded.push(await uploadContentPhoto(file))
      }
      onDraftChange({
        availableUrls: [...new Set([...draft.availableUrls, ...uploaded])],
        selectedUrls: [...draft.selectedUrls, ...uploaded],
      })
      toast(`เพิ่มแล้ว ${uploaded.length} รูป`, 'success')
    } catch (err) {
      console.error('[ContentReview] upload failed:', err)
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast('อัปโหลดรูปไม่สำเร็จ ลองอีกครั้ง', 'error')
    } finally {
      setUploading(false)
    }
  }

  async function handleReject() {
    onDraftChange({ busy: true })
    onDismiss()
    try {
      await rejectContentPost(post.id)
      toast('ปฏิเสธโพสต์แล้ว', 'success')
    } catch (err) {
      console.error('[ContentReview] reject failed:', err)
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast('ปฏิเสธไม่สำเร็จ ลองอีกครั้ง', 'error')
      onDraftChange({ busy: false })
      onRestore()
    }
  }

  async function handleApprove() {
    if (!draft.selectedHeadline.trim()) {
      toast('กรุณาเลือกหัวข้อ', 'error')
      return
    }
    const realPhotos = draft.selectedUrls.filter(isUsablePhotoUrl)
    if (realPhotos.length < 1 || realPhotos.length > MAX_PHOTOS) {
      toast(`กรุณาเลือก 1–${MAX_PHOTOS} รูปจริงจากแกลเลอรีหรืออัปโหลด`, 'error')
      return
    }

    onDraftChange({ busy: true })
    onDismiss()
    try {
      const result = await approveContentPost(post.id, {
        selected_headline: draft.selectedHeadline.trim(),
        caption_fb: draft.caption,
        photo_urls: realPhotos,
      })

      if (isManualTargetAccount(result.target_account ?? post.target_account)) {
        toast('อนุมัติแล้ว — โพสต์ด้วยมือ (ไม่ยิง Graph API)', 'success')
        onManualApproved({
          ...post,
          status: 'approved_pending_manual_post',
          selected_headline: draft.selectedHeadline.trim(),
          caption_fb: draft.caption,
          photo_urls: realPhotos,
          target_account: result.target_account ?? post.target_account,
        })
      } else if (result.status === 'posted') {
        toast('โพสต์ขึ้นเพจแล้วผ่าน Graph API', 'success')
      } else {
        toast('อนุมัติแล้ว', 'success')
      }
    } catch (err) {
      console.error('[ContentReview] approve failed:', err)
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      const msg =
        err instanceof Error && err.message.trim()
          ? err.message.trim()
          : 'อนุมัติไม่สำเร็จ ลองอีกครั้ง'
      toast(msg.length > 220 ? `${msg.slice(0, 217)}…` : msg, 'error')
      onDraftChange({ busy: false })
      onRestore()
    }
  }

  return (
    <article className="space-y-4 rounded-editorial border border-white/8 bg-surface-card p-4">
      <header className="space-y-2">
        {isManual ? (
          <span className="inline-block rounded-editorial border border-coral/40 bg-coral/10 px-2.5 py-1 text-xs font-medium text-coral">
            {targetAccountLabel(post.target_account)} · Manual post only
          </span>
        ) : post.target_account ? (
          <span className="inline-block rounded-editorial border border-gold/40 bg-gold/15 px-2.5 py-1 text-xs font-medium text-gold">
            {targetAccountLabel(post.target_account)} · Graph auto
          </span>
        ) : (
          <span className="inline-block rounded-editorial border border-coral/40 bg-coral/10 px-2.5 py-1 text-xs font-medium text-coral">
            Missing target_account
          </span>
        )}
        {noTrip ? (
          <span className="inline-block rounded-editorial border border-gold/40 bg-gold/15 px-2.5 py-1 text-xs font-medium text-gold">
            Value content
          </span>
        ) : (
          <>
            <h2 className="font-serif text-base text-cream">
              {tour?.name_en ?? 'ไม่พบทริป'}
              {tour?.name_th ? (
                <span className="ml-2 font-sans text-sm text-cream-muted">{tour.name_th}</span>
              ) : null}
            </h2>
            <p className="mt-1 text-xs text-cream-muted">
              {tour?.trip_code ? `${tour.trip_code} · ` : ''}
              {formatDate(tour?.departure_date ?? null)}
              {tour ? ` · ${tour.booked_seats}/${tour.max_seats} ที่นั่ง` : ''}
            </p>
          </>
        )}
      </header>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-cream-muted">หัวข้อ</legend>
        {post.headline_options.length === 0 ? (
          <p className="text-sm text-cream-muted">ยังไม่มีตัวเลือกหัวข้อ</p>
        ) : (
          <ul className="space-y-2">
            {post.headline_options.map((opt) => (
              <li key={opt}>
                <label className="flex cursor-pointer items-start gap-3 rounded-editorial border border-white/8 bg-near-black-green/40 px-3 py-2.5 transition-colors hover:border-white/15 has-[:checked]:border-gold/50 has-[:checked]:bg-gold/10">
                  <input
                    type="radio"
                    name={`headline-${post.id}`}
                    value={opt}
                    checked={draft.selectedHeadline === opt}
                    onChange={() => onDraftChange({ selectedHeadline: opt })}
                    className="mt-1 accent-[var(--color-gold,#D4A853)]"
                  />
                  <span className="text-sm text-cream">{opt}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <label className="block">
        <span className="text-sm font-medium text-cream-muted">แคปชัน Facebook</span>
        <textarea
          value={draft.caption}
          onChange={(e) => onDraftChange({ caption: e.target.value })}
          rows={5}
          className="mt-1.5 w-full rounded-editorial border border-white/15 bg-near-black-green px-3 py-2 text-sm text-cream placeholder:text-cream-muted/50 focus:border-gold/50 focus:outline-none"
        />
      </label>

      <div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-cream-muted">
            รูปภาพ <span className="text-cream-muted/70">(1–{MAX_PHOTOS})</span>
          </span>
          <span
            className={`text-xs ${
              draft.selectedUrls.length >= 1 ? 'text-teal-400' : 'text-coral'
            }`}
          >
            เลือกแล้ว {draft.selectedUrls.length}/{MAX_PHOTOS}
          </span>
        </div>
        <p className="mt-1.5 text-xs text-cream-muted">
          {noTrip
            ? 'แตะรูปเพื่อเลือก/ยกเลิก หรือกด + เพิ่มรูป เพื่ออัปโหลดจากเครื่อง'
            : 'แตะเลือกรูปจริงจากแกลเลอรีทริป (หรือกด + เพิ่มรูป จากเครื่อง) — ห้ามใช้ placeholder'}
        </p>
        {!noTrip && (post.photo_urls?.length ?? 0) === 0 && draft.availableUrls.length === 0 && (
          <p className="mt-1 text-xs text-cream-muted">
            ร่างจาก AI ยังไม่มีรูป — อัปโหลดรูป หรือใส่รูปใน Storage แล้วรีเฟรช
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          disabled={draft.busy || uploading || !canAddMore}
          onChange={(e) => void handleUploadFiles(e)}
        />

        {draft.photosLoading ? (
          <div
            className="mt-3 flex items-center justify-center gap-2 py-8 text-sm text-cream-muted"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-5 w-5 animate-spin text-gold" aria-hidden />
            กำลังโหลดรูปจาก Storage…
          </div>
        ) : (
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {draft.availableUrls.map((url) => {
              const checked = draft.selectedUrls.includes(url)
              return (
                <li key={url}>
                  <button
                    type="button"
                    onClick={() => togglePhoto(url)}
                    aria-pressed={checked}
                    className={`relative block w-full cursor-pointer overflow-hidden rounded-editorial border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${
                      checked
                        ? 'border-gold ring-1 ring-gold/40'
                        : 'border-white/8 hover:border-gold/40'
                    }`}
                  >
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      className="aspect-[3/2] w-full bg-near-black-green object-cover"
                    />
                    <span
                      className={`absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-md border text-[10px] ${
                        checked
                          ? 'border-gold bg-gold text-near-black-green'
                          : 'border-white/40 bg-near-black-green/70 text-cream'
                      }`}
                      aria-hidden
                    >
                      {checked ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                    </span>
                    <span className="sr-only">{checked ? 'ยกเลิกเลือก' : 'เลือก'}รูปนี้</span>
                  </button>
                </li>
              )
            })}

            {canAddMore ? (
              <li>
                <button
                  type="button"
                  disabled={draft.busy || uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-[3/2] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-editorial border border-dashed border-gold/50 bg-gold/5 px-3 text-center transition-colors hover:border-gold hover:bg-gold/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-7 w-7 animate-spin text-gold" aria-hidden />
                      <span className="text-xs font-medium text-cream-muted">กำลังอัปโหลด…</span>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-7 w-7 text-gold" aria-hidden />
                      <span className="text-sm font-medium text-gold">+ เพิ่มรูป</span>
                      <span className="text-[10px] text-cream-muted">Add photo · จากเครื่อง</span>
                    </>
                  )}
                </button>
              </li>
            ) : null}
          </ul>
        )}

        {!draft.photosLoading && draft.selectedUrls.length < 1 && (
          <p className="mt-2 text-xs text-coral" role="alert">
            กรุณาเลือก 1–{MAX_PHOTOS} รูป
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={draft.busy}
          onClick={handleReject}
          className="rounded-editorial border border-coral/50 bg-coral/10 px-4 py-2.5 text-sm font-medium text-coral transition-colors hover:bg-coral/20 disabled:opacity-50"
        >
          ปฏิเสธ
        </button>
        <button
          type="button"
          disabled={
            draft.busy ||
            uploading ||
            !draft.selectedHeadline.trim() ||
            draft.selectedUrls.filter(isUsablePhotoUrl).length < 1 ||
            draft.selectedUrls.filter(isUsablePhotoUrl).length > MAX_PHOTOS
          }
          onClick={handleApprove}
          className="rounded-editorial border border-gold/40 bg-gold/15 px-4 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isManual ? 'Approve (manual post)' : 'Approve & publish to Page'}
        </button>
      </div>
    </article>
  )
}

export default function ContentReview() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [manualPosts, setManualPosts] = useState<ContentPost[]>([])
  const [drafts, setDrafts] = useState<Record<string, CardDraft>>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [draftRows, manualRows] = await Promise.all([
        fetchDraftContentPosts(),
        fetchManualPendingContentPosts(),
      ])
      setPosts(draftRows)
      setManualPosts(manualRows)
      setDrafts(Object.fromEntries(draftRows.map((p) => [p.id, initialDraft(p)])))
    } catch (err) {
      console.error('[ContentReview] load failed:', err)
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      setPosts([])
      setManualPosts([])
      setDrafts({})
      toast('โหลดโพสต์ร่างไม่สำเร็จ ลองอีกครั้ง', 'error')
    } finally {
      setLoading(false)
    }
  }, [navigate, toast])

  useEffect(() => {
    void load()
  }, [load])

  function patchDraft(id: string, next: Partial<CardDraft>) {
    setDrafts((prev) => {
      const cur = prev[id]
      if (!cur) return prev
      return { ...prev, [id]: { ...cur, ...next } }
    })
  }

  function dismissCard(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  function restoreCard(post: ContentPost) {
    setPosts((prev) => {
      if (prev.some((p) => p.id === post.id)) return prev
      return [...prev, post].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    })
  }

  function addManual(post: ContentPost) {
    setManualPosts((prev) => {
      if (prev.some((p) => p.id === post.id)) return prev
      return [post, ...prev]
    })
  }

  return (
    <div className={staffShellClass}>
      <StaffPageHeader
        backTo="/app/owner"
        backLabel="← แดชบอร์ดเจ้าของ"
        title="รีวิวคอนเทนต์"
        subtitle="Page → Graph auto-publish · Thai-Aus Group → คัดลอกแล้วโพสต์มือ"
      />

      <StaffMain className="space-y-8">
        {loading && (
          <div role="status" aria-live="polite" aria-busy="true">
            <p className="mb-3 flex items-center gap-2 text-sm text-cream-muted">
              <Loader2 className="h-4 w-4 animate-spin text-gold" aria-hidden />
              กำลังโหลดโพสต์ร่าง…
            </p>
            <ListRowSkeleton count={3} />
          </div>
        )}

        {!loading && manualPosts.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-serif text-base text-cream">รอโพสต์กลุ่ม Thai-Aus (Manual)</h2>
            {manualPosts.map((post) => (
              <ManualGroupCard
                key={post.id}
                post={post}
                onPosted={() =>
                  setManualPosts((prev) => prev.filter((p) => p.id !== post.id))
                }
              />
            ))}
          </section>
        )}

        {!loading && posts.length === 0 && manualPosts.length === 0 && (
          <StaffCard className="bg-surface-card/50 py-10 text-center">
            <p className="text-base text-cream">ยังไม่มีโพสต์ร่างให้รีวิว</p>
            <p className="mt-2 text-sm text-cream-muted">
              เมื่อมีร่างใหม่จาก Quick Post หรือ Make.com จะโชว์ที่นี่
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link to="/app/quick-post" className="block sm:inline-block">
                <StaffButton variant="secondary" className="min-h-12 text-sm">
                  ไป Quick Post
                </StaffButton>
              </Link>
              <StaffButton
                variant="secondary"
                className="min-h-12 text-sm"
                onClick={() => void load()}
              >
                รีเฟรช
              </StaffButton>
            </div>
          </StaffCard>
        )}

        {!loading && posts.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-serif text-base text-cream">ร่างรออนุมัติ</h2>
            {posts.map((post) => {
              const draft = drafts[post.id]
              if (!draft) return null
              return (
                <ReviewCard
                  key={post.id}
                  post={post}
                  draft={draft}
                  onDraftChange={(next) => patchDraft(post.id, next)}
                  onDismiss={() => dismissCard(post.id)}
                  onRestore={() => restoreCard(post)}
                  onManualApproved={addManual}
                />
              )
            })}
          </section>
        )}
      </StaffMain>
    </div>
  )
}

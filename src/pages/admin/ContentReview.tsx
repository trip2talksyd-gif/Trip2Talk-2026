import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import {
  approveContentPost,
  fetchDraftContentPosts,
  formatDate,
  listTripPhotoUrls,
  rejectContentPost,
} from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import type { ContentPost } from '../../types/tour'
import { ListRowSkeleton } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'

const MAX_PHOTOS = 4

type CardDraft = {
  selectedHeadline: string
  caption: string
  selectedUrls: string[]
  availableUrls: string[]
  photosLoading: boolean
  busy: boolean
}

function initialDraft(post: ContentPost): CardDraft {
  const options = post.headline_options
  const selectedHeadline =
    post.selected_headline && options.includes(post.selected_headline)
      ? post.selected_headline
      : (options[0] ?? '')
  const seedPhotos = (post.photo_urls ?? []).slice(0, MAX_PHOTOS)
  const noTrip = !post.trip_id
  // trip_promo AI drafts often ship with photo_urls=[] — always load Storage picker
  const needsStoragePicker = !noTrip
  return {
    selectedHeadline,
    caption: post.caption_fb ?? '',
    selectedUrls: seedPhotos,
    availableUrls: noTrip ? [...new Set(post.photo_urls ?? [])] : [],
    photosLoading: needsStoragePicker,
    busy: false,
  }
}

function ReviewCard({
  post,
  draft,
  onDraftChange,
  onDismiss,
  onRestore,
}: {
  post: ContentPost
  draft: CardDraft
  onDraftChange: (next: Partial<CardDraft>) => void
  onDismiss: () => void
  onRestore: () => void
}) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const tour = post.tours
  const noTrip = !post.trip_id

  useEffect(() => {
    if (noTrip || !post.trip_id) {
      onDraftChange({ photosLoading: false })
      return
    }

    let cancelled = false
    const seedSelected = draft.selectedUrls
    const tripId = post.trip_id

    ;(async () => {
      try {
        const urls = await listTripPhotoUrls(tripId)
        if (cancelled) return
        const merged = [...new Set([...seedSelected, ...urls])]
        onDraftChange({
          availableUrls: merged,
          photosLoading: false,
          selectedUrls: seedSelected.filter((u) => merged.includes(u)),
        })
      } catch (err) {
        console.error('[ContentReview] listTripPhotoUrls failed:', err)
        if (cancelled) return
        onDraftChange({
          availableUrls: seedSelected,
          photosLoading: false,
        })
        toast('โหลดรูปทริปไม่สำเร็จ', 'error')
      }
    })()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.trip_id, noTrip])

  function togglePhoto(url: string) {
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
    if (draft.selectedUrls.length < 1 || draft.selectedUrls.length > MAX_PHOTOS) {
      toast(`กรุณาเลือก 1–${MAX_PHOTOS} รูป`, 'error')
      return
    }

    onDraftChange({ busy: true })
    onDismiss()
    try {
      await approveContentPost(post.id, {
        selected_headline: draft.selectedHeadline.trim(),
        caption_fb: draft.caption,
        photo_urls: draft.selectedUrls,
      })
      toast('อนุมัติแล้ว — Make.com จะโพสต์ให้', 'success')
    } catch (err) {
      console.error('[ContentReview] approve failed:', err)
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast('อนุมัติไม่สำเร็จ ลองอีกครั้ง', 'error')
      onDraftChange({ busy: false })
      onRestore()
    }
  }

  return (
    <article className="space-y-4 rounded-editorial border border-white/8 bg-surface-card p-4">
      <header>
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
          <span className="text-xs text-cream-muted">
            เลือกแล้ว {draft.selectedUrls.length}/{MAX_PHOTOS}
          </span>
        </div>
        {!noTrip && (post.photo_urls?.length ?? 0) === 0 && (
          <p className="mt-1.5 text-xs text-cream-muted">
            ร่างจาก AI ยังไม่มีรูป — เลือกจากโฟลเดอร์ trip-photos ของทริปนี้
          </p>
        )}
        {draft.photosLoading ? (
          <div
            className="mt-3 flex items-center justify-center gap-2 py-8 text-sm text-cream-muted"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-5 w-5 animate-spin text-gold" aria-hidden />
            กำลังโหลดรูปจาก Storage…
          </div>
        ) : draft.availableUrls.length === 0 ? (
          <p className="mt-3 text-sm text-cream-muted">
            {noTrip
              ? 'ยังไม่มีรูปในร่างนี้'
              : 'ไม่พบรูปใน trip-photos ของทริปนี้ — อัปโหลดรูปเข้า Storage ก่อนแล้วรีเฟรช'}
          </p>
        ) : (
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {draft.availableUrls.map((url) => {
              const checked = draft.selectedUrls.includes(url)
              return (
                <li key={url}>
                  <label
                    className={`relative block cursor-pointer overflow-hidden rounded-editorial border transition-colors ${
                      checked ? 'border-gold ring-1 ring-gold/40' : 'border-white/8'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePhoto(url)}
                      className="absolute left-2 top-2 z-10 accent-[var(--color-gold,#D4A853)]"
                    />
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      className="aspect-square w-full object-cover"
                    />
                  </label>
                </li>
              )
            })}
          </ul>
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
          disabled={draft.busy}
          onClick={handleApprove}
          className="rounded-editorial border border-gold/40 bg-gold/15 px-4 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/25 disabled:opacity-50"
        >
          อนุมัติและโพสต์
        </button>
      </div>
    </article>
  )
}

export default function ContentReview() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [drafts, setDrafts] = useState<Record<string, CardDraft>>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await fetchDraftContentPosts()
      setPosts(rows)
      setDrafts(Object.fromEntries(rows.map((p) => [p.id, initialDraft(p)])))
    } catch (err) {
      console.error('[ContentReview] load failed:', err)
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      setPosts([])
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

  return (
    <div className="min-h-svh bg-near-black-green text-cream">
      <header className="border-b border-white/8 px-4 py-4">
        <Link to="/app/owner" className="text-sm text-gold">
          ← แดชบอร์ดเจ้าของ
        </Link>
        <h1 className="mt-2 font-serif text-lg text-cream">รีวิวคอนเทนต์</h1>
        <p className="mt-1 text-sm text-cream-muted">
          อนุมัติโพสต์ร่างก่อน Make.com โพสต์ขึ้น Facebook
        </p>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        {loading && (
          <div role="status" aria-live="polite" aria-busy="true">
            <p className="mb-3 flex items-center gap-2 text-sm text-cream-muted">
              <Loader2 className="h-4 w-4 animate-spin text-gold" aria-hidden />
              กำลังโหลดโพสต์ร่าง…
            </p>
            <ListRowSkeleton count={3} />
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="rounded-editorial border border-white/8 bg-surface-card/50 px-4 py-10 text-center">
            <p className="text-base text-cream">ยังไม่มีโพสต์ร่างให้รีวิว</p>
            <p className="mt-2 text-sm text-cream-muted">
              เมื่อมีร่างใหม่จาก Quick Post หรือ Make.com จะโชว์ที่นี่
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link
                to="/app/quick-post"
                className="inline-flex min-h-12 items-center justify-center rounded-editorial border border-gold/40 bg-gold/15 px-4 text-sm font-medium text-gold"
              >
                ไป Quick Post
              </Link>
              <button
                type="button"
                onClick={() => void load()}
                className="inline-flex min-h-12 items-center justify-center rounded-editorial border border-white/15 px-4 text-sm text-cream-muted"
              >
                รีเฟรช
              </button>
            </div>
          </div>
        )}

        {!loading &&
          posts.map((post) => {
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
              />
            )
          })}
      </main>
    </div>
  )
}

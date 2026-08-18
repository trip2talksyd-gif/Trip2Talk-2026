import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ExternalLink, ImagePlus, Loader2, MapPin, Pencil, Play, Plus, Trash2, X } from 'lucide-react'
import {
  StaffButton,
  StaffCard,
  StaffField,
  StaffInput,
  StaffMain,
  StaffPageHeader,
  StaffSelect,
  StaffTextarea,
  staffShellClass,
  staffTabActiveClass,
  staffTabIdleClass,
} from '../../components/app/staffUi'
import SpotLocationPicker from '../../components/spots/SpotLocationPicker'
import { DashboardCardSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import { useToast } from '../../components/ui/Toast'
import {
  PHOTO_SPOT_EDIT_CATEGORIES,
  PHOTO_SPOT_MAX_GALLERY,
  type CameraModeSettings,
  type DroneAllowed,
  type PhotoSpotRow,
} from '../../data/photoSpotsDraft'
import {
  deletePhotoSpot,
  listPhotoSpotsAdmin,
  uploadPhotoSpotImage,
  uploadPhotoSpotVideo,
  PHOTO_SPOT_VIDEO_TOO_LARGE,
  upsertPhotoSpot,
} from '../../lib/photoSpotsApi'
import { fetchToursAdmin } from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import { storageImageSrc, STORAGE_IMG } from '../../lib/storageImage'

type FormState = {
  id?: string
  slug: string
  title_en: string
  title_th: string
  location_en: string
  location_th: string
  description_en: string
  description_th: string
  categories: string[]
  latitude: number | null
  longitude: number | null
  best_time: string
  best_season: string
  drive_time_from_sydney: string
  access_private_car: string
  access_public_transport: string
  landscape: CameraModeSettings
  portrait: CameraModeSettings
  tips_en: string
  tips_th: string
  warnings_en: string
  warnings_th: string
  drone_allowed: DroneAllowed
  drone_notes: string
  related_trip_code: string
  hero_image_url: string
  thumbnail_url: string
  gallery_image_urls: string[]
  video_url: string
  is_featured: boolean
  sort_order: string
}

const emptyMode = (): CameraModeSettings => ({
  aperture: '',
  iso: '',
  shutter: '',
  filter: '',
})

function emptyForm(): FormState {
  return {
    slug: '',
    title_en: '',
    title_th: '',
    location_en: '',
    location_th: '',
    description_en: '',
    description_th: '',
    categories: [],
    latitude: null,
    longitude: null,
    best_time: '',
    best_season: '',
    drive_time_from_sydney: '',
    access_private_car: '',
    access_public_transport: '',
    landscape: emptyMode(),
    portrait: emptyMode(),
    tips_en: '',
    tips_th: '',
    warnings_en: '',
    warnings_th: '',
    drone_allowed: 'restricted',
    drone_notes: '',
    related_trip_code: '',
    hero_image_url: '',
    thumbnail_url: '',
    gallery_image_urls: [],
    video_url: '',
    is_featured: false,
    sort_order: '100',
  }
}

function rowToForm(row: PhotoSpotRow): FormState {
  return {
    id: row.id,
    slug: row.slug,
    title_en: row.title_en,
    title_th: row.title_th,
    location_en: row.location_en,
    location_th: row.location_th,
    description_en: row.description_en ?? '',
    description_th: row.description_th ?? '',
    categories: [...row.categories],
    latitude: row.latitude,
    longitude: row.longitude,
    best_time: row.best_time ?? '',
    best_season: row.best_season ?? '',
    drive_time_from_sydney: row.drive_time_from_sydney ?? '',
    access_private_car: row.access_private_car ?? '',
    access_public_transport: row.access_public_transport ?? '',
    landscape: { ...emptyMode(), ...(row.camera_settings.landscape ?? {}) },
    portrait: { ...emptyMode(), ...(row.camera_settings.portrait ?? {}) },
    tips_en: row.tips_en ?? '',
    tips_th: row.tips_th ?? '',
    warnings_en: row.warnings_en ?? '',
    warnings_th: row.warnings_th ?? '',
    drone_allowed: row.drone_allowed,
    drone_notes: row.drone_notes ?? '',
    related_trip_code: row.related_trip_code ?? row.linked_trip_code ?? '',
    hero_image_url: row.hero_image_url ?? '',
    thumbnail_url: row.thumbnail_url ?? row.hero_image_url ?? '',
    gallery_image_urls: [...(row.gallery_image_urls ?? [])].slice(0, PHOTO_SPOT_MAX_GALLERY),
    video_url: row.video_url ?? '',
    is_featured: row.is_featured,
    sort_order: String(row.sort_order ?? 100),
  }
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function isMissingPhoto(spot: Pick<PhotoSpotRow, 'hero_image_url' | 'thumbnail_url'>): boolean {
  return !spot.hero_image_url?.trim() && !spot.thumbnail_url?.trim()
}

function compareSpots(a: PhotoSpotRow, b: PhotoSpotRow): number {
  const missA = isMissingPhoto(a) ? 0 : 1
  const missB = isMissingPhoto(b) ? 0 : 1
  if (missA !== missB) return missA - missB
  return a.sort_order - b.sort_order || a.title_en.localeCompare(b.title_en)
}

export default function PhotoSpotsAdminPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [spots, setSpots] = useState<PhotoSpotRow[]>([])
  const [tripCodes, setTripCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [slugTouched, setSlugTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadPhase, setUploadPhase] = useState<'idle' | 'compressing' | 'uploading'>('idle')
  const [uploadProgress, setUploadProgress] = useState('')
  const uploading = uploadPhase !== 'idle'
  const [videoError, setVideoError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [listFilter, setListFilter] = useState<'missing' | 'all'>('missing')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    Promise.all([listPhotoSpotsAdmin(), fetchToursAdmin()])
      .then(([rows, tours]) => {
        setSpots(rows)
        const codes = [
          ...new Set(
            tours
              .map((t) => (t.trip_code || '').replace(/-\d{8}$/, '').trim())
              .filter(Boolean),
          ),
        ].sort((a, b) => a.localeCompare(b))
        setTripCodes(codes)
      })
      .catch((err) => {
        if (err instanceof StaffSessionExpiredError) {
          navigate('/app')
          return
        }
        console.error('[PhotoSpotsAdmin] load failed:', err)
        setError('Could not load photo spots')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setForm(emptyForm())
    setSlugTouched(false)
    setFormOpen(true)
  }

  const openEdit = (row: PhotoSpotRow) => {
    setForm(rowToForm(row))
    setSlugTouched(true)
    setFormOpen(true)
  }

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'title_en' && !slugTouched && typeof value === 'string') {
        next.slug = slugify(value)
      }
      return next
    })
  }

  const toggleCategory = (cat: string) => {
    setForm((prev) => {
      const has = prev.categories.includes(cat)
      return {
        ...prev,
        categories: has
          ? prev.categories.filter((c) => c !== cat)
          : [...prev.categories, cat],
      }
    })
  }

  const validationError = useMemo(() => {
    if (!form.title_en.trim() || !form.title_th.trim()) return 'Name (EN + TH) is required'
    if (!form.location_en.trim() || !form.location_th.trim()) {
      return 'Region / nearest town (EN + TH) is required'
    }
    if (form.categories.length < 1) return 'Select at least one category'
    if (form.latitude == null || form.longitude == null) {
      return 'Click the map to set coordinates'
    }
    return ''
  }, [form])

  const missingCount = useMemo(() => spots.filter(isMissingPhoto).length, [spots])
  const displayedSpots = useMemo(() => {
    const sorted = [...spots].sort(compareSpots)
    if (listFilter === 'missing') return sorted.filter(isMissingPhoto)
    return sorted
  }, [spots, listFilter])

  const handleUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    slot: 'hero' | 'gallery',
  ) => {
    const selected = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (selected.length === 0) return

    if (slot === 'hero') {
      const file = selected[0]
      setUploadProgress(file.name)
      setUploadPhase('compressing')
      try {
        const url = await uploadPhotoSpotImage(file, slot, setUploadPhase)
        let thumbUrl = url
        try {
          thumbUrl = await uploadPhotoSpotImage(file, 'gallery', setUploadPhase)
        } catch {
          thumbUrl = url
        }
        setForm((prev) => ({
          ...prev,
          hero_image_url: url,
          thumbnail_url: thumbUrl,
        }))
        toast(`${file.name} uploaded`, 'success')
      } catch (err) {
        console.error('[PhotoSpotsAdmin] upload failed:', err)
        toast(
          `${file.name}: ${err instanceof Error ? err.message : 'Upload failed'}`,
          'error',
        )
      } finally {
        setUploadPhase('idle')
        setUploadProgress('')
      }
      return
    }

    const room = PHOTO_SPOT_MAX_GALLERY - form.gallery_image_urls.length
    if (room <= 0) {
      toast(`Gallery max is ${PHOTO_SPOT_MAX_GALLERY} images`, 'error')
      return
    }

    const chosen = selected.slice(0, room)
    const skipped = selected.length - chosen.length
    if (skipped > 0) {
      toast(
        `Only ${room} gallery slot${room === 1 ? '' : 's'} left — skipped ${skipped} extra file${skipped === 1 ? '' : 's'}`,
        'info',
      )
    }

    for (let i = 0; i < chosen.length; i += 1) {
      const file = chosen[i]
      setUploadProgress(`${i + 1} / ${chosen.length}: ${file.name}`)
      setUploadPhase('compressing')
      try {
        const url = await uploadPhotoSpotImage(file, 'gallery', setUploadPhase)
        setForm((prev) => ({
          ...prev,
          gallery_image_urls: [...prev.gallery_image_urls, url].slice(0, PHOTO_SPOT_MAX_GALLERY),
        }))
        toast(`${file.name} uploaded`, 'success')
      } catch (err) {
        console.error('[PhotoSpotsAdmin] gallery upload failed:', err)
        toast(
          `${file.name}: ${err instanceof Error ? err.message : 'Upload failed'}`,
          'error',
        )
      }
    }

    setUploadPhase('idle')
    setUploadProgress('')
  }

  const handleVideoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setVideoError('')
    setUploadPhase('uploading')
    try {
      const url = await uploadPhotoSpotVideo(file, setUploadPhase)
      setField('video_url', url)
      toast('Video uploaded', 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      if (msg.includes('Video too large') || msg === PHOTO_SPOT_VIDEO_TOO_LARGE) {
        setVideoError(PHOTO_SPOT_VIDEO_TOO_LARGE)
      } else {
        toast(msg, 'error')
      }
    } finally {
      setUploadPhase('idle')
    }
  }

  const handleSave = async () => {
    if (validationError) {
      toast(validationError, 'error')
      return
    }
    setSaving(true)
    try {
      const saved = await upsertPhotoSpot({
        id: form.id,
        slug: form.slug || slugify(form.title_en),
        title_en: form.title_en.trim(),
        title_th: form.title_th.trim(),
        location_en: form.location_en.trim(),
        location_th: form.location_th.trim(),
        description_en: form.description_en.trim() || null,
        description_th: form.description_th.trim() || null,
        categories: form.categories,
        latitude: form.latitude!,
        longitude: form.longitude!,
        best_time: form.best_time.trim() || null,
        best_season: form.best_season.trim() || null,
        drive_time_from_sydney: form.drive_time_from_sydney.trim() || null,
        access_private_car: form.access_private_car,
        access_public_transport: form.access_public_transport.trim() || null,
        camera_settings: {
          landscape: form.landscape,
          portrait: form.portrait,
        },
        tips_en: form.tips_en.trim() || null,
        tips_th: form.tips_th.trim() || null,
        warnings_en: form.warnings_en.trim() || null,
        warnings_th: form.warnings_th.trim() || null,
        drone_allowed: form.drone_allowed,
        drone_notes: form.drone_notes.trim() || null,
        related_trip_code: form.related_trip_code.trim() || null,
        hero_image_url: form.hero_image_url.trim() || null,
        thumbnail_url: form.thumbnail_url.trim() || form.hero_image_url.trim() || null,
        gallery_image_urls: form.gallery_image_urls,
        video_url: form.video_url.trim() || null,
        is_featured: form.is_featured,
        sort_order: Number(form.sort_order) || 100,
      })
      toast(form.id ? 'Spot updated' : 'Spot created — live on /spots', 'success')
      setFormOpen(false)
      setSpots((prev) => {
        const others = prev.filter((s) => s.id !== saved.id)
        return [...others, saved].sort(compareSpots)
      })
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      console.error('[PhotoSpotsAdmin] save failed:', err)
      toast(err instanceof Error ? err.message : 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row: PhotoSpotRow) => {
    if (
      !window.confirm(
        `Delete “${row.title_en}”? This removes it from the public /spots map immediately.`,
      )
    ) {
      return
    }
    setDeletingId(row.id)
    try {
      await deletePhotoSpot(row.id)
      setSpots((prev) => prev.filter((s) => s.id !== row.id))
      if (form.id === row.id) setFormOpen(false)
      toast('Spot deleted', 'success')
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      console.error('[PhotoSpotsAdmin] delete failed:', err)
      toast(err instanceof Error ? err.message : 'Delete failed', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className={staffShellClass}>
      <StaffPageHeader
        backTo="/app/owner"
        backLabel="Owner"
        title="Photo Spots"
        subtitle="Add & edit spots — live on /spots after save"
      >
        <button type="button" className={staffTabIdleClass} onClick={openCreate}>
          <Plus className="mr-1 inline h-3.5 w-3.5" aria-hidden />
          Add New Spot
        </button>
      </StaffPageHeader>

      <StaffMain className="!max-w-7xl">
        {loading ? (
          <DashboardCardSkeleton />
        ) : error ? (
          <PageError message={error} onRetry={load} />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setListFilter('missing')}
                className={`${listFilter === 'missing' ? staffTabActiveClass : staffTabIdleClass} min-h-11 px-4 py-2 text-sm`}
              >
                ยังไม่มีรูป (Missing photos)
                <span className="ml-1.5 opacity-80">{missingCount}</span>
              </button>
              <button
                type="button"
                onClick={() => setListFilter('all')}
                className={`${listFilter === 'all' ? staffTabActiveClass : staffTabIdleClass} min-h-11 px-4 py-2 text-sm`}
              >
                All / ทั้งหมด
                <span className="ml-1.5 opacity-80">{spots.length}</span>
              </button>
            </div>

            {displayedSpots.length === 0 ? (
              <StaffCard>
                <p className="text-base text-cream-muted">
                  {listFilter === 'missing'
                    ? 'No spots missing photos. / จุดท่องเที่ยวมีรูปครบแล้ว'
                    : 'No photo spots yet. Add the first one.'}
                </p>
              </StaffCard>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {displayedSpots.map((spot) => {
                const missing = isMissingPhoto(spot)
                const thumb = spot.thumbnail_url?.trim() || spot.hero_image_url?.trim() || ''
                return (
                  <StaffCard key={spot.id} padding={false} className="flex h-full flex-col p-3">
                    <div className="relative">
                    {missing ? (
                      <div className="flex h-28 w-full items-center justify-center rounded-xl bg-amber/20 text-amber">
                        <ImagePlus className="h-8 w-8" aria-hidden />
                      </div>
                    ) : (
                      <img
                        src={storageImageSrc(thumb, STORAGE_IMG.thumb) || thumb}
                        alt=""
                        className="h-28 w-full rounded-xl object-cover"
                      />
                    )}
                    {spot.video_url?.trim() ? (
                      <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-cream">
                        <Play className="h-3 w-3 fill-cream" aria-hidden />
                        Video
                      </span>
                    ) : null}
                    </div>
                    <div className="mt-3 flex min-w-0 flex-1 flex-col">
                      {missing ? (
                        <span className="mb-1.5 inline-block w-fit rounded-full bg-amber px-2.5 py-0.5 text-[11px] font-bold text-near-black-green">
                          No photo / ยังไม่มีรูป
                        </span>
                      ) : (
                        <span className="mb-1.5 inline-block w-fit rounded-full bg-teal-500/25 px-2.5 py-0.5 text-[11px] font-medium text-teal-200">
                          Has photo / มีรูป
                        </span>
                      )}
                      <p className="text-[15px] font-semibold leading-snug text-cream">{spot.title_en}</p>
                      <p className="mt-0.5 text-[13px] leading-snug text-cream-muted">{spot.title_th}</p>
                      <p className="mt-2 flex flex-wrap gap-1 text-[11px]">
                        {spot.categories.map((c) => (
                          <span
                            key={c}
                            className="rounded-full bg-white/10 px-2 py-0.5 text-cream-muted"
                          >
                            {c}
                          </span>
                        ))}
                        <span
                          className={
                            spot.is_featured
                              ? 'rounded-full bg-amber/25 px-2 py-0.5 text-amber'
                              : 'rounded-full bg-teal-500/20 px-2 py-0.5 text-teal-300'
                          }
                        >
                          {spot.is_featured ? 'Featured' : 'Live'}
                        </span>
                      </p>
                      <p className="mt-2 flex items-start gap-1.5 text-[13px] leading-snug text-cream-muted">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                        <span className="min-w-0">{spot.location_en}</span>
                      </p>
                      <div className="mt-3 flex flex-col gap-1.5">
                        <button
                          type="button"
                          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-cream hover:bg-white/15"
                          onClick={() => openEdit(spot)}
                        >
                          <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                          Edit / แก้ไข
                        </button>
                        <button
                          type="button"
                          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-coral/20 px-3 py-2 text-sm font-medium text-coral hover:bg-coral/30 disabled:opacity-40"
                          disabled={deletingId === spot.id}
                          onClick={() => handleDelete(spot)}
                        >
                          {deletingId === spot.id ? (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                          ) : (
                            <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
                          )}
                          Delete / ลบ
                        </button>
                        <Link
                          to={`/spots/${spot.slug}`}
                          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-white/15 px-3 py-2 text-sm font-medium text-teal-200 hover:bg-white/10"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                          View public / ดูหน้าเว็บ
                        </Link>
                      </div>
                    </div>
                  </StaffCard>
                )
              })}
              </div>
            )}
          </div>
        )}

        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
            <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-near-black-green sm:rounded-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <h2 className="text-sm font-semibold text-cream">
                  {form.id ? 'Edit Photo Spot' : 'Add New Spot'}
                </h2>
                <button
                  type="button"
                  className="rounded-full p-1.5 text-cream-muted hover:bg-white/10"
                  onClick={() => setFormOpen(false)}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto px-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <StaffField label="Name (EN) *">
                    <StaffInput
                      value={form.title_en}
                      onChange={(e) => setField('title_en', e.target.value)}
                      placeholder="Bombo Headland"
                    />
                  </StaffField>
                  <StaffField label="Name (TH) *">
                    <StaffInput
                      value={form.title_th}
                      onChange={(e) => setField('title_th', e.target.value)}
                      placeholder="บอมโบ เฮดแลนด์"
                    />
                  </StaffField>
                </div>

                <div className="space-y-2 rounded-xl border border-amber/40 bg-amber/10 p-3">
                  <p className="text-sm font-semibold text-cream">
                    Images (max 5 — 1 hero + {PHOTO_SPOT_MAX_GALLERY} gallery)
                  </p>
                  <p className="text-xs text-cream-muted">
                    รูปภาพ / อัปโหลดก่อน แล้วค่อยแก้รายละเอียดด้านล่าง. Gallery accepts multiple
                    files (max {PHOTO_SPOT_MAX_GALLERY}).
                  </p>
                  {form.hero_image_url ? (
                    <div className="relative">
                      <img
                        src={storageImageSrc(form.hero_image_url, STORAGE_IMG.card)}
                        alt="Hero"
                        className="h-28 w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-cream"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, hero_image_url: '', thumbnail_url: '' }))
                        }
                        aria-label="Remove hero"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/20 py-6 text-sm text-cream-muted hover:border-teal-500/40">
                      {uploading && uploadProgress
                        ? uploadProgress
                        : uploadPhase === 'compressing'
                        ? 'Compressing…'
                        : uploadPhase === 'uploading'
                          ? 'Uploading…'
                          : 'Upload hero image / อัปโหลดรูปหลัก'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => handleUpload(e, 'hero')}
                      />
                    </label>
                  )}

                  <div className="grid grid-cols-4 gap-2">
                    {form.gallery_image_urls.map((url) => (
                      <div key={url} className="relative">
                        <img src={storageImageSrc(url, STORAGE_IMG.thumb)} alt="" className="h-16 w-full rounded object-cover" />
                        <button
                          type="button"
                          className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-cream"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              gallery_image_urls: prev.gallery_image_urls.filter((u) => u !== url),
                            }))
                          }
                          aria-label="Remove gallery image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {form.gallery_image_urls.length < PHOTO_SPOT_MAX_GALLERY && (
                      <label className="flex h-16 cursor-pointer items-center justify-center rounded border border-dashed border-white/20 text-[10px] text-cream-muted hover:border-teal-500/40">
                        {uploading && uploadProgress
                          ? uploadProgress
                          : uploadPhase === 'compressing'
                          ? 'Compressing…'
                          : uploadPhase === 'uploading'
                            ? 'Uploading…'
                            : '+ Gallery (multi)'}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          disabled={uploading}
                          onChange={(e) => handleUpload(e, 'gallery')}
                        />
                      </label>
                    )}
                  </div>

                  <div className="border-t border-white/10 pt-3">
                    <p className="text-sm font-semibold text-cream">
                      Video (optional) / วิดีโอ (ไม่บังคับ)
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-cream-muted">
                      Keep videos short and compressed to protect site performance and hosting costs.
                      / วิดีโอควรสั้นและบีบอัดแล้ว เพื่อรักษาความเร็วเว็บและต้นทุนโฮสติ้ง
                    </p>
                    {form.video_url ? (
                      <div className="mt-2 flex items-center gap-2">
                        <video
                          src={form.video_url}
                          className="h-16 w-24 rounded object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                        <button
                          type="button"
                          className="rounded-full bg-coral/20 px-3 py-1.5 text-xs text-coral"
                          onClick={() => setField('video_url', '')}
                        >
                          Remove video / ลบวิดีโอ
                        </button>
                      </div>
                    ) : (
                      <label className="mt-2 flex min-h-12 cursor-pointer items-center justify-center rounded-lg border border-dashed border-white/20 px-3 py-3 text-xs text-cream-muted hover:border-teal-500/40">
                        {uploading ? 'Uploading…' : 'Upload .mp4 / อัปโหลด .mp4'}
                        <input
                          type="file"
                          accept="video/mp4,.mp4"
                          className="hidden"
                          disabled={uploading}
                          onChange={handleVideoUpload}
                        />
                      </label>
                    )}
                    {videoError ? (
                      <p className="mt-2 text-xs leading-relaxed text-coral">{videoError}</p>
                    ) : null}
                  </div>
                </div>

                <StaffField label="URL slug">
                  <StaffInput
                    value={form.slug}
                    onChange={(e) => {
                      setSlugTouched(true)
                      setField('slug', slugify(e.target.value))
                    }}
                    placeholder="bombo-headland"
                  />
                </StaffField>

                <div className="grid grid-cols-2 gap-3">
                  <StaffField label="Region / town (EN) *">
                    <StaffInput
                      value={form.location_en}
                      onChange={(e) => setField('location_en', e.target.value)}
                      placeholder="Kiama, NSW"
                    />
                  </StaffField>
                  <StaffField label="Region / town (TH) *">
                    <StaffInput
                      value={form.location_th}
                      onChange={(e) => setField('location_th', e.target.value)}
                      placeholder="ไคอา마, NSW"
                    />
                  </StaffField>
                </div>

                <StaffField label="Description (EN)">
                  <StaffTextarea
                    rows={3}
                    value={form.description_en}
                    onChange={(e) => setField('description_en', e.target.value)}
                  />
                </StaffField>
                <StaffField label="Description (TH)">
                  <StaffTextarea
                    rows={3}
                    value={form.description_th}
                    onChange={(e) => setField('description_th', e.target.value)}
                  />
                </StaffField>

                <StaffField label="Categories *">
                  <div className="flex flex-wrap gap-1.5">
                    {PHOTO_SPOT_EDIT_CATEGORIES.map((cat) => {
                      const on = form.categories.includes(cat)
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={
                            on
                              ? 'rounded-full bg-teal-500 px-2.5 py-1 text-[11px] font-medium text-near-black-green'
                              : 'rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-cream-muted hover:bg-white/15'
                          }
                        >
                          {cat}
                        </button>
                      )
                    })}
                  </div>
                </StaffField>

                <StaffField label="Location on map *">
                  <SpotLocationPicker
                    latitude={form.latitude}
                    longitude={form.longitude}
                    onChange={(lat, lng) => {
                      setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }))
                    }}
                  />
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <StaffInput
                      type="number"
                      step="any"
                      value={form.latitude ?? ''}
                      onChange={(e) =>
                        setField(
                          'latitude',
                          e.target.value === '' ? null : Number(e.target.value),
                        )
                      }
                      placeholder="Latitude"
                    />
                    <StaffInput
                      type="number"
                      step="any"
                      value={form.longitude ?? ''}
                      onChange={(e) =>
                        setField(
                          'longitude',
                          e.target.value === '' ? null : Number(e.target.value),
                        )
                      }
                      placeholder="Longitude"
                    />
                  </div>
                </StaffField>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <StaffField label="Best time">
                    <StaffInput
                      value={form.best_time}
                      onChange={(e) => setField('best_time', e.target.value)}
                      placeholder="Sunrise"
                    />
                  </StaffField>
                  <StaffField label="Best season">
                    <StaffInput
                      value={form.best_season}
                      onChange={(e) => setField('best_season', e.target.value)}
                      placeholder="Mar–May"
                    />
                  </StaffField>
                  <StaffField label="Drive time">
                    <StaffInput
                      value={form.drive_time_from_sydney}
                      onChange={(e) => setField('drive_time_from_sydney', e.target.value)}
                      placeholder="~2 hrs from Sydney"
                    />
                  </StaffField>
                </div>

                <StaffField label="Access (private car)">
                  <StaffTextarea
                    rows={2}
                    value={form.access_private_car}
                    onChange={(e) => setField('access_private_car', e.target.value)}
                  />
                </StaffField>
                <StaffField label="Access (public transport)">
                  <StaffTextarea
                    rows={2}
                    value={form.access_public_transport}
                    onChange={(e) => setField('access_public_transport', e.target.value)}
                  />
                </StaffField>

                <div className="rounded-xl border border-white/10 p-3">
                  <p className="mb-2 text-xs font-semibold text-cream">Camera — Landscape</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['aperture', 'iso', 'shutter', 'filter'] as const).map((k) => (
                      <StaffInput
                        key={`l-${k}`}
                        value={form.landscape[k] ?? ''}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            landscape: { ...prev.landscape, [k]: e.target.value },
                          }))
                        }
                        placeholder={k}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 p-3">
                  <p className="mb-2 text-xs font-semibold text-cream">Camera — Portrait</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['aperture', 'iso', 'shutter', 'filter'] as const).map((k) => (
                      <StaffInput
                        key={`p-${k}`}
                        value={form.portrait[k] ?? ''}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            portrait: { ...prev.portrait, [k]: e.target.value },
                          }))
                        }
                        placeholder={k}
                      />
                    ))}
                  </div>
                </div>

                <StaffField label="Tips (EN)">
                  <StaffTextarea
                    rows={2}
                    value={form.tips_en}
                    onChange={(e) => setField('tips_en', e.target.value)}
                  />
                </StaffField>
                <StaffField label="Tips (TH)">
                  <StaffTextarea
                    rows={2}
                    value={form.tips_th}
                    onChange={(e) => setField('tips_th', e.target.value)}
                  />
                </StaffField>
                <StaffField label="Warnings / safety (EN)">
                  <StaffTextarea
                    rows={2}
                    value={form.warnings_en}
                    onChange={(e) => setField('warnings_en', e.target.value)}
                  />
                </StaffField>
                <StaffField label="Warnings / safety (TH)">
                  <StaffTextarea
                    rows={2}
                    value={form.warnings_th}
                    onChange={(e) => setField('warnings_th', e.target.value)}
                  />
                </StaffField>

                <div className="grid grid-cols-2 gap-3">
                  <StaffField label="Drone">
                    <StaffSelect
                      value={form.drone_allowed}
                      onChange={(e) =>
                        setField('drone_allowed', e.target.value as DroneAllowed)
                      }
                    >
                      <option value="allowed">Allowed</option>
                      <option value="restricted">Restricted</option>
                      <option value="prohibited">Prohibited</option>
                    </StaffSelect>
                  </StaffField>
                  <StaffField label="Related trip">
                    <StaffSelect
                      value={form.related_trip_code}
                      onChange={(e) => setField('related_trip_code', e.target.value)}
                    >
                      <option value="">— None —</option>
                      {tripCodes.map((code) => (
                        <option key={code} value={code}>
                          {code}
                        </option>
                      ))}
                    </StaffSelect>
                  </StaffField>
                </div>

                <StaffField label="Drone notes">
                  <StaffInput
                    value={form.drone_notes}
                    onChange={(e) => setField('drone_notes', e.target.value)}
                  />
                </StaffField>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2.5">
                  <span className="text-xs text-cream">Featured on /spots</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.is_featured}
                    onClick={() => setField('is_featured', !form.is_featured)}
                    className={
                      form.is_featured
                        ? 'h-7 w-12 rounded-full bg-amber px-1 transition'
                        : 'h-7 w-12 rounded-full bg-white/15 px-1 transition'
                    }
                  >
                    <span
                      className={
                        form.is_featured
                          ? 'ml-auto block h-5 w-5 rounded-full bg-near-black-green'
                          : 'block h-5 w-5 rounded-full bg-cream'
                      }
                    />
                  </button>
                </div>

                <StaffField label="Sort order">
                  <StaffInput
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setField('sort_order', e.target.value)}
                  />
                </StaffField>

                {validationError ? (
                  <p className="text-xs text-coral">{validationError}</p>
                ) : (
                  <p className="text-xs text-teal-300">Ready to save — goes live immediately.</p>
                )}
              </div>

              <div className="flex gap-2 border-t border-white/10 px-4 py-3">
                <StaffButton
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </StaffButton>
                <StaffButton
                  type="button"
                  className="flex-1"
                  disabled={saving || uploading || Boolean(validationError)}
                  onClick={handleSave}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden />
                      Saving…
                    </>
                  ) : form.id ? (
                    'Save changes'
                  ) : (
                    'Create spot'
                  )}
                </StaffButton>
              </div>
            </div>
          </div>
        )}
      </StaffMain>
    </div>
  )
}

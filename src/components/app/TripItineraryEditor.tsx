import { useState } from 'react'
import type { Tour, TourItineraryDay } from '../../types/tour'
import { hasDetailedCmsItinerary, listItineraryTemplateCodes } from '../../data/itineraries'
import { resolveTemplateTripCode } from '../../lib/tripCode'
import { updateTourItinerary } from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'

type Props = {
  tour: Tour
  onSaved: (tour: Tour) => void
  onSessionExpired: () => void
  onToast: (msg: string, tone?: 'success' | 'error') => void
}

function blankDay(day: number): TourItineraryDay {
  return { day, title_en: '', title_th: '', description_en: '', description_th: '' }
}

export default function TripItineraryEditor({ tour, onSaved, onSessionExpired, onToast }: Props) {
  const cmsTemplate = resolveTemplateTripCode(tour.trip_code, listItineraryTemplateCodes())
  const cmsDetailed = hasDetailedCmsItinerary(tour.trip_code)

  const [open, setOpen] = useState(false)
  const [days, setDays] = useState<TourItineraryDay[]>(() =>
    tour.itinerary && tour.itinerary.length > 0
      ? tour.itinerary.map((d) => ({ ...d }))
      : [blankDay(1)],
  )
  const [saving, setSaving] = useState(false)

  function updateDay(index: number, patch: Partial<TourItineraryDay>) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)))
  }

  async function save(clear = false) {
    setSaving(true)
    try {
      const payload = clear
        ? null
        : days
            .map((d, i) => ({
              ...d,
              day: Number(d.day) || i + 1,
              title_en: d.title_en.trim(),
              title_th: d.title_th.trim(),
              description_en: d.description_en.trim(),
              description_th: d.description_th.trim(),
            }))
            .filter((d) => d.title_en || d.title_th || d.description_en || d.description_th)

      const updated = await updateTourItinerary(tour.id, payload)
      onSaved(updated)
      setDays(
        updated.itinerary && updated.itinerary.length > 0
          ? updated.itinerary.map((d) => ({ ...d }))
          : [blankDay(1)],
      )
      onToast(clear ? 'ล้าง itinerary แล้ว (ใช้ CMS)' : 'บันทึก itinerary แล้ว', 'success')
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        onSessionExpired()
        return
      }
      onToast(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-2 border-t border-white/8 pt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-medium text-gold hover:underline"
      >
        {open ? '▲ ซ่อนแผนวันต่อวัน' : '▼ แก้ไขแผนวันต่อวัน (Itinerary)'}
      </button>

      {open && (
        <div className="mt-2 space-y-3">
          <p className="text-[11px] leading-relaxed text-cream-muted">
            {tour.itinerary && tour.itinerary.length > 0
              ? 'มี DB override บนทริปนี้ — จะแสดงแทน CMS'
              : cmsDetailed && cmsTemplate
                ? `ยังไม่มี DB override · เว็บใช้ CMS template “${cmsTemplate}”`
                : 'ยังไม่มีแผนวันต่อวัน — กรอกด้านล่าง หรือปล่อยว่าง (หน้าเว็บจะซ่อน/แสดง Coming soon)'}
          </p>

          {days.map((d, i) => (
            <div
              key={`day-${i}`}
              className="space-y-1.5 rounded-lg border border-white/10 bg-near-black-green/50 p-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs text-cream-muted">
                  Day
                  <input
                    type="number"
                    min={1}
                    value={d.day}
                    onChange={(e) => updateDay(i, { day: Number(e.target.value) || 1 })}
                    className="w-14 rounded border border-white/15 bg-near-black-green px-2 py-1 text-cream"
                  />
                </label>
                {days.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setDays((prev) => prev.filter((_, j) => j !== i))}
                    className="text-[10px] text-coral hover:underline"
                  >
                    ลบวัน
                  </button>
                )}
              </div>
              <input
                value={d.title_en}
                onChange={(e) => updateDay(i, { title_en: e.target.value })}
                placeholder="Title EN"
                className="w-full rounded border border-white/15 bg-near-black-green px-2 py-1.5 text-xs text-cream"
              />
              <input
                value={d.title_th}
                onChange={(e) => updateDay(i, { title_th: e.target.value })}
                placeholder="ชื่อวัน TH"
                className="w-full rounded border border-white/15 bg-near-black-green px-2 py-1.5 text-xs text-cream"
              />
              <textarea
                value={d.description_en}
                onChange={(e) => updateDay(i, { description_en: e.target.value })}
                placeholder="Description EN"
                rows={2}
                className="w-full rounded border border-white/15 bg-near-black-green px-2 py-1.5 text-xs text-cream"
              />
              <textarea
                value={d.description_th}
                onChange={(e) => updateDay(i, { description_th: e.target.value })}
                placeholder="รายละเอียด TH"
                rows={2}
                className="w-full rounded border border-white/15 bg-near-black-green px-2 py-1.5 text-xs text-cream"
              />
            </div>
          ))}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDays((prev) => [...prev, blankDay(prev.length + 1)])}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-cream-muted hover:bg-white/10"
            >
              + เพิ่มวัน
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void save(false)}
              className="rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-near-black-green disabled:opacity-50"
            >
              {saving ? 'กำลังบันทึก…' : 'บันทึก itinerary'}
            </button>
            <button
              type="button"
              disabled={saving || !(tour.itinerary && tour.itinerary.length > 0)}
              onClick={() => void save(true)}
              className="rounded-lg border border-coral/40 px-3 py-1.5 text-xs text-coral disabled:opacity-40"
            >
              ล้าง DB override
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

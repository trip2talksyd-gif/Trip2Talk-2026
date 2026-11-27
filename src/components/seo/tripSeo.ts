import type { Tour } from '../../types/tour'
import { tourDestination, tourDurationLabel } from '../../lib/tourDisplay'

/** Compact duration such as 6D5N for titles. */
export function compactDuration(tour: Tour): string {
  const days = tour.duration_days
  const nights = tour.duration_nights
  if (days != null && nights != null && nights > 0) return `${days}D${nights}N`
  return tourDurationLabel(tour, 'en').replace(/\s+/g, '')
}

export function tripSeoTitle(tour: Tour): string {
  const destination = tourDestination(tour.trip_code)
  const duration = compactDuration(tour)
  const name = tour.name_en.trim() || tour.trip_code
  const bits = [name]
  if (duration && !name.toUpperCase().includes(duration.toUpperCase())) bits.push(duration)
  if (destination && !name.toLowerCase().includes(destination.toLowerCase())) bits.push(destination)
  return `${bits.join(' ')} Photo Trip | Trip2Talk`
}

export function tripSeoDescription(tour: Tour): string {
  const destination = tourDestination(tour.trip_code)
  const duration = tourDurationLabel(tour, 'en')
  const raw = (tour.description_en ?? '').replace(/\s+/g, ' ').trim()
  const lead = raw || `${tour.name_en} — a ${duration} photo trip to ${destination}.`
  const text = `${lead} Small group, photographer included.`
  return text.length > 160 ? `${text.slice(0, 157)}...` : text
}

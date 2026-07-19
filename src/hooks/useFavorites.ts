import { useCallback, useSyncExternalStore } from 'react'
import {
  getFavoriteTripCodes,
  removeFavoriteTrip,
  toggleFavoriteTrip,
} from '../lib/favorites'

const LISTENERS = new Set<() => void>()

function subscribe(listener: () => void) {
  LISTENERS.add(listener)
  return () => {
    LISTENERS.delete(listener)
  }
}

function emit() {
  LISTENERS.forEach((listener) => listener())
}

function getSnapshot() {
  return getFavoriteTripCodes().join('|')
}

function getServerSnapshot() {
  return ''
}

export function useFavoriteTripCodes(): string[] {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return snapshot ? snapshot.split('|') : []
}

export function useIsFavorite(tripCode: string): boolean {
  const codes = useFavoriteTripCodes()
  return codes.some((id) => id.toUpperCase() === tripCode.toUpperCase())
}

export function useToggleFavorite() {
  return useCallback((tripCode: string) => {
    const next = toggleFavoriteTrip(tripCode)
    emit()
    return next
  }, [])
}

export function useRemoveFavorite() {
  return useCallback((tripCode: string) => {
    removeFavoriteTrip(tripCode)
    emit()
  }, [])
}

import { useCallback, useEffect, useRef, useState } from 'react'

const LONG_PRESS_MS = 450
const MOVE_CANCEL_PX = 12
const HOVER_DELAY_MS = 120
const BUBBLE_SIZE = 92
const BUBBLE_OFFSET = 20

export type PreviewPosition = {
  visible: boolean
  x: number
  y: number
}

function clampPosition(clientX: number, clientY: number): { x: number; y: number } {
  const margin = 8
  const x = Math.min(
    Math.max(clientX + BUBBLE_OFFSET, margin + BUBBLE_SIZE / 2),
    window.innerWidth - margin - BUBBLE_SIZE / 2,
  )
  const y = Math.min(
    Math.max(clientY - BUBBLE_OFFSET, margin + BUBBLE_SIZE / 2),
    window.innerHeight - margin - BUBBLE_SIZE / 2,
  )
  return { x, y }
}

function canUseFineHover(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

export function useTripCardPreview() {
  const [position, setPosition] = useState<PreviewPosition>({ visible: false, x: 0, y: 0 })
  const hoverTimerRef = useRef<number | null>(null)
  const longPressTimerRef = useRef<number | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const suppressClickRef = useRef(false)
  const previewVisibleRef = useRef(false)
  const lastPointerRef = useRef({ x: 0, y: 0 })

  const hide = useCallback(() => {
    previewVisibleRef.current = false
    setPosition((prev) => ({ ...prev, visible: false }))
  }, [])

  const showAt = useCallback((clientX: number, clientY: number) => {
    const { x, y } = clampPosition(clientX, clientY)
    previewVisibleRef.current = true
    setPosition({ visible: true, x, y })
  }, [])

  const clearHoverTimer = useCallback(() => {
    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
  }, [])

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearHoverTimer()
      clearLongPressTimer()
    }
  }, [clearHoverTimer, clearLongPressTimer])

  useEffect(() => {
    if (!position.visible) return
    const dismiss = () => hide()
    window.addEventListener('scroll', dismiss, { passive: true, capture: true })
    return () => window.removeEventListener('scroll', dismiss, { capture: true })
  }, [position.visible, hide])

  const onPointerEnter = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== 'mouse' || !canUseFineHover()) return
      lastPointerRef.current = { x: e.clientX, y: e.clientY }
      clearHoverTimer()
      hoverTimerRef.current = window.setTimeout(() => {
        showAt(lastPointerRef.current.x, lastPointerRef.current.y)
      }, HOVER_DELAY_MS)
    },
    [clearHoverTimer, showAt],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== 'mouse' || !canUseFineHover()) return
      lastPointerRef.current = { x: e.clientX, y: e.clientY }
      if (previewVisibleRef.current) {
        showAt(e.clientX, e.clientY)
      }
    },
    [showAt],
  )

  const onPointerLeave = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      clearHoverTimer()
      hide()
    },
    [clearHoverTimer, hide],
  )

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0]
      if (!touch) return
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
      clearLongPressTimer()
      longPressTimerRef.current = window.setTimeout(() => {
        suppressClickRef.current = true
        showAt(touch.clientX, touch.clientY)
      }, LONG_PRESS_MS)
    },
    [clearLongPressTimer, showAt],
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || longPressTimerRef.current === null) return
      const touch = e.touches[0]
      if (!touch) return
      const dx = touch.clientX - touchStartRef.current.x
      const dy = touch.clientY - touchStartRef.current.y
      if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) {
        clearLongPressTimer()
      }
    },
    [clearLongPressTimer],
  )

  const onTouchEnd = useCallback(() => {
    clearLongPressTimer()
    touchStartRef.current = null
  }, [clearLongPressTimer])

  const onTouchCancel = useCallback(() => {
    clearLongPressTimer()
    touchStartRef.current = null
    hide()
  }, [clearLongPressTimer, hide])

  const onClickCapture = useCallback(
    (e: React.MouseEvent) => {
      if (suppressClickRef.current) {
        e.preventDefault()
        e.stopPropagation()
        suppressClickRef.current = false
        hide()
        return
      }
      if (previewVisibleRef.current) {
        e.preventDefault()
        e.stopPropagation()
        hide()
      }
    },
    [hide],
  )

  return {
    position,
    hide,
    previewHandlers: {
      onPointerEnter,
      onPointerMove,
      onPointerLeave,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel,
      onClickCapture,
    },
  }
}

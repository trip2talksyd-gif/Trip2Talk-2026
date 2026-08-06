import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * React Router doesn't reset scroll position between route changes on its
 * own (it's an SPA — the browser never actually reloads the page). Without
 * this, clicking a trip link or any nav item keeps whatever scroll position
 * the previous page was at, so the new page can render already scrolled to
 * the middle/bottom instead of the top.
 *
 * Scroll lives in `[data-app-scroll]` (fixed app shell), not the window.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    const ports = document.querySelectorAll<HTMLElement>('[data-app-scroll]')
    if (ports.length > 0) {
      ports.forEach((el) => {
        el.scrollTop = 0
      })
      return
    }
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

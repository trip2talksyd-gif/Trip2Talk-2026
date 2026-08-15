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
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const id = hash.startsWith('#') ? hash.slice(1) : ''

    const run = () => {
      const target = id ? document.getElementById(id) : null
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      const ports = document.querySelectorAll<HTMLElement>('[data-app-scroll]')
      if (ports.length > 0) {
        ports.forEach((el) => {
          el.scrollTop = 0
        })
        return
      }
      window.scrollTo(0, 0)
    }

    const raf = window.requestAnimationFrame(run)
    return () => window.cancelAnimationFrame(raf)
  }, [pathname, hash])

  return null
}

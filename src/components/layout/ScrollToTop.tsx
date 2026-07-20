import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * React Router doesn't reset scroll position between route changes on its
 * own (it's an SPA — the browser never actually reloads the page). Without
 * this, clicking a trip link or any nav item keeps whatever scroll position
 * the previous page was at, so the new page can render already scrolled to
 * the middle/bottom instead of the top.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

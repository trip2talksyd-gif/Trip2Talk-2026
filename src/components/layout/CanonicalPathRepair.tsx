import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * Recovers customer-facing 404s when a client (in-app browser, relative
 * video URL, or encodeURIComponent join) lands on a path like
 * `/pricing%2Ftrip-videos%2FNZ02_web.mp4` instead of `/pricing`.
 * Pricing has no nested routes — extra segments are always a mistake.
 */
export default function CanonicalPathRepair() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const raw = window.location.pathname
    let decoded = raw
    try {
      decoded = decodeURIComponent(raw)
    } catch {
      decoded = raw
    }

    if (/%2f/i.test(raw) && decoded.startsWith('/pricing')) {
      window.location.replace(`/pricing${window.location.search}${window.location.hash}`)
      return
    }

    if (location.pathname.startsWith('/pricing/') && location.pathname !== '/pricing/') {
      navigate(
        { pathname: '/pricing', search: location.search, hash: location.hash },
        { replace: true },
      )
    }
  }, [location.hash, location.pathname, location.search, navigate])

  return null
}

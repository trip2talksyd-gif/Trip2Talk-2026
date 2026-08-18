import { Navigate } from 'react-router-dom'

/**
 * Retired from `/`. Discover is the homepage.
 * Condensed positioning (v2) sits after Saen's latest work on Discover.
 * Full positioning copy lives on /about.
 * HomeVideoIntro is kept for reuse off the homepage.
 */
export default function HomePage() {
  return <Navigate to="/" replace />
}

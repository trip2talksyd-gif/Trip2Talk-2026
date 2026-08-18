import { Navigate } from 'react-router-dom'

/**
 * Retired from `/`. Discover is the homepage.
 * Positioning copy lives on Discover via HomePositioningSection.
 * HomeVideoIntro is kept for reuse off the homepage.
 */
export default function HomePage() {
  return <Navigate to="/" replace />
}

import { Navigate } from 'react-router-dom'

/**
 * Retired from `/`. Discover is the homepage.
 * Unique video + “We're Not a Tour Company” live on Discover via
 * HomeVideoIntro and HomePositioningSection.
 */
export default function HomePage() {
  return <Navigate to="/" replace />
}

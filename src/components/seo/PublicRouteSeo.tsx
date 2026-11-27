import { useLocation } from 'react-router-dom'
import SeoHead from './SeoHead'
import { metaForPath } from './routeMeta'

/** Head tags for public routes that do not set their own (trip pages do). */
export default function PublicRouteSeo() {
  const { pathname } = useLocation()
  const meta = metaForPath(pathname)
  if (!meta) return null
  const path = pathname.split('?')[0] || '/'
  return (
    <SeoHead
      title={meta.title}
      description={meta.description}
      path={path}
      noindex={meta.noindex}
    />
  )
}

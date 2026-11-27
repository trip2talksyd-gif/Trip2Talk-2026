import { useContext, useEffect } from 'react'
import { HeadSinkContext } from '../../prerender/sink'
import { DEFAULT_OG_IMAGE, canonicalUrl } from './site'

export type SeoHeadProps = {
  title: string
  description: string
  /** Path only, no query string. `/` for the homepage. */
  path: string
  image?: string
  noindex?: boolean
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function removeMeta(attr: 'name' | 'property', key: string) {
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove()
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>("link[rel='canonical']")
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

/** Sets document head for the current public route. Safe to mount once per page. */
export default function SeoHead({ title, description, path, image, noindex }: SeoHeadProps) {
  const sink = useContext(HeadSinkContext)
  if (sink) {
    sink.title = title
    sink.description = description
    sink.canonical = canonicalUrl(path)
    sink.image = image && image.startsWith('http') ? image : DEFAULT_OG_IMAGE
    sink.noindex = Boolean(noindex)
  }

  useEffect(() => {
    const url = canonicalUrl(path)
    const ogImage = image && image.startsWith('http') ? image : DEFAULT_OG_IMAGE
    document.title = title
    upsertMeta('name', 'description', description)
    upsertCanonical(url)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:site_name', 'Trip2Talk')
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', ogImage)
    upsertMeta('property', 'og:locale', 'en_AU')
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description.slice(0, 160))
    upsertMeta('name', 'twitter:image', ogImage)
    if (noindex) upsertMeta('name', 'robots', 'noindex')
    else removeMeta('name', 'robots')
  }, [title, description, path, image, noindex])

  return null
}

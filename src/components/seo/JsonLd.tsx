import { useContext, useEffect } from 'react'
import { HeadSinkContext } from '../../prerender/sink'

/** Injects one JSON-LD block and removes it when the route changes. */
export default function JsonLd({ id, data }: { id: string; data: unknown }) {
  const json = JSON.stringify(data)
  const sink = useContext(HeadSinkContext)
  if (sink && !sink.jsonLd.some((block) => block.id === id)) {
    sink.jsonLd.push({ id, json })
  }

  useEffect(() => {
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    el.text = json
    document.head.appendChild(el)
    return () => el.remove()
  }, [id, json])
  return null
}

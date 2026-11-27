import { useEffect } from 'react'

/** Injects one JSON-LD block and removes it when the route changes. */
export default function JsonLd({ id, data }: { id: string; data: unknown }) {
  const json = JSON.stringify(data)
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

import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function ContentPage({ title, subtitle, children }: Props) {
  return (
    <article className="mx-auto max-w-2xl space-y-4 pb-6">
      <header>
        <h1 className="font-serif text-2xl text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{subtitle}</p>}
      </header>
      <div className="space-y-3 text-sm leading-relaxed text-ink/85">{children}</div>
    </article>
  )
}

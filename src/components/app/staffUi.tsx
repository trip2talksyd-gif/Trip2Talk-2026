import { Link } from 'react-router-dom'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

/** Root class for every /app/* page — enables shared form chrome in index.css */
export const staffShellClass = 'staff-shell min-h-svh bg-near-black-green text-cream'

export const staffCardClass =
  'overflow-hidden rounded-2xl border border-white/8 bg-surface-card/70 shadow-[0_12px_28px_-18px_rgba(0,0,0,0.65)]'

export const staffCardSelectedClass =
  'overflow-hidden rounded-2xl border border-teal-500/50 bg-surface-card shadow-[0_12px_28px_-18px_rgba(0,0,0,0.65)] ring-1 ring-teal-500/30'

export const staffChipClass =
  'inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-surface-card px-3.5 py-2 text-xs font-medium text-cream transition-colors hover:border-teal-500/40 hover:bg-teal-800/80 active:scale-[0.98]'

export const staffChipHighlightClass =
  'inline-flex min-h-11 items-center gap-2 rounded-full bg-teal-500 px-3.5 py-2 text-xs font-medium text-near-black-green shadow-[0_8px_20px_-8px_rgba(233,147,90,0.55)] transition-colors active:scale-[0.98]'

export const staffBtnPrimaryClass =
  'inline-flex min-h-11 w-full items-center justify-center rounded-full bg-teal-500 px-4 py-2.5 text-sm font-bold text-near-black-green transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40'

export const staffBtnSecondaryClass =
  'inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-surface-card px-4 py-2.5 text-sm font-medium text-cream transition-colors hover:border-teal-500/40 hover:bg-teal-800/80 disabled:opacity-40'

export const staffBtnDangerClass =
  'inline-flex min-h-10 items-center justify-center rounded-full bg-coral/20 px-3 py-1.5 text-xs font-medium text-coral transition-colors hover:bg-coral/30 disabled:opacity-40'

export const staffTabActiveClass =
  'rounded-full bg-teal-500 px-2.5 py-1 text-[11px] font-medium text-near-black-green'

export const staffTabIdleClass =
  'rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-cream-muted transition-colors hover:bg-white/15'

export function StaffPageHeader({
  backTo,
  backLabel,
  title,
  subtitle,
  children,
}: {
  backTo: string
  backLabel: string
  title: string
  subtitle?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="border-b border-white/8 px-4 py-4">
      <Link to={backTo} className="text-sm text-teal-500 hover:text-teal-400">
        {backLabel}
      </Link>
      <h1 className="mt-2 font-serif text-lg text-cream">{title}</h1>
      {subtitle ? <div className="mt-1 text-sm text-cream-muted">{subtitle}</div> : null}
      {children ? <div className="mt-4 flex flex-wrap gap-2">{children}</div> : null}
    </header>
  )
}

export function StaffMain({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <main className={`mx-auto max-w-2xl space-y-5 px-4 py-6 ${className}`.trim()}>{children}</main>
}

export function StaffCard({
  children,
  className = '',
  selected = false,
  padding = true,
  ...rest
}: {
  children: ReactNode
  className?: string
  selected?: boolean
  padding?: boolean
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`${selected ? staffCardSelectedClass : staffCardClass} ${padding ? 'p-4' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  )
}

export function StaffActionChip({
  to,
  icon,
  label,
  highlighted = false,
}: {
  to: string
  icon: ReactNode
  label: string
  highlighted?: boolean
}) {
  return (
    <Link to={to} className={highlighted ? staffChipHighlightClass : staffChipClass}>
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          highlighted ? 'bg-near-black-green/15 text-near-black-green' : 'bg-white/8 text-teal-500'
        }`}
      >
        {icon}
      </span>
      <span className="leading-snug">{label}</span>
    </Link>
  )
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
}

export function StaffButton({ variant = 'primary', className = '', type = 'button', children, ...rest }: BtnProps) {
  const base =
    variant === 'primary'
      ? staffBtnPrimaryClass
      : variant === 'secondary'
        ? staffBtnSecondaryClass
        : variant === 'danger'
          ? staffBtnDangerClass
          : 'inline-flex items-center justify-center rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-cream-muted transition-colors hover:bg-white/15 disabled:opacity-40'
  return (
    <button type={type} className={`${base} ${className}`.trim()} {...rest}>
      {children}
    </button>
  )
}

export function StaffField({
  label,
  children,
  className = '',
}: {
  label: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className}`.trim()}>
      <span className="text-xs text-cream-muted">{label}</span>
      {children}
    </label>
  )
}

/** Native checkbox row with teal-styled control (via .staff-shell CSS). */
export function StaffCheckRow({
  checked,
  onChange,
  children,
  tone = 'default',
  className = '',
}: {
  checked: boolean
  onChange: (next: boolean) => void
  children: ReactNode
  tone?: 'default' | 'warning' | 'danger'
  className?: string
}) {
  const toneClass =
    tone === 'danger'
      ? 'border-coral/40 bg-coral/10'
      : tone === 'warning'
        ? 'border-amber/40 bg-amber/10'
        : 'border-white/10 bg-surface-card/80'
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-3.5 py-3 ${toneClass} ${className}`.trim()}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="staff-check mt-0.5 shrink-0"
      />
      <span className="min-w-0 flex-1 text-sm leading-snug text-cream">{children}</span>
    </label>
  )
}

export function StaffInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props
  return <input className={`staff-control ${className}`.trim()} {...rest} />
}

export function StaffSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = '', children, ...rest } = props
  return (
    <select className={`staff-control ${className}`.trim()} {...rest}>
      {children}
    </select>
  )
}

export function StaffTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props
  return <textarea className={`staff-control ${className}`.trim()} {...rest} />
}

export function StaffSectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-sm font-medium text-cream-muted">{children}</h2>
}

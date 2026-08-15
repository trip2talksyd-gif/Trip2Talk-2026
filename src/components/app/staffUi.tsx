import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import BrandLogo from '../brand/BrandLogo'

/** Root class for every /app/* page — enables shared form chrome in index.css */
export const staffShellClass =
  'staff-shell relative flex h-full max-h-full flex-col overflow-hidden bg-near-black-green text-cream'

export const staffCardClass =
  'staff-card relative overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-br from-[#2a4249]/90 via-surface-card/95 to-teal-900/90 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.07)]'

export const staffCardSelectedClass =
  'staff-card relative overflow-hidden rounded-2xl border border-teal-500/55 bg-gradient-to-br from-teal-800 via-surface-card to-teal-900 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.75),0_0_0_1px_rgba(239,165,101,0.12),inset_0_1px_0_0_rgba(255,255,255,0.08)] ring-1 ring-teal-500/25'

export const staffChipClass =
  'inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-gradient-to-b from-white/[0.07] to-surface-card/80 px-3.5 py-2 text-xs font-medium text-cream shadow-[0_8px_18px_-14px_rgba(0,0,0,0.7)] transition-[transform,border-color,background-color,box-shadow] duration-150 hover:-translate-y-0.5 hover:border-teal-500/40 hover:bg-teal-800/70 hover:shadow-[0_12px_24px_-14px_rgba(0,0,0,0.75)] active:translate-y-0 active:scale-[0.98]'

export const staffChipHighlightClass =
  'inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-br from-teal-400 via-teal-500 to-amber px-5 py-3.5 text-sm font-semibold text-near-black-green shadow-[0_14px_32px_-8px_rgba(233,147,90,0.75),0_0_28px_-4px_rgba(239,165,101,0.5),inset_0_1px_0_0_rgba(255,255,255,0.35)] transition-[transform,filter,box-shadow] duration-150 hover:-translate-y-0.5 hover:brightness-[1.04] hover:shadow-[0_18px_36px_-8px_rgba(233,147,90,0.85),0_0_32px_-2px_rgba(239,165,101,0.55)] active:translate-y-0 active:scale-[0.98]'

export const staffActionTileClass =
  'flex min-h-[4.5rem] flex-col items-start justify-center gap-2 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-surface-card/80 to-teal-900/70 px-3.5 py-3 text-left shadow-[0_12px_28px_-18px_rgba(0,0,0,0.75),inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-[transform,border-color,background-color,box-shadow] duration-150 hover:-translate-y-0.5 hover:border-teal-500/35 hover:shadow-[0_16px_32px_-16px_rgba(0,0,0,0.8)] active:translate-y-0 active:scale-[0.98]'

export const staffBtnPrimaryClass =
  'inline-flex min-h-11 w-full items-center justify-center rounded-full bg-gradient-to-br from-teal-400 via-teal-500 to-amber px-4 py-2.5 text-sm font-bold text-near-black-green shadow-[0_10px_24px_-8px_rgba(233,147,90,0.65),inset_0_1px_0_0_rgba(255,255,255,0.28)] transition-[opacity,transform,filter] duration-150 hover:brightness-[1.03] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none'

export const staffBtnSecondaryClass =
  'inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-gradient-to-b from-white/[0.08] to-surface-card/70 px-4 py-2.5 text-sm font-medium text-cream shadow-[0_8px_18px_-14px_rgba(0,0,0,0.65)] transition-[border-color,background-color,transform] duration-150 hover:-translate-y-0.5 hover:border-teal-500/40 hover:bg-teal-800/80 active:translate-y-0 disabled:opacity-40'

export const staffBtnDangerClass =
  'inline-flex min-h-10 items-center justify-center rounded-full bg-coral/20 px-3 py-1.5 text-xs font-medium text-coral shadow-[0_6px_16px_-10px_rgba(226,115,74,0.55)] transition-colors hover:bg-coral/30 disabled:opacity-40'

export const staffTabActiveClass =
  'rounded-full bg-gradient-to-br from-teal-400 to-teal-500 px-2.5 py-1 text-[11px] font-medium text-near-black-green shadow-[0_4px_12px_-4px_rgba(233,147,90,0.55)]'

export const staffTabIdleClass =
  'rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-cream-muted transition-colors hover:bg-white/15'

function StaffHistoryNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const navType = useNavigationType()
  const idx = typeof window !== 'undefined' ? Number(window.history.state?.idx ?? 0) : 0
  const [maxIdx, setMaxIdx] = useState(idx)

  useEffect(() => {
    if (navType === 'PUSH' || navType === 'REPLACE') {
      setMaxIdx(idx)
    } else {
      setMaxIdx((prev) => Math.max(prev, idx))
    }
  }, [idx, location.key, navType])

  const canBack = idx > 0
  const canForward = idx < maxIdx

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Page history">
      <button
        type="button"
        disabled={!canBack}
        onClick={() => navigate(-1)}
        aria-label="Back"
        className="flex h-8 w-8 items-center justify-center rounded-full text-cream transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:text-cream/25 disabled:hover:bg-transparent"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden />
      </button>
      <button
        type="button"
        disabled={!canForward}
        onClick={() => navigate(1)}
        aria-label="Forward"
        className="flex h-8 w-8 items-center justify-center rounded-full text-cream transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:text-cream/25 disabled:hover:bg-transparent"
      >
        <ChevronRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
      </button>
    </div>
  )
}

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
    <header className="staff-page-header relative shrink-0 overflow-hidden border-b border-white/10 px-4 pb-5 pt-[max(1rem,env(safe-area-inset-top))]">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal-700/30 via-transparent to-teal-500/[0.08]"
        aria-hidden
      />
      <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-teal-500/10 blur-3xl" aria-hidden />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Link to="/app" className="min-w-0" aria-label="Trip2Talk staff home">
            <BrandLogo size="sm" tone="dark" withWordmark decorative wordmarkClassName="text-cream" />
          </Link>
          <div className="flex shrink-0 items-center gap-1.5">
            <StaffHistoryNav />
            <Link
              to={backTo}
              className="text-sm font-medium text-teal-500 transition-colors hover:text-teal-400"
            >
              {backLabel}
            </Link>
          </div>
        </div>
        <h1 className="mt-0.5 font-serif text-2xl font-semibold tracking-tight text-cream sm:text-[1.65rem]">
          {title}
        </h1>
        {subtitle ? (
          <div className="mt-1.5 text-sm leading-relaxed text-cream-muted">{subtitle}</div>
        ) : null}
        {children ? <div className="mt-4 flex flex-wrap gap-2.5">{children}</div> : null}
      </div>
    </header>
  )
}

export function StaffMain({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <main
      className={`app-scroll relative mx-auto w-full max-w-2xl space-y-7 px-4 py-7 ${className}`.trim()}
      data-app-scroll
    >
      {children}
    </main>
  )
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

export function StaffStatCard({
  label,
  value,
  icon,
  tone = 'default',
  /** 0–1 share vs this month’s peer metrics (real relative bar — not decorative filler). */
  barRatio,
}: {
  label: string
  value: string
  icon?: ReactNode
  tone?: 'default' | 'muted' | 'positive' | 'negative'
  barRatio?: number
}) {
  const valueTone =
    tone === 'positive'
      ? 'text-teal-400'
      : tone === 'negative'
        ? 'text-coral'
        : tone === 'muted'
          ? 'text-cream'
          : 'text-teal-400'

  const barTone =
    tone === 'positive'
      ? 'from-teal-400 to-teal-500/40'
      : tone === 'negative'
        ? 'from-coral to-coral/35'
        : tone === 'muted'
          ? 'from-cream/50 to-cream/10'
          : 'from-teal-400 to-teal-500/35'

  const iconWrap =
    tone === 'negative'
      ? 'bg-coral/15 text-coral ring-coral/25'
      : tone === 'muted'
        ? 'bg-white/8 text-cream-muted ring-white/10'
        : 'bg-teal-500/15 text-teal-400 ring-teal-500/25'

  const ratio = Math.max(0, Math.min(1, barRatio ?? 0))
  const barPct = `${Math.round(ratio * 100)}%`

  return (
    <StaffCard padding={false} className="rounded-3xl p-3.5 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-cream-muted/90">
          {label}
        </p>
        {icon ? (
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ${iconWrap}`}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p
        className={`mt-3 font-serif text-[1.65rem] font-semibold tabular-nums leading-none tracking-tight sm:text-[1.85rem] ${valueTone}`}
      >
        {value}
      </p>
      <div className="mt-3.5 flex h-14 items-end gap-1" aria-hidden>
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-white/[0.05] ring-1 ring-white/[0.06]">
          <div
            className={`absolute inset-x-1 bottom-1 rounded-lg bg-gradient-to-t ${barTone} transition-[height] duration-500`}
            style={{ height: `calc(${barPct} - 0px)`, minHeight: ratio > 0 ? '6px' : '0px' }}
          />
        </div>
      </div>
    </StaffCard>
  )
}

/** Dense quick-action tile for secondary ops links (2-col grids). */
export function StaffActionTile({
  to,
  icon,
  label,
  className = '',
}: {
  to: string
  icon: ReactNode
  label: string
  className?: string
}) {
  return (
    <Link to={to} className={`${staffActionTileClass} ${className}`.trim()}>
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/15 text-teal-400 ring-1 ring-teal-500/25">
        {icon}
      </span>
      <span className="text-xs font-medium leading-snug text-cream">{label}</span>
    </Link>
  )
}

export function StaffActionChip({
  to,
  icon,
  label,
  highlighted = false,
  className = '',
}: {
  to: string
  icon: ReactNode
  label: string
  highlighted?: boolean
  className?: string
}) {
  return (
    <Link
      to={to}
      className={`${highlighted ? staffChipHighlightClass : staffChipClass} ${className}`.trim()}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          highlighted
            ? 'bg-near-black-green/18 text-near-black-green shadow-inner'
            : 'bg-white/8 text-teal-400 ring-1 ring-white/10'
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
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-cream-muted/85">
      {children}
    </h2>
  )
}

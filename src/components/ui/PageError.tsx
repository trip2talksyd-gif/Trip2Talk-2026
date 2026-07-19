import { useLang } from '../../hooks/useLang'

type Props = {
  message?: string
  onRetry?: () => void
  dark?: boolean
}

export function PageError({ message, onRetry, dark }: Props) {
  const { t } = useLang()
  const text = message ?? t('common.error')

  return (
    <div
      className={`rounded-xl border p-6 text-center ${
        dark
          ? 'border-red-900/50 bg-red-950/30 text-red-300'
          : 'border-red-100 bg-red-50 text-red-800'
      }`}
      role="alert"
    >
      <p className="text-sm font-medium">{text}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={`mt-3 text-sm underline ${dark ? 'text-amber-400' : 'text-teal-700'}`}
        >
          {t('common.retry')}
        </button>
      )}
    </div>
  )
}

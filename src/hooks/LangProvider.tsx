import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { translations, type Lang, type TranslationKey } from '../i18n/translations'

export type LangContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
  /** Active-language string (legacy / form chrome). Prefer `tt` for bilingual UI. */
  t: (key: TranslationKey) => string
  /** Always returns both EN + TH — pair for bilingual UI; order via BiText / lang. */
  tt: (key: TranslationKey) => { en: string; th: string }
}

export const LangContext = createContext<LangContextValue | null>(null)

const STORAGE_KEY = 'trip2talk_lang'

function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'en' ? 'en' : 'th'
  } catch {
    return 'th'
  }
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore quota / private mode */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang === 'th' ? 'th' : 'en'
  }, [lang])

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next: Lang = prev === 'th' ? 'en' : 'th'
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  const t = useCallback(
    (key: TranslationKey) => translations[lang][key] ?? translations.en[key] ?? key,
    [lang],
  )

  const tt = useCallback(
    (key: TranslationKey) => ({
      en: translations.en[key] ?? key,
      th: translations.th[key] ?? translations.en[key] ?? key,
    }),
    [],
  )

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, t, tt }),
    [lang, setLang, toggleLang, t, tt],
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

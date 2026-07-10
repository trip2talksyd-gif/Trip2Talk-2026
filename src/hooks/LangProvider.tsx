import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'
import { translations, type Lang, type TranslationKey } from '../i18n/translations'

export type LangContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
  t: (key: TranslationKey) => string
}

export const LangContext = createContext<LangContextValue | null>(null)

const STORAGE_KEY = 'trip2talk_lang'

function readStoredLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'en' ? 'en' : 'th'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === 'th' ? 'en' : 'th')
  }, [lang, setLang])

  const t = useCallback(
    (key: TranslationKey) => translations[lang][key] ?? translations.en[key] ?? key,
    [lang],
  )

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, t }),
    [lang, setLang, toggleLang, t],
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

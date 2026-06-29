import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import i18n from './index'
import {
  appLanguageStorageKey,
  appLanguages,
  defaultAppLocale,
  normalizeAppLocale,
  type AppLocale,
} from './locales'

export function useAppLocale(): {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
  languages: typeof appLanguages
} {
  const { i18n: reactI18n } = useTranslation()
  const locale = normalizeAppLocale(reactI18n.language) ?? defaultAppLocale

  const setLocale = useCallback((nextLocale: AppLocale) => {
    localStorage.setItem(appLanguageStorageKey, nextLocale)
    void i18n.changeLanguage(nextLocale)
  }, [])

  return { locale, setLocale, languages: appLanguages }
}

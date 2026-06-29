import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import {
  appLanguages,
  defaultAppLocale,
  getHtmlLang,
  normalizeAppLocale,
  resolveInitialLocale,
} from './locales'
import { resources } from './resources'

function syncDocumentLanguage(language: string) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = getHtmlLang(normalizeAppLocale(language) ?? defaultAppLocale)
}

void i18n.use(initReactI18next).init({
  resources,
  lng: resolveInitialLocale(),
  fallbackLng: defaultAppLocale,
  supportedLngs: appLanguages.map((language) => language.code),
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', syncDocumentLanguage)
syncDocumentLanguage(i18n.language)

export default i18n
export * from './locales'

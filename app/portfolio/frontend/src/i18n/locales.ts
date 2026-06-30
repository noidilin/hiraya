export const appLanguages = [
  { code: 'en', label: 'EN', htmlLang: 'en' },
  { code: 'zh-TW', label: 'TW', htmlLang: 'zh-TW' },
] as const

export type AppLocale = (typeof appLanguages)[number]['code']
export const defaultAppLocale: AppLocale = 'en'
export const appLanguageStorageKey = 'hiraya-portfolio-language'

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return appLanguages.some((language) => language.code === value)
}

export function normalizeAppLocale(value: string | null | undefined): AppLocale | undefined {
  return isAppLocale(value) ? value : undefined
}

export function detectBrowserLocale(languages?: readonly string[]): AppLocale {
  for (const language of languages ?? []) {
    const normalized = language.trim().toLowerCase()
    if (normalized === 'zh-tw' || normalized === 'zh-hant' || normalized.startsWith('zh-hant-')) {
      return 'zh-TW'
    }
    if (normalized === 'en' || normalized.startsWith('en-')) {
      return 'en'
    }
  }

  return defaultAppLocale
}

export function readStoredAppLocale(): string | undefined {
  if (typeof localStorage === 'undefined') return undefined

  try {
    return localStorage.getItem(appLanguageStorageKey) ?? undefined
  } catch {
    return undefined
  }
}

export function writeStoredAppLocale(locale: AppLocale): void {
  if (typeof localStorage === 'undefined') return

  try {
    localStorage.setItem(appLanguageStorageKey, locale)
  } catch {
    // Keep locale switching functional in browsers that block storage access.
  }
}

export function resolveInitialLocale(options?: {
  stored?: string | null
  browserLanguages?: readonly string[]
}): AppLocale {
  const stored = options?.stored ?? readStoredAppLocale()
  const browserLanguages = options?.browserLanguages ?? (typeof navigator === 'undefined' ? undefined : navigator.languages)

  return normalizeAppLocale(stored) ?? detectBrowserLocale(browserLanguages)
}

export function getHtmlLang(locale: AppLocale): string {
  return appLanguages.find((language) => language.code === locale)?.htmlLang ?? defaultAppLocale
}

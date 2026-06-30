import { describe, expect, it, vi } from 'vitest'

import { detectBrowserLocale, normalizeAppLocale, resolveInitialLocale, writeStoredAppLocale } from './locales'

describe('i18n locale utilities', () => {
  it('normalizes only canonical locales', () => {
    expect(normalizeAppLocale('en')).toBe('en')
    expect(normalizeAppLocale('zh-TW')).toBe('zh-TW')
    expect(normalizeAppLocale(`zh${'TW'}`)).toBeUndefined()
  })

  it('detects supported browser locales precisely', () => {
    expect(detectBrowserLocale(['zh-TW'])).toBe('zh-TW')
    expect(detectBrowserLocale(['zh-Hant-HK'])).toBe('zh-TW')
    expect(detectBrowserLocale(['zh-CN'])).toBe('en')
    expect(detectBrowserLocale(['en-US'])).toBe('en')
  })

  it('lets stored canonical values win over browser detection', () => {
    expect(resolveInitialLocale({ stored: 'en', browserLanguages: ['zh-TW'] })).toBe('en')
    expect(resolveInitialLocale({ stored: 'zh-TW', browserLanguages: ['en-US'] })).toBe('zh-TW')
  })

  it('falls back from invalid stored values to browser detection then English', () => {
    expect(resolveInitialLocale({ stored: `zh${'TW'}`, browserLanguages: ['zh-Hant'] })).toBe('zh-TW')
    expect(resolveInitialLocale({ stored: 'fr', browserLanguages: ['zh-CN'] })).toBe('en')
  })

  it('keeps locale resolution and writes safe when storage access is blocked', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    })

    expect(resolveInitialLocale({ browserLanguages: ['zh-TW'] })).toBe('zh-TW')
    expect(() => writeStoredAppLocale('en')).not.toThrow()

    vi.unstubAllGlobals()
  })
})

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

export const languages = [
  { code: 'en', label: 'EN', htmlLang: 'en' },
  { code: 'zhTW', label: '繁中', htmlLang: 'zh-TW' },
] as const

export type AppLanguage = (typeof languages)[number]['code']

export const languageStorageKey = 'lazycicd-language'

const resources = {
  en: {
    translation: {
      app: {
        eyebrow: 'Lazy CI/CD lab',
        title: 'Interactive CI/CD starter',
        description:
          'A bilingual teaching surface for CI/CD concepts, now with richer motion primitives for visual explanations.',
        simulate: 'Simulate run',
        reset: 'Reset',
        runs: 'Runs simulated with Zustand: {{count}}',
      },
      stack: {
        title: 'Frontend tooling',
        items: [
          'Vite + React + TypeScript',
          'TanStack Router + Query',
          'Zustand',
          'shadcn/ui + Tailwind',
          'GSAP + React Flow + Remotion',
          'i18next + react-i18next',
          'React Bits visual components',
        ],
      },
      flow: {
        commit: 'Commit',
        test: 'Test',
        deploy: 'Deploy',
        timeline: 'CI/CD timeline',
      },
      visuals: {
        title: 'Motion palette',
        transitionBefore: 'Code enters the pipeline',
        transitionAfter: 'Release reaches production',
        trailTitle: 'Pointer trail',
        trailSubtitle: 'Pixel Trail',
        gridTitle: 'Shape Grid',
        gridSubtitle: 'Canvas background layer',
      },
    },
  },
  zhTW: {
    translation: {
      app: {
        eyebrow: 'Lazy CI/CD 實驗室',
        title: '互動式 CI/CD 入門',
        description: '支援繁中與英文的教學介面，加入更多動態視覺元件來說明 CI/CD 流程。',
        simulate: '模擬執行',
        reset: '重設',
        runs: 'Zustand 模擬執行次數：{{count}}',
      },
      stack: {
        title: '前端工具',
        items: [
          'Vite + React + TypeScript',
          'TanStack Router + Query',
          'Zustand',
          'shadcn/ui + Tailwind',
          'GSAP + React Flow + Remotion',
          'i18next + react-i18next',
          'React Bits 視覺元件',
        ],
      },
      flow: {
        commit: '提交',
        test: '測試',
        deploy: '部署',
        timeline: 'CI/CD 時間軸',
      },
      visuals: {
        title: '動態視覺庫',
        transitionBefore: '程式碼進入流水線',
        transitionAfter: '版本抵達正式環境',
        trailTitle: '游標軌跡',
        trailSubtitle: 'Pixel Trail',
        gridTitle: 'Shape Grid',
        gridSubtitle: 'Canvas 背景層',
      },
    },
  },
} as const

const isAppLanguage = (language: string | null): language is AppLanguage =>
  languages.some((option) => option.code === language)

const getInitialLanguage = () => {
  const storedLanguage = localStorage.getItem(languageStorageKey)
  return isAppLanguage(storedLanguage) ? storedLanguage : 'en'
}

const syncDocumentLanguage = (language: string) => {
  const matchedLanguage = languages.find((option) => option.code === language)
  document.documentElement.lang = matchedLanguage?.htmlLang ?? 'en'
}

void i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  supportedLngs: languages.map((language) => language.code),
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', (language) => {
  if (isAppLanguage(language)) {
    localStorage.setItem(languageStorageKey, language)
  }
  syncDocumentLanguage(language)
})
syncDocumentLanguage(i18n.language)

export default i18n

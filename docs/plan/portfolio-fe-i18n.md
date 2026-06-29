# Portfolio Frontend i18n Implementation Plan

## Purpose

Implement i18n for the Hiraya portfolio frontend, targeting `/hiraya/*` first while establishing a clean global locale foundation for the rest of the app.

This plan is for the next implementation agent. Follow the decisions in:

- `docs/adr/0010-hiraya-portfolio-i18n-hybrid-localization.md`
- `app/portfolio/frontend/docs/i18n-translation-guideline-zhTW.md`
- `app/portfolio/frontend/docs/presentation-en.md`
- `app/portfolio/frontend/docs/presentation-zhTW.md`

## Scope

In scope:

- Migrate locale identifiers from `zhTW` to `zh-TW` globally.
- Replace `src/i18n.ts` with a small `src/i18n/` module.
- Add shared `AppLocale` / `defaultAppLocale` / language metadata.
- Add `useAppLocale()`.
- Use one global locale state across Hiraya, lab routes, and shared chrome.
- Split Hiraya content into `src/content/hiraya/` with separate locale files.
- Add full Hiraya English and zh-TW content structures.
- Use `presentation-zhTW.md` as authoritative zh-TW source, adapted into the UI content model.
- Localize reusable visible UI chrome with `i18next`.
- Localize Guide Chat frontend chrome only.
- Add locale utility tests and Hiraya content parity tests.

Out of scope:

- Locale URL segments or query params.
- Legacy storage migration from `lazycicd-language`.
- Runtime compatibility alias for `zhTW`.
- Translating lab lesson/body content beyond mechanical key rename.
- Translating Guide API responses, prompts, citations, knowledge-base content, initial assistant message, or assistant fallback/error chat messages.
- Hardcoded-string lint rule.
- JSON translation files or external translation tooling.

## Required Runtime Behavior

Supported locales:

- `en`
- `zh-TW`

Language preference:

- Storage key: `hiraya-portfolio-language`
- Only canonical values are valid: `en`, `zh-TW`
- Ignore old `lazycicd-language`
- Do not support old `zhTW` value
- Persist only when user explicitly changes language through the app
- Do not persist passive browser detection on first load

Initial locale resolution:

1. If `hiraya-portfolio-language` has a valid canonical locale, use it.
2. Else inspect browser languages:
   - `zh-TW` -> `zh-TW`
   - `zh-Hant` / `zh-Hant-*` -> `zh-TW`
   - `en` / `en-*` -> `en`
   - all others, including `zh`, `zh-CN`, `zh-Hans`, `zh-SG`, `zhTW` -> `en`
3. Fallback to `en`.

Document language:

- Sync `<html lang>` to `en` or `zh-TW`.
- Do not add `dir` support in this pass.

Routing:

- Keep existing URLs unchanged:
  - `/hiraya`
  - `/hiraya/$pageId`
  - `/chapters/*`
  - `/visuals`
- Invalid Hiraya page IDs keep current behavior: render `brief` fallback, no new redirect.
- Route IDs, aliases, section IDs, evidence IDs, and resource IDs remain stable English identifiers.

## Desired File Structure

Create/adjust these files:

```txt
app/portfolio/frontend/src/i18n/
  index.ts
  locales.ts
  resources.ts
  use-app-locale.ts
  locales.test.ts

app/portfolio/frontend/src/content/hiraya/
  types.ts
  en.ts
  zh-TW.ts
  content.ts
  hiraya-content-parity.test.ts
```

Remove or replace:

```txt
app/portfolio/frontend/src/i18n.ts
app/portfolio/frontend/src/content/hirayaContent.ts
```

If removing `hirayaContent.ts` creates too much churn, keep a temporary compatibility export file that re-exports from `src/content/hiraya/content.ts`, but prefer updating imports directly.

## Implementation Phases / Logical Commits

### Commit 1: i18n foundation cleanup

Goal: establish canonical locale infrastructure without changing Hiraya content yet.

Tasks:

1. Create `src/i18n/locales.ts`.

   It should export roughly:

   ```ts
   export const appLanguages = [
     { code: 'en', label: 'EN', htmlLang: 'en' },
     { code: 'zh-TW', label: 'TW', htmlLang: 'zh-TW' },
   ] as const

   export type AppLocale = (typeof appLanguages)[number]['code']
   export const defaultAppLocale: AppLocale = 'en'
   export const appLanguageStorageKey = 'hiraya-portfolio-language'
   export function isAppLocale(value: string | null | undefined): value is AppLocale
   export function normalizeAppLocale(value: string | null | undefined): AppLocale | undefined
   export function detectBrowserLocale(languages?: readonly string[]): AppLocale
   export function resolveInitialLocale(options?: { stored?: string | null; browserLanguages?: readonly string[] }): AppLocale
   export function getHtmlLang(locale: AppLocale): string
   ```

   Notes:
   - `normalizeAppLocale('zhTW')` must not return `zh-TW`.
   - `detectBrowserLocale(['zh-Hant-HK'])` should return `zh-TW`.
   - `detectBrowserLocale(['zh-CN'])` should return `en`.

2. Create `src/i18n/resources.ts`.

   Keep i18next resources as TypeScript objects. Start with current resources from `src/i18n.ts`, but rename locale key `zhTW` to `zh-TW`.

   Add namespaces/keys for shared UI chrome that will be needed later, for example:

   ```ts
   common: {
     language: {
       switchToTraditionalChinese: 'Switch locale to Traditional Chinese',
       switchToEnglish: 'Switch locale to English',
     },
     nav: {
       chapters: 'Chapters',
       openChapters: 'Open chapters',
       hiraya: 'Hiraya',
       openHiraya: 'Open Hiraya',
       repository: 'Hiraya repository',
       openRepository: 'Open Hiraya repository on GitHub',
     },
   },
   guide: {
     launcher: {
       ask: 'Ask Hiraya Guide',
       minimize: 'Minimize Guide',
     },
     panel: {
       title: 'Hiraya Guide',
       close: 'Close Hiraya Guide',
       ...
     },
   }
   ```

   Add zh-TW equivalents following `i18n-translation-guideline-zhTW.md`.

3. Create `src/i18n/index.ts`.

   It should initialize i18next with:

   - `resources`
   - `lng: resolveInitialLocale()` based on new storage key and browser language
   - `fallbackLng: defaultAppLocale`
   - `supportedLngs: appLanguages.map(...)`
   - `interpolation.escapeValue = false`

   It should sync `<html lang>` on init and when language changes.

   Important: do **not** persist language in the global `languageChanged` handler. Persistence should happen only in `useAppLocale().setLocale()`.

4. Create `src/i18n/use-app-locale.ts`.

   Hook API:

   ```ts
   export function useAppLocale(): {
     locale: AppLocale
     setLocale: (locale: AppLocale) => void
     languages: typeof appLanguages
   }
   ```

   Requirements:

   - Return normalized supported locale only.
   - No raw `i18n.language` exposed.
   - `setLocale()` calls `i18n.changeLanguage(locale)` and writes `hiraya-portfolio-language`.

5. Update `src/main.tsx` import.

   From:

   ```ts
   import './i18n'
   ```

   To either:

   ```ts
   import './i18n'
   ```

   if directory index resolution works, or explicitly:

   ```ts
   import './i18n/index'
   ```

6. Mechanically rename locale keys/types:

   - `zhTW` -> `zh-TW`
   - `LabLocaleKey` should be replaced where practical with shared `AppLocale`.
   - `defaultLabLocale` should be replaced where practical with `defaultAppLocale`.
   - `labLocaleKeys` should either be removed or re-export shared app locale keys if still needed.

   Files likely affected:

   - `src/content/labContentTypes.ts`
   - `src/content/labChapters.ts`
   - `src/content/labVisualContent.ts`
   - `src/components/app/navigation/global-dock.tsx`
   - `src/features/lab/pages/kinetic-lab-page.tsx`
   - `src/features/hiraya/pages/hiraya-page.tsx`
   - tests

7. Wire global locale state into lab and Hiraya pages.

   Replace page-local state like:

   ```ts
   const [locale, setLocale] = useState<LabLocaleKey>(defaultLabLocale)
   ```

   With:

   ```ts
   const { locale, setLocale } = useAppLocale()
   ```

   Lab content can continue falling back to English for untranslated fields.

8. Add pure utility tests in `src/i18n/locales.test.ts`.

   Test behavior, not translated strings.

   Suggested cases:

   - valid canonical locale normalization
   - `zhTW` is not normalized to `zh-TW`
   - `zh-TW` browser detection
   - `zh-Hant-*` browser detection
   - `zh-CN` fallback to English
   - `en-US` detection to English
   - stored canonical value wins over browser detection
   - invalid stored value falls back to browser detection, then English

Validation after commit:

```bash
cd app/portfolio/frontend
pnpm typecheck
pnpm test
```

### Commit 2: Hiraya content module refactor, English behavior preserved

Goal: split current English Hiraya content into a dedicated module without changing rendered English content.

Tasks:

1. Create `src/content/hiraya/types.ts`.

   Move current types from `src/content/hirayaContent.ts`:

   - `HirayaRouteId`
   - `HirayaRouteAlias`
   - `HirayaContentTable`
   - `HirayaContentSection`
   - `HirayaMetric`
   - `HirayaProofPoint`
   - `HirayaMediaSlot`
   - `HirayaEvidenceItem`
   - `HirayaFlowStep`
   - `HirayaWellArchitectedPillar`
   - `HirayaPageContent`

   Keep route IDs stable:

   ```ts
   export const hirayaRouteIds = ['brief', 'arch', 'cost', 'sdlc', 'waf'] as const
   ```

2. Create `src/content/hiraya/en.ts`.

   Move the current English arrays/objects from `hirayaContent.ts`:

   - evidence items
   - route aliases if appropriate, or keep aliases in `content.ts`
   - pages

   Name exports clearly, for example:

   ```ts
   export const hirayaEvidenceItemsEn = [...] satisfies readonly HirayaEvidenceItem[]
   export const hirayaPagesEn = [...] satisfies readonly HirayaPageContent[]
   ```

3. Create placeholder `src/content/hiraya/zh-TW.ts`.

   Initially, duplicate English content structure if needed to satisfy strict types. This will be replaced/adapted in Commit 3.

   Export:

   ```ts
   export const hirayaEvidenceItemsZhTW = [...] satisfies readonly HirayaEvidenceItem[]
   export const hirayaPagesZhTW = [...] satisfies readonly HirayaPageContent[]
   ```

   Note: final zh-TW prose must be translated in Commit 3. This temporary duplication is only to complete the structural refactor.

4. Create `src/content/hiraya/content.ts`.

   It should export pure resolver functions that accept locale explicitly:

   ```ts
   export function getHirayaPages(locale: AppLocale): readonly HirayaPageContent[]
   export function getHirayaEvidenceItems(locale: AppLocale): readonly HirayaEvidenceItem[]
   export function resolveHirayaRouteId(routeId: string | undefined): HirayaRouteId
   export function findHirayaPage(routeId: string | undefined, locale: AppLocale): HirayaPageContent
   ```

   Requirements:

   - Invalid/missing page ID falls back to `brief`.
   - No resolver reads global i18next state.
   - Route aliases remain locale-independent.

5. Update imports from old module.

   Current imports like:

   ```ts
   import { findHirayaPage, hirayaPages } from '@/content/hirayaContent'
   ```

   Should become:

   ```ts
   import { findHirayaPage, getHirayaPages } from '@/content/hiraya/content'
   ```

6. Update `HirayaPage`.

   - Use `useAppLocale()`.
   - Resolve content at page/container level.
   - Pass already-localized content down.
   - `HirayaActionBar` should receive localized pages or locale and call `getHirayaPages(locale)` at container/action-bar level; do not make leaf cards resolve translations.

   Example shape:

   ```tsx
   const { locale, setLocale } = useAppLocale()
   const pages = getHirayaPages(locale)
   const activePage = findHirayaPage(activePageId, locale)
   ```

7. Add `src/content/hiraya/hiraya-content-parity.test.ts`.

   It should compare `hirayaPagesEn` and `hirayaPagesZhTW`.

   Strictly assert:

   - same page count
   - same page IDs and order
   - same section IDs and order
   - same table column/row counts
   - same metric count
   - same proof point IDs
   - same media slot IDs, types, statuses, evidence refs
   - same flow step IDs
   - same WAF pillar IDs
   - same tools arrays, because official product/tool names should remain unchanged
   - same non-translatable metadata

   Do not assert exact translated prose.

Validation after commit:

```bash
cd app/portfolio/frontend
pnpm typecheck
pnpm test
```

### Commit 3: Hiraya zh-TW content adaptation

Goal: replace duplicated placeholder zh-TW text with real Traditional Chinese content adapted from `presentation-zhTW.md`.

Tasks:

1. Read and use:

   - `app/portfolio/frontend/docs/presentation-en.md`
   - `app/portfolio/frontend/docs/presentation-zhTW.md`
   - `app/portfolio/frontend/docs/i18n-translation-guideline-zhTW.md`

2. Translate/adapt all text fields in `src/content/hiraya/zh-TW.ts`.

   Fields likely requiring translation:

   - `navLabel`
   - `shortLabel`
   - `eyebrow`
   - `title`
   - `summary`
   - `thesis`
   - metric `label` / `note` where prose
   - proof point `title` / `summary`
   - media slot `title` / `description`
   - section `eyebrow` / `title` / `body` / `bullets` / `tags`
   - table column headers and translated cells where prose
   - flow step `title` / `summary`
   - WAF pillar `title` / `stance` / `highlights` / `futureHardening`

3. Preserve non-translatable values:

   - IDs
   - route IDs
   - aliases
   - URLs
   - domains
   - ports
   - CIDRs
   - AWS regions
   - service names
   - secret paths
   - evidence refs
   - tool/product names and common acronyms

4. Follow short action-bar labels:

   | Route | zh-TW short label |
   |---|---|
   | brief | 概覽 |
   | arch | 架構 |
   | cost | 成本 |
   | sdlc | SDLC |
   | waf | WAF |

5. Keep official terms in English where guideline says so:

   - AWS, EKS, Kubernetes, Terraform, GitHub Actions, Argo CD, GitOps, ECR, IRSA, OIDC, ALB, ACM, Route 53, Prometheus, Grafana, Well-Architected, CI/CD, SDLC.

6. Run parity test frequently while editing.

Validation after commit:

```bash
cd app/portfolio/frontend
pnpm typecheck
pnpm test
```

### Commit 4: UI chrome localization

Goal: move visible reusable UI labels to i18next and ensure they follow global locale.

Tasks:

1. Update `GlobalDock`.

   Current hardcoded strings include:

   - `Switch locale to Traditional Chinese`
   - `Switch locale to English`
   - `Chapters`
   - `Open chapters`
   - `Hiraya`
   - `Open Hiraya`
   - `Hiraya repository`
   - `Open Hiraya repository on GitHub`

   Use `useTranslation()` for these.

   Keep current compact badge behavior:

   - current `en` displays `EN`
   - current `zh-TW` can display current compact style, currently `TW`

2. Update Hiraya action bar labels.

   These should come from localized Hiraya page `shortLabel`, not i18next.

3. Update Guide Chat visible frontend chrome only.

   Files likely affected:

   - `src/features/guide-chat/components/guide-chat-launcher.tsx`
   - `src/features/guide-chat/components/guide-chat-panel.tsx`
   - `src/features/guide-chat/components/citation-list.tsx`
   - possibly message bubble/input components if they contain labels/placeholders

   In scope examples:

   - launcher button label
   - minimize label
   - panel title/subtitle if static UI chrome
   - close aria label
   - input placeholder
   - send button label
   - citation heading if a UI label
   - purely UI loading/status labels

   Out of scope, do not translate:

   - `initialGuideMessage` in `use-guide-chat.ts`
   - assistant fallback/error chat message in `use-guide-chat.ts`
   - backend-generated answer text
   - citation content
   - prompt/API behavior

4. Update tests that assert hardcoded English chrome.

   Do not add brittle exact zh-TW prose assertions. Prefer behavior/structure tests.

   For Guide Chat tests, ensure:

   - launcher still appears on Hiraya routes
   - launcher still absent outside Hiraya routes
   - chat messages remain as expected/out of scope
   - UI still submits typed prompt

Validation after commit:

```bash
cd app/portfolio/frontend
pnpm typecheck
pnpm test
```

### Commit 5: Final validation and cleanup

Goal: ensure the implementation is shippable.

Tasks:

1. Search for old locale key:

   ```bash
   rg "zhTW|lazycicd-language|LabLocaleKey|defaultLabLocale" app/portfolio/frontend/src
   ```

   Expected:

   - no `zhTW` runtime/content keys
   - no `lazycicd-language`
   - no remaining old lab locale type unless intentionally re-exported as compatibility inside code, which is discouraged

2. Search for old content module imports:

   ```bash
   rg "hirayaContent" app/portfolio/frontend/src
   ```

   Expected: none, unless a temporary re-export was intentionally kept.

3. Run validation:

   ```bash
   cd app/portfolio/frontend
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```

4. Manual smoke test locally:

   ```bash
   cd app/portfolio/frontend
   pnpm dev
   ```

   Check:

   - `/hiraya/brief` renders English by default if browser language is not Traditional Chinese.
   - Toggle language to zh-TW updates Hiraya content.
   - Refresh keeps explicit selected locale.
   - `<html lang>` updates.
   - `/hiraya/arch`, `/hiraya/cost`, `/hiraya/sdlc`, `/hiraya/waf` render localized content.
   - Action bar labels localize.
   - GlobalDock labels/tooltips localize.
   - Guide Chat launcher/panel chrome localizes, but initial assistant message remains unchanged.
   - `/chapters/*` uses same selected locale but untranslated lesson content falls back to English.
   - Invalid `/hiraya/not-real` renders brief fallback.

## Important Existing Code Notes

Current relevant files before implementation:

- `src/i18n.ts` already initializes i18next but uses `zhTW` and old storage key.
- `src/main.tsx` imports `./i18n`.
- `src/content/labContentTypes.ts` defines `LabLocaleKey` and fallback resolver.
- `src/content/labChapters.ts` has many `zhTW: {}` placeholders.
- `src/content/labVisualContent.ts` has actual translated presentation UI labels plus many empty visual `zhTW: {}` entries.
- `src/content/hirayaContent.ts` is English-only and large.
- `src/features/hiraya/pages/hiraya-page.tsx` currently has page-local locale state that does not affect Hiraya content.
- `GuideChatLauncher` is mounted under Hiraya route only.

## Translation Guidance

Use `presentation-zhTW.md` for terminology and copy direction. Do not literal-translate blindly. The existing zh-TW presentation uses a polished Taiwanese technical portfolio style.

Rules:

- Traditional Chinese only.
- Preserve product/tool names.
- Preserve resource names and technical identifiers.
- Translate surrounding prose naturally.
- Keep DevOps terms in English when common and recognizable.
- Prefer concise labels for UI.
- Do not translate code-like values, domains, paths, regions, ports, secret names, IDs.

## Testing Strategy

Required tests:

1. Locale utility tests:
   - normalization
   - browser detection
   - initial locale resolution
   - no `zhTW` compatibility

2. Hiraya content parity test:
   - structural parity only
   - no exact translated prose assertions

3. Existing feature tests updated:
   - avoid assuming global Guide Chat outside Hiraya
   - avoid brittle hardcoded English UI labels where labels are now translated
   - preserve behavior tests for submit/fallback/session

Do not add:

- hardcoded-string lint rule
- exhaustive translation snapshot tests
- exact zh-TW copy tests unless unavoidable

## Acceptance Criteria

Implementation is complete when:

- `zh-TW` is the only Traditional Chinese locale key in source content/runtime.
- `zhTW` is not supported as runtime alias.
- `hiraya-portfolio-language` is the only language storage key used.
- Browser detection works only for `zh-TW` / `zh-Hant*`; unsupported locales fall back to English.
- User-selected locale persists; passive browser detection does not write preference.
- Hiraya pages have complete English and zh-TW content.
- Hiraya content is split into `src/content/hiraya/` module.
- Hiraya resolvers are pure and accept locale explicitly.
- Hiraya presentational components receive localized content objects.
- Lab routes use global locale state but untranslated content falls back to English.
- Shared UI chrome and Guide Chat chrome are localized through i18next.
- Guide assistant messages/API responses/citations remain unchanged.
- Tests, typecheck, lint, and build pass.

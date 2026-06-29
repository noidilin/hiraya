# Hiraya Portfolio i18n Hybrid Localization

Status: accepted

Hiraya portfolio i18n will target the `/hiraya/*` portfolio pages first. The CI/CD lab routes under `/chapters/*` and `/visuals` are explicitly out of scope for the first i18n implementation pass, except where shared navigation chrome needs to remain coherent across routes.

Hiraya will use a hybrid localization approach. Large structured portfolio content will stay in typed content objects, while reusable UI chrome will use `i18next` / `react-i18next`. This means page data such as hero copy, summaries, metrics, proof points, media slot descriptions, sections, tables, flow steps, and Well-Architected pillar copy should be represented as localized TypeScript content and resolved by the active locale. Shared interface strings such as dock tooltips, aria labels, buttons, loading states, errors, and generic navigation labels should be translated through i18next resources.

This is preferred over putting all portfolio content into i18next keys because Hiraya content is long-form and structurally rich. Splitting it into many flat translation keys would make the page harder to review, weaken TypeScript guarantees around page shape, and make English/zh-TW parity harder to inspect. Typed localized content objects preserve the current `hirayaContent.ts` structure and match the existing lab content model pattern, while still allowing i18next to handle the smaller reusable UI strings where it is strongest.

The accepted implementation direction is therefore:

- Use a single global active locale shared by the Hiraya route, lab routes, and shared chrome.
- Do not add locale segments or query parameters to URLs in the first pass; keep existing routes such as `/hiraya/brief` stable and persist language as user preference.
- Standardize locale identifiers on BCP 47 language tags, specifically `en` and `zh-TW`; migrate existing code/content keys from `zhTW` to `zh-TW` and do not support `zhTW` as a runtime compatibility alias.
- Replace the current single `src/i18n.ts` file with a small `src/i18n/` module that separates locale definitions, i18next initialization, TypeScript UI resources, and a React `useAppLocale()` hook.
- Use shared `AppLocale` / `defaultAppLocale` definitions for both Hiraya and lab content instead of keeping a separate `LabLocaleKey` source of truth.
- Wire the locale switcher to i18next language state instead of page-local state; persist preference only in the new `hiraya-portfolio-language` key with no migration from the legacy `lazycicd-language` key.
- Persist language only when the user explicitly changes locale through the app; do not write passive browser-detected initial locale to localStorage.
- Add Hiraya-specific localized content types and pure resolver functions for structured page content; resolver functions must accept locale explicitly rather than reading global i18next state.
- Split Hiraya content into a dedicated module, for example `src/content/hiraya/`, with shared types/resolvers and separate `en.ts` and `zh-TW.ts` locale files.
- Duplicate the full Hiraya page content structure per locale rather than applying partial translation overlays onto English content.
- Require complete Hiraya content in both `en` and `zh-TW`; do not allow partial fallback for Hiraya page content.
- Add a parity test that enforces matching page IDs/order, section IDs/order, table dimensions, metric/proof/media/flow/pillar IDs, non-translatable metadata, evidence references, and tool arrays across locale files while allowing translated prose to differ.
- Keep route IDs, aliases, section IDs, evidence IDs, resource identifiers, URLs, AWS/Kubernetes service names, ports, CIDRs, secret paths, and product names unchanged across locales.
- Use `app/portfolio/frontend/docs/presentation-zhTW.md` as the authoritative zh-TW translation source and manually adapt it into the Hiraya UI content model.
- Use `app/portfolio/frontend/docs/i18n-translation-guideline-zhTW.md` as the zh-TW translation style guide.
- Translate Hiraya portfolio pages before expanding the same strategy to lab/lesson content; lab content may keep English fallback for untranslated fields after the mechanical `zh-TW` locale-key migration, but lab routes should still read the same global `useAppLocale()` state.
- Detect browser language only when no saved preference exists; map only `zh-TW` and `zh-Hant*` to `zh-TW`, and fall back to English for all unsupported locales.
- Localize the visible Hiraya Guide chat frontend chrome because the launcher is mounted under the Hiraya route, but leave Guide API response language, prompt behavior, citations, knowledge-base content, and frontend-authored assistant/fallback chat messages unchanged in this pass. Guide Chat components may call `useTranslation()` directly for chrome labels.
- Keep i18next UI resources in TypeScript for this pass instead of introducing JSON translation files.
- Resolve localized Hiraya page content at page/container level and pass already-localized content objects to presentational Hiraya components.
- Add small pure locale utility tests for normalization, browser detection, and initial-locale resolution, plus structural parity tests for Hiraya locale content. Avoid brittle tests that assert exact translated prose.
- Implement the change in logical commits/phases: i18n foundation cleanup, Hiraya content module refactor, Hiraya zh-TW content adaptation, UI chrome localization, and validation.

The trade-off is that the frontend will have two localization mechanisms: typed localized content for domain/page content, and i18next for reusable UI labels. This is acceptable because the boundary is explicit: content/body data belongs in localized content objects; repeated UI chrome belongs in i18next. If future requirements include external translation management or non-developer editing, the typed content objects may be exported to JSON or migrated behind the same resolver API without changing route components.

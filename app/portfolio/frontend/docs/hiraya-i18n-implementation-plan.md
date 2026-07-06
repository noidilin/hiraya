# Hiraya i18n Implementation Plan

## Goal

Complete the accepted ADR-0010 hybrid localization design for the Hiraya Portfolio routes under `/hiraya/*`.

The finished implementation should let Portfolio Visitors switch between `en` and `zh-TW` without seeing mixed-language Hiraya route content, while preserving stable routes, typed content contracts, and maintainable parity checks.

## Confirmed decisions

- Follow ADR-0010; do not reopen the localization architecture.
- Keep existing routes stable. Do not add locale URL segments or query parameters.
- Use the existing global `AppLocale` / `useAppLocale()` state.
- Keep first-pass content localization scoped to `/hiraya/*`; do not translate `/chapters/*` lab content in this pass.
- Use the hybrid model:
  - typed localized content objects for Hiraya page/domain/visual content;
  - i18next resources for reusable UI chrome and generic controls.
- Use `en` and `zh-TW` only. Do not support legacy `zhTW` runtime aliases.
- Require complete Hiraya content in both locales. Do not allow partial runtime fallback to English for Hiraya route content.
- Translate manually for polished Taiwanese technical portfolio style using:
  - `app/portfolio/frontend/docs/presentation-zhTW.md`
  - `app/portfolio/frontend/docs/i18n-translation-guideline-zhTW.md`
- Preserve common DevOps/AWS/Kubernetes product and concept names in English where that is the natural technical usage.
- Keep stable metadata unchanged across locales: IDs, route IDs, evidence IDs, enum values, graph edge endpoints, source refs, URLs, file paths, resource identifiers, ports, CIDRs, hostnames, product/tool names, and route aliases.
- Keep source refs in content data for maintainers and parity tests, but hide raw source/file refs from visitor-facing Hiraya UI in this pass.

## Current state observed

Already present:

- `src/i18n/` module with locale definitions, i18next resources, initialization, and `useAppLocale()`.
- `en` and `zh-TW` Hiraya page-level content in `src/content/hiraya/en.ts` and `src/content/hiraya/zh-TW.ts`.
- Page resolver functions in `src/content/hiraya/content.ts`.
- Locale utility tests in `src/i18n/locales.test.ts`.
- Basic Hiraya page content parity test in `src/content/hiraya/hiraya-content-parity.test.ts`.

Still requiring i18n completion:

- Route-specific visual/domain modules are mostly English-only:
  - `architectureOwnership.ts`
  - `architectureRuntimeInteractions.ts`
  - `architectureExposureBoundaries.ts`
  - `briefPlatformProofMap.ts`
  - `costTradeoffLedger.ts`
  - `sdlcAuthorityFlow.ts`
  - `sdlcDeliveryGuardrails.ts`
  - `wafMaturityJudgment.ts`
  - `evidence-assets.ts`
- Hiraya visual components still contain hardcoded English UI labels, headings, aria labels, table headers, tab metadata, and helper copy.
- Some components render raw source refs/file-path chips that should remain internal metadata rather than visitor-facing UI.

## Content module file pattern

Use a flat module trio inside `src/content/hiraya/` for each route-specific concept module.

Example:

```text
src/content/hiraya/architectureOwnership.ts        # types + resolver/export surface
src/content/hiraya/architectureOwnership.en.ts     # English localized data
src/content/hiraya/architectureOwnership.zh-TW.ts  # zh-TW localized data
```

Apply the same pattern to:

```text
architectureRuntimeInteractions
architectureExposureBoundaries
briefPlatformProofMap
costTradeoffLedger
sdlcAuthorityFlow
sdlcDeliveryGuardrails
wafMaturityJudgment
evidence-assets
```

The existing page-level `en.ts` / `zh-TW.ts` files can remain as the page-content locale files unless a later cleanup chooses to split them further.

## Resolver model

Add one aggregate route-design resolver for Hiraya visual content, backed by the per-module resolvers.

Suggested shape:

```ts
export type HirayaRouteDesignContent = {
  briefProofPathOverview: readonly BriefProofPathCard[]
  briefPlatformProofMap: BriefPlatformProofMapContent
  architectureOwnership: ArchitectureOwnershipContent
  architectureExposureBoundaries: ExposureBoundaryContent
  architectureRuntimeInteractions: ArchitectureRuntimeInteractionsContent
  costCapacityTradeoffLedger: CostCapacityTradeoffLedgerContent
  sdlcAuthorityFlow: SdlcAuthorityFlowContent
  sdlcDeliveryGuardrails: readonly SdlcDeliveryGuardrail[]
  wafMaturityJudgment: WafMaturityJudgmentContent
  evidenceAssets: readonly HirayaEvidenceAsset[]
}

export function getHirayaRouteDesignContent(locale: AppLocale): HirayaRouteDesignContent
```

Resolve this bundle at the route/container composition level and pass already-localized objects into presentational components.

Components should not read global i18n state to resolve route/domain content. They may still use `useTranslation()` for generic reusable controls and aria labels.

## Translatable vs stable fields

Translate:

- visitor-facing titles, labels, summaries, descriptions, captions, notes, stance text, claims, rules, allowed/forbidden explanations, handoff copy, non-claim copy, tab labels, table headers, table prose cells, button labels, aria labels, empty-state/helper copy.

Keep stable:

- object IDs;
- route IDs and route aliases;
- evidence IDs;
- enum values such as `status`, `kind`, `tradeoffClass`, `authorityBadge`;
- graph node IDs and edge source/target IDs;
- `sourceRefs` / `sourceDoc` data;
- URLs, paths, workflow names, resource names, ports, CIDRs, hostnames;
- product/tool names where they are official names or common technical usage.

## UI chrome boundary

Use typed localized content for concept-owned labels, such as:

- route visual section headings;
- table column labels when specific to a concept board;
- WAF maturity state copy;
- SDLC authority lane/stage labels;
- cost ledger tab names;
- exposure class labels;
- proof lens labels;
- evidence asset titles/captions.

Use i18next resources for reusable chrome, such as:

- previous/next carousel controls;
- generic evidence carousel aria labels;
- generic status labels if reused outside one concept;
- common language/nav labels;
- Guide chat chrome already under `guide.*`.

## Evidence asset localization

Localize evidence asset human-facing metadata:

- `title`
- `caption`
- `alt` when present

Keep these stable:

- `evidenceId`
- `kind`
- `status`
- `preferredUse`
- `routes`
- `src`

Update evidence asset lookup so components receive localized metadata by active locale, not the English-only manifest.

## Hide source refs from visitor UI

Keep source refs in the data model and parity tests, but remove or hide visitor-facing raw source/file reference chips from Hiraya visuals.

Known areas to check:

- Brief proof map inspected node card currently renders `node.sourceRefs`.
- WAF maturity detail panel currently renders `sourceRefs`.
- Any future evidence/source debug panels should stay out of the default visitor UI.

If a source-inspection affordance is wanted later, add it intentionally as a debug/dev-only feature, not as part of normal localized portfolio reading.

## Parity testing plan

Expand `hiraya-content-parity.test.ts` or add route-module-specific parity tests.

Do not assert exact translated prose. Assert structural and metadata parity.

Minimum parity coverage:

- Page content:
  - page IDs/order;
  - `sourceDoc` / `sourceSection` stability;
  - section IDs/order;
  - table dimensions;
  - metric/proof/media/flow/pillar IDs;
  - evidence refs and tools arrays where stable.
- Brief proof path overview:
  - card IDs/order;
  - evidence refs;
  - source refs.
- Brief platform proof map:
  - zone IDs/order, positions, sizes;
  - node IDs/order, kind/role/toolIcon/positions/sourceRefs;
  - edge IDs/source/target/lens IDs;
  - lens IDs/highlighted node IDs/evidence refs/nextRoute.
- Architecture ownership:
  - boundary IDs/order;
  - layer IDs/order;
  - connector endpoints/order;
  - stable mechanism/tool/resource arrays where intentionally unchanged.
- Architecture exposure boundaries:
  - group IDs/order;
  - row IDs/order;
  - exposure class values;
  - row counts.
- Architecture runtime interactions:
  - tab/default IDs;
  - fact count/order where relevant;
  - stage IDs/order and boundary enum values;
  - request example IDs/stage lists;
  - service IDs/status/ports/exposure identifiers where stable;
  - secret step IDs/order/source refs;
  - non-claim count.
- Cost ledger:
  - tradeoff IDs/order/classes/source refs;
  - estimate row categories/order;
  - capacity numeric values and Terraform sizing metadata.
- SDLC authority flow:
  - lane IDs/order;
  - stage IDs/order/concept IDs/credential tones/evidence refs;
  - connector endpoints/order.
- SDLC delivery guardrails:
  - guardrail IDs/order;
  - authority badges;
  - mapped flow stage IDs;
  - source/evidence refs.
- WAF maturity judgment:
  - pillar IDs/order;
  - maturity item IDs/order/states;
  - source/evidence refs;
  - tools arrays.
- Evidence assets:
  - evidence IDs/order;
  - kind/status/preferredUse/routes/src stability.

Avoid broad “English leakage” tests because technical English is intentionally preserved. Use manual mixed-language audit instead.

## Implementation phases

### Phase 1 — Resolver and parity foundation

- Add aggregate route-design content type/resolver.
- Add per-module resolver pattern for one small module first to validate the convention.
- Expand parity test helpers so route modules can share stable structural assertions.
- Update `HirayaPage` / `HirayaRouteDesign` to resolve route-design content from `locale` and pass it as props.

Acceptance:

- Existing English UI still renders.
- Locale switch still changes page-level content.
- Tests pass.

### Phase 2 — Brief route vertical slice

- Split/localize:
  - `briefProofPathOverview`
  - `briefPlatformProofMap`
- Pass localized Brief content to `BriefProofPathOverview` and `BriefPlatformProofMap`.
- Move Brief-specific hardcoded labels into typed content or i18next according to ownership.
- Hide raw source refs in Brief proof map visitor UI.

Acceptance:

- `/hiraya/brief` switches cleanly between English and zh-TW.
- Brief proof map graph remains structurally identical across locales.

### Phase 3 — Architecture route vertical slice

- Split/localize:
  - `architectureOwnership`
  - `architectureExposureBoundaries`
  - `architectureRuntimeInteractions`
- Localize concept-owned labels: ownership explorer labels, exposure table/filter labels, runtime tabs, graph helper labels, non-claims.
- Keep resource names, ports, service names, hostnames, and Kubernetes/AWS identifiers stable.

Acceptance:

- `/hiraya/arch` has no unintended English prose outside preserved technical terms.
- Graph/table structures remain aligned by parity tests.

### Phase 4 — Cost route vertical slice

- Split/localize `costTradeoffLedger`.
- Localize cost tabs, headings, assumptions, justifications, capacity decision explanation, and ledger copy.
- Preserve numeric capacity snapshot, instance types, categories, and source refs.

Acceptance:

- `/hiraya/cost` switches cleanly and preserves the same capacity model.

### Phase 5 — SDLC route vertical slice

- Split/localize:
  - `sdlcAuthorityFlow`
  - `sdlcDeliveryGuardrails`
- Localize authority lanes, stages, allowed actions, does-not-own copy, guardrail rules, risks, and badge labels.
- Preserve stage IDs, mapped stage IDs, credential tone enums, and evidence refs.

Acceptance:

- `/hiraya/sdlc` switches cleanly and preserves authority-flow semantics.

### Phase 6 — WAF + evidence + final chrome cleanup

- Split/localize:
  - `wafMaturityJudgment`
  - `evidence-assets`
- Localize WAF maturity board state copy, pillar descriptions, recommendations, item summaries, evidence captions.
- Move remaining generic Hiraya chrome to i18next resources.
- Remove/hide raw source refs from WAF visitor UI.
- Run an `rg` audit for hardcoded English in `src/features/hiraya` and decide whether each remaining string is:
  - stable technical term;
  - concept-owned localized content;
  - reusable i18next chrome;
  - dev-only/debug-only text.

Acceptance:

- `/hiraya/waf` and all evidence carousels switch cleanly.
- No known visitor-facing source-ref chips remain.

## Validation gates

Run from repository root:

```sh
pnpm run portfolio:frontend:test
pnpm run portfolio:frontend:typecheck
pnpm run portfolio:frontend:lint
pnpm run portfolio:frontend:build
```

Manual smoke:

- Start the frontend with:

```sh
pnpm --filter @hiraya/portfolio-frontend dev
```

- In both `en` and `zh-TW`, inspect:
  - `/hiraya/brief`
  - `/hiraya/arch`
  - `/hiraya/cost`
  - `/hiraya/sdlc`
  - `/hiraya/waf`
- Check:
  - route navigation labels update;
  - route-specific boards are localized;
  - graphs still fit and remain usable;
  - tables do not overflow badly beyond existing responsive behavior;
  - preserved English technical terms look intentional;
  - no raw source/file refs are visible in normal visitor UI;
  - Guide chat chrome remains localized while Guide responses remain out of scope.

## Out of scope

- Translating `/chapters/*` lab lesson content.
- Changing route URLs or adding locale route params.
- Adding external translation management or JSON resource files.
- Localizing Guide API responses, Guide prompt behavior, citations, or curated knowledge content.
- Adding broad English-leakage tests.
- Adding full browser/e2e screenshot test coverage.

## Definition of done

- All `/hiraya/*` route-specific visual/domain content resolves from active `AppLocale`.
- `en` and `zh-TW` Hiraya content structures are complete and parity-tested.
- Reusable Hiraya UI chrome needed by the localized routes is covered by i18next resources.
- Raw source/file refs remain in data but are hidden from normal visitor UI.
- Validation gates pass.
- Manual EN/TW smoke confirms no unintended mixed-language route experience.

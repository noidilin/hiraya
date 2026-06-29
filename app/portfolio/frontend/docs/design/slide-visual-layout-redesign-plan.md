# Slide Visual Layout Redesign Implementation Plan

## Goal

Redesign the current CI/CD slide visual layouts so each visual uses the much larger slide slot effectively, with the desktop experience for a 14-inch MacBook Pro as the primary target.

This is a layout and composition redesign only. Preserve the teaching meaning, required primitives, interaction behavior, motion intent, accessibility notes, and adjacent-slide diversity in `docs/design/slide-design-requirements.md`.

## Primary Decisions

- Use shared layout-system changes first, then slide-specific refinements.
- Preserve every slide's existing interaction model unless `slide-design-requirements.md` changes.
- Make the main diagram, graph, matrix, funnel, loop, dashboard, or control surface visually dominant.
- Use a dedicated desktop right rail for supplemental details.
- Reserve the footer for state controllers only.
- Keep graph legends near or inside the graph only when they explain node types, edge types, or connection meaning.
- Move explanation-only chips, summaries, selected-state copy, route details, artifact identity, and evidence lists to the right rail.
- Adopt a larger desktop React Flow canvas and fix slide layouts around it.
- Maximize vertical use within the allocated main visual space while keeping a roughly 16:9 graph stage.
- Apply the same height-aware rule to non-React Flow visuals.

## Target Experience

Primary viewport:

- Desktop: `1512 x 982` CSS pixels.
- Secondary desktop check: around `1280 x 832` CSS pixels.

Desktop composition:

- Slide header remains compact.
- Visual slot fills the available presentation body.
- Main visual region takes the largest area.
- Right rail has a fixed desktop width of `260px`, with an allowed `280px` max for dense slides.
- Footer is fixed-height and contains only `VisualStateController` or equivalent state controls.
- Mobile and narrow layouts may stack the rail below the main visual, but desktop should not place the rail below the canvas.

## Current Constraints Found In Code

The outer slot already provides substantially more vertical room:

- `src/components/lab/presentation/visual-slot-renderer.tsx`
- Current shell class: `min-h-[40rem] md:min-h-[34rem] md:h-[calc(100svh-12rem)] md:max-h-[56rem]`

Several slide internals still behave like compact reference previews:

- Local `max-w` caps such as `max-w-[34rem]`, `max-w-[42rem]`, `max-w-[46rem]`, `max-w-[58rem]`, and `max-w-[59rem]`.
- Small SVG caps such as `max-w-[14rem]`.
- Below-canvas summary cards that compete with the graph for height.
- Ad hoc side panels instead of the dedicated right rail.
- Shared shell minimums that were tuned for preview-size components.

Primary shared files to update:

- `src/components/lab/presentation/visual-slot-renderer.tsx`
- `src/components/lab/slides/cicd/shared/system-responsibility-kit.tsx`
- `src/components/lab/slides/cicd/shared/loop-pipeline-kit.tsx`
- `src/components/lab/slides/cicd/shared/trust-tradeoff-kit.tsx`
- `src/components/lab/slides/cicd/shared/flow-canvas.tsx`
- `src/components/lab/slides/cicd/shared/visual-state-control.tsx`

Reference visual language:

- `src/components/lab/visual-reference-gallery.tsx`
- `src/components/lab/visuals/*`
- Route: `/visuals`

## Orchestration Mode

This plan is intended to be executed with the `implementation-plan-orchestrator` skill.

The orchestrator must:

- Create and maintain a task-plan UI before implementation begins.
- Keep exactly one task-plan item in progress.
- Run each bounded slice through worker, reviewer, integration, and acceptance gates.
- Mark a slice complete only after the orchestrator accepts the reviewed result.
- Keep control of sequencing, integration fixes, and final verification in the main agent.
- Avoid broad parallel delegation until shared layout contracts are stable.
- Never revert unrelated user changes.

### Orchestrator Intake Checklist

Before spawning workers, the orchestrator should read:

- `AGENTS.md`
- `docs/design/slide-visual-layout-redesign-plan.md`
- `docs/design/slide-design-requirements.md`
- `docs/design/visual-flow-canvas-guidelines.md`
- `src/components/lab/presentation/visual-slot-renderer.tsx`
- `src/components/lab/presentation/topic-content.tsx`
- `src/components/lab/slides/cicd/shared/system-responsibility-kit.tsx`
- `src/components/lab/slides/cicd/shared/loop-pipeline-kit.tsx`
- `src/components/lab/slides/cicd/shared/trust-tradeoff-kit.tsx`
- `src/components/lab/slides/cicd/shared/flow-canvas.tsx`
- `src/components/lab/slides/cicd/shared/visual-state-control.tsx`
- `src/components/lab/visual-reference-gallery.tsx`

The orchestrator should inspect:

- `git status --short`
- The current slide file list under `src/components/lab/slides/cicd/`
- Current local `max-w-*`, `h-*`, and below-canvas detail patterns in slide files.

Likely conflict zones:

- Shared shell class exports and imports.
- `SlideFlowCanvas` constants and default sizing.
- Slide files that import shared shell helpers.
- Shared primitive files under `src/components/lab/visuals/`.
- Footer and right-rail semantics.

### Task Plan UI Items

Use these as the initial task-plan items:

1. Intake and slice stabilization.
2. Shared shell and right-rail contract.
3. Larger React Flow canvas contract.
4. React Flow slide refactor pass.
5. Non-flow shell and primitive expansion pass.
6. Matrix, dashboard, metric, and evidence slide pass.
7. Visual QA and integration fixes.
8. Final static verification and summary.

Each item must pass worker and reviewer gates before the next item starts, except the intake item, which the orchestrator handles directly.

### Worker And Reviewer Loop

For each implementation slice:

1. Orchestrator updates the task-plan item to in progress.
2. Worker implements only the owned slice.
3. Worker reports changed files and verification performed.
4. Reviewer inspects only that slice against this plan and the relevant acceptance criteria.
5. Orchestrator inspects the diff and reviewer findings.
6. Orchestrator either accepts the slice, applies small integration fixes, or sends a focused follow-up.
7. If material fixes are made, run another review pass.
8. Orchestrator marks the task-plan item complete only when the slice is stable.

Reviewer focus:

- Plan compliance.
- Correct layout ownership: main visual, rail, footer.
- No explanation-only graph nodes.
- No footer summaries or footer legends.
- No old preview caps kept without reason.
- Type/import/export correctness.
- Accessibility regressions.
- Responsive desktop behavior.
- Missing screenshot or verification risk.

### Worker Prompt Template

Each worker prompt should include:

```md
Objective:
Implement [slice name] from docs/design/slide-visual-layout-redesign-plan.md.

Owned files/directories:
- [explicit file list]

Avoid:
- [files outside the slice]
- Reverting unrelated user changes
- Broad refactors not required by this slice

Relevant plan sections:
- [section names]

Acceptance criteria:
- [slice-specific criteria]

Notes:
- Other agents may be working in the repo.
- Preserve slide semantics from docs/design/slide-design-requirements.md.
- Preserve React Flow rules from docs/design/visual-flow-canvas-guidelines.md.
- Footer is for state controllers only.
- Supplemental details belong in the right rail on desktop.
- Report changed files and verification performed.
```

### Reviewer Prompt Template

Each reviewer prompt should include:

```md
Review [slice name].

Worker-claimed changed files:
- [file list]

Original objective:
[slice objective]

Relevant acceptance criteria:
- [criteria]

Boundaries to preserve:
- [owned files]
- [avoid list]

Focus on bugs, regressions, plan compliance, import/type issues, accessibility risks, and missing verification.
Do not perform broad rewrites. Provide focused findings and minimal fix suggestions.
```

## Orchestrated Slice Definitions

### Slice 0: Intake And Stabilization

Owner: orchestrator.

Tasks:

- Complete the intake checklist.
- Confirm current git status.
- Confirm the slide inventory still has 33 CI/CD slide files.
- Identify any user changes that overlap the plan.
- Update the task-plan UI if the current repo shape requires different sequencing.

Acceptance gate:

- The orchestrator has a current task plan and understands conflict zones before workers start.

### Slice 1: Shared Shell And Right-Rail Contract

Recommended worker ownership:

- `src/components/lab/slides/cicd/shared/system-responsibility-kit.tsx`
- `src/components/lab/slides/cicd/shared/loop-pipeline-kit.tsx`
- `src/components/lab/slides/cicd/shared/trust-tradeoff-kit.tsx`
- `src/components/lab/slides/cicd/shared/visual-state-control.tsx`
- Small call-site adjustments required only to keep the build compiling.

Avoid:

- Broad slide-by-slide redesign.
- React Flow node repositioning.
- Visual primitive redesign under `src/components/lab/visuals/`.

Tasks:

- Establish shared body, main-region, right-rail, dense-rail, and footer layout tokens.
- Standardize desktop right rail width at `260px`, with an optional dense `280px` variant.
- Let shells receive custom rail content where needed.
- Ensure footer remains available only for state controls.
- Keep mobile/narrow stacking behavior.

Acceptance gate:

- `LoopPipelineShell`, `FamilyShell`, and `TrustTradeoffShell` share a coherent desktop body contract.
- Existing slide call sites still compile.
- No worker-introduced footer summary pattern exists.

### Slice 2: Larger React Flow Canvas Contract

Recommended worker ownership:

- `src/components/lab/slides/cicd/shared/flow-canvas.tsx`
- Minimal call-site updates in React Flow slides if required by type or prop changes.

Avoid:

- Full slide node repositioning.
- Non-flow primitive changes.

Tasks:

- Replace preview-sized fixed canvas height with height-aware sizing.
- Add larger desktop canvas constants.
- Preserve pan, zoom, `fitView`, non-draggable nodes, and semantic node type support.
- Keep mobile/tablet fitting down responsively.
- Support graph legends without encouraging explanation overlays.

Acceptance gate:

- React Flow slides compile against the new canvas.
- The canvas can fill the allocated main-stage height.
- Existing graph behavior is preserved.

### Slice 3: React Flow Slide Refactor Pass

Recommended worker ownership:

- `src/components/lab/slides/cicd/01-delivery-loop-comparison.tsx`
- `src/components/lab/slides/cicd/02-trusted-pipeline-path.tsx`
- `src/components/lab/slides/cicd/08-system-skill-map.tsx`
- `src/components/lab/slides/cicd/09-architecture-to-pipeline-mapping.tsx`
- `src/components/lab/slides/cicd/10-coupled-validation-model.tsx`
- `src/components/lab/slides/cicd/11-affected-service-graph.tsx`
- `src/components/lab/slides/cicd/13-artifact-to-runtime-map.tsx`
- `src/components/lab/slides/cicd/16-release-operations-loop.tsx`
- `src/components/lab/slides/cicd/19-system-fit-frame.tsx`
- `src/components/lab/slides/cicd/28-ai-architecture-review.tsx`

Avoid:

- Shared shell redesign beyond small integration fixes.
- Non-flow slide files.

Tasks:

- Reposition nodes for the larger desktop canvas.
- Remove old local desktop width caps unless a specific reason is documented.
- Move below-canvas summaries into the rail.
- Keep graph legends only for node/edge grammar.
- Keep state controllers in the footer.

Acceptance gate:

- Each React Flow slide uses `main visual + right rail + footer controller`.
- No explanation-only React Flow nodes or desktop below-canvas summary cards remain in this group.
- Slide semantics still match `slide-design-requirements.md`.

### Slice 4: Non-Flow Shell And Primitive Expansion Pass

Recommended worker ownership:

- `src/components/lab/visuals/primitive-kit.tsx`
- `src/components/lab/visuals/concept-scene.tsx`
- `src/components/lab/visuals/comparison-frame.tsx`
- `src/components/lab/visuals/evidence-chain.tsx`
- `src/components/lab/visuals/metric-constellation.tsx`
- `src/components/lab/visuals/trust-funnel.tsx`
- `src/components/lab/visuals/responsibility-lanes.tsx`
- `src/components/lab/visuals/ai-assistance-orbit.tsx`
- Slide files from Group B where those primitives are used directly.

Avoid:

- React Flow slide node repositioning.
- Matrix/dashboard slide redesign unless needed for shared primitive compatibility.

Tasks:

- Remove preview-sized caps from slide-use layouts.
- Make loops, funnels, orbits, comparisons, and control surfaces height-aware.
- Keep `/visuals` reference previews clean by preserving preview compatibility through wrapper classes or defaults.
- Move supplemental details to the rail where slide wrappers provide one.

Acceptance gate:

- Non-flow visuals use the available vertical space without stretched empty panels.
- `/visuals` still renders reference components.
- Reduced-motion behavior remains intact.

### Slice 5: Matrix, Dashboard, Metric, And Evidence Slide Pass

Recommended worker ownership:

- `src/components/lab/slides/cicd/05-benefit-evidence-path.tsx`
- `src/components/lab/slides/cicd/12-operating-model-comparison.tsx`
- `src/components/lab/slides/cicd/14-permission-lanes.tsx`
- `src/components/lab/slides/cicd/17-evidence-chain.tsx`
- `src/components/lab/slides/cicd/18-qualitative-checklist.tsx`
- `src/components/lab/slides/cicd/21-release-health-frame.tsx`
- `src/components/lab/slides/cicd/22-duration-breakdown.tsx`
- `src/components/lab/slides/cicd/23-delivery-recovery-metrics.tsx`
- `src/components/lab/slides/cicd/24-trust-efficiency-metrics.tsx`
- `src/components/lab/slides/cicd/25-security-audit-confidence.tsx`
- `src/components/lab/slides/cicd/26-metric-constellation.tsx`
- `src/components/lab/slides/cicd/30-responsibility-authority-map.tsx`

Avoid:

- React Flow canvas contract changes.
- Shared shell redesign beyond small integration fixes.

Tasks:

- Expand matrix, board, dashboard, metric, and evidence surfaces.
- Move selected-state summaries and interpretation copy into the rail.
- Keep evidence chains, metric constellations, and dashboards as the primary visual surface.
- Preserve hover/focus detail access.

Acceptance gate:

- Dense slides are readable at the primary desktop viewport.
- Supplemental interpretation lives in the rail on desktop.
- Keyboard and text accessibility are preserved.

### Slice 6: Visual QA And Integration Fixes

Owner: orchestrator, with optional focused worker follow-ups.

Tasks:

- Run the app locally.
- Capture all 33 slides at `1512 x 982`.
- Capture risky slides at around `1280 x 832`.
- Capture `/visuals`.
- Compare screenshots against the visual acceptance checks.
- Apply small integration fixes directly or send focused follow-up workers.
- Re-review any materially changed slice.

Acceptance gate:

- No slide looks like a centered preview.
- No desktop slide has footer summaries, footer legends, or explanation cards below the main visual.
- React Flow and non-flow visuals both maximize their allocated vertical space.

### Slice 7: Final Static Verification

Owner: orchestrator.

Tasks:

- Run:

```bash
pnpm lint
pnpm tsc --noEmit
pnpm build
```

- Document any existing unrelated failures separately from new failures.
- Summarize changed files, accepted exceptions, screenshot coverage, and residual risk.

Acceptance gate:

- Static verification passes, or failures are clearly identified as unrelated/existing.
- The final summary reports verification and any remaining risks.

## Phase 1: Shared Layout System

### 1. Create A Slide Visual Shell Contract

Update the shared slide shells so all visual families use the same desktop structure:

- Outer shell: full available height from `className`.
- Body: `main visual + fixed right rail`.
- Footer: state controller only.
- Right rail: fixed `260px`, optional `280px` variant for dense slides.
- Main visual: `min-h-0`, `h-full`, and no local centering that shrinks the diagram.

Recommended implementation shape:

- Replace the current `visualShellBodyClassName` with a height-aware grid.
- Add explicit exported class tokens for:
  - `slideVisualBodyClassName`
  - `slideVisualMainClassName`
  - `slideVisualRailClassName`
  - `slideVisualDenseRailClassName`
- Keep `VisualShellDetailRail`, but make it suitable as the canonical desktop rail rather than a small metadata aside.
- Let slide shells accept optional rail content where the generic title/status rail is not enough.

Acceptance criteria:

- `LoopPipelineShell`, `FamilyShell`, and `TrustTradeoffShell` all share the same body structure.
- Footer is rendered only when controls exist.
- Footer content is only state control UI.
- Desktop rail appears to the right, not below.
- Mobile/narrow layouts can stack the rail below the main visual.

### 2. Standardize Right Rail Content

The right rail should contain supplemental details such as:

- Selected-state summary.
- Evidence lists.
- Route status.
- Artifact identity.
- Legend text that is not graph grammar.
- Matrix row/column interpretation.
- Scenario result copy.
- Health signal details.

Do not put these in the footer or below the canvas on desktop.

The right rail should not contain:

- State controllers.
- Graph elements that are part of spatial meaning.
- Large paragraphs that duplicate slide narration.
- Decorative cards.

Acceptance criteria:

- No desktop slide uses below-canvas summary cards when a right rail would carry the same information.
- Footer remains visually and semantically reserved for state controls.
- Right rail copy is concise and keyboard-accessible.

### 3. Upgrade React Flow Canvas Sizing

Update `src/components/lab/slides/cicd/shared/flow-canvas.tsx`.

Current canonical board:

- `736 x 416`

New desktop intent:

- Adopt a larger desktop canvas first.
- The allocated React Flow surface should maximize vertical size in the main visual column.
- Preserve a roughly 16:9 graph stage.
- Width follows the available height unless column width becomes the limiting constraint.
- Keep mobile/tablet using the same graph, fitted down responsively.

Implementation notes:

- Replace fixed `h-[26rem]` behavior with height-aware sizing.
- Consider exported constants for the larger desktop board, for example:
  - `SLIDE_FLOW_DESKTOP_CANVAS_WIDTH`
  - `SLIDE_FLOW_DESKTOP_CANVAS_HEIGHT`
- Keep a logical board abstraction for node positioning, but allow existing slides to move to the new dimensions intentionally.
- Keep `fitView`, pan, zoom, and non-draggable nodes.
- Tune `fitViewOptions` slide by slide after the shared canvas grows.

Acceptance criteria:

- React Flow surfaces use most of the main column height on desktop.
- Node labels and edge labels are larger/clearer because the canvas is larger, not merely scaled into the old cramped board.
- Graph legends that explain node/edge grammar remain near the graph.
- Explanation-only overlays move to the right rail.

### 4. Expand Non-Flow Visual Defaults

For visual primitives and non-flow slide components:

- Remove preview-sized caps when the component is used in a slide.
- Use `h-full`, `min-h-0`, `flex-1`, and responsive aspect constraints.
- Increase SVG viewport usage and matrix/table row density where needed.
- Keep label text readable and avoid stretched empty panels.

Affected reference primitives may include:

- `src/components/lab/visuals/primitive-kit.tsx`
- `src/components/lab/visuals/concept-scene.tsx`
- `src/components/lab/visuals/comparison-frame.tsx`
- `src/components/lab/visuals/evidence-chain.tsx`
- `src/components/lab/visuals/metric-constellation.tsx`
- `src/components/lab/visuals/trust-funnel.tsx`
- `src/components/lab/visuals/responsibility-lanes.tsx`
- `src/components/lab/visuals/ai-assistance-orbit.tsx`

Acceptance criteria:

- Non-flow visuals no longer sit as small centered previews inside the larger shell.
- Matrices, dashboards, funnels, loops, and constellations each use the full allocated visual height.
- The `/visuals` route still renders reference previews cleanly.

## Phase 2: Slide Group Refactors

Work slide groups in this order so shared patterns settle before dense slides are tuned.

### Group A: React Flow Maps And Graphs

Slides:

- `01-delivery-loop-comparison.tsx`
- `02-trusted-pipeline-path.tsx`
- `08-system-skill-map.tsx`
- `09-architecture-to-pipeline-mapping.tsx`
- `10-coupled-validation-model.tsx`
- `11-affected-service-graph.tsx`
- `13-artifact-to-runtime-map.tsx`
- `16-release-operations-loop.tsx`
- `19-system-fit-frame.tsx`
- `28-ai-architecture-review.tsx`

Tasks:

- Move local layout to `main visual + right rail + footer controller`.
- Remove local desktop `max-w-[46rem]`, `max-w-[58rem]`, and `max-w-[59rem]` caps unless there is a specific clipping risk.
- Reposition nodes for the larger desktop board.
- Keep graph semantics inside React Flow.
- Keep node/edge legends with the graph only when they explain relationships.
- Move selected-state explanations and route summaries to the rail.
- Remove below-canvas summary cards from desktop layouts.

High-priority examples:

- Slide 2: move CI/CD gate question cards and live summary to the rail; make the pipeline canvas occupy the main column height.
- Slide 9: move selected boundary stage scope cards to the rail; let the bipartite map dominate.
- Slide 13: keep artifact, environments, dependencies, and evidence in the graph; move promotion summary and same-artifact explanation to the rail.
- Slide 16: keep the branching route canvas dominant; rail carries route status, intended artifact, and health evidence.

Acceptance criteria:

- Each flow slide visibly reads as a large spatial teaching canvas.
- Rail content clarifies the selected graph state.
- Footer contains only the state controller where a slide has states.
- No slide uses explanation cards below the canvas on desktop.

### Group B: Loop, Pipeline, Funnel, And Control Surfaces

Slides:

- `03-ai-assisted-change-funnel.tsx`
- `04-six-stage-loop.tsx`
- `06-simple-vs-production-reality.tsx`
- `07-chapter-takeaway.tsx`
- `15-speed-trust-balance.tsx`
- `20-tradeoff-frame.tsx`
- `27-ai-delivery-loop-orbit.tsx`
- `29-optimization-assistant-panel.tsx`
- `31-security-evidence-gates.tsx`
- `32-suggestion-evidence-decision.tsx`
- `33-ai-accelerator-takeaway.tsx`

Tasks:

- Replace compact centered compositions with height-aware stage layouts.
- Increase loop, funnel, orbit, and control-surface scale.
- Move supplemental explanations to the right rail.
- Use the footer only for sliders, segmented controls, or state selectors.
- Preserve reduced-motion behavior.

High-priority examples:

- Slide 3: enlarge the funnel body and use rail for pass/hold interpretation.
- Slide 4: remove the `max-w-[34rem]` feel; enlarge the six-stage loop and artifact callout.
- Slide 6: expand simple-vs-production comparison so layered constraints are visible without tiny text.
- Slide 15: make the speed/trust control surface the main visual, not a set of compact cards.
- Slide 29: allow before/after timing bars and evidence-risk review to feel like a workspace.

Acceptance criteria:

- The main visual object is the largest element in the slide body.
- Detail cards do not compete equally with the diagram.
- All interactive states remain keyboard reachable.

### Group C: Matrices, Boards, Dashboards, And Evidence Views

Slides:

- `05-benefit-evidence-path.tsx`
- `12-operating-model-comparison.tsx`
- `14-permission-lanes.tsx`
- `17-evidence-chain.tsx`
- `18-qualitative-checklist.tsx`
- `21-release-health-frame.tsx`
- `22-duration-breakdown.tsx`
- `23-delivery-recovery-metrics.tsx`
- `24-trust-efficiency-metrics.tsx`
- `25-security-audit-confidence.tsx`
- `26-metric-constellation.tsx`
- `30-responsibility-authority-map.tsx`

Tasks:

- Expand matrix and board layouts to use full height.
- Keep repeated items dense but readable.
- Move explanatory and selected-state summaries to the rail.
- For evidence chains, keep the chain/path prominent and put question details in rail/focus states.
- For metrics, make the graph/board/dash surface primary and rail carry interpretation.

High-priority examples:

- Slide 12: hosted-vs-self-hosted matrix should feel like the main surface, not a narrow table.
- Slide 14: permission matrix should use available height for row/column readability.
- Slide 17: move status-only explanation and question details to the rail; make evidence chain dominant.
- Slide 21: release health dashboard should center artifact/version and use surrounding zones.
- Slide 26: metric constellation should expand, with tension-line legend near the graph and interpretation in rail.

Acceptance criteria:

- Matrices and dashboards are readable at the primary desktop viewport.
- Metric and evidence interpretation is text-accessible.
- Hover/focus details have keyboard equivalents.

## Phase 3: Slide-Specific Audit Checklist

For every slide, verify:

- The visual fills the larger slot instead of floating as a small preview.
- The main visual area is dominant.
- The right rail contains supplemental details on desktop.
- The footer contains only state controls.
- Graph legends explain graph grammar only.
- Explanation-only content is not inside React Flow.
- Text does not overlap, clip, or become unreadably small.
- Reduced-motion behavior still communicates the same state changes.
- Keyboard focus reaches controls, meaningful nodes/cards, and detail reveals.
- The slide still satisfies `docs/design/slide-design-requirements.md`.

## Phase 4: Verification Workflow

Run static checks:

```bash
pnpm lint
pnpm tsc --noEmit
pnpm build
```

Run the app:

```bash
pnpm dev
```

Screenshot verification:

- Capture all 33 slides at `1512 x 982`.
- Capture the riskiest slides at around `1280 x 832`.
- Include `/visuals` to ensure reference components still render well.

Riskiest slides for secondary screenshot pass:

- React Flow maps: 1, 2, 8, 9, 10, 11, 13, 16, 19, 28.
- Dense matrices/boards: 12, 14, 17, 21, 24, 26, 30.
- Complex control surfaces: 15, 20, 29, 32.

Visual acceptance checks:

- No slide looks like a centered preview inside a large shell.
- No desktop slide places selected-state explanation below the main visual.
- Right rail is consistently located and not overcrowded.
- Footer is consistently reserved for state controls.
- React Flow surfaces maximize the allocated vertical space.
- Non-flow visuals use height proportionally and do not stretch awkwardly.
- All required visual primitives remain visible.
- Adjacent-slide visual diversity from `slide-design-requirements.md` is preserved.

## Orchestrated Execution Order

Execute the plan through the slice definitions above, not as a fire-and-forget checklist.

1. Slice 0: orchestrator intake and stabilization.
2. Slice 1: shared shell and right-rail contract.
3. Slice 2: larger React Flow canvas contract.
4. Slice 3: React Flow slide refactor pass.
5. Slice 4: non-flow shell and primitive expansion pass.
6. Slice 5: matrix, dashboard, metric, and evidence slide pass.
7. Slice 6: visual QA and integration fixes.
8. Slice 7: final static verification and summary.

Default to sequential execution. Parallel workers are only allowed after Slice 2 if the orchestrator identifies truly disjoint write sets and can still perform review, integration, and screenshot QA coherently. Do not mark a slice complete until worker output, reviewer feedback, any integration fixes, and any required re-review are accepted by the orchestrator.

## Deliberate Exceptions Policy

Exceptions are allowed only when the slide's semantic design requires it.

Allowed exceptions:

- A tiny graph legend may remain inside or over the canvas when it explains node or edge grammar.
- A spatial annotation may remain inside React Flow when it needs to pan and zoom with graph concepts.
- A dense slide may use a `280px` right rail.
- Mobile may stack the rail below the main visual.

Not allowed:

- Explanation cards below the canvas on desktop.
- Footer summaries.
- Footer legends.
- State controllers in the rail when the footer is available.
- Explanation-only React Flow nodes.
- Preserving old `max-w` caps only because they already exist.

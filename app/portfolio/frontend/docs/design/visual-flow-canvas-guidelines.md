# Visual Flow Canvas Guidelines

Use this guideline when a CI/CD slide visual adopts `@xyflow/react` through `SlideFlowCanvas`.

## Purpose

Treat `SlideFlowCanvas` as the main spatial stage for the visual component shell. It is not a small embedded widget. The canvas should receive most of the shell body, especially on desktop where height is the scarce resource.

Design against the shared canonical board in `src/features/lab/slides/cicd/shared/flow-canvas.tsx`:

- Width: `736px`
- Height: `416px`
- Interaction: pan and zoom the viewport
- Constraint: nodes are not draggable

## What Belongs In React Flow

Put elements inside React Flow when they are part of the diagram's spatial model:

- Pipeline stages
- Gates
- Artifacts
- Environments
- System boundaries
- Skill domains
- Dependency paths
- Edge labels
- Selected-path annotations
- Anything that should pan and zoom with the graph

## What Stays Outside React Flow

Keep non-spatial UI fixed outside the graph:

- Segmented controls
- Scenario selectors
- Legends
- Summary text
- Status pills
- Selected-detail cards
- Explanatory chips
- Help text or interaction affordances

Do not put normal UI inside React Flow only because the slide adopted React Flow. If it teaches, controls, summarizes, or explains the graph, keep it fixed.

## Layout Rules

- The canvas is the primary left/main region.
- Extra detail UI should use a narrow right-side rail on desktop.
- Do not place the detail rail below the canvas on desktop.
- Keep `VisualStateController` in the shell footer.
- Tiny legends or status indicators may be fixed overlays on the canvas.
- On mobile, the right rail may stack below the canvas or become a compact overlay.
- Mobile should use the same React Flow canvas, not a separate non-flow fallback.

## Interaction Contract

- Users may pan the viewport.
- Users may zoom the viewport.
- Users may not drag nodes.
- Users should not need direct graph manipulation to understand or operate the slide.
- Slide controls should change graph state.

## Node And Edge Design

- Use the pre-built semantic node components in `src/features/lab/visuals/flow/` for CI/CD maps.
- Type slide nodes as `SlideFlowCanvasNode` when using `SlideFlowCanvas`; it already includes the visual node kit.
- Use the built-in semantic node `type` values instead of creating ad hoc card-shaped text nodes:
  - `flowStage` for validate, build, deploy, verify, and other pipeline steps
  - `flowGate` for decisions, approvals, policy checks, and release gates
  - `flowArtifact` for packages, image digests, SBOMs, provenance, and registry records
  - `flowEnvironment` for dev, staging, production, and runtime targets
  - `flowSystem` for services, databases, infra, platforms, and external dependencies
  - `flowEvidence` for tests, logs, scans, approvals, rollback notes, and outcomes
  - `flowMetric` for lead time, frequency, recovery, failure rate, and health signals
  - `flowActor` for developers, reviewers, release owners, platform teams, and AI assistants
- Supply `VisualFlowNodeData` with `label`, `detail`, optional `code`, `status`, `metric`, `Icon`, `tone`, and handle positions as needed.
- Keep descriptive detail in `detail` for tooltip and accessibility; do not pack paragraphs of explanatory text onto the node face.
- Use `flowStage`, `flowGate`, `flowArtifact`, `flowEnvironment`, `flowSystem`, `flowEvidence`, `flowMetric`, and `flowActor` to get distinct geometry, icons, handles, tooltip behavior, and reduced-motion-safe decoration.
- Use shared `slideEdge` edges for ordinary relationships.
- Use shared `slideCard` nodes only as a fallback for generic annotations that do not match the semantic kit.
- Add custom node or edge types only when the visual grammar truly changes and none of the pre-built semantic nodes can express it.
- Keep explicit, stable node positions.
- Use `fitView` for viewport adaptation.
- Do not encode meaning only through color or motion.
- Labels and status text should carry the concept.
- Keep animations purposeful and reduced-motion safe.

## Rule Of Thumb

If it is part of the concept map, put it in React Flow.

If it teaches, controls, summarizes, or explains the concept map, keep it fixed outside React Flow.

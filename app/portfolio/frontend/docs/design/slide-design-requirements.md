# Slide Design Requirements

## Scope

This document covers Chapter 1 `why-cicd-matters`, Chapter 2 `skill-sets-needed`, Chapter 3 `evaluating-cicd-benefits`, and Chapter 4 `ai-builds-better-cicd`. It preserves the Stage 2 visual-slot intent while compensating for shorter slide-facing text with stronger visual specificity, narration references, interaction behavior, and accessibility requirements.

For map-heavy slide visuals that use `@xyflow/react` or `SlideFlowCanvas`, follow `docs/visual-flow-canvas-guidelines.md`. Keep the graph as the primary spatial stage, use the shared semantic node types for systems, stages, gates, artifacts, environments, evidence, metrics, and actors, and keep controls, legends, scenario selectors, and explanatory summaries outside the canvas.

## Chapter 1: Why CI/CD Matters

### Slide 1: Software is not done when code is written

- Chapter: `why-cicd-matters`
- Slide id/title: `software-not-done-when-written` / Software is not done when code is written
- Concise slide text: Writing code starts delivery; it does not finish it. CI/CD expands local confidence into a shared loop that validates, packages, deploys, verifies, and feeds evidence back.
- Script reference: `labSlideScripts['software-not-done-when-written']`
- Original meaning preserved: The slide still expands the learner's definition of done from local code completion to a shared delivery loop with validation, packaging, deployment, verification, and feedback.
- Visual component design requirement: Build a nested loop comparison. The small inner loop represents local development: write, inspect, run, adjust. The larger outer loop represents shared delivery: source change, validation, build/package, deploy, verify/observe, feedback to team. Written code must appear as the start of the outer path, not the finish line.
- Required visual primitives: Two loop paths, directional arrows, movable change token, four inner-stage nodes, six outer-stage nodes, status/evidence badges, compact labels, and icons for code, checks, package, deploy, observe, and feedback.
- Interaction/motion requirement: Start with the inner loop active, move the change token once around it, then reveal or unfold the outer loop and carry the token into validation. In reduced motion, use a staged highlight with no continuous movement.
- Accessibility notes: Provide visible text labels for every stage and an aria label describing the nested relationship. Do not rely on size or color alone to distinguish local and shared work. Reading order should move from local change to shared delivery stages.
- Adjacent-slide visual diversity note: Slide 2 should not use another nested/circular composition. It should switch to a mostly horizontal pipeline with two decision gates.
- Implementation complexity/risk: Medium. Static SVG is manageable, but responsive label placement, token motion, and reduced-motion fallback require care.

### Slide 2: CI and CD answer different questions

- Chapter: `why-cicd-matters`
- Slide id/title: `ci-cd-answer-different-questions` / CI and CD answer different questions
- Concise slide text: CI asks if a change is safe to merge. CD asks if an accepted change can be released safely. One path can carry both decisions, but the confidence points are different.
- Script reference: `labSlideScripts['ci-cd-answer-different-questions']`
- Original meaning preserved: The slide keeps the source distinction between merge confidence and release confidence while preserving the idea that both can live inside one visible evidence flow.
- Visual component design requirement: Use the `trusted-pipeline-path` slot as a linear pipeline with two explicit gates. The CI gate should sit after validation and before merge. The CD gate should sit after artifact/deploy/verification and before release promotion.
- Required visual primitives: Source/change node, validation stages, CI decision gate, artifact node, deploy/verify stages, CD decision gate, merge confidence badge, release confidence badge, and evidence trail connectors.
- Interaction/motion requirement: Provide a CI/CD segmented control or toggle. CI view highlights validation and merge gate while dimming later stages; CD view highlights artifact, deploy, verify, and release gate. Reduced motion should switch states instantly.
- Accessibility notes: Gate labels must include the question each gate answers. Highlight state must be represented by labels or badges, not color alone. Keyboard focus should reach the toggle and each gate summary.
- Adjacent-slide visual diversity note: This should be linear and decision-oriented to contrast with Slide 1's nested loop and Slide 3's funnel.
- Implementation complexity/risk: Medium. Existing `PipelineFlowGraph` can be reused, but the two-gate semantics need slide-specific labels.

### Slide 3: AI makes trust more important

- Chapter: `why-cicd-matters`
- Slide id/title: `ai-makes-trust-more-important` / AI makes trust more important
- Concise slide text: AI can generate plausible code, tests, scripts, and configuration quickly. CI/CD keeps that speed tied to evidence, so faster change does not become faster uncertainty.
- Script reference: `labSlideScripts['ai-makes-trust-more-important']`
- Original meaning preserved: The slide still says AI acceleration is useful only when generated work passes trustworthy validation and leaves a record of what automation proved versus what needs human judgment.
- Visual component design requirement: Use the `ai-assisted-change-funnel` slot as a validation funnel. Generated items should enter as branches, tests, scripts, config, migrations, and dependency changes. Gates should filter them into evidence tokens and human-review holds.
- Required visual primitives: Input tokens, funnel body, validation gates, pass/hold states, evidence output lane, human judgment marker, and icons for AI-generated code, tests, scripts, config, dependencies, and permissions.
- Interaction/motion requirement: Stagger generated items into the funnel, then convert passing items into evidence tokens while risky items pause at gates. Reduced motion should reveal grouped input, gate, and output states.
- Accessibility notes: Pass and hold states need text labels and icon differences. The funnel should expose an aria summary that explains generated work is being validated before trust is assigned.
- Adjacent-slide visual diversity note: Use a vertical or diagonal funnel to avoid repeating Slide 2's horizontal pipeline; Slide 4 can return to a circular loop because Slide 3 creates a shape break.
- Implementation complexity/risk: Low to medium. Existing `TrustFunnel` is close, but input and output labels must be tuned to generated change types and evidence.

### Slide 4: The simple six-step model

- Chapter: `why-cicd-matters`
- Slide id/title: `simple-six-step-model` / The simple six-step model
- Concise slide text: The durable model is tool-agnostic: validate, build once, deploy infrastructure when needed, deploy the artifact, verify the release, and feed results back.
- Script reference: `labSlideScripts['simple-six-step-model']`
- Original meaning preserved: The slide retains the complete six-stage source model and the emphasis on building one immutable artifact tied to a source revision.
- Visual component design requirement: Use the `six-stage-loop` slot as a circular six-stage loop with the immutable artifact visibly called out between build/package and deploy application. The diagram should feel like a mental model rather than a vendor workflow.
- Required visual primitives: Six stage nodes, directional loop path, artifact capsule, source revision tag, feedback arrow, stage labels, tool-agnostic icons, and optional short tooltips for each stage.
- Interaction/motion requirement: Step through one stage at a time. The token should transform from source change to immutable artifact to deployed release to feedback. Reduced motion should use active-stage emphasis only.
- Accessibility notes: Stage order must be available in DOM order and in the aria label. The artifact callout must be readable without relying on icon meaning alone.
- Adjacent-slide visual diversity note: Returning to a loop is acceptable because Slide 3 is a funnel, but this must be a single outer loop, not nested like Slide 1.
- Implementation complexity/risk: Low. Existing `SixStageLoopPrimitive` is a strong fit; the main risk is adding artifact emphasis without crowding.

### Slide 5: The real benefits

- Chapter: `why-cicd-matters`
- Slide id/title: `real-benefits` / The real benefits
- Concise slide text: CI/CD benefits are evidence-backed: faster feedback, more reliable releases, better traceability, safer collaboration, and speed that stays controlled.
- Script reference: `labSlideScripts['real-benefits']`
- Original meaning preserved: The slide keeps all source benefits and frames them as outcomes of repeatable, observable, safer delivery rather than vague promises.
- Visual component design requirement: Use the `benefit-evidence-path` slot as an evidence chain where each benefit token is attached to concrete evidence or a practical question: checks ran, artifact built, environment received it, approval recorded, health confirmed, recovery known.
- Required visual primitives: Evidence chain path, five benefit tokens, practical-question callouts, artifact digest marker, approval marker, environment marker, health signal marker, rollback/recovery marker, and hover/focus details.
- Interaction/motion requirement: Hovering or focusing a benefit highlights the evidence that supports it. A guided reveal can advance from faster feedback through controlled speed. Reduced motion should keep highlights static.
- Accessibility notes: Hover details must also be keyboard accessible. Each benefit must have a text relationship to its supporting evidence. Avoid color-only mapping between benefits and evidence.
- Adjacent-slide visual diversity note: This should be a path or chain rather than another loop, giving visual relief after Slide 4.
- Implementation complexity/risk: Medium. Existing `EvidenceChain` can support the path, but benefit-specific evidence mapping is more specific than a generic release chain.

### Slide 6: Why good CI/CD is hard

- Chapter: `why-cicd-matters`
- Slide id/title: `why-good-cicd-is-hard` / Why good CI/CD is hard
- Concise slide text: The model is simple; production is not. Real CI/CD crosses architecture, optimization, permissions, security, compliance, ownership, and recovery boundaries.
- Script reference: `labSlideScripts['why-good-cicd-is-hard']`
- Original meaning preserved: The slide preserves the source claim that production CI/CD is difficult because privileged automation touches architecture, infrastructure, optimization, permissions, security, compliance, ownership, and rollback/recovery.
- Visual component design requirement: Use the `simple-vs-production-reality` slot as a comparison between a clean six-stage model and a production path with layered constraints. The production side should overlay boundaries and risk controls rather than merely list them.
- Required visual primitives: Simple six-stage strip or mini-loop, production constraint layers, architecture boundary markers, cache/parallelism optimization markers, permission boundaries, security/compliance gates, rollback path, and warning/recovery badges.
- Interaction/motion requirement: Provide a reveal-constraints mode that adds architecture, speed, permissions, security, and recovery layers in sequence. Reduced motion should present the same sequence as discrete state changes.
- Accessibility notes: Each constraint layer needs a label and short description. Warning badges must not rely on red alone. The comparison should read as "simple model plus production constraints," not "simple good versus production bad."
- Adjacent-slide visual diversity note: Use layered comparison rather than an evidence chain so it differs from Slide 5; Slide 7 should then simplify into a compact transition scene.
- Implementation complexity/risk: Medium. `ComparisonFrame` can provide the shell, but a richer slide-specific production overlay may be needed. Divergence from the generic comparison is justified because the simplified slide text depends on the visual to show the missing production constraints.

### Slide 7: Main takeaway

- Chapter: `why-cicd-matters`
- Slide id/title: `larger-loop-takeaway` / Main takeaway
- Concise slide text: AI can accelerate the small loop of writing software. CI/CD protects the larger loop that turns fast changes into trusted releases.
- Script reference: `labSlideScripts['larger-loop-takeaway']`
- Original meaning preserved: The slide keeps the chapter conclusion that CI/CD connects source changes to validation, artifacts, environments, verification, and operational feedback, especially when AI accelerates software changes.
- Visual component design requirement: Use the `chapter-takeaway` slot as a compact transition scene. Show AI accelerating the small writing loop while CI/CD stabilizes the larger release loop. The composition should bridge into Chapter 2 by hinting at skills or responsibilities around the outer loop.
- Required visual primitives: Small loop, larger protective loop, AI acceleration token, release confidence marker, feedback marker, compact source-to-release path, and subtle next-chapter bridge label or icon cluster.
- Interaction/motion requirement: Pulse the small loop at a faster rhythm and the outer loop at a steadier rhythm, then settle both into a trusted release state. Reduced motion should use static rhythm indicators or staged highlights.
- Accessibility notes: Motion should not be required to understand "fast small loop" versus "protected larger loop." Provide text labels and an aria summary that links AI acceleration to CI/CD trust.
- Adjacent-slide visual diversity note: Echo Slide 1's loop vocabulary, but keep it compact and transition-focused rather than a full nested comparison. This intentional return creates chapter closure without duplicating Slide 1.
- Implementation complexity/risk: Low. Existing `ConceptScene` likely fits; risk is conceptual repetition if it visually copies Slide 1 too closely.

## Chapter 2: Skill Sets Needed to Implement CI/CD

### Slide 8: CI/CD is not just YAML

- Chapter: `skill-sets-needed`
- Slide id/title: `cicd-not-just-yaml` / CI/CD is not just YAML
- Concise slide text: YAML is the interface. Real CI/CD is a delivery system shaped by application, platform, infrastructure, security, optimization, observability, and release operations.
- Script reference: `labSlideScripts['cicd-not-just-yaml']`
- Original meaning preserved: The slide keeps the source claim that production CI/CD is broader than workflow syntax and requires a repeatable, observable, safe-to-change delivery path across multiple engineering disciplines.
- Visual component design requirement: Use the `system-skill-map` slot as a central CI/CD system map. CI/CD should sit in the middle with surrounding domains for application design, platform, infrastructure, security, optimization, observability, and release operations. Edges should show each domain influencing the delivery path rather than orbiting as unrelated topics.
- Map-heavy implementation note: If this map is updated with `SlideFlowCanvas`, follow `docs/visual-flow-canvas-guidelines.md`; skill domains should use semantic system/actor-style nodes, while selected-domain controls and detail chips stay outside the graph.
- Required visual primitives: Central CI/CD node, seven skill-domain nodes, responsibility edges, delivery-path highlight, compact domain labels, domain icons, and focusable detail chips for repeatable, observable, and safe to change.
- Interaction/motion requirement: Selecting a skill domain highlights the pipeline stages it influences. Initial motion may draw edges from the center outward, then settle into a readable map. Reduced motion should reveal all nodes and use static focus states.
- Accessibility notes: Every domain must have visible text and a programmatic label. Edge meaning should be repeated in text details because dependency lines alone are not enough. The center-to-domain relationship must not rely on color only.
- Adjacent-slide visual diversity note: This begins Chapter 2 as a radial/system map. Slide 9 should switch to a left-to-right mapping rather than another hub-and-spoke composition.
- Implementation complexity/risk: Low. `SkillSystemMap` is a strong Stage 2 fit; the main risk is overcrowding the hub if all domains and detail chips are visible at once.

### Slide 9: Application shape decides pipeline shape

- Chapter: `skill-sets-needed`
- Slide id/title: `application-shape-decides-pipeline-shape` / Application shape decides pipeline shape
- Concise slide text: Service, module, database, and configuration boundaries decide what must be validated, built, deployed, and verified.
- Script reference: `labSlideScripts['application-shape-decides-pipeline-shape']`
- Original meaning preserved: The slide preserves the source idea that architecture boundaries determine change impact and should shape validation, build, deployment, and verification scope instead of treating every repository the same.
- Visual component design requirement: Use the `architecture-to-pipeline-mapping` slot as a bipartite architecture-to-pipeline map. Place application boundary boxes on the left and pipeline stage cards on the right, with connectors showing which boundaries influence validate, build, deploy, and verify. This diverges from a plain pipeline graph because Stage 2's intent is mapping, not simply sequence.
- Map-heavy implementation note: Follow `docs/visual-flow-canvas-guidelines.md` when using React Flow. Put boundary boxes, stage cards, changed-item markers, and impact connectors in the canvas using semantic node types; keep scope badges, selected-boundary summaries, and scenario controls outside the canvas.
- Required visual primitives: Boundary boxes for services, modules, databases, and runtime configuration; stage cards for validate, build, deploy, and verify; impact connectors; changed-item marker; scope badges; and optional architecture layer labels.
- Interaction/motion requirement: Clicking or focusing a boundary highlights the affected stages and updates a validation-scope badge. Reduced motion should change emphasis instantly without animated connector movement.
- Accessibility notes: Connector relationships need text equivalents in each boundary detail. Keyboard users should be able to move through boundaries and hear which stages are affected. Use pattern or icon differences in addition to color.
- Adjacent-slide visual diversity note: This should be left-to-right and causal, contrasting with Slide 8's radial map and Slide 10's compact coupled-gate model.
- Implementation complexity/risk: Medium. Existing `PipelineFlowGraph` patterns can help, but a slide-specific two-column mapping layout is clearer than reusing a standard pipeline.

### Slide 10: Classic apps and coupled validation

- Chapter: `skill-sets-needed`
- Slide id/title: `classic-apps-coupled-validation` / Classic apps and coupled validation
- Concise slide text: When frontend, backend, schema, and configuration move together, even a small change can require broad validation before promotion.
- Script reference: `labSlideScripts['classic-apps-coupled-validation']`
- Original meaning preserved: The slide keeps the source emphasis on classic two-tier or three-tier coupling, broad safety checks, immutable images, external runtime configuration, migration compatibility, and same-image promotion across environments.
- Visual component design requirement: Use the `coupled-validation-model` slot as a compact coupled-system diagram. Show frontend, backend, schema/database, and runtime configuration as tightly linked components feeding one broad validation gate, then one immutable image moving through dev, staging, and production.
- Map-heavy implementation note: If implemented as a flow canvas, follow `docs/visual-flow-canvas-guidelines.md`. Model coupled components as `flowSystem` nodes, the broad validation point as a `flowGate`, the image as a `flowArtifact`, and dev/staging/production as `flowEnvironment` nodes; keep the small-change versus schema-coupled toggle outside the canvas.
- Required visual primitives: Four coupled component nodes, visible coupling links, broad validation gate, immutable image capsule, migration compatibility marker, environment promotion rail, config-outside-image marker, and pass/fail status tokens.
- Interaction/motion requirement: Provide a small toggle between "small UI change" and "schema-coupled change." The first highlights a narrower path; the second lights up the whole coupled validation gate. Reduced motion should use static before/after states.
- Accessibility notes: The broad-validation state must be described with text, not only more highlighted lines. The toggle labels need to state the scenario and validation consequence. Keep all component labels readable at small viewport widths.
- Adjacent-slide visual diversity note: This should feel dense and coupled, not like the broader dependency graph on Slide 11. Use a single gate and promotion rail to differentiate it from Slide 9's mapping.
- Implementation complexity/risk: Medium. Prefer the semantic flow-node grammar from `docs/visual-flow-canvas-guidelines.md` over a fully bespoke primitive when possible; the remaining risk is keeping the compact cluster, broad gate, and promotion rail readable without turning the slide into a generic pipeline.

### Slide 11: Microservices and dependency scope

- Chapter: `skill-sets-needed`
- Slide id/title: `microservices-dependency-scope` / Microservices and dependency scope
- Concise slide text: Independent service delivery only works when the pipeline understands shared libraries, schemas, contracts, downstream services, and shared resources.
- Script reference: `labSlideScripts['microservices-dependency-scope']`
- Original meaning preserved: The slide retains the source tension that microservices can build and deploy independently only when the pipeline chooses the correct validation scope across dependencies without testing everything or skipping too much.
- Visual component design requirement: Use the `affected-service-graph` slot as an affected-service graph. A changed service should sit near the center with shared libraries, schema/contract nodes, downstream services, feature flags, deployment locks, and shared resources inside or outside a selected validation radius.
- Map-heavy implementation note: If dependency filtering moves into React Flow, follow `docs/visual-flow-canvas-guidelines.md`. Keep service/dependency nodes, directed edges, and validation-radius annotations in the canvas; keep dependency-type filters, selected-check summaries, and legends outside it.
- Required visual primitives: Changed-service node, dependency nodes, downstream nodes, directed edges, validation-radius ring, selected-scope badge, skip/test-all warning markers, and service-version or image-digest detail.
- Interaction/motion requirement: Selecting the changed service or dependency type updates the validation radius and highlights included checks. Reduced motion should avoid animated graph rearrangement and only change emphasis.
- Accessibility notes: Graph relationships must have a readable list alternative or aria summary. Radius inclusion cannot be represented by position alone; included and excluded checks need labels. Focus order should start at the changed service, then dependencies, then selected checks.
- Adjacent-slide visual diversity note: This may also use nodes and edges, but it should read as a distributed network with radius selection, unlike Slide 10's single broad gate and Slide 12's comparison matrix.
- Implementation complexity/risk: Medium. `AffectedServiceGraphPrimitive` gives a base, but richer dependency filtering would raise complexity if implemented with React Flow.

### Slide 12: Where automation runs

- Chapter: `skill-sets-needed`
- Slide id/title: `where-automation-runs` / Where automation runs
- Concise slide text: Hosted CI/CD is fast to start. Self-hosted CI/CD gives more control, but it becomes production infrastructure the team must operate.
- Script reference: `labSlideScripts['where-automation-runs']`
- Original meaning preserved: The slide preserves the source comparison between hosted convenience and self-hosted control, while keeping responsibility for triggers, secrets, branches, short-lived identity, runners, caches, capacity, isolation, security, observability, and recovery.
- Visual component design requirement: Use the `operating-model-comparison` slot as a hosted-versus-self-hosted responsibility matrix. Rows should compare runners, caches, secrets, private access, capacity, isolation, recovery, and platform upgrades. The visual should compare ownership, not market features.
- Required visual primitives: Two comparison columns, responsibility rows, ownership badges, trust-boundary markers, operational-load meter, runner/cache/secrets/private-access icons, and concise row-level detail tooltips.
- Interaction/motion requirement: Hovering or focusing a row reveals which model owns the responsibility and what the team still must define. Reduced motion should keep row expansion instant.
- Accessibility notes: The matrix must be navigable by row with text that names both models' responsibilities. Ownership badges need labels beyond color. Tooltips must be keyboard accessible.
- Adjacent-slide visual diversity note: The matrix should provide a structured pause after Slide 11's graph. Slide 13 should return to a flow/map so two adjacent slides do not both feel tabular.
- Implementation complexity/risk: Low to medium. `ComparisonFrame` can provide the shell, but a responsibility table inside the frame is needed to compensate for shorter slide text.

### Slide 13: Infrastructure connects artifacts to runtime

- Chapter: `skill-sets-needed`
- Slide id/title: `infrastructure-connects-artifacts-to-runtime` / Infrastructure connects artifacts to runtime
- Concise slide text: A built image still needs registries, runtime targets, networks, databases, secrets, ingress, and observability to reach production safely.
- Script reference: `labSlideScripts['infrastructure-connects-artifacts-to-runtime']`
- Original meaning preserved: The slide keeps the source claim that containers do not remove runtime infrastructure complexity and that CI/CD must connect artifacts to environments through repeatable infrastructure, scoped identities, deployment choices, and preserved evidence.
- Visual component design requirement: Use the `artifact-to-runtime-map` slot as an artifact-to-runtime flow. Start with one image digest, pass through registry and infrastructure plan/apply, then branch into environment dependencies and deployment targets with observability and evidence tokens attached.
- Map-heavy implementation note: Follow `docs/visual-flow-canvas-guidelines.md` when using React Flow. The digest, registry, plan/apply, environments, dependencies, deployment targets, and evidence tokens belong in the canvas; the promotion state control and same-artifact summary should remain fixed outside the canvas.
- Required visual primitives: Image digest capsule, registry node, IaC plan/apply nodes, environment lanes for dev/staging/production, network/database/secrets/ingress dependency nodes, deployment target node, observability node, rollback evidence token, and identity scope badges.
- Interaction/motion requirement: Promote one artifact across environments without rebuilding. Motion can carry the same digest token from dev to staging to production while environment-specific infrastructure edges change. Reduced motion should step through the same promotion states.
- Accessibility notes: The same-artifact identity must be textually explicit in every environment state. Dependency icons need labels. Evidence tokens for plans, applies, approvals, deployments, and rollbacks should be reachable by keyboard.
- Adjacent-slide visual diversity note: Use a horizontal or diagonal artifact journey to contrast with Slide 12's matrix and Slide 14's permission lanes. Infrastructure side nodes are allowed because Stage 2 explicitly calls for artifact-to-runtime mapping.
- Implementation complexity/risk: Medium. Existing pipeline/React Flow patterns can help, but sidecar infrastructure nodes and responsive environment lanes need careful layout.

### Slide 14: Permissions and security by stage

- Chapter: `skill-sets-needed`
- Slide id/title: `permissions-security-by-stage` / Permissions and security by stage
- Concise slide text: Pipelines are privileged automation. Each stage should have only the power it needs, with explicit audit evidence for powerful actions.
- Script reference: `labSlideScripts['permissions-security-by-stage']`
- Original meaning preserved: The slide preserves the source focus on least-privilege job identities, scoped secrets, short-lived identity, environment separation, scans, provenance or signing where needed, and audit trails for changes, artifacts, approvals, and releases.
- Visual component design requirement: Use the `permission-lanes` slot as a stage-by-capability matrix. Columns should represent validation, build, infrastructure plan, infrastructure apply, application deploy, and verification. Rows should represent read code, publish artifact, plan infra, apply infra, deploy app, access secrets, and write production.
- Required visual primitives: Stage columns, capability rows, allowed/blocked cells, unsafe over-permission highlights, least-privilege toggle, audit-evidence badges, secret boundary markers, and protected-environment markers.
- Interaction/motion requirement: Toggle between "over-broad credential" and "least privilege." Unsafe cells should be highlighted first, then reduced to the target permissions. Reduced motion should switch states with no sweeping animation.
- Accessibility notes: Cell state must be announced as allowed, blocked, or unsafe, not only colored. The least-privilege toggle needs descriptive labels. Matrix reading order should be row by row or column by column consistently.
- Adjacent-slide visual diversity note: This matrix can follow Slide 13's flow because the structure and task are different. Slide 15 should avoid another grid and use a balance/control metaphor.
- Implementation complexity/risk: Low. `PermissionLanesPrimitive` is a strong Stage 2 fit; risk is mostly keeping the matrix legible on mobile.

### Slide 15: Optimization is feedback-loop design

- Chapter: `skill-sets-needed`
- Slide id/title: `optimization-feedback-loop-design` / Optimization is feedback-loop design
- Concise slide text: Optimization is faster useful feedback, not shorter jobs at any cost. Speed must preserve what ran, skipped, built, and deployed.
- Script reference: `labSlideScripts['optimization-feedback-loop-design']`
- Original meaning preserved: The slide retains the source distinction between useful speed and raw job duration, including fail-fast ordering, caching, matrices, sharding, affected-service detection, artifact promotion, runner capacity, concurrency controls, and traceability risks.
- Visual component design requirement: Use the `speed-trust-balance` slot as a speed-versus-trust control surface rather than a simple funnel. Place optimization levers on one side and evidence risks on the other, with a central confidence meter. Borrow `TrustFunnel`'s gate-row vocabulary only as a small evidence-preserved strip that shows which proofs still move forward; do not make the main composition a funnel because the concept is a feedback-loop tradeoff.
- Required visual primitives: Speed slider or dial, confidence meter, optimization lever chips, risk tokens for skipped jobs/stale caches/overloaded runners/flaky tests, traceability checklist, small evidence-gate strip, warning state, and preserved-evidence output badge.
- Interaction/motion requirement: Moving the speed control reveals warnings when evidence becomes hidden or unreliable. Selecting a lever should show the traceability condition required to keep that optimization safe. Reduced motion should update meter and warnings instantly.
- Accessibility notes: Slider values must have text descriptions, such as "balanced speed with traceability." Warnings need icons and labels, not red alone. Lever details must be accessible without hover.
- Adjacent-slide visual diversity note: Use a balance/control layout to break away from Slide 14's matrix and prepare Slide 16's loop/branching release operations visual.
- Implementation complexity/risk: Medium. The conceptual shift is justified by Stage 2's speed/trust intent and simplified slide text, but interactive slider states add implementation and QA surface.

### Slide 16: Observability and release operations close the loop

- Chapter: `skill-sets-needed`
- Slide id/title: `observability-release-operations-close-loop` / Observability and release operations close the loop
- Concise slide text: Deployment is complete only after release acceptance shows the intended version is running, healthy, and feeding lessons back into the pipeline.
- Script reference: `labSlideScripts['observability-release-operations-close-loop']`
- Original meaning preserved: The slide keeps the source conclusion that deploy-command success is not enough; smoke tests, health checks, logs, metrics, traces, dashboards, alerts, synthetic checks, rollback/roll-forward decisions, progressive delivery, feature flags, and incident review close the delivery loop.
- Visual component design requirement: Use the `release-operations-loop` slot as a branching release-operations loop. Show deploy, runtime verification, health signals, release acceptance, decision branch, rollback or roll-forward, incident learning, and pipeline improvement. The intended artifact/version must remain visible through the loop.
- Required visual primitives: Deploy node, intended-version badge, smoke/health/synthetic check nodes, logs/metrics/traces/dashboard/alert signal cluster, accept/roll-forward/rollback decision branch, status-token treatment for healthy/degraded/failed route summaries, feature-flag/progressive-delivery marker, incident-learning node, feedback arrow to pipeline design, and release evidence record.
- Interaction/motion requirement: Provide a segmented state for healthy, degraded, and failed deploy outcomes. Healthy routes to accept, degraded routes to progressive action or roll forward, and failed routes to rollback and incident learning. Reduced motion should swap route highlights without animated path travel.
- Accessibility notes: Each outcome route must have a text summary and not depend on color. The health signal cluster should be grouped with an aria label. The feedback arrow must be described as incident learning improving pipeline design.
- Adjacent-slide visual diversity note: A branching loop is appropriate after Slide 15's control surface and closes Chapter 2 by echoing Chapter 1's loop vocabulary without reusing the same nested-loop composition.
- Implementation complexity/risk: High. Stage 2 already marks this as high because branch routing, outcome states, version identity, and responsive signal clusters require careful implementation. Reuse the existing status-token visual language for outcome labels where possible to lower state-design risk without simplifying the release-operations concept.

## Chapter 3: How to Evaluate CI/CD Benefits

### Slide 17: Evidence, not vibes

- Chapter: `evaluating-cicd-benefits`
- Slide id/title: `evidence-not-vibes` / Evidence, not vibes
- Concise slide text: CI/CD value shows up as evidence: what changed, what ran, what built, where it deployed, which gates passed, whether it is healthy, and how recovery works.
- Script reference: `labSlideScripts['evidence-not-vibes']`
- Original meaning preserved: The slide keeps the source claim that CI/CD is correct only when it turns changes into trustworthy feedback, deployable artifacts, safe releases, visible gates, health evidence, and clear recovery paths.
- Visual component design requirement: Use the `evidence-chain` slot as a release evidence chain. Show a single meaningful change moving through source, validation, artifact, environment, gates, health, and recovery evidence. The visual must make a green check look incomplete unless each evidence node can answer a release question.
- Required visual primitives: Source-change node, validation-result node, artifact digest capsule, environment/deploy target node, permission and policy gate node, health signal node, recovery path node, evidence connectors, release decision badge, and question reveal cards.
- Interaction/motion requirement: Clicking or focusing each evidence node reveals the question it answers. A guided reveal can progressively replace a generic green check with the full evidence chain. Reduced motion should use discrete node highlighting.
- Accessibility notes: Every evidence node needs visible text and a programmatic label. The green-check contrast must not rely on color alone; label it as "status only" versus "evidence available." Question reveal cards must be keyboard reachable.
- Adjacent-slide visual diversity note: Start Chapter 3 with a horizontal or gently stepped chain to contrast with Chapter 2's closing branching loop. Slide 18 should switch to a grouped checklist rather than another path.
- Implementation complexity/risk: Low. `EvidenceChainPrimitive` or `EvidenceChain` is a strong Stage 2 fit; the main risk is keeping the full evidence list legible in compact slide space.

### Slide 18: Qualitative evaluation

- Chapter: `evaluating-cicd-benefits`
- Slide id/title: `qualitative-evaluation` / Qualitative evaluation
- Concise slide text: Qualitative evaluation asks whether the pipeline changes team behavior: trust, lifecycle fit, visibility, repeatability, boundaries, optimization, and release operations.
- Script reference: `labSlideScripts['qualitative-evaluation']`
- Original meaning preserved: The slide retains the source idea that qualitative signals reveal whether CI/CD is becoming part of the software development lifecycle instead of another automation tool.
- Visual component design requirement: Use the `qualitative-checklist` slot as a grouped evaluation checklist. Groups should cover architecture, platform visibility, infrastructure repeatability, permission boundaries, optimization quality, and release operations, each with a status token for unknown, weak, or strong.
- Required visual primitives: Six checklist groups, status tokens, confidence label, compact question chips, lifecycle-fit marker, behavior/trust badges, and an overall review summary strip.
- Interaction/motion requirement: Marking a group as unknown, weak, or strong updates the overall confidence label. Reduced motion should avoid animated score counting and use instant status updates.
- Accessibility notes: Status must be represented by text labels and icons, not only color. Checklist groups must be navigable in a logical order. The overall confidence label should announce changes for screen readers if made interactive.
- Adjacent-slide visual diversity note: Use grouped checklist/status tokens to break away from Slide 17's evidence chain. Slide 19 can then become a layered system frame rather than another checklist.
- Implementation complexity/risk: Low. `StatusTokensPanel` is a close fit; risk is oversimplifying qualitative questions into a score, so keep the status language diagnostic.

### Slide 19: Architecture, platform, and infrastructure fit

- Chapter: `evaluating-cicd-benefits`
- Slide id/title: `architecture-platform-infrastructure-fit` / Architecture, platform, and infrastructure fit
- Concise slide text: Evaluate fit across three layers: the application shape, the automation platform, and the runtime infrastructure that supports each release.
- Script reference: `labSlideScripts['architecture-platform-infrastructure-fit']`
- Original meaning preserved: The slide keeps the source checks for application boundaries and migrations, inspectable platform evidence, and versioned, validated, serialized, traceable infrastructure changes.
- Visual component design requirement: Use the `system-fit-frame` slot as a three-layer fit map rather than a generic comparison. Stack architecture, platform, and infrastructure layers, then cross-link each layer to evidence outputs: validation scope, artifact promotion, inspectable logs, runner or lock state, plan/apply record, environment output, and release trace.
- Map-heavy implementation note: If this becomes a React Flow layout, follow `docs/visual-flow-canvas-guidelines.md`. Put the three layers, cross-layer connectors, and evidence output nodes in the canvas; keep layer selectors, fit questions, failure-signal summaries, and interpretation copy outside the graph.
- Required visual primitives: Three stacked layers, layer labels, fit-question chips, cross-layer connectors, evidence output nodes, migration compatibility marker, platform inspectability markers, infrastructure plan/apply marker, and trace-to-release badge.
- Interaction/motion requirement: Selecting a layer reveals its fit questions and associated failure signals. Reduced motion should show the selected layer with static emphasis and no connector animation.
- Accessibility notes: Cross-layer relationships need text equivalents because connector lines alone are not enough. Layer selection must be keyboard accessible. Do not use vertical position alone to communicate priority; all three layers are required.
- Adjacent-slide visual diversity note: A layered map contrasts with Slide 18's checklist and prepares Slide 20's tri-axis tradeoff frame. Divergence from a plain `ComparisonFrame` is justified because Stage 2 calls for system fit across layers, and the concise text depends on the visual to preserve detail.
- Implementation complexity/risk: Medium. Existing comparison shells can provide framing, but the layered cross-link map likely needs a purpose-built primitive or React Flow layout.

### Slide 20: Permissions, security, and optimization quality

- Chapter: `evaluating-cicd-benefits`
- Slide id/title: `permissions-security-optimization-quality` / Permissions, security, and optimization quality
- Concise slide text: Good evaluation asks whether powerful actions are bounded and whether faster feedback still preserves the evidence needed to trust the result.
- Script reference: `labSlideScripts['permissions-security-optimization-quality']`
- Original meaning preserved: The slide preserves the source's combined evaluation of least-privilege stage boundaries, scoped secrets, untrusted pull request isolation, fail-fast ordering, safe caches, visible skipped work, runner capacity, and flaky-test handling.
- Visual component design requirement: Use the `tradeoff-frame` slot as a tri-axis tradeoff surface with speed, trust, and privilege. Plot scenario cards such as retries, caches, production credentials, skipped jobs, runner parallelism, and protected deploy gates. The visual should show security and optimization as evidence-preserving design choices, not opposing teams.
- Required visual primitives: Tri-axis frame, scenario cards, stage-boundary markers, secret/credential boundary badge, evidence-preserved badge, speed lever, risk warning state, and safer/faster toggle states.
- Interaction/motion requirement: Toggling safer or faster options moves scenario cards around the frame and updates a trust/evidence badge. Reduced motion should reposition cards instantly or use before/after states.
- Accessibility notes: Axis meaning must be labeled in text. Scenario positions need text summaries such as "fast but hides evidence" or "bounded and auditable." Movement must not be the only way to understand the tradeoff.
- Adjacent-slide visual diversity note: The tri-axis surface should feel analytical and spatial after Slide 19's layered system map. Divergence from a standard two-sided comparison is justified because Stage 2 explicitly identifies three axes: speed, trust, and privilege.
- Implementation complexity/risk: Medium. A static tri-axis primitive is manageable; interactive card motion and scenario state copy add QA risk.

### Slide 21: Release operations and health

- Chapter: `evaluating-cicd-benefits`
- Slide id/title: `release-operations-and-health` / Release operations and health
- Concise slide text: A successful deploy command is not release acceptance. Verify the intended artifact, health checks, observability signals, rollback readiness, and incident learning.
- Script reference: `labSlideScripts['release-operations-and-health']`
- Original meaning preserved: The slide keeps the source distinction between deploy-command success and release acceptance through version verification, smoke tests, health checks, logs, metrics, traces, dashboards, alerts, rollback/roll-forward rehearsal, and incident feedback.
- Visual component design requirement: Use the `release-health-frame` slot as a release health dashboard, not only a loose metric constellation. The dashboard should center the intended artifact and deployed version, then surround them with smoke, health, logs, metrics, traces, alerts, rollback status, and incident-learning feedback. Reuse `MetricConstellation`'s compact signal-card grammar, icon/value/detail hierarchy, badges, and tone language, but arrange the cards as dashboard zones rather than a free-form constellation.
- Required visual primitives: Intended artifact badge, deployed version badge, smoke-test card, health-check card, logs/metrics/traces signal cards using metric-card treatment, dashboard/alert marker, rollback readiness indicator, release acceptance state, and incident-learning feedback chip.
- Interaction/motion requirement: Switch between healthy, warning, and failed release states; affected signals update together and the release acceptance state changes. Reduced motion should swap state labels and static highlights without animated flashing.
- Accessibility notes: Health states must have text names and icon differences. The signal group should have an aria summary that connects the signals to release acceptance. Avoid rapid pulsing or alert animation.
- Adjacent-slide visual diversity note: Use a dashboard frame after Slide 20's spatial tradeoff surface. Divergence from a pure `MetricConstellation` is justified because Stage 2 says dashboard composition may better explain release acceptance.
- Implementation complexity/risk: Medium. Reusing `MetricConstellation` card language should reduce visual-design risk, but synchronized scenario states and compact dashboard layout still need careful responsive design.

### Slide 22: Feedback time breakdown

- Chapter: `evaluating-cicd-benefits`
- Slide id/title: `feedback-time-breakdown` / Feedback time breakdown
- Concise slide text: A single pipeline duration hides the cause. Break feedback time into queue, setup, execution, transfer, deploy wait, and verification delay.
- Script reference: `labSlideScripts['feedback-time-breakdown']`
- Original meaning preserved: The slide preserves the source point that quantitative metrics are useful only when they support a decision, and that different delay categories point to different fixes.
- Visual component design requirement: Use the `duration-breakdown` slot as a segmented timeline or waterfall. Each segment should show a delay category, likely root cause, and improvement lever, with the total duration shown as only the starting clue.
- Required visual primitives: Segmented duration bar, queue/setup/execution/transfer/deploy-wait/verification segments, total duration label, root-cause hints, improvement hint chips, before/after comparison marker, and useful-answer endpoint.
- Interaction/motion requirement: Hovering or focusing a segment reveals likely causes and fixes. Optional before/after mode can compare an optimized timeline. Reduced motion should use static expansion with no bar tween.
- Accessibility notes: Segment values and meanings must be readable in text. Tooltips must be keyboard accessible. The total duration should not be announced as the only metric; include a summary of the segment breakdown.
- Adjacent-slide visual diversity note: A horizontal timeline gives visual relief after Slide 21's dashboard. Slide 23 should shift into a quadrant or grouped metric view so adjacent slides do not both look like bars.
- Implementation complexity/risk: Low. `DurationBreakdownPrimitive` is a strong fit; risk is mainly overcrowding root-cause text.

### Slide 23: Delivery and recovery metrics

- Chapter: `evaluating-cicd-benefits`
- Slide id/title: `delivery-recovery-metrics` / Delivery and recovery metrics
- Concise slide text: Read delivery and recovery together: deployment frequency, lead time, change failure rate, and recovery time only make sense in release context.
- Script reference: `labSlideScripts['delivery-recovery-metrics']`
- Original meaning preserved: The slide keeps the source warnings that deployment frequency, lead time, change failure rate, and recovery time can be misleading unless interpreted with release size, risk, product stage, waiting, and recovery capability.
- Visual component design requirement: Use the `delivery-recovery-metrics` slot as a four-metric quadrant or balanced metric group. Pair speed signals with reliability context: frequency with batch size, lead time with waiting, failure rate with release risk, and recovery time with acceptable service restoration.
- Required visual primitives: Four metric cards or quadrants, speed axis, reliability/recovery axis, context annotation chips, release-size marker, risk marker, waiting/uncertainty marker, recovery-path marker, and scenario selector.
- Interaction/motion requirement: Selecting a team scenario changes the interpretation labels for the same metric values. Reduced motion should update labels and emphasis instantly.
- Accessibility notes: Metric interpretation must be text-based, not inferred from quadrant position only. Scenario selector needs descriptive names. Do not imply high frequency is universally good without the context note.
- Adjacent-slide visual diversity note: Use a quadrant/grouped metric composition after Slide 22's timeline. A constellation may be reused later on Slide 26, so this slide should avoid looking like a star field.
- Implementation complexity/risk: Medium. `MetricConstellation` can provide metric-card language, but a quadrant mode or dedicated primitive would better preserve the interpretation nuance.

### Slide 24: Trust and efficiency metrics

- Chapter: `evaluating-cicd-benefits`
- Slide id/title: `trust-efficiency-metrics` / Trust and efficiency metrics
- Concise slide text: Fast delivery stays dependable only when flakes, caches, artifact traceability, and rollback readiness are measured as trust signals, not side details.
- Script reference: `labSlideScripts['trust-efficiency-metrics']`
- Original meaning preserved: The slide preserves the source detail that flaky tests weaken trust, cache hit rate is useful only beside transfer time and correctness, traceability connects source to outcome, and rollback readiness must exist before pressure arrives.
- Visual component design requirement: Use the `trust-efficiency-metrics` slot as a paired metric board. Each efficiency signal should be paired with a confidence condition: flaky-test rate with trust in failures, cache hit rate with transfer time/correctness, traceability with source-artifact-deploy linkage, and rollback readiness with known-good artifact and compatible recovery path.
- Required visual primitives: Four paired metric rows, efficiency signal cells, trust condition cells, unhealthy scenario toggle, confidence score or badge, traceability chain mini-strip, rollback readiness marker, and warning annotations.
- Interaction/motion requirement: Toggle unhealthy cache or flaky-test scenarios; speed may improve while the confidence badge drops. Reduced motion should update values and warnings without animated count-up effects.
- Accessibility notes: Pairings must be readable row by row. Warning state needs text and icon differences. Confidence changes should explain why the score changed, not only report a number.
- Adjacent-slide visual diversity note: Use a paired board to contrast with Slide 23's quadrant and avoid repeating Slide 18's checklist by showing metric-condition pairs rather than review items.
- Implementation complexity/risk: Medium. Existing metric visuals can be adapted, but paired semantics and scenario toggles need custom data and copy.

### Slide 25: Security, audit, and confidence metrics

- Chapter: `evaluating-cicd-benefits`
- Slide id/title: `security-audit-confidence-metrics` / Security, audit, and confidence metrics
- Concise slide text: Trust combines security outcomes, retained audit evidence, and developer confidence that pipeline results are understandable and worth acting on.
- Script reference: `labSlideScripts['security-audit-confidence-metrics']`
- Original meaning preserved: The slide keeps the source distinction between blocking findings, exceptions, advisories, repeated process issues, false positives, retained searchable evidence, and developer confidence in what the pipeline proved.
- Visual component design requirement: Use the `security-audit-confidence` slot as a security evidence chain with branches. Findings should flow into block, exception, advisory, repeated-process, or false-positive states, then connect to retained audit evidence and developer action.
- Required visual primitives: Finding input node, branch states for block/exception/advisory/repeated/false positive, retained evidence store, audit search marker, developer action/confidence marker, human judgment badge, evidence connectors, and filter chips.
- Interaction/motion requirement: Filtering by finding type highlights the branch, retained evidence, and expected developer action. Reduced motion should change branch emphasis instantly.
- Accessibility notes: Branch state must be labeled and not color-only. Exceptions and false positives must include text that they require documentation or review. Filter chips must be keyboard accessible.
- Adjacent-slide visual diversity note: A branching evidence chain can follow Slide 24's paired board because it uses flow and decision states. It should not duplicate Slide 17's simple release evidence chain; the branching security taxonomy is the differentiator.
- Implementation complexity/risk: Medium. `EvidenceChain` can provide the backbone, but branches for exceptions and false positives need careful copy to avoid implying bypass.

### Slide 26: Metrics create tradeoffs

- Chapter: `evaluating-cicd-benefits`
- Slide id/title: `metrics-create-tradeoffs` / Metrics create tradeoffs
- Concise slide text: No single metric proves CI/CD success. Evaluation balances speed, reliability, trust, efficiency, and security for the team's actual release model.
- Script reference: `labSlideScripts['metrics-create-tradeoffs']`
- Original meaning preserved: The slide preserves the chapter takeaway that metrics must be interpreted together, conflicts are expected, and evaluation means choosing the right tradeoff for the team's architecture, platform, infrastructure, risk, and release model.
- Visual component design requirement: Use the `metric-constellation` slot as a five-cluster metric constellation with explicit tension lines. Clusters should be speed, reliability, trust, efficiency, and security, with annotations for known conflicts such as parallelism versus cost, gates versus lead time, and selective validation versus missed-dependency risk.
- Required visual primitives: Five metric clusters, context frame, tension lines, conflict annotation chips, selected-tradeoff state, balanced-release-model badge, source-to-recovery evidence anchor, and chapter takeaway marker.
- Interaction/motion requirement: Selecting a tradeoff draws or emphasizes tension lines between affected clusters and updates a short interpretation label. Reduced motion should reveal lines statically with no sweeping draw animation.
- Accessibility notes: Tension lines need text equivalents. Cluster labels must be visible and programmatic. The balanced view should avoid implying a single ideal score; include text that tradeoffs depend on context.
- Adjacent-slide visual diversity note: End Chapter 3 with a constellation after Slide 25's branching evidence chain. This intentional synthesis feels visually broader than the prior security-specific flow and sets up Chapter 4 without processing Chapter 4 content.
- Implementation complexity/risk: Medium. `MetricConstellation` is a strong fit, but explicit conflict edges and context-aware interpretation labels are additional implementation work.

## Chapter 4: How AI Helps Teams Build Better CI/CD

### Slide 27: AI helps the loop, but the pipeline remains truth

- Chapter: `ai-builds-better-cicd`
- Slide id/title: `ai-helps-loop-pipeline-remains-truth` / AI helps the loop, but the pipeline remains truth
- Concise slide text: AI can draft, inspect, compare, summarize, and monitor CI/CD work. The pipeline still holds gates, artifacts, verification, and release truth.
- Script reference: `labSlideScripts['ai-helps-loop-pipeline-remains-truth']`
- Original meaning preserved: The slide preserves the source distinction between AI reducing CI/CD toil and the pipeline remaining the authoritative delivery system shaped by architecture, platform, infrastructure, permissions, and release evidence.
- Visual component design requirement: Use the `ai-delivery-loop-orbit` slot as an AI assistance orbit around a fixed delivery loop. AI tasks should sit outside or beside the authoritative path, while gates, artifacts, verification, and release evidence stay inside the pipeline. This follows Stage 2 directly; the visual must carry the detail omitted from the concise slide copy.
- Required visual primitives: Central delivery loop, fixed gate nodes, artifact capsule, verification node, release truth badge, orbiting AI task chips for draft/inspect/compare/summarize/monitor, source-of-truth highlight, and evidence trail.
- Interaction/motion requirement: Orbiting AI tasks pause beside the stage they support; gate nodes remain fixed and visually authoritative. Reduced motion should reveal task chips in sequence without continuous orbit motion.
- Accessibility notes: Do not communicate AI support through motion alone. Every AI task and pipeline gate needs visible text and a programmatic label. The aria summary should state that AI assists the loop while pipeline evidence remains authoritative.
- Adjacent-slide visual diversity note: Slide 26 ends as a metric constellation, so this orbit must read as a delivery loop with fixed gates, not another free-form radial cluster. Slide 28 should move into a review board or graph to avoid consecutive orbit layouts.
- Implementation complexity/risk: Low. `AiAssistanceOrbit` is a strong Stage 2 fit; risk is conceptual if orbiting AI chips appear equal to pipeline truth.

### Slide 28: AI can support architecture decisions

- Chapter: `ai-builds-better-cicd`
- Slide id/title: `ai-supports-architecture-decisions` / AI can support architecture decisions
- Concise slide text: AI can map services, checks, targets, and rollback concerns, but humans decide which architecture and risk boundaries are real.
- Script reference: `labSlideScripts['ai-supports-architecture-decisions']`
- Original meaning preserved: The slide keeps the source claim that AI can map services, packages, schemas, infrastructure modules, deployment targets, validation needs, deployment style, artifact-promotion issues, rollback, observability, and configuration concerns while humans own the architecture decision.
- Visual component design requirement: Use the `ai-architecture-review` slot as an architecture review board. Place the system map in the center, AI suggestion chips around services and dependencies, and a human decision marker on accepted validation/deployment scope. AI annotations must remain visually separate from accepted pipeline design.
- Map-heavy implementation note: If richer dependency mapping uses React Flow, follow `docs/visual-flow-canvas-guidelines.md`. Place services, packages, schemas, modules, deployment targets, and dependency connectors in the canvas; keep AI suggestion review controls, accept/reject/needs-evidence summaries, and human decision copy outside it.
- Required visual primitives: Service/package/schema/module nodes, deployment-target nodes, dependency connectors, AI suggestion chips, accept/reject/needs-evidence states, human decision marker, validation-scope badge, rollback/observability/config callouts, and artifact-promotion warning.
- Interaction/motion requirement: AI suggestion chips appear on services and dependencies, then a reviewer marks each accepted, rejected, or needs evidence. Reduced motion should use static state changes.
- Accessibility notes: Suggestion states need text labels and icons, not color alone. Connector relationships need text equivalents. Keyboard users should be able to focus each suggestion and hear its current decision state.
- Adjacent-slide visual diversity note: A board or graph contrasts with Slide 27's loop orbit. Slide 29 should switch to a panel with timing bars so Chapter 4 does not become a sequence of maps.
- Implementation complexity/risk: Medium. `AiArchitectureReviewPrimitive` fits Stage 2, but richer dependency mapping may require React Flow. The divergence toward a review board is justified because the simplified slide text relies on visible suggestion-versus-decision separation.

### Slide 29: AI can improve optimization strategy

- Chapter: `ai-builds-better-cicd`
- Slide id/title: `ai-improves-optimization-strategy` / AI can improve optimization strategy
- Concise slide text: AI can spot slow stages and suggest ordering, caching, or parallelism. Optimization still must show what ran, skipped, changed, and became riskier.
- Script reference: `labSlideScripts['ai-improves-optimization-strategy']`
- Original meaning preserved: The slide preserves the source focus on faster useful feedback rather than raw runtime, including queue/setup/execution/transfer/lock/deploy waiting, fail-fast ordering, cache keys, matrices, sharding, repeated work, flaky tests, trends, and evidence preservation.
- Visual component design requirement: Use the `optimization-assistant-panel` slot as a measured optimization workspace. Show before/after timing bars, AI suggestions, and an evidence-risk review column that explains whether speed gains preserved trust.
- Required visual primitives: Before/after timing bars, queue/setup/execution/transfer/lock/deploy-wait segments, suggestion cards for ordering/cache/parallelism/sharding/repeated work, evidence-risk column, what-ran/skipped/built/deployed checklist, flaky-test badge, and confidence marker.
- Interaction/motion requirement: Selecting a suggestion updates the before/after bars and risk badge. Reduced motion should change bar values and labels instantly without tweening numbers.
- Accessibility notes: Timing bars must include text values and categories. Risk states need clear labels and icons. The suggestion list and evidence checklist must be keyboard reachable without hover-only details.
- Adjacent-slide visual diversity note: Use a dashboard/panel after Slide 28's graph-like board. Slide 30 should become lane-based so adjacent slides do not both feel like analysis panels.
- Implementation complexity/risk: Low to medium. `OptimizationAssistantPrimitive` is a strong Stage 2 fit; risk is overstating projected speed gains without labeling them as suggestions pending evidence.

### Slide 30: AI should not blur ownership

- Chapter: `ai-builds-better-cicd`
- Slide id/title: `ai-should-not-blur-ownership` / AI should not blur ownership
- Concise slide text: AI can advise, draft proposals, and trigger low-risk automation. Approval authority, production access, and accountability stay with named owners.
- Script reference: `labSlideScripts['ai-should-not-blur-ownership']`
- Original meaning preserved: The slide keeps the source role-permission model across developers, reviewers, platform, security, and release owners, including responsibility maps, permission review, read-only versus publish versus plan/apply/deploy access, summaries, onboarding, protected environments, approval rules, and clear identities.
- Visual component design requirement: Use the `responsibility-authority-map` slot as responsibility lanes with explicit authority states. Separate AI assistant, developer, reviewer, platform, security, and release owner lanes, and show which actions are advisory, proposal, low-risk automation, or approval-required. Borrow `ResponsibilityLanes` row styling, actor icons, badges, and dense lane treatment, but replace the percentage/share metaphor with authority-state tokens so ownership does not look like a workload split.
- Required visual primitives: Six responsibility lanes, action cards, advisory/proposal/automation/approval-required badges, authority-state tokens instead of percentage bars, production-access lock, named-owner marker, protected-environment gate, permission-scope chips, and accountability label.
- Interaction/motion requirement: Moving or selecting an action card reveals which lane can perform it and what approval level it needs. Reduced motion should use static lane highlighting instead of animated dragging.
- Accessibility notes: Lane ownership and authority state must be readable in text. Do not rely on lane color to communicate permission. Drag affordances need keyboard-accessible alternatives such as buttons or selectable cards.
- Adjacent-slide visual diversity note: Lanes create a strong structural break from Slide 29's timing panel. Slide 31 can then move into gate/evidence visuals without repeating lane rows.
- Implementation complexity/risk: Medium. `ResponsibilityLanes` is useful for lane treatment, but its responsibility-share metaphor must not carry over; authority-level states and accessible card movement add interaction and QA risk.

### Slide 31: AI helps with security evidence, not gate bypassing

- Chapter: `ai-builds-better-cicd`
- Slide id/title: `ai-helps-security-evidence-not-gate-bypass` / AI helps with security evidence, not gate bypassing
- Concise slide text: AI can summarize findings and draft policies. The pipeline still enforces security gates, exceptions, approvals, and release blocks.
- Script reference: `labSlideScripts['ai-helps-security-evidence-not-gate-bypass']`
- Original meaning preserved: The slide preserves the source distinction between AI-produced security help and enforced release rules, including secret and credential checks, untrusted pull request isolation, least-privilege splits, dependency/image/policy findings, SBOMs, provenance, signatures, exception templates, repeated findings, incident evidence, audit records, and post-deploy verification.
- Visual component design requirement: Use the `security-evidence-gates` slot as AI evidence cards beside enforced security gates. AI may produce summaries, comparisons, or draft policy inputs, but gate state changes only when pipeline evidence arrives.
- Required visual primitives: AI summary card, security gate nodes, pending/pass/exception/block states, secret-scan marker, credential-scope marker, untrusted-PR boundary, SBOM/provenance/signature evidence chips, policy-as-code draft chip, approval/exception record, and release-block badge.
- Interaction/motion requirement: AI summary appears as an input card while gate state remains pending, pass, exception, or block until evidence is selected. Reduced motion should use direct state changes.
- Accessibility notes: Gate states must have text and icon differences. Exceptions must say documented/reviewed. The aria summary should distinguish generated security summaries from enforced release gates.
- Adjacent-slide visual diversity note: A gate-focused flow differs from Slide 30's lanes. It should not duplicate Chapter 3's security evidence chain; the differentiator is AI input beside non-bypassable gates.
- Implementation complexity/risk: Low. `SecurityEvidenceGatesPrimitive` is a strong Stage 2 fit; risk is accidentally making AI summaries look like approvals.

### Slide 32: Generated plans are not verified releases

- Chapter: `ai-builds-better-cicd`
- Slide id/title: `generated-plans-not-verified-releases` / Generated plans are not verified releases
- Concise slide text: A generated plan is not a verified release. Suggestions need pipeline evidence before humans decide risk, approval, and recovery.
- Script reference: `labSlideScripts['generated-plans-not-verified-releases']`
- Original meaning preserved: The slide keeps the source evidence hierarchy: AI can draft, inspect, optimize, and summarize, but evidence must show what ran, validation results, artifact digest, deployment target, health signals, approval trail, and recovery path before humans decide architecture, risk, approval, and recovery.
- Visual component design requirement: Use the `suggestion-evidence-decision` slot as a three-layer handoff: suggestion layer, evidence layer, decision layer. Each layer should have distinct allowed verbs and ownership; the proposed change cannot reach decision until evidence nodes are complete.
- Required visual primitives: Three stacked layers, proposed-change token, AI draft/inspect/summarize cards, evidence nodes for ran/skipped/validation/artifact/deploy/health/approval/recovery, blocked-transition marker, human decision gate, allowed-verb labels, and ownership badges.
- Interaction/motion requirement: A proposed change travels from suggestion to evidence to decision; blocked transitions appear if evidence is missing. Reduced motion should step through layers with static highlights.
- Accessibility notes: Layer order, ownership, and blocked state need visible text. Do not rely on vertical position alone to communicate authority. Keyboard users should be able to inspect each evidence node before the decision gate.
- Adjacent-slide visual diversity note: The layered handoff is distinct from Slide 31's security gates because it generalizes responsibility layers. Slide 33 should synthesize into an accelerator diagram rather than another stack.
- Implementation complexity/risk: Low. `AiBoundaryPrimitive` maps well to Stage 2; risk is overcrowding the evidence layer if every evidence node is visible at once.

### Slide 33: Main takeaway

- Chapter: `ai-builds-better-cicd`
- Slide id/title: `ai-accelerator-takeaway` / Main takeaway
- Concise slide text: Use AI to improve the loop faster. Keep delivery grounded in gates, least privilege, immutable artifacts, verification, audit evidence, and human judgment.
- Script reference: `labSlideScripts['ai-accelerator-takeaway']`
- Original meaning preserved: The slide preserves the final source message that AI accelerates CI/CD design and maintenance rather than replacing CI/CD judgment, and that teams should still know exactly what was checked, built, deployed, whether it worked, and how to recover.
- Visual component design requirement: Use the `ai-accelerator-takeaway` slot as a closing accelerator diagram. Five AI assist actions should flow into grounding controls for gates, least privilege, immutable artifacts, human ownership, verification, and audit evidence; the release badge lights only after evidence and human judgment are present.
- Required visual primitives: AI assist action chips for understand/draft/inspect/summarize/compare, six grounding control nodes, evidence trail, least-privilege lock, immutable artifact capsule, verification signal, audit record, human judgment marker, release badge, and course-closing loop marker.
- Interaction/motion requirement: Sequentially reveal AI assist actions flowing into grounding controls, then activate the release badge only after evidence and judgment are present. Reduced motion should reveal grouped states without path animation.
- Accessibility notes: The final release state must be conveyed through text and icon, not glow or color alone. The assist-to-control relationship needs a concise aria summary. Avoid rapid celebratory motion.
- Adjacent-slide visual diversity note: End with a synthesis diagram rather than repeating Slide 32's layers. It may echo gates and evidence from earlier slides, but the composition should combine assist actions and grounding controls into a final course summary.
- Implementation complexity/risk: Low. `AiAcceleratorTakeawayPrimitive` is a good Stage 2 fit; risk is visual clutter if all assist actions and controls compete for equal emphasis.

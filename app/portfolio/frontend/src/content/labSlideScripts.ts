export type LabSlideScript = {
  chapterId: string
  title: string
  sourceDoc: string
  sourceHeadings: readonly string[]
  originalBody: string
  originalKeyPoints: readonly string[]
  speakerScript: readonly string[]
  narrationNotes: readonly string[]
}

export const labSlideScripts = {
  'software-not-done-when-written': {
    chapterId: 'why-cicd-matters',
    title: 'Software is not done when code is written',
    sourceDoc: 'docs/ID30/01-benefits.md',
    sourceHeadings: ['Document introduction', 'The Larger Feedback Loop'],
    originalBody:
      'Writing code is only the small developer loop: change, inspect, run, and adjust. CI/CD creates the larger shared loop around that work, where each meaningful source change is validated, packaged, deployed, verified, and fed back to the team. The goal is a trusted path from idea to running software, not a release process that depends on memory, local machines, or one person\'s checklist.',
    originalKeyPoints: ['Code writing is only the first loop.', 'Delivery needs shared validation and feedback.'],
    speakerScript: [
      'Start by expanding the learner\'s definition of done. The moment code is written is important, but it is only local progress.',
      'Point to the small loop first: change, inspect, run, adjust. Then move attention to the larger delivery loop where the team earns shared confidence.',
      'Close by naming the real goal: a trusted path from idea to running software, not a release process that depends on memory, local machines, or one person\'s checklist.',
    ],
    narrationNotes: [
      'Use the visual to make written code feel like the beginning of the outer loop, not the finish line.',
      'Preserve the distinction between local confidence and shared delivery evidence.',
      'This slide sets up the chapter vocabulary of small loop versus larger loop.',
    ],
  },
  'ci-cd-answer-different-questions': {
    chapterId: 'why-cicd-matters',
    title: 'CI and CD answer different questions',
    sourceDoc: 'docs/ID30/01-benefits.md',
    sourceHeadings: ['The Larger Feedback Loop'],
    originalBody:
      'CI and CD belong to the same delivery path, but they answer different questions. Continuous integration asks whether a change is acceptable to merge. Continuous delivery asks whether an accepted change can be released safely. Keeping those questions separate helps a team distinguish merge confidence from release confidence while still using one visible flow of evidence. Automation does not remove human judgment; it handles routine checks so people can focus on design, product tradeoffs, security risk, and exceptions.',
    originalKeyPoints: ['CI supports merge decisions.', 'CD supports release decisions.'],
    speakerScript: [
      'Frame CI and CD as two questions inside one delivery path.',
      'CI produces merge confidence: should this change join the shared codebase?',
      'CD produces release confidence: can this accepted change move safely into an environment?',
      'Remind learners that automation moves routine checks out of people\'s heads so judgment can focus on design, product tradeoffs, security risk, and exceptions.',
    ],
    narrationNotes: [
      'Avoid treating CI/CD as one generic green check.',
      'Keep merge confidence and release confidence visually distinct.',
      'Human judgment remains part of the system; the pipeline organizes evidence for it.',
    ],
  },
  'ai-makes-trust-more-important': {
    chapterId: 'why-cicd-matters',
    title: 'AI makes trust more important',
    sourceDoc: 'docs/ID30/01-benefits.md',
    sourceHeadings: ['Why AI Makes CI/CD More Necessary'],
    originalBody:
      'AI-assisted development can produce feature branches, refactors, migrations, test suites, deployment scripts, and configuration faster than before. That speed is useful only if the delivery system can keep up. Without strong CI/CD, faster generation can also mean faster uncertainty: more plausible-looking changes, more scripts to validate, more permission and dependency changes to inspect, and more pressure to merge before there is evidence. The goal is not blind trust in automation; it is a clearer record of what automation proved and what still needs human judgment.',
    originalKeyPoints: ['Faster generation can create faster uncertainty.', 'CI/CD keeps speed connected to evidence.'],
    speakerScript: [
      'Acknowledge that AI can increase useful output: branches, refactors, migrations, tests, scripts, and configuration.',
      'Then make the turn: speed only helps when the delivery system can validate the extra work.',
      'Use the funnel visual to show generated inputs becoming evidence only after gates have checked them.',
      'End with the trust point: the goal is not blind trust in automation, but a clearer record of what was proved and what still needs human judgment.',
    ],
    narrationNotes: [
      'Do not imply AI is the problem; the problem is faster uncertainty without evidence.',
      'Show both passing and held items so validation feels active rather than decorative.',
      'Connect this slide back to controlled speed and forward to security and permission concerns.',
    ],
  },
  'simple-six-step-model': {
    chapterId: 'why-cicd-matters',
    title: 'The simple six-step model',
    sourceDoc: 'docs/ID30/01-benefits.md',
    sourceHeadings: ['The Easy Mental Model'],
    originalBody:
      'The basic model is tool-agnostic. First validate the change with fast checks and gates. Then build or package once into an immutable artifact tied to a source revision. Deploy infrastructure changes deliberately when needed, promote the already-built application artifact, run post-deploy verification, and feed results back where the team can act on failures, approvals, deployment outcomes, and recovery decisions.',
    originalKeyPoints: ['Validate the change.', 'Build/package once.', 'Verify and feed results back.'],
    speakerScript: [
      'Introduce the six stages as a tool-agnostic mental model, not a vendor checklist.',
      'Walk the loop in order: validate, build or package once, deploy infrastructure deliberately, deploy the application artifact, verify, and feed results back.',
      'Emphasize the immutable artifact: the team should promote the thing already built instead of rebuilding during release.',
      'Close by tying feedback to action: failures, approvals, deployment outcomes, and recovery decisions must land somewhere the team can use.',
    ],
    narrationNotes: [
      'Keep this slide crisp and memorable; it is the chapter anchor model.',
      'Artifact immutability should be visible between build/package and deploy.',
      'Avoid vendor logos unless a later implementation intentionally adds tool examples.',
    ],
  },
  'real-benefits': {
    chapterId: 'why-cicd-matters',
    title: 'The real benefits',
    sourceDoc: 'docs/ID30/01-benefits.md',
    sourceHeadings: [
      'The Real Benefits',
      'Faster Useful Feedback',
      'More Reliable Releases',
      'Better Traceability',
      'Safer Collaboration',
      'Controlled Speed',
    ],
    originalBody:
      'The benefits come from making delivery repeatable, observable, and safer to change. Teams learn about problems earlier, reduce hidden variation in release work, and can trace which source revision produced an artifact, which checks ran, where it was deployed, who or what approved it, and which health signals confirmed the outcome. That shared evidence makes collaboration safer and lets teams move faster without pretending every change has the same risk.',
    originalKeyPoints: [
      'Feedback arrives sooner.',
      'Release work becomes repeatable.',
      'Traceability supports incidents and audits.',
    ],
    speakerScript: [
      'Treat the benefits as earned outcomes, not marketing claims.',
      'Move through the evidence path: earlier problem discovery, less hidden release variation, and traceability from source revision to artifact, deployment, approval, and health signal.',
      'Name collaboration explicitly: shared evidence lets developers, reviewers, platform engineers, security reviewers, and operators reason from the same record.',
      'End with controlled speed: teams move faster because risk is visible, not because all changes are treated as equal.',
    ],
    narrationNotes: [
      'Every benefit should connect to an evidence token or practical question.',
      'Do not overcrowd the slide with all traceability questions; preserve them in narration.',
      'This slide should feel different from the previous circular loop by using a path or evidence chain.',
    ],
  },
  'why-good-cicd-is-hard': {
    chapterId: 'why-cicd-matters',
    title: 'Why good CI/CD is hard',
    sourceDoc: 'docs/ID30/01-benefits.md',
    sourceHeadings: [
      'Why CI/CD Is Hard to Do Well',
      'Architecture Boundaries',
      'Optimization Without Losing Trust',
      'Permissions and Ownership',
      'Security and Compliance',
      'Rollback and Recovery',
    ],
    originalBody:
      'The mental model is simple, but production CI/CD is hard because it crosses many boundaries at once. Architecture shapes what must be validated and deployed. Optimization must preserve trust when teams add caching, parallelism, selective tests, locks, and runner capacity. Permissions, security scans, secrets, supply-chain controls, protected environments, audit evidence, and rollback plans all matter because the pipeline is privileged automation that can change real systems.',
    originalKeyPoints: [
      'Boundaries affect validation scope.',
      'Speed work can weaken trust.',
      'Rollback must be designed before failure.',
    ],
    speakerScript: [
      'Open with the contrast: the six-step model is easy to remember, but production CI/CD crosses many real boundaries.',
      'Use the visual layers to show architecture, optimization, permissions, security, compliance, and recovery as constraints on the simple path.',
      'Explain why this matters: the pipeline is privileged automation that can change real systems, so broad credentials, unclear ownership, and missing recovery plans are not minor details.',
      'Close by making difficulty feel constructive: these constraints are what the rest of the course will learn to design around.',
    ],
    narrationNotes: [
      'Do not let the slide become a wall of warnings; use layered constraints over the simple model.',
      'Keep rollback visible as a designed path, not a panic action.',
      'This should prepare learners for Chapter 2 skill areas.',
    ],
  },
  'larger-loop-takeaway': {
    chapterId: 'why-cicd-matters',
    title: 'Main takeaway',
    sourceDoc: 'docs/ID30/01-benefits.md',
    sourceHeadings: ['The Main Takeaway'],
    originalBody:
      'CI/CD is the delivery system that connects source changes to validation, artifacts, environments, post-deploy verification, and operational feedback. AI can accelerate the small loop of writing and changing software. CI/CD protects the larger delivery loop: the path that turns fast changes into trusted releases.',
    originalKeyPoints: ['AI accelerates the small loop.', 'CI/CD protects the larger delivery loop.'],
    speakerScript: [
      'Bring the chapter back to the small loop and larger loop language from Slide 1.',
      'AI can make writing and changing software faster, but fast changes need a protected delivery path.',
      'CI/CD connects source changes to validation, artifacts, environments, verification, and operational feedback.',
      'Use this as the handoff into the next chapter: what skills does a team need to build the larger loop well?',
    ],
    narrationNotes: [
      'Keep the slide compact and transitional.',
      'Echo the nested-loop visual language without repeating the exact Slide 1 composition.',
      'The final beat should point toward skill requirements, not add a new concept.',
    ],
  },
  'cicd-not-just-yaml': {
    chapterId: 'skill-sets-needed',
    title: 'CI/CD is not just YAML',
    sourceDoc: 'docs/ID30/02-skill-set.md',
    sourceHeadings: ['Document introduction'],
    originalBody:
      'CI/CD is not one isolated skill, and it is not just YAML. A team can begin with a simple workflow file, but production CI/CD sits where application design, platform engineering, infrastructure, security, optimization, observability, and release operations meet. The real skill is making the delivery path repeatable, observable, and safe to change.',
    originalKeyPoints: ['YAML is only the interface.', 'The delivery path spans several engineering disciplines.'],
    speakerScript: [
      'Reset the learner\'s mental model before going into the skill list: YAML is the interface, not the system.',
      'Use the skill map to show CI/CD sitting in the middle of application design, platform engineering, infrastructure, security, optimization, observability, and release operations.',
      'Make the practical claim clear: the team is designing a repeatable, observable, safe-to-change delivery path.',
      'This is the bridge from why CI/CD matters into what a team must know to build it deliberately.',
    ],
    narrationNotes: [
      'Do not make this sound like YAML is unimportant; it is the visible surface of a larger design problem.',
      'The visual should carry most of the breadth so the slide text can stay compact.',
      'Preserve the source emphasis on repeatable, observable, and safe to change.',
    ],
  },
  'application-shape-decides-pipeline-shape': {
    chapterId: 'skill-sets-needed',
    title: 'Application shape decides pipeline shape',
    sourceDoc: 'docs/ID30/02-skill-set.md',
    sourceHeadings: ['Application Architecture'],
    originalBody:
      'Good CI/CD starts by understanding the application shape. Service boundaries, modules, databases, and runtime configuration decide what must be validated, built, deployed, and verified. The core skill is knowing what a change can affect, then shaping the pipeline around that impact instead of treating every repository the same way.',
    originalKeyPoints: ['Boundaries define validation scope.', 'The core skill is knowing change impact.'],
    speakerScript: [
      'Start with architecture, not tooling. A pipeline should reflect what the application actually is.',
      'Point from service, module, database, and runtime configuration boundaries into the pipeline stages they affect.',
      'Emphasize impact analysis: the core skill is knowing what a change can affect before deciding how much validation or deployment work is needed.',
      'Close by rejecting the generic workflow instinct: two repositories can need very different delivery paths.',
    ],
    narrationNotes: [
      'The mapping should make boundaries feel causal, not decorative.',
      'Avoid implying every change can be safely narrowed; the point is choosing scope from architecture evidence.',
      'This slide prepares the classic-app and microservice examples that follow.',
    ],
  },
  'classic-apps-coupled-validation': {
    chapterId: 'skill-sets-needed',
    title: 'Classic apps and coupled validation',
    sourceDoc: 'docs/ID30/02-skill-set.md',
    sourceHeadings: ['Classic Two-Tier or Three-Tier Applications'],
    originalBody:
      'A classic two-tier or three-tier application may ship as one containerized service or as a small group of tightly connected containers. The team needs to know which checks make the whole app safe to merge, how to build immutable images, how to keep runtime configuration outside the image, and how to handle database migrations without breaking old or new versions. Because frontend, backend, schema, and configuration often move together, even a small change may need a broader validation path before the same image is promoted across environments.',
    originalKeyPoints: ['Coupling can force broad validation.', 'The same image should promote across environments.'],
    speakerScript: [
      'Describe the classic shape: frontend, backend, database, and configuration often move as one tightly connected system.',
      'Use the validation gate to show why a small-looking change can still need broad checks across the app.',
      'Name the durable skills from the source: safe merge checks, immutable images, externalized runtime configuration, and compatible database migrations.',
      'End with artifact promotion: once the image is built, the same image should move across environments instead of being rebuilt for each one.',
    ],
    narrationNotes: [
      'This slide should feel coupled and compact, not like a distributed service graph.',
      'Keep migrations visible because they explain why code-only validation is insufficient.',
      'Preserve the distinction between broad validation and same-image promotion.',
    ],
  },
  'microservices-dependency-scope': {
    chapterId: 'skill-sets-needed',
    title: 'Microservices and dependency scope',
    sourceDoc: 'docs/ID30/02-skill-set.md',
    sourceHeadings: ['Microservice Applications'],
    originalBody:
      'Microservices can build, test, publish, and deploy independently, but that independence only works when the pipeline understands dependencies. A service-level change may still affect shared libraries, schemas, contracts, downstream services, feature flags, deployment locks, or shared resources. The hard skill is choosing the correct validation scope: rebuilding and retesting everything is slow, while skipping too much makes the pipeline untrustworthy.',
    originalKeyPoints: ['Independent deploys need dependency awareness.', 'Correct validation scope preserves trust.'],
    speakerScript: [
      'Open with the promise and the condition: microservices can deploy independently only when dependencies are understood.',
      'Highlight the changed service, then expand to shared libraries, schemas, contracts, downstream services, feature flags, locks, and shared resources.',
      'Explain the tension: testing everything is slow, but skipping too much makes the answer untrustworthy.',
      'Name validation scope as the skill learners should remember.',
    ],
    narrationNotes: [
      'The graph should show dependency radius, not just a cluster of services.',
      'Avoid framing microservices as automatically easier than classic apps.',
      'This should contrast with Slide 10 by showing distributed dependency choice rather than one broad coupled gate.',
    ],
  },
  'where-automation-runs': {
    chapterId: 'skill-sets-needed',
    title: 'Where automation runs',
    sourceDoc: 'docs/ID30/02-skill-set.md',
    sourceHeadings: ['Host Platform', 'Third-Party CI/CD', 'Self-Hosted CI/CD'],
    originalBody:
      'The host platform is where automation runs: triggers, jobs, runners, logs, artifacts, approvals, environment rules, and connections to source control, registries, and deployment targets. Hosted CI/CD is usually fastest to start, but the team still has to define which events trigger work, which jobs can access secrets, which branches can deploy, and how short-lived identity is used. Self-hosted CI/CD gives more control over runners, caches, private access, capacity, and isolation, but it also makes CI/CD production infrastructure that someone must operate, secure, observe, and recover.',
    originalKeyPoints: ['Hosted platforms still need trust boundaries.', 'Self-hosting turns CI/CD into production infrastructure.'],
    speakerScript: [
      'Shift from application shape to the place where automation actually runs.',
      'For hosted CI/CD, emphasize speed to start, then immediately name the trust boundaries the team still owns: events, secrets, branches, deploy authority, and short-lived identity.',
      'For self-hosted CI/CD, emphasize control over runners, caches, private access, capacity, and isolation.',
      'Close with the operating model point: self-hosting turns CI/CD into production infrastructure that needs owners, security, observability, and recovery.',
    ],
    narrationNotes: [
      'Compare responsibilities rather than feature checklists.',
      'The hosted side should not look responsibility-free.',
      'The self-hosted side should show control and operational load together.',
    ],
  },
  'infrastructure-connects-artifacts-to-runtime': {
    chapterId: 'skill-sets-needed',
    title: 'Infrastructure connects artifacts to runtime',
    sourceDoc: 'docs/ID30/02-skill-set.md',
    sourceHeadings: ['Infrastructure', 'Cloud Provider', 'On-Premise or Private Infrastructure'],
    originalBody:
      'Containers still need runtime infrastructure: registries, clusters, servers, networking, databases, queues, secrets, ingress, and observability systems. CI/CD has to connect the image that was built to the environment where it will run, preferably through reviewed and repeatable infrastructure as code. Cloud and private environments both need scoped identities, safe access to deployment targets, a choice between push deployment and pull-based GitOps reconciliation, and preserved evidence for plans, applies, deployments, approvals, and rollbacks.',
    originalKeyPoints: ['Runtime infrastructure needs repeatable change paths.', 'Artifacts must connect to environment-specific dependencies.'],
    speakerScript: [
      'Start by puncturing the container myth: a built image still needs somewhere real to run.',
      'Trace the artifact from image digest to registry, infrastructure plan and apply, environment dependencies, deployment target, and observability.',
      'Bring in both cloud and private environments through the shared needs: scoped identities, safe deployment access, push or GitOps reconciliation, and preserved evidence.',
      'End on repeatability: CI/CD connects artifacts to runtime without hidden manual steps.',
    ],
    narrationNotes: [
      'Keep the artifact identity visible across environments.',
      'Show infrastructure as the bridge between artifact and runtime, not as a separate topic floating off to the side.',
      'Evidence for plans, applies, approvals, deployments, and rollbacks should appear as trace tokens.',
    ],
  },
  'permissions-security-by-stage': {
    chapterId: 'skill-sets-needed',
    title: 'Permissions and security by stage',
    sourceDoc: 'docs/ID30/02-skill-set.md',
    sourceHeadings: ['Permissions and Security'],
    originalBody:
      'Pipelines are privileged automation: they can read code, publish images, change infrastructure, deploy applications, and sometimes access secrets. Each stage should have only the power it needs, using scoped secret injection, least-privilege job identities, short-lived identity patterns, and clear separation between development, staging, production, and preview environments. Security work also includes dependency and image scanning, provenance or signing when assurance needs are high, and audit trails that show who changed what, which artifact was deployed, and what evidence approved the release.',
    originalKeyPoints: ['Validation should not mutate production.', 'Powerful actions should be explicit and auditable.'],
    speakerScript: [
      'Name the risk plainly: pipelines are privileged automation, not harmless scripts.',
      'Walk stage by stage through the powers involved: read code, publish images, change infrastructure, deploy applications, and access secrets.',
      'Use the lanes to show least privilege: validation should not mutate production, build should not own infrastructure, and production deploy should use a protected path.',
      'Close with auditability: security work includes scans, provenance or signing where needed, and evidence of who changed what, which artifact deployed, and what approved the release.',
    ],
    narrationNotes: [
      'Keep the least-privilege target state concrete by stage.',
      'Do not collapse security into scanning only; authority boundaries are the main concept.',
      'Make unsafe broad credentials visually obvious but not melodramatic.',
    ],
  },
  'optimization-feedback-loop-design': {
    chapterId: 'skill-sets-needed',
    title: 'Optimization is feedback-loop design',
    sourceDoc: 'docs/ID30/02-skill-set.md',
    sourceHeadings: ['Optimization'],
    originalBody:
      'CI/CD optimization is feedback-loop design, not just making jobs shorter. Useful speed comes from fail-fast ordering, reliable dependency and Docker layer caching, matrix jobs, test sharding, affected-service detection, artifact promotion, runner capacity planning, and concurrency controls for shared environments or infrastructure state. A skipped job, stale cache, overloaded runner, or flaky test can make the pipeline faster while making its answer less useful, so optimization must preserve traceability for what ran, what was skipped, what was built, and what was deployed.',
    originalKeyPoints: ['Fast answers must remain useful.', 'Optimization should show what ran, skipped, built, and deployed.'],
    speakerScript: [
      'Reframe optimization away from raw duration. The goal is faster useful feedback.',
      'Show the speed levers: fail-fast ordering, caching, matrix jobs, sharding, affected-service detection, artifact promotion, runner capacity, and concurrency controls.',
      'Then show the trust risks: skipped jobs, stale caches, overloaded runners, and flaky tests can make the pipeline faster while making its answer worse.',
      'End with traceability: after optimization, the team should still see what ran, what was skipped, what was built, and what deployed.',
    ],
    narrationNotes: [
      'The visual should make speed and confidence trade off when evidence is hidden.',
      'Avoid celebrating shorter pipelines without showing the preserved answer quality.',
      'This slide should be distinct from the permissions matrix by using a balance or control surface.',
    ],
  },
  'observability-release-operations-close-loop': {
    chapterId: 'skill-sets-needed',
    title: 'Observability and release operations close the loop',
    sourceDoc: 'docs/ID30/02-skill-set.md',
    sourceHeadings: ['Observability and Release Operations', 'The Main Takeaway'],
    originalBody:
      'Deployment is not complete when the command succeeds. CI/CD also needs release acceptance: smoke tests, health checks, logs, metrics, traces, dashboards, alerts, and synthetic checks that show the intended version is running and healthy. Rollback or roll-forward decisions, feature flags, progressive delivery, and incident reviews close the loop by turning release outcomes back into better pipeline design. These skills matter because the team also has to evaluate whether the delivery system is creating trustworthy release evidence.',
    originalKeyPoints: [
      'Release acceptance needs health evidence.',
      'Incident learning should feed back into the pipeline.',
      'The next skill is evaluating whether CI/CD creates trustworthy evidence.',
    ],
    speakerScript: [
      'Open by separating deploy command success from release acceptance.',
      'Walk the operations loop: smoke tests, health checks, logs, metrics, traces, dashboards, alerts, and synthetic checks prove whether the intended version is healthy.',
      'Show the decision branch: accept, roll forward, roll back, or use feature flags and progressive delivery when risk justifies it.',
      'Close the chapter by feeding incidents and release outcomes back into pipeline design, then point to Chapter 3: evaluating whether the system creates trustworthy release evidence.',
    ],
    narrationNotes: [
      'The loop must return to pipeline design, not stop at runtime monitoring.',
      'Make the intended version explicit so health is tied to the artifact, not just generic uptime.',
      'This is the Chapter 2 handoff into evaluation, so leave the learner with evidence vocabulary.',
    ],
  },
  'evidence-not-vibes': {
    chapterId: 'evaluating-cicd-benefits',
    title: 'Evidence, not vibes',
    sourceDoc: 'docs/ID30/03-evaluation.md',
    sourceHeadings: ['Document introduction', 'What Good CI/CD Should Prove'],
    originalBody:
      'CI/CD is working when it improves the team\'s ability to change software with confidence. A pipeline is not correct just because it has many jobs, uses a popular platform, or shows a green check. It creates value when it turns source changes into trustworthy feedback, deployable artifacts, safe releases, and clear recovery paths. For each meaningful change, the team should be able to see what changed, which checks ran, which artifact was built, where it deployed, which permissions and gates were used, whether the system is healthy, and how recovery would happen.',
    originalKeyPoints: [
      'Evaluate evidence, not green checks.',
      'Answers should be visible and repeatable.',
      'Good CI/CD supports better release decisions sooner.',
    ],
    speakerScript: [
      'Open Chapter 3 by changing the evaluation question. We are not asking whether the pipeline looks busy or green; we are asking what it proves.',
      'Walk the evidence chain from source change through checks, artifact, environment, gates, health, and recovery.',
      'Emphasize visibility and repeatability: if the answer lives in memory, chat, local scripts, or scattered logs, the delivery loop is still incomplete.',
      'Close with the decision lens: good CI/CD helps teams make better release decisions sooner.',
    ],
    narrationNotes: [
      'Use the visual to make the green check feel insufficient unless evidence is attached.',
      'Preserve the source list of release questions even though the slide text is short.',
      'This slide establishes the evaluation vocabulary for the rest of the chapter.',
    ],
  },
  'qualitative-evaluation': {
    chapterId: 'evaluating-cicd-benefits',
    title: 'Qualitative evaluation',
    sourceDoc: 'docs/ID30/03-evaluation.md',
    sourceHeadings: ['Qualitative Evaluation'],
    originalBody:
      'Qualitative evaluation asks how the pipeline changes the team\'s behavior. These signals are not always easy to count, but they show whether CI/CD is becoming part of the software development lifecycle instead of just another automation tool. The useful questions look across architecture, platform visibility, infrastructure repeatability, permission boundaries, optimization quality, and release operations.',
    originalKeyPoints: [
      'Qualitative signals reveal trust.',
      'Behavior matters as much as automation.',
      'The pipeline should become part of the lifecycle.',
    ],
    speakerScript: [
      'Shift from evidence objects to team behavior. Some of the most important signals are not simple counters.',
      'Use the checklist to show the qualitative review areas: architecture fit, platform visibility, repeatable infrastructure, permission boundaries, optimization quality, and release operations.',
      'Explain that these questions reveal whether CI/CD is part of everyday software development or just a tool people work around.',
      'Close by tying trust to behavior: people should know where to look, what to believe, and when judgment is still needed.',
    ],
    narrationNotes: [
      'Do not let qualitative sound soft or optional; it captures trust and lifecycle fit.',
      'The checklist should feel like an evaluation instrument, not a generic todo list.',
      'This slide should be quieter and more review-oriented than the evidence chain before it.',
    ],
  },
  'architecture-platform-infrastructure-fit': {
    chapterId: 'evaluating-cicd-benefits',
    title: 'Architecture, platform, and infrastructure fit',
    sourceDoc: 'docs/ID30/03-evaluation.md',
    sourceHeadings: ['Application Architecture', 'Host Platform', 'Infrastructure'],
    originalBody:
      'Good CI/CD reflects the shape of the application: which services, packages, schemas, or modules a change can affect, when a smaller validation path is safe, when broad validation is required, how migrations stay compatible, and whether the same artifact can move through environments without rebuilding. The host platform should make triggers, checks, approvals, artifacts, logs, runner limits, locks, and skipped jobs inspectable. Infrastructure changes should be versioned, validated, planned before apply, serialized when they share state, and traceable to the application release they support.',
    originalKeyPoints: [
      'Correctness matters more than pretending every change is small.',
      'The platform should preserve inspectable evidence.',
      'Infrastructure changes should be repeatable and reviewable.',
    ],
    speakerScript: [
      'Frame this as a three-layer fit test: application shape, automation platform, and runtime infrastructure.',
      'For architecture, ask whether the pipeline understands affected services, packages, schemas, modules, migrations, and artifact promotion.',
      'For the platform, ask whether triggers, checks, approvals, artifacts, logs, runner limits, locks, and skipped jobs are inspectable.',
      'For infrastructure, ask whether changes are versioned, validated, planned before apply, serialized when shared state is involved, and traceable to the release they support.',
    ],
    narrationNotes: [
      'Correctness beats pretending every change is small.',
      'Show cross-layer evidence instead of three isolated boxes.',
      'The visual must carry detail that the concise slide text no longer lists explicitly.',
    ],
  },
  'permissions-security-optimization-quality': {
    chapterId: 'evaluating-cicd-benefits',
    title: 'Permissions, security, and optimization quality',
    sourceDoc: 'docs/ID30/03-evaluation.md',
    sourceHeadings: ['Permissions and Security', 'Optimization'],
    originalBody:
      'CI/CD is privileged automation, so each stage should have only the authority it needs. Validation should not require production credentials, build, publish, infrastructure, and deploy permissions should be separated, secrets should appear only in the jobs and environments that need them, and untrusted pull request workflows should not receive privileged authority. Optimization is valuable when it shortens feedback without reducing trust: cheap deterministic checks first, safe cache keys, visible skipped-job reasons, enough runner capacity for parallelism, and flaky tests treated as reliability problems instead of hidden by retries.',
    originalKeyPoints: [
      'Privileged automation needs stage boundaries.',
      'Security should be explicit and auditable.',
      'Speed should not erase evidence.',
    ],
    speakerScript: [
      'Name the combined evaluation: powerful actions must be bounded, and faster feedback must not hide risk.',
      'Start with authority boundaries: validation should not need production credentials, and build, publish, infrastructure, and deploy permissions should be separated.',
      'Then move to optimization quality: cheap deterministic checks first, safe cache keys, visible skipped-job reasons, enough runner capacity, and flaky tests treated as reliability problems.',
      'Close on the tradeoff: security and speed are evaluated by whether evidence remains explicit and auditable.',
    ],
    narrationNotes: [
      'Keep privilege, trust, and speed visible as separate axes.',
      'Avoid presenting security and optimization as enemies; the point is evidence-preserving tradeoff design.',
      'Use examples from both source sections so the merged slide does not flatten either one.',
    ],
  },
  'release-operations-and-health': {
    chapterId: 'evaluating-cicd-benefits',
    title: 'Release operations and health',
    sourceDoc: 'docs/ID30/03-evaluation.md',
    sourceHeadings: ['Observability and Release Operations'],
    originalBody:
      'Deployment is complete only after the release is accepted. Evaluation should ask whether the pipeline verifies that the deployed version matches the intended artifact, ties smoke tests and health checks to release acceptance, connects logs, metrics, traces, dashboards, and alerts to the release record, and feeds incident learning back into checks or gates. A deploy command that exits successfully is not the same as a healthy system.',
    originalKeyPoints: [
      'The intended artifact should be verified in runtime.',
      'Release acceptance needs health evidence.',
      'Rollback decisions need practical rehearsal.',
    ],
    speakerScript: [
      'Separate deployment success from release acceptance. A command can exit successfully while the system is not healthy.',
      'Use the health frame to connect intended artifact, deployed version, smoke tests, health checks, logs, metrics, traces, dashboards, and alerts.',
      'Bring rollback and roll-forward back into evaluation: the team should know whether recovery decisions have been rehearsed enough to be practical.',
      'End with feedback: incident learning should improve checks or gates, not stay outside the pipeline.',
    ],
    narrationNotes: [
      'Keep the intended artifact visible so runtime health is tied to the release under evaluation.',
      'The visual should combine several signals into one release acceptance picture.',
      'Avoid letting observability become generic monitoring; it must connect to the release record.',
    ],
  },
  'feedback-time-breakdown': {
    chapterId: 'evaluating-cicd-benefits',
    title: 'Feedback time breakdown',
    sourceDoc: 'docs/ID30/03-evaluation.md',
    sourceHeadings: ['Quantitative Evaluation', 'Feedback Time'],
    originalBody:
      'Quantitative metrics are useful only when the team knows what decision they support. Feedback time measures how long it takes a developer or release owner to receive a useful answer, but a single total is too vague to improve. Queue time points to runner capacity, setup time points to checkout or dependency restore, execution time points to checks and builds, transfer time points to artifact or cache movement, and deploy wait time points to approvals, locks, rollout waits, GitOps reconciliation, or release windows.',
    originalKeyPoints: [
      'Different delay types need different fixes.',
      'Useful feedback matters more than raw runtime.',
      'A total duration is only the starting clue.',
    ],
    speakerScript: [
      'Introduce quantitative metrics with a warning: a metric is useful only when the team knows what decision it supports.',
      'Break the single duration into categories: queue, setup, execution, transfer, deploy wait, and verification.',
      'For each segment, name the likely improvement path: runner capacity, dependency restore, test or build work, artifact movement, approvals, locks, rollout waits, GitOps reconciliation, or release windows.',
      'Close by repeating that useful feedback matters more than raw runtime.',
    ],
    narrationNotes: [
      'Make the segmented timeline do the explanatory work.',
      'Do not imply every minute has the same fix.',
      'This slide begins the quantitative section, so keep the connection to decision support explicit.',
    ],
  },
  'delivery-recovery-metrics': {
    chapterId: 'evaluating-cicd-benefits',
    title: 'Delivery and recovery metrics',
    sourceDoc: 'docs/ID30/03-evaluation.md',
    sourceHeadings: ['Deployment Frequency', 'Lead Time for Changes', 'Change Failure Rate', 'MTTR and Recovery Time'],
    originalBody:
      'Deployment frequency can show small batches and healthy automation, but low frequency may also reflect intentional release timing, high risk, or product stage. Lead time shows where change waits across review, validation, build, approval, deployment, verification, and coordination. Change failure rate should be read with release size and risk because tiny frequent changes and large regulated releases create different patterns. Recovery time completes the picture: CI/CD is only half optimized if it deploys quickly but cannot restore acceptable service quickly.',
    originalKeyPoints: [
      'High frequency can signal healthy small batches.',
      'Lead time reveals waiting and uncertainty.',
      'Recovery matters as much as deployment speed.',
    ],
    speakerScript: [
      'Group these metrics as a speed-and-reliability picture, not a scoreboard.',
      'Explain deployment frequency in context: it may show small batches and healthy automation, or intentional release timing, high risk, or product stage.',
      'Use lead time to expose waiting across review, validation, build, approval, deployment, verification, and coordination.',
      'Pair change failure rate with release size and risk, then close on recovery time: deploying quickly is only half optimized if recovery is slow.',
    ],
    narrationNotes: [
      'Prevent the learner from ranking teams by one metric alone.',
      'Use scenario context to change how the same values are interpreted.',
      'Recovery should be visually equal in importance to delivery speed.',
    ],
  },
  'trust-efficiency-metrics': {
    chapterId: 'evaluating-cicd-benefits',
    title: 'Trust and efficiency metrics',
    sourceDoc: 'docs/ID30/03-evaluation.md',
    sourceHeadings: ['Flaky-Test Rate', 'Cache Hit Rate', 'Artifact Traceability', 'Rollback Readiness'],
    originalBody:
      'Trust and efficiency metrics test whether fast delivery is still dependable. Flaky-test rate matters because flakes slow decisions, consume reviewer attention, encourage blind retries, and weaken trust in real failures. Cache hit rate is useful only beside transfer time and correctness: a cache that is slow to download or restores incompatible output is not an improvement. Artifact traceability connects source revision, validation result, immutable artifact digest, deployment target, and release outcome. Rollback readiness asks whether a known-good artifact, compatible data strategy, feature flags, documented steps, permissions, and health checks are ready before pressure arrives.',
    originalKeyPoints: [
      'Flakes weaken trust in real failures.',
      'Caches help only when safe and worthwhile.',
      'Traceability supports rollback and audits.',
    ],
    speakerScript: [
      'Frame this slide around dependable speed. Efficiency is not useful if people stop trusting the answer.',
      'Pair flaky-test rate with decision quality: flakes slow decisions, drain attention, encourage blind retries, and weaken trust in real failures.',
      'Pair cache hit rate with transfer time and correctness: a slow or incompatible cache is not an improvement.',
      'Close by tying artifact traceability and rollback readiness to pressure moments: audits, incidents, rollback, and recovery.',
    ],
    narrationNotes: [
      'Each speed signal should have a confidence condition beside it.',
      'Do not celebrate high cache hit rate without correctness and transfer-time context.',
      'Rollback readiness should feel prepared before failure, not improvised during failure.',
    ],
  },
  'security-audit-confidence-metrics': {
    chapterId: 'evaluating-cicd-benefits',
    title: 'Security, audit, and confidence metrics',
    sourceDoc: 'docs/ID30/03-evaluation.md',
    sourceHeadings: ['Security Gate Outcomes', 'Audit Evidence Completeness', 'Developer Confidence'],
    originalBody:
      'Security gate outcomes should separate blocking findings, documented exceptions, advisory findings, repeated process problems, and false positives that create review fatigue. Audit evidence completeness asks whether approvals, status checks, test reports, security reports, infrastructure plans, artifact digests, SBOMs, provenance, deployment records, secret access logs, and runtime verification are retained, searchable, and connected. Developer confidence ties the evidence back to behavior: people should trust failing checks enough to fix them, understand what the pipeline proved, and know where human judgment is still required.',
    originalKeyPoints: [
      'Risk should be visible and actionable.',
      'Evidence should be retained and connected.',
      'Confidence means understanding what the pipeline proves.',
    ],
    speakerScript: [
      'Broaden security beyond "scanner passed." Evaluation should separate blocking findings, exceptions, advisories, repeated process problems, and false positives.',
      'Trace the audit evidence: approvals, status checks, reports, infrastructure plans, artifact digests, SBOMs, provenance, deployment records, secret access logs, and runtime verification.',
      'Then bring it back to people. Developer confidence means people trust failing checks enough to fix them and understand what the pipeline proved.',
      'Close by naming the remaining human boundary: confidence includes knowing where judgment is still required.',
    ],
    narrationNotes: [
      'Show false positives and exceptions without making them look equivalent to passed gates.',
      'Audit evidence should be retained, searchable, and connected in the visual.',
      'Developer confidence is behavioral, not cheerfulness.',
    ],
  },
  'metrics-create-tradeoffs': {
    chapterId: 'evaluating-cicd-benefits',
    title: 'Metrics create tradeoffs',
    sourceDoc: 'docs/ID30/03-evaluation.md',
    sourceHeadings: ['Interpreting Metrics Together', 'The Main Takeaway'],
    originalBody:
      'No single metric proves CI/CD success. The useful view balances speed, reliability, trust, efficiency, and security against the team\'s architecture, platform, infrastructure, risk, and release model. Metrics can conflict: more parallelism may reduce execution time while increasing cost, more gates may reduce change failure rate while increasing lead time, and more selective validation may improve pull request speed while increasing the risk of missed dependencies. Evaluation is the act of choosing the right tradeoff, not chasing every number upward.',
    originalKeyPoints: [
      'Metrics must be interpreted together.',
      'More gates can improve risk while increasing lead time.',
      'Selective validation can speed feedback while increasing missed-dependency risk.',
    ],
    speakerScript: [
      'Close the chapter by refusing the single-metric answer. CI/CD success is a balanced signal, not one number going up.',
      'Use the constellation to show speed, reliability, trust, efficiency, and security in the context of the team\'s architecture, platform, infrastructure, risk, and release model.',
      'Name the conflicts: parallelism can reduce time while increasing cost, gates can reduce failure rate while increasing lead time, and selective validation can speed pull requests while missing dependencies.',
      'End with the main takeaway: evaluation means choosing the right tradeoff for the system, not chasing every number upward.',
    ],
    narrationNotes: [
      'This slide should synthesize Chapter 3 and bridge into Chapter 4 without starting AI content.',
      'Make tension lines or annotations explicit so conflict is visible.',
      'Preserve the source takeaway that benefits are evaluated by evidence, not vibes.',
    ],
  },
  'ai-helps-loop-pipeline-remains-truth': {
    chapterId: 'ai-builds-better-cicd',
    title: 'AI helps the loop, but the pipeline remains truth',
    sourceDoc: 'docs/ID30/04-ai-integration.md',
    sourceHeadings: ['Document introduction'],
    originalBody:
      'AI can make CI/CD work faster, but the big picture still wins. A useful pipeline is not a pile of generated YAML; it is a delivery system shaped by architecture, platform, infrastructure, permissions, and release evidence. AI is strongest when it drafts steps, inspects configuration, compares options, summarizes failures, and monitors trends while the pipeline keeps the source of truth. It should not become the owner of architecture, security, production access, or release judgment.',
    originalKeyPoints: ['AI reduces toil around the system.', 'The pipeline remains the release truth.'],
    speakerScript: [
      'Open Chapter 4 by keeping AI useful but bounded. AI can accelerate drafting, inspection, comparison, summaries, and trend monitoring.',
      'Point to the delivery loop visual: AI supports stages around the loop, but the gates and evidence inside the pipeline remain authoritative.',
      'Name the boundary plainly: AI should not own architecture, security, production access, or release judgment.',
      'Close with the practical question from the source: where can AI reduce toil while explicit gates, human ownership, least privilege, immutable artifacts, and verification remain intact?',
    ],
    narrationNotes: [
      'The orbit should show help around the loop, not AI replacing the loop.',
      'Keep pipeline gates visually fixed while AI tasks move or appear around them.',
      'This slide should distinguish Chapter 4 from the prior metrics constellation by grounding the radial motion in a delivery loop.',
    ],
  },
  'ai-supports-architecture-decisions': {
    chapterId: 'ai-builds-better-cicd',
    title: 'AI can support architecture decisions',
    sourceDoc: 'docs/ID30/04-ai-integration.md',
    sourceHeadings: ['Architecture'],
    originalBody:
      'Good CI/CD starts with architecture. AI can map services, packages, schemas, infrastructure modules, and deployment targets; identify which checks should run for frontend, backend, shared library, database, or infrastructure changes; draft pipeline diagrams and stage descriptions; compare push-based deployment with GitOps-style reconciliation; spot rebuilds from source instead of artifact promotion; and explain how a proposed change might affect rollback, observability, or environment configuration. The team still owns the architecture decision.',
    originalKeyPoints: ['Pipeline design follows application shape.', 'Humans decide what matches the real system and risk.'],
    speakerScript: [
      'Start from the earlier chapter rule: pipeline design follows application shape.',
      'Use the review board to show what AI can surface: services, packages, schemas, deployment targets, checks, rollback concerns, observability, and environment configuration.',
      'Separate suggestions from decisions. AI can recommend contract tests, broader validation, narrower paths, or artifact promotion, but humans decide whether that matches the real system and risk.',
      'End by making the decision marker explicit: architecture ownership stays with the team.',
    ],
    narrationNotes: [
      'AI annotations should look like review comments, not accepted design truth.',
      'Show accept, reject, and needs-evidence states so suggestion quality remains inspectable.',
      'Do not let the graph imply AI has complete architecture knowledge by default.',
    ],
  },
  'ai-improves-optimization-strategy': {
    chapterId: 'ai-builds-better-cicd',
    title: 'AI can improve optimization strategy',
    sourceDoc: 'docs/ID30/04-ai-integration.md',
    sourceHeadings: ['Optimization Strategy'],
    originalBody:
      'AI can improve CI/CD feedback loops, but the goal is faster useful feedback without making the pipeline less trustworthy. It can read logs to summarize queue time, setup time, execution time, transfer time, lock waiting, and deployment waiting; suggest fail-fast ordering; propose cache keys; compare matrix jobs, test sharding, and fan-out/fan-in stages; detect repeated work; identify flaky-test patterns; summarize historical trends; and review workflow changes for what became faster, riskier, or less evidenced.',
    originalKeyPoints: ['Optimization should remain explicit.', 'Evidence should show what became faster or riskier.'],
    speakerScript: [
      'Reframe AI optimization as measured feedback-loop design, not just shortening a timer.',
      'Walk the assistant panel from measured time breakdown to suggested changes: fail-fast ordering, cache keys, parallelism, sharding, repeated work, and flaky-test ownership.',
      'Then show the guardrail column. If a suggestion skips jobs, broadens a cache, cancels runs, or parallelizes deploy work, the pipeline still has to show what ran, skipped, built, and deployed.',
      'Close by pairing each speed improvement with evidence preservation.',
    ],
    narrationNotes: [
      'Before-and-after bars should never imply faster automatically means better.',
      'Include risk badges for hidden skipped work, unsafe cache reuse, missing artifacts, or flaky tests.',
      'This slide can be more dashboard-like to break from the architecture map before it.',
    ],
  },
  'ai-should-not-blur-ownership': {
    chapterId: 'ai-builds-better-cicd',
    title: 'AI should not blur ownership',
    sourceDoc: 'docs/ID30/04-ai-integration.md',
    sourceHeadings: ['Role Permissions'],
    originalBody:
      'CI/CD is shared work across developers, reviewers, platform engineers, security teams, and release owners. AI can draft responsibility maps, review pipelines for broad permissions, explain which jobs need read-only, artifact publishing, infrastructure planning, infrastructure applying, or deployment access, summarize failed checks, prepare release notes and incident summaries, and help new team members understand the delivery path. AI can inspect and explain the permission model, but it should operate inside it rather than silently inheriting production authority or accountability.',
    originalKeyPoints: ['Permission models follow pipeline stages.', 'AI can advise without owning approval authority.'],
    speakerScript: [
      'Name the coordination benefit first: AI can reduce the work of explaining, summarizing, and mapping responsibilities.',
      'Use the lanes to separate AI assistant, developer, reviewer, platform, security, and release owner responsibilities.',
      'Move through authority levels: advisory, proposal, low-risk automation trigger, approval required, and production access.',
      'Close on the key boundary: an assistant that can draft a deployment command should not automatically have authority to run it in production.',
    ],
    narrationNotes: [
      'Keep advisory work, proposals, automation triggers, approvals, and production access visually distinct.',
      'Avoid implying AI is a team role equivalent to accountable humans.',
      'Authority labels and owner names should carry the meaning, not lane color alone.',
    ],
  },
  'ai-helps-security-evidence-not-gate-bypass': {
    chapterId: 'ai-builds-better-cicd',
    title: 'AI helps with security evidence, not gate bypassing',
    sourceDoc: 'docs/ID30/04-ai-integration.md',
    sourceHeadings: ['Security and Compliance Rules'],
    originalBody:
      'AI-assisted CI/CD increases the need for clear security and compliance rules. AI can inspect workflows for plaintext secrets, broad credentials, unsafe logging, or privileged jobs on untrusted pull requests; suggest least-privilege stage splits; summarize dependency, image, policy, and compliance findings; compare SBOMs, provenance records, signatures, image digests, and release records; draft policy-as-code rules or exception templates; monitor repeated findings; and help incident responders connect releases, artifacts, health signals, and rollback paths. AI can help produce and interpret evidence, but the pipeline must still enforce the gate.',
    originalKeyPoints: ['AI helps produce and interpret evidence.', 'The pipeline still enforces the gate.'],
    speakerScript: [
      'Start by saying why security rules matter more when AI can generate code, tests, scripts, manifests, and configuration quickly.',
      'Show AI as producing or summarizing evidence beside security gates: secret checks, credential scope, untrusted pull request isolation, SBOMs, provenance, signatures, findings, policy rules, and exceptions.',
      'Then make the contrast: a generated vulnerability summary is not a release rule, a suggested approval is not an approved environment, and a plausible plan is not a verified release.',
      'Close by keeping gates visible as checks in the pipeline, not hidden in chat.',
    ],
    narrationNotes: [
      'Gate state must remain controlled by pipeline evidence, not AI confidence.',
      'Exceptions should look documented and reviewed, not like bypass buttons.',
      'Use this slide to reinforce least privilege, immutable artifacts, visible checks, audit evidence, and post-deploy verification.',
    ],
  },
  'generated-plans-not-verified-releases': {
    chapterId: 'ai-builds-better-cicd',
    title: 'Generated plans are not verified releases',
    sourceDoc: 'docs/ID30/04-ai-integration.md',
    sourceHeadings: ['AI and Release Evidence'],
    originalBody:
      'AI can draft a pipeline, but evidence shows whether the pipeline is trustworthy. AI can inspect logs, but evidence shows what actually ran. AI can suggest an optimization, but evidence shows whether feedback became faster without losing confidence. AI can summarize a release, but evidence connects the source change, validation results, artifact digest, deployment target, health signals, approval trail, and recovery path. The pipeline remains the source of truth, and AI helps the team move through that source of truth faster.',
    originalKeyPoints: ['AI helps draft or inspect.', 'CI/CD validates and records evidence.', 'Humans decide risk, approval, and recovery.'],
    speakerScript: [
      'Use this slide as the clean boundary model: suggestion, evidence, decision.',
      'Follow one proposed change through the layers. It can begin as an AI draft or inspection, but it cannot become a release decision until pipeline evidence exists.',
      'Name examples of evidence: what ran, what was skipped, validation results, artifact digest, deployment target, health signals, approval trail, and recovery path.',
      'End with the human layer: people decide architecture, risk, approval, and recovery using the evidence, not the generated plan alone.',
    ],
    narrationNotes: [
      'Blocked transitions are important; show that a proposal cannot jump directly to release.',
      'Keep the evidence layer visually heavier than the suggestion layer.',
      'This slide should feel layered and procedural after the gate-focused security slide.',
    ],
  },
  'ai-accelerator-takeaway': {
    chapterId: 'ai-builds-better-cicd',
    title: 'Main takeaway',
    sourceDoc: 'docs/ID30/04-ai-integration.md',
    sourceHeadings: ['The Main Takeaway'],
    originalBody:
      'AI is an accelerator for CI/CD design and maintenance, not a replacement for CI/CD judgment. Use AI to understand architecture, draft workflows, inspect configuration, summarize failures, compare optimization options, explain permissions, and make security evidence easier to act on. Keep the actual delivery system grounded in explicit gates, least privilege, immutable artifacts, human ownership, post-deploy verification, and auditable release evidence. The best result is a team that can improve the whole delivery loop faster while still knowing exactly what was checked, what was built, what was deployed, whether it worked, and how to recover.',
    originalKeyPoints: ['Use AI to understand, draft, inspect, summarize, and compare.', 'Keep delivery grounded in evidence and human judgment.'],
    speakerScript: [
      'Close the course by refusing the tempting headline that AI writes the pipeline.',
      'Use the visual to send five AI assist actions into grounding controls: gates, least privilege, immutable artifacts, human ownership, verification, and audit evidence.',
      'Make the final release badge wait until evidence and human judgment are both present.',
      'End with the source takeaway: the best result is a team improving the whole delivery loop faster while still knowing what was checked, built, deployed, whether it worked, and how to recover.',
    ],
    narrationNotes: [
      'This should feel like synthesis, not a new list of features.',
      'Keep AI as an accelerator attached to CI/CD evidence rather than a replacement authority.',
      'The final visual should echo gates and evidence from earlier chapters without repeating any one previous layout.',
    ],
  },
} as const satisfies Record<string, LabSlideScript>

export type LabSlideScriptTopicId = keyof typeof labSlideScripts

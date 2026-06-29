import type { LabChapter, LabTopic, LabTopicRef } from './labContentTypes'

const sourceDocs = {
  benefits: 'docs/ID30/01-benefits.md',
  skills: 'docs/ID30/02-skill-set.md',
  evaluation: 'docs/ID30/03-evaluation.md',
  ai: 'docs/ID30/04-ai-integration.md',
} as const

export const labChapters = [
  {
    id: 'why-cicd-matters',
    sourceDoc: sourceDocs.benefits,
    content: {
      en: {
        title: 'Why CI/CD Matters',
        summary:
          'CI/CD turns written code into a larger delivery loop that validates, releases, verifies, and feeds evidence back to the team.',
      },
      'zh-TW': {},
    },
    topics: [
      {
        id: 'software-not-done-when-written',
        chapterId: 'why-cicd-matters',
        sourceDoc: sourceDocs.benefits,
        sourceHeadings: ['Document introduction', 'The Larger Feedback Loop'],
        content: {
          en: {
            title: 'Software is not done when code is written',
            summary:
              'A change still has to be validated, packaged, released, observed, and sometimes reversed.',
            body:
              'Writing code starts delivery; it does not finish it. CI/CD expands local confidence into a shared loop that validates, packages, deploys, verifies, and feeds evidence back.',
            keyPoints: ['Code is the first loop.', 'Delivery needs shared evidence.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'delivery-loop-comparison',
        stage2Notes: 'Candidate for a delivery loop comparison between local development and shared release flow.',
      },
      {
        id: 'ci-cd-answer-different-questions',
        chapterId: 'why-cicd-matters',
        sourceDoc: sourceDocs.benefits,
        sourceHeadings: ['The Larger Feedback Loop'],
        content: {
          en: {
            title: 'CI and CD answer different questions',
            summary:
              'Continuous integration asks whether a change is safe to merge; continuous delivery asks whether it can be released safely.',
            body:
              'CI asks if a change is safe to merge. CD asks if an accepted change can be released safely. One path can carry both decisions, but the confidence points are different.',
            keyPoints: ['CI creates merge confidence.', 'CD creates release confidence.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'trusted-pipeline-path',
        stage2Notes: 'Candidate for a trusted path or pipeline-stage visual.',
      },
      {
        id: 'ai-makes-trust-more-important',
        chapterId: 'why-cicd-matters',
        sourceDoc: sourceDocs.benefits,
        sourceHeadings: ['Why AI Makes CI/CD More Necessary'],
        content: {
          en: {
            title: 'AI makes trust more important',
            summary:
              'AI can accelerate generated code, tests, scripts, and configuration, which increases the need for trustworthy validation.',
            body:
              'AI can generate plausible code, tests, scripts, and configuration quickly. CI/CD keeps that speed tied to evidence, so faster change does not become faster uncertainty.',
            keyPoints: ['Faster generation can create faster uncertainty.', 'CI/CD keeps speed connected to evidence.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'ai-assisted-change-funnel',
        stage2Notes: 'Candidate for an AI-assisted change funnel that filters generated work through validation.',
      },
      {
        id: 'simple-six-step-model',
        chapterId: 'why-cicd-matters',
        sourceDoc: sourceDocs.benefits,
        sourceHeadings: ['The Easy Mental Model'],
        content: {
          en: {
            title: 'The simple six-step model',
            summary:
              'CI/CD can be understood as validate, build/package, deploy infrastructure, deploy application, verify, and feed results back.',
            body:
              'The durable model is tool-agnostic: validate, build once, deploy infrastructure when needed, deploy the artifact, verify the release, and feed results back.',
            keyPoints: ['Validate before release.', 'Build once, verify, then learn.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'six-stage-loop',
        stage2Notes: 'Candidate for a six-stage loop visual.',
      },
      {
        id: 'real-benefits',
        chapterId: 'why-cicd-matters',
        sourceDoc: sourceDocs.benefits,
        sourceHeadings: [
          'The Real Benefits',
          'Faster Useful Feedback',
          'More Reliable Releases',
          'Better Traceability',
          'Safer Collaboration',
          'Controlled Speed',
        ],
        content: {
          en: {
            title: 'The real benefits',
            summary:
              'CI/CD improves delivery by making feedback faster, releases more reliable, traceability stronger, collaboration safer, and speed controlled.',
            body:
              'CI/CD benefits are evidence-backed: faster feedback, more reliable releases, better traceability, safer collaboration, and speed that stays controlled.',
            keyPoints: ['Benefits come from evidence.', 'Speed stays connected to risk.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'benefit-evidence-path',
        stage2Notes: 'Candidate for benefit cards or an evidence-backed release path.',
      },
      {
        id: 'why-good-cicd-is-hard',
        chapterId: 'why-cicd-matters',
        sourceDoc: sourceDocs.benefits,
        sourceHeadings: [
          'Why CI/CD Is Hard to Do Well',
          'Architecture Boundaries',
          'Optimization Without Losing Trust',
          'Permissions and Ownership',
          'Security and Compliance',
          'Rollback and Recovery',
        ],
        content: {
          en: {
            title: 'Why good CI/CD is hard',
            summary:
              'Production-quality CI/CD touches architecture, infrastructure, security, workflow, optimization, ownership, and recovery.',
            body:
              'The model is simple; production is not. Real CI/CD crosses architecture, optimization, permissions, security, compliance, ownership, and recovery boundaries.',
            keyPoints: ['Boundaries shape validation.', 'Trust must survive speed work.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'simple-vs-production-reality',
        stage2Notes: 'Candidate for a simple model versus production reality comparison.',
      },
      {
        id: 'larger-loop-takeaway',
        chapterId: 'why-cicd-matters',
        sourceDoc: sourceDocs.benefits,
        sourceHeadings: ['The Main Takeaway'],
        content: {
          en: {
            title: 'Main takeaway',
            summary:
              'CI/CD is the larger loop that turns fast changes into trusted releases, especially in AI-assisted development.',
            body:
              'AI can accelerate the small loop of writing software. CI/CD protects the larger loop that turns fast changes into trusted releases.',
            keyPoints: ['AI accelerates the small loop.', 'CI/CD protects the larger delivery loop.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'chapter-takeaway',
        stage2Notes: 'Likely a concise transition visual into the skill-set chapter.',
      },
    ],
  },
  {
    id: 'skill-sets-needed',
    sourceDoc: sourceDocs.skills,
    content: {
      en: {
        title: 'Skill Sets Needed to Implement CI/CD',
        summary:
          'Building CI/CD requires application, platform, infrastructure, security, optimization, observability, and release-operation skills.',
      },
      'zh-TW': {},
    },
    topics: [
      {
        id: 'cicd-not-just-yaml',
        chapterId: 'skill-sets-needed',
        sourceDoc: sourceDocs.skills,
        sourceHeadings: ['Document introduction'],
        content: {
          en: {
            title: 'CI/CD is not just YAML',
            summary:
              'The core skill is designing a delivery path, not only configuring a workflow file.',
            body:
              'YAML is the interface. Real CI/CD is a delivery system shaped by application, platform, infrastructure, security, optimization, observability, and release operations.',
            keyPoints: ['Design the delivery path.', 'Keep it repeatable, observable, and safe.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'system-skill-map',
        stage2Notes: 'Candidate for a CI/CD system skill map.',
      },
      {
        id: 'application-shape-decides-pipeline-shape',
        chapterId: 'skill-sets-needed',
        sourceDoc: sourceDocs.skills,
        sourceHeadings: ['Application Architecture'],
        content: {
          en: {
            title: 'Application shape decides pipeline shape',
            summary:
              'Pipelines are easier to design when service, module, database, and configuration boundaries are clear.',
            body:
              'Service, module, database, and configuration boundaries decide what must be validated, built, deployed, and verified.',
            keyPoints: ['Map change impact.', 'Shape the pipeline around boundaries.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'architecture-to-pipeline-mapping',
        stage2Notes: 'Candidate for an architecture-to-pipeline mapping.',
      },
      {
        id: 'classic-apps-coupled-validation',
        chapterId: 'skill-sets-needed',
        sourceDoc: sourceDocs.skills,
        sourceHeadings: ['Classic Two-Tier or Three-Tier Applications'],
        content: {
          en: {
            title: 'Classic apps and coupled validation',
            summary:
              'Frontend, backend, schema, and configuration coupling can require broader validation even for small changes.',
            body:
              'When frontend, backend, schema, and configuration move together, even a small change can require broad validation before promotion.',
            keyPoints: ['Coupling expands validation.', 'Promote the same built image.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'coupled-validation-model',
        stage2Notes: 'Possible compact model of coupled frontend, backend, and database validation.',
      },
      {
        id: 'microservices-dependency-scope',
        chapterId: 'skill-sets-needed',
        sourceDoc: sourceDocs.skills,
        sourceHeadings: ['Microservice Applications'],
        content: {
          en: {
            title: 'Microservices and dependency scope',
            summary:
              'Microservice CI/CD needs service-level independence while still respecting shared libraries, schemas, contracts, and downstream effects.',
            body:
              'Independent service delivery only works when the pipeline understands shared libraries, schemas, contracts, downstream services, and shared resources.',
            keyPoints: ['Find the affected radius.', 'Validate enough without testing everything.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'affected-service-graph',
        stage2Notes: 'Candidate for an affected-service graph.',
      },
      {
        id: 'where-automation-runs',
        chapterId: 'skill-sets-needed',
        sourceDoc: sourceDocs.skills,
        sourceHeadings: ['Host Platform', 'Third-Party CI/CD', 'Self-Hosted CI/CD'],
        content: {
          en: {
            title: 'Where automation runs',
            summary:
              'Hosted CI/CD offers convenience, while self-hosted CI/CD adds control and operational responsibility.',
            body:
              'Hosted CI/CD is fast to start. Self-hosted CI/CD gives more control, but it becomes production infrastructure the team must operate.',
            keyPoints: ['Hosted still needs trust boundaries.', 'Self-hosted adds operational ownership.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'operating-model-comparison',
        stage2Notes: 'Candidate for a hosted versus self-hosted operating-model comparison.',
      },
      {
        id: 'infrastructure-connects-artifacts-to-runtime',
        chapterId: 'skill-sets-needed',
        sourceDoc: sourceDocs.skills,
        sourceHeadings: ['Infrastructure', 'Cloud Provider', 'On-Premise or Private Infrastructure'],
        content: {
          en: {
            title: 'Infrastructure connects artifacts to runtime',
            summary:
              'CI/CD must connect built images to registries, clusters, servers, networks, databases, secrets, and observability systems.',
            body:
              'A built image still needs registries, runtime targets, networks, databases, secrets, ingress, and observability to reach production safely.',
            keyPoints: ['Connect artifacts to runtime.', 'Preserve deploy and rollback evidence.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'artifact-to-runtime-map',
        stage2Notes: 'Candidate for an artifact-to-runtime infrastructure map.',
      },
      {
        id: 'permissions-security-by-stage',
        chapterId: 'skill-sets-needed',
        sourceDoc: sourceDocs.skills,
        sourceHeadings: ['Permissions and Security'],
        content: {
          en: {
            title: 'Permissions and security by stage',
            summary:
              'Validation, build, infrastructure, deployment, and verification stages should have different powers.',
            body:
              'Pipelines are privileged automation. Each stage should have only the power it needs, with explicit audit evidence for powerful actions.',
            keyPoints: ['Separate stage authority.', 'Make release power auditable.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'permission-lanes',
        stage2Notes: 'Candidate for responsibility and permission lanes by pipeline stage.',
      },
      {
        id: 'optimization-feedback-loop-design',
        chapterId: 'skill-sets-needed',
        sourceDoc: sourceDocs.skills,
        sourceHeadings: ['Optimization'],
        content: {
          en: {
            title: 'Optimization is feedback-loop design',
            summary:
              'Pipeline speed matters only when it preserves confidence, traceability, and correctness.',
            body:
              'Optimization is faster useful feedback, not shorter jobs at any cost. Speed must preserve what ran, skipped, built, and deployed.',
            keyPoints: ['Fast answers must stay trustworthy.', 'Trace optimized paths.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'speed-trust-balance',
        stage2Notes: 'Candidate for a speed and trust balance visual.',
      },
      {
        id: 'observability-release-operations-close-loop',
        chapterId: 'skill-sets-needed',
        sourceDoc: sourceDocs.skills,
        sourceHeadings: ['Observability and Release Operations', 'The Main Takeaway'],
        content: {
          en: {
            title: 'Observability and release operations close the loop',
            summary:
              'Deployment is complete only when the team knows the intended version is running and healthy.',
            body:
              'Deployment is complete only after release acceptance shows the intended version is running, healthy, and feeding lessons back into the pipeline.',
            keyPoints: [
              'Release acceptance needs health evidence.',
              'Release outcomes improve pipeline design.',
            ],
          },
          'zh-TW': {},
        },
        visualSlot: 'release-operations-loop',
        stage2Notes: 'Likely a loop-closing visual for deployment verification and feedback.',
      },
    ],
  },
  {
    id: 'evaluating-cicd-benefits',
    sourceDoc: sourceDocs.evaluation,
    content: {
      en: {
        title: 'How to Evaluate CI/CD Benefits',
        summary:
          'A strong CI/CD evaluation asks whether the pipeline creates trustworthy evidence for better release decisions.',
      },
      'zh-TW': {},
    },
    topics: [
      {
        id: 'evidence-not-vibes',
        chapterId: 'evaluating-cicd-benefits',
        sourceDoc: sourceDocs.evaluation,
        sourceHeadings: ['Document introduction', 'What Good CI/CD Should Prove'],
        content: {
          en: {
            title: 'Evidence, not vibes',
            summary:
              'CI/CD is valuable when it proves what changed, what ran, what was built, what deployed, and whether recovery is ready.',
            body:
              'CI/CD value shows up as evidence: what changed, what ran, what built, where it deployed, which gates passed, whether it is healthy, and how recovery works.',
            keyPoints: ['Evaluate evidence, not green checks.', 'Make release answers visible.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'evidence-chain',
        stage2Notes: 'Candidate for a release evidence chain visual.',
      },
      {
        id: 'qualitative-evaluation',
        chapterId: 'evaluating-cicd-benefits',
        sourceDoc: sourceDocs.evaluation,
        sourceHeadings: ['Qualitative Evaluation'],
        content: {
          en: {
            title: 'Qualitative evaluation',
            summary:
              'Qualitative checks ask how the pipeline changes behavior, trust, and lifecycle fit.',
            body:
              'Qualitative evaluation asks whether the pipeline changes team behavior: trust, lifecycle fit, visibility, repeatability, boundaries, optimization, and release operations.',
            keyPoints: ['Behavior reveals trust.', 'Fit matters beyond automation.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'qualitative-checklist',
        stage2Notes: 'Possible checklist or question-set visual.',
      },
      {
        id: 'architecture-platform-infrastructure-fit',
        chapterId: 'evaluating-cicd-benefits',
        sourceDoc: sourceDocs.evaluation,
        sourceHeadings: ['Application Architecture', 'Host Platform', 'Infrastructure'],
        content: {
          en: {
            title: 'Architecture, platform, and infrastructure fit',
            summary:
              'Evaluation should check whether the pipeline reflects the real application shape, automation platform, and runtime environment.',
            body:
              'Evaluate fit across three layers: the application shape, the automation platform, and the runtime infrastructure that supports each release.',
            keyPoints: ['Match validation to real boundaries.', 'Keep platform and infrastructure evidence inspectable.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'system-fit-frame',
        stage2Notes: 'Candidate for a system-fit frame across architecture, platform, and infrastructure.',
      },
      {
        id: 'permissions-security-optimization-quality',
        chapterId: 'evaluating-cicd-benefits',
        sourceDoc: sourceDocs.evaluation,
        sourceHeadings: ['Permissions and Security', 'Optimization'],
        content: {
          en: {
            title: 'Permissions, security, and optimization quality',
            summary:
              'A good pipeline keeps powerful actions bounded while making feedback faster without hiding risk.',
            body:
              'Good evaluation asks whether powerful actions are bounded and whether faster feedback still preserves the evidence needed to trust the result.',
            keyPoints: ['Bound privilege by stage.', 'Do not trade evidence away for speed.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'tradeoff-frame',
        stage2Notes: 'Candidate for a tradeoff frame covering speed, trust, and privilege.',
      },
      {
        id: 'release-operations-and-health',
        chapterId: 'evaluating-cicd-benefits',
        sourceDoc: sourceDocs.evaluation,
        sourceHeadings: ['Observability and Release Operations'],
        content: {
          en: {
            title: 'Release operations and health',
            summary:
              'Deployment is complete only after the release is accepted through version, smoke, health, and operational signals.',
            body:
              'A successful deploy command is not release acceptance. Verify the intended artifact, health checks, observability signals, rollback readiness, and incident learning.',
            keyPoints: ['Verify the intended runtime version.', 'Tie health evidence to release acceptance.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'release-health-frame',
        stage2Notes: 'Possible release health and acceptance visual.',
      },
      {
        id: 'feedback-time-breakdown',
        chapterId: 'evaluating-cicd-benefits',
        sourceDoc: sourceDocs.evaluation,
        sourceHeadings: ['Quantitative Evaluation', 'Feedback Time'],
        content: {
          en: {
            title: 'Feedback time breakdown',
            summary:
              'Feedback time should be split into queue, setup, execution, transfer, deploy wait, and verification delays.',
            body:
              'A single pipeline duration hides the cause. Break feedback time into queue, setup, execution, transfer, deploy wait, and verification delay.',
            keyPoints: ['Different delays need different fixes.', 'Useful feedback beats raw runtime.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'duration-breakdown',
        stage2Notes: 'Candidate for a pipeline duration breakdown.',
      },
      {
        id: 'delivery-recovery-metrics',
        chapterId: 'evaluating-cicd-benefits',
        sourceDoc: sourceDocs.evaluation,
        sourceHeadings: ['Deployment Frequency', 'Lead Time for Changes', 'Change Failure Rate', 'MTTR and Recovery Time'],
        content: {
          en: {
            title: 'Delivery and recovery metrics',
            summary:
              'Deployment frequency, lead time, change failure rate, and recovery time show delivery speed and reliability in context.',
            body:
              'Read delivery and recovery together: deployment frequency, lead time, change failure rate, and recovery time only make sense in release context.',
            keyPoints: ['Speed needs reliability context.', 'Recovery matters as much as deploy speed.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'delivery-recovery-metrics',
        stage2Notes: 'Likely metric group visual for delivery speed and recovery reliability.',
      },
      {
        id: 'trust-efficiency-metrics',
        chapterId: 'evaluating-cicd-benefits',
        sourceDoc: sourceDocs.evaluation,
        sourceHeadings: ['Flaky-Test Rate', 'Cache Hit Rate', 'Artifact Traceability', 'Rollback Readiness'],
        content: {
          en: {
            title: 'Trust and efficiency metrics',
            summary:
              'Flaky tests, cache usefulness, artifact traceability, and rollback readiness reveal whether fast delivery remains trustworthy.',
            body:
              'Fast delivery stays dependable only when flakes, caches, artifact traceability, and rollback readiness are measured as trust signals, not side details.',
            keyPoints: ['Efficiency must stay trustworthy.', 'Traceability supports rollback and audits.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'trust-efficiency-metrics',
        stage2Notes: 'Possible trust and efficiency metric grouping.',
      },
      {
        id: 'security-audit-confidence-metrics',
        chapterId: 'evaluating-cicd-benefits',
        sourceDoc: sourceDocs.evaluation,
        sourceHeadings: ['Security Gate Outcomes', 'Audit Evidence Completeness', 'Developer Confidence'],
        content: {
          en: {
            title: 'Security, audit, and confidence metrics',
            summary:
              'Trust includes security gate outcomes, retained audit evidence, and whether developers understand and act on pipeline results.',
            body:
              'Trust combines security outcomes, retained audit evidence, and developer confidence that pipeline results are understandable and worth acting on.',
            keyPoints: ['Make risk visible and actionable.', 'Keep evidence retained and connected.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'security-audit-confidence',
        stage2Notes: 'Possible visual tying security evidence to human confidence.',
      },
      {
        id: 'metrics-create-tradeoffs',
        chapterId: 'evaluating-cicd-benefits',
        sourceDoc: sourceDocs.evaluation,
        sourceHeadings: ['Interpreting Metrics Together', 'The Main Takeaway'],
        content: {
          en: {
            title: 'Metrics create tradeoffs',
            summary:
              'No single metric proves success; evaluation balances speed, reliability, trust, efficiency, and security.',
            body:
              'No single metric proves CI/CD success. Evaluation balances speed, reliability, trust, efficiency, and security for the team\'s actual release model.',
            keyPoints: ['Interpret metrics together.', 'Choose tradeoffs instead of chasing every number.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'metric-constellation',
        stage2Notes: 'Candidate for a metric constellation or balanced-signal view.',
      },
    ],
  },
  {
    id: 'ai-builds-better-cicd',
    sourceDoc: sourceDocs.ai,
    content: {
      en: {
        title: 'How AI Helps Teams Build Better CI/CD',
        summary:
          'AI can draft, inspect, summarize, and compare CI/CD work, but the pipeline remains the source of release truth.',
      },
      'zh-TW': {},
    },
    topics: [
      {
        id: 'ai-helps-loop-pipeline-remains-truth',
        chapterId: 'ai-builds-better-cicd',
        sourceDoc: sourceDocs.ai,
        sourceHeadings: ['Document introduction'],
        content: {
          en: {
            title: 'AI helps the loop, but the pipeline remains truth',
            summary:
              'AI is most useful when it reduces toil while CI/CD keeps explicit gates, least privilege, immutable artifacts, and release verification.',
            body:
              'AI can draft, inspect, compare, summarize, and monitor CI/CD work. The pipeline still holds gates, artifacts, verification, and release truth.',
            keyPoints: ['AI reduces CI/CD toil.', 'Pipeline evidence stays authoritative.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'ai-delivery-loop-orbit',
        stage2Notes: 'Candidate for AI orbiting the delivery loop.',
      },
      {
        id: 'ai-supports-architecture-decisions',
        chapterId: 'ai-builds-better-cicd',
        sourceDoc: sourceDocs.ai,
        sourceHeadings: ['Architecture'],
        content: {
          en: {
            title: 'AI can support architecture decisions',
            summary:
              'AI can help map services, checks, deployment targets, rollback concerns, and pipeline diagrams.',
            body:
              'AI can map services, checks, targets, and rollback concerns, but humans decide which architecture and risk boundaries are real.',
            keyPoints: ['AI surfaces architecture options.', 'Humans own boundary decisions.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'ai-architecture-review',
        stage2Notes: 'Possible visual for AI-assisted architecture review.',
      },
      {
        id: 'ai-improves-optimization-strategy',
        chapterId: 'ai-builds-better-cicd',
        sourceDoc: sourceDocs.ai,
        sourceHeadings: ['Optimization Strategy'],
        content: {
          en: {
            title: 'AI can improve optimization strategy',
            summary:
              'AI can summarize time spent, suggest fail-fast ordering, compare cache keys, detect repeated work, and review workflow changes.',
            body:
              'AI can spot slow stages and suggest ordering, caching, or parallelism. Optimization still must show what ran, skipped, changed, and became riskier.',
            keyPoints: ['Use AI on measured behavior.', 'Preserve optimization evidence.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'optimization-assistant-panel',
        stage2Notes: 'Candidate for an optimization assistant panel.',
      },
      {
        id: 'ai-should-not-blur-ownership',
        chapterId: 'ai-builds-better-cicd',
        sourceDoc: sourceDocs.ai,
        sourceHeadings: ['Role Permissions'],
        content: {
          en: {
            title: 'AI should not blur ownership',
            summary:
              'AI can reduce coordination cost, but advisory work, proposals, automation triggers, and approvals must stay distinct.',
            body:
              'AI can advise, draft proposals, and trigger low-risk automation. Approval authority, production access, and accountability stay with named owners.',
            keyPoints: ['AI can assist coordination.', 'Authority stays explicit.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'responsibility-authority-map',
        stage2Notes: 'Candidate for a responsibility and authority map.',
      },
      {
        id: 'ai-helps-security-evidence-not-gate-bypass',
        chapterId: 'ai-builds-better-cicd',
        sourceDoc: sourceDocs.ai,
        sourceHeadings: ['Security and Compliance Rules'],
        content: {
          en: {
            title: 'AI helps with security evidence, not gate bypassing',
            summary:
              'AI can inspect, summarize, and compare security evidence, but the pipeline must enforce the gate.',
            body:
              'AI can summarize findings and draft policies. The pipeline still enforces security gates, exceptions, approvals, and release blocks.',
            keyPoints: ['AI helps interpret evidence.', 'Gates remain enforced checks.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'security-evidence-gates',
        stage2Notes: 'Possible visual showing AI evidence support beside enforced security gates.',
      },
      {
        id: 'generated-plans-not-verified-releases',
        chapterId: 'ai-builds-better-cicd',
        sourceDoc: sourceDocs.ai,
        sourceHeadings: ['AI and Release Evidence'],
        content: {
          en: {
            title: 'Generated plans are not verified releases',
            summary:
              'A suggestion, a pipeline record, and a release decision are different layers of responsibility.',
            body:
              'A generated plan is not a verified release. Suggestions need pipeline evidence before humans decide risk, approval, and recovery.',
            keyPoints: ['Suggestions need evidence.', 'Humans make release decisions.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'suggestion-evidence-decision',
        stage2Notes: 'Candidate for a hierarchy of AI suggestion, pipeline evidence, and human release decision.',
      },
      {
        id: 'ai-accelerator-takeaway',
        chapterId: 'ai-builds-better-cicd',
        sourceDoc: sourceDocs.ai,
        sourceHeadings: ['The Main Takeaway'],
        content: {
          en: {
            title: 'Main takeaway',
            summary:
              'AI accelerates CI/CD design and maintenance, but it does not replace CI/CD judgment.',
            body:
              'Use AI to improve the loop faster. Keep delivery grounded in gates, least privilege, immutable artifacts, verification, audit evidence, and human judgment.',
            keyPoints: ['AI accelerates improvement.', 'CI/CD judgment stays grounded.'],
          },
          'zh-TW': {},
        },
        visualSlot: 'ai-accelerator-takeaway',
        stage2Notes: 'Likely a concise closing visual for AI as an accelerator, not authority.',
      },
    ],
  },
] as const satisfies readonly LabChapter[]

export const labTopics: readonly LabTopic[] = (labChapters as readonly LabChapter[]).flatMap(
  (chapter) => chapter.topics,
)

export const labTopicOrder: readonly LabTopicRef[] = labTopics.map((topic, index, topics) => {
  const previousTopic = topics[index - 1]
  const nextTopic = topics[index + 1]

  return {
    chapterId: topic.chapterId,
    topicId: topic.id,
    index,
    previous: previousTopic
      ? {
          chapterId: previousTopic.chapterId,
          topicId: previousTopic.id,
        }
      : undefined,
    next: nextTopic
      ? {
          chapterId: nextTopic.chapterId,
          topicId: nextTopic.id,
        }
      : undefined,
  }
})

export const firstLabTopic = labTopicOrder[0]

export const findLabChapter = (chapterId: string) =>
  labChapters.find((chapter) => chapter.id === chapterId)

export const findLabTopic = (chapterId: string, topicId: string) =>
  findLabChapter(chapterId)?.topics.find((topic) => topic.id === topicId)

export const findLabTopicRef = (chapterId: string, topicId: string) =>
  labTopicOrder.find((topicRef) => topicRef.chapterId === chapterId && topicRef.topicId === topicId)

export const getFirstTopicForChapter = (chapterId: string): LabTopic | undefined =>
  findLabChapter(chapterId)?.topics[0]

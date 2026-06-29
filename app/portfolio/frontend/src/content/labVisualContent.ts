import type {
  LabLocalizedContent,
  LabPresentationUiLocaleContent,
  LabVisualLocaleContent,
  LabVisualSlotKey,
} from './labContentTypes'

export const labPresentationUiContent = {
  en: {
    chapterLabel: 'Chapter',
    slideLabel: 'Slide',
    coreIdeaLabel: 'Core idea',
    keyPointsLabel: 'Key points',
    sourceReferenceLabel: 'Source reference',
    sourceReferenceAriaLabel: 'Source reference',
    stage2BadgeLabel: 'Stage 2',
    visualPlaceholderLabel: 'Visual placeholder',
    visualLoadingLabel: 'Loading visual',
    previousLabel: 'Previous',
    nextLabel: 'Next',
    checkpointDescription: 'Checkpoint before moving to the next slide.',
    stayLabel: 'Stay',
    continueLabel: 'Continue',
    emptyStateLabel: 'No presentation content is available.',
  },
  'zh-TW': {
    chapterLabel: '章節',
    slideLabel: '投影片',
    coreIdeaLabel: '核心概念',
    keyPointsLabel: '重點',
    sourceReferenceLabel: '來源參照',
    sourceReferenceAriaLabel: '來源參照',
    stage2BadgeLabel: '第二階段',
    visualPlaceholderLabel: '視覺占位',
    visualLoadingLabel: '載入視覺元件',
    previousLabel: '上一張',
    nextLabel: '下一張',
    checkpointDescription: '前往下一張投影片前的檢查點。',
    stayLabel: '停留',
    continueLabel: '繼續',
    emptyStateLabel: '沒有可用的簡報內容。',
  },
} satisfies LabLocalizedContent<LabPresentationUiLocaleContent>

export const labVisualSlotContent = {
  'delivery-loop-comparison': {
    en: {
      title: 'Delivery loop comparison',
      summary: 'Contrasts local code writing with the larger shared delivery loop.',
      ariaLabel: 'Delivery loop comparison visual',
    },
    'zh-TW': {},
  },
  'trusted-pipeline-path': {
    en: {
      title: 'Trusted pipeline path',
      summary: 'Shows how source, build, deploy, and verify stages create release evidence.',
      ariaLabel: 'Trusted pipeline path visual',
    },
    'zh-TW': {},
  },
  'ai-assisted-change-funnel': {
    en: {
      title: 'AI-assisted change funnel',
      summary: 'Frames generated work as input that still has to pass validation gates.',
      ariaLabel: 'AI-assisted change funnel visual',
    },
    'zh-TW': {},
  },
  'six-stage-loop': {
    en: {
      title: 'Six-stage delivery loop',
      summary: 'Shows validate, build, infrastructure, deploy, verify, and feedback as one trusted loop.',
      ariaLabel: 'Six-stage delivery loop visual',
    },
    'zh-TW': {},
  },
  'benefit-evidence-path': {
    en: {
      title: 'Benefit evidence path',
      summary: 'Connects delivery benefits to the evidence a pipeline preserves.',
      ariaLabel: 'Benefit evidence path visual',
    },
    'zh-TW': {},
  },
  'simple-vs-production-reality': {
    en: {
      title: 'Simple model versus production reality',
      summary: 'Compares the easy mental model with real production constraints.',
      ariaLabel: 'Simple model versus production reality visual',
    },
    'zh-TW': {},
  },
  'chapter-takeaway': {
    en: {
      title: 'Chapter takeaway',
      summary: 'A compact bridge from the chapter idea into the next chapter.',
      ariaLabel: 'Chapter takeaway visual',
    },
    'zh-TW': {},
  },
  'system-skill-map': {
    en: {
      title: 'System skill map',
      summary: 'Maps CI/CD work across application, platform, cloud, and context skills.',
      ariaLabel: 'System skill map visual',
    },
    'zh-TW': {},
  },
  'architecture-to-pipeline-mapping': {
    en: {
      title: 'Architecture to pipeline mapping',
      summary: 'Shows how application boundaries shape validation and deployment flow.',
      ariaLabel: 'Architecture to pipeline mapping visual',
    },
    'zh-TW': {},
  },
  'coupled-validation-model': {
    en: {
      title: 'Coupled validation model',
      summary: 'Compares a focused UI change with a schema-coupled change that expands validation across app, database, config, and promotion gates.',
      ariaLabel: 'Coupled validation model visual comparing focused UI checks with broad schema, config, and promotion validation',
    },
    'zh-TW': {},
  },
  'affected-service-graph': {
    en: {
      title: 'Affected service graph',
      summary: 'Highlights how one service change can affect shared dependencies and downstream checks.',
      ariaLabel: 'Affected service graph visual',
    },
    'zh-TW': {},
  },
  'operating-model-comparison': {
    en: {
      title: 'Operating model comparison',
      summary: 'Contrasts hosted CI/CD convenience with self-hosted operational control.',
      ariaLabel: 'Operating model comparison visual',
    },
    'zh-TW': {},
  },
  'artifact-to-runtime-map': {
    en: {
      title: 'Artifact to runtime map',
      summary: 'Connects built artifacts to registries, infrastructure, and runtime environments.',
      ariaLabel: 'Artifact to runtime map visual',
    },
    'zh-TW': {},
  },
  'permission-lanes': {
    en: {
      title: 'Permission lanes',
      summary: 'Shows how pipeline stages should have different powers and responsibilities.',
      ariaLabel: 'Permission lanes visual',
    },
    'zh-TW': {},
  },
  'speed-trust-balance': {
    en: {
      title: 'Speed and trust balance',
      summary: 'Frames optimization as useful speed that preserves pipeline confidence.',
      ariaLabel: 'Speed and trust balance visual',
    },
    'zh-TW': {},
  },
  'release-operations-loop': {
    en: {
      title: 'Release operations loop',
      summary: 'Shows deployment verification and operational feedback returning to the team.',
      ariaLabel: 'Release operations loop visual',
    },
    'zh-TW': {},
  },
  'evidence-chain': {
    en: {
      title: 'Evidence chain',
      summary: 'Connects artifacts, logs, tests, approvals, and deployment outcomes.',
      ariaLabel: 'Evidence chain visual',
    },
    'zh-TW': {},
  },
  'qualitative-checklist': {
    en: {
      title: 'Qualitative checklist',
      summary: 'Represents review signals that cannot be captured by duration metrics alone.',
      ariaLabel: 'Qualitative checklist visual',
    },
    'zh-TW': {},
  },
  'system-fit-frame': {
    en: {
      title: 'System fit frame',
      summary: 'Evaluates whether a delivery system matches the team and product context.',
      ariaLabel: 'System fit frame visual',
    },
    'zh-TW': {},
  },
  'tradeoff-frame': {
    en: {
      title: 'Tradeoff frame',
      summary: 'Frames CI/CD decisions as tradeoffs instead of universal best practices.',
      ariaLabel: 'Tradeoff frame visual',
    },
    'zh-TW': {},
  },
  'release-health-frame': {
    en: {
      title: 'Release health frame',
      summary: 'Groups release signals into a health picture the team can act on.',
      ariaLabel: 'Release health frame visual',
    },
    'zh-TW': {},
  },
  'duration-breakdown': {
    en: {
      title: 'Duration breakdown',
      summary: 'Separates pipeline time into useful feedback, waiting, and bottlenecks.',
      ariaLabel: 'Duration breakdown visual',
    },
    'zh-TW': {},
  },
  'delivery-recovery-metrics': {
    en: {
      title: 'Delivery and recovery metrics',
      summary: 'Connects deployment frequency, lead time, failure rate, and recovery time.',
      ariaLabel: 'Delivery and recovery metrics visual',
    },
    'zh-TW': {},
  },
  'trust-efficiency-metrics': {
    en: {
      title: 'Trust and efficiency metrics',
      summary: 'Balances speed signals with confidence, traceability, and reliability.',
      ariaLabel: 'Trust and efficiency metrics visual',
    },
    'zh-TW': {},
  },
  'security-audit-confidence': {
    en: {
      title: 'Security and audit confidence',
      summary: 'Shows evidence that supports security review, audit trails, and accountability.',
      ariaLabel: 'Security and audit confidence visual',
    },
    'zh-TW': {},
  },
  'metric-constellation': {
    en: {
      title: 'Metric constellation',
      summary: 'Collects multiple release signals into one readable confidence model.',
      ariaLabel: 'Metric constellation visual',
    },
    'zh-TW': {},
  },
  'ai-delivery-loop-orbit': {
    en: {
      title: 'AI delivery loop orbit',
      summary: 'Positions AI assistance around drafting, inspecting, and summarizing delivery work.',
      ariaLabel: 'AI delivery loop orbit visual',
    },
    'zh-TW': {},
  },
  'ai-architecture-review': {
    en: {
      title: 'AI architecture review',
      summary: 'Shows AI as a review assistant around architecture and pipeline boundaries.',
      ariaLabel: 'AI architecture review visual',
    },
    'zh-TW': {},
  },
  'optimization-assistant-panel': {
    en: {
      title: 'Optimization assistant panel',
      summary: 'Frames AI help as optimization suggestions that still need validation.',
      ariaLabel: 'Optimization assistant panel visual',
    },
    'zh-TW': {},
  },
  'responsibility-authority-map': {
    en: {
      title: 'Responsibility and authority map',
      summary: 'Separates AI assistance from human release authority and risk acceptance.',
      ariaLabel: 'Responsibility and authority map visual',
    },
    'zh-TW': {},
  },
  'security-evidence-gates': {
    en: {
      title: 'Security evidence gates',
      summary: 'Connects AI-generated security work to the evidence needed before release.',
      ariaLabel: 'Security evidence gates visual',
    },
    'zh-TW': {},
  },
  'suggestion-evidence-decision': {
    en: {
      title: 'Suggestion, evidence, decision',
      summary: 'Shows the handoff from AI suggestion to pipeline evidence to human decision.',
      ariaLabel: 'Suggestion, evidence, decision visual',
    },
    'zh-TW': {},
  },
  'ai-accelerator-takeaway': {
    en: {
      title: 'AI accelerator takeaway',
      summary: 'Summarizes AI as an accelerator that must stay attached to trusted CI/CD evidence.',
      ariaLabel: 'AI accelerator takeaway visual',
    },
    'zh-TW': {},
  },
} satisfies Record<LabVisualSlotKey, LabLocalizedContent<LabVisualLocaleContent>>

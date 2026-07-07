import type { AppLocale } from '@/i18n/locales'

import type { HirayaEvidenceItem } from './types'
import type { SdlcAuthorityStageId } from './sdlcAuthorityFlow'

export type SdlcDeliveryGuardrailId =
  | 'validate-before-authorize'
  | 'immutable-artifacts-first'
  | 'git-as-deployment-contract'
  | 'gated-infrastructure-path'
  | 'rollback-through-gitops'

export type SdlcDeliveryGuardrailAuthorityBadge = 'no-aws' | 'scoped-oidc' | 'reviewed-git' | 'gitops' | 'environment-gated'

export type SdlcDeliveryGuardrailAuthorityBadgeCopy = {
  label: string
}

export type SdlcDeliveryGuardrailChrome = {
  eyebrow: string
  guardrailLabel: string
  authorityFlowStagesLabel: string
  mappedStagesLabel: string
  allowedActionLabel: string
  forbiddenShortcutLabel: string
  handoffResultLabel: string
  shortcutRiskLabel: string
}

export type SdlcDeliveryGuardrail = {
  id: SdlcDeliveryGuardrailId
  rule: string
  allowedAction: string
  forbiddenShortcut: string
  handoffResult: string
  authorityBadge: SdlcDeliveryGuardrailAuthorityBadge
  flowStageIds: readonly SdlcAuthorityStageId[]
  sourceRefs: readonly string[]
  evidenceRefs?: readonly HirayaEvidenceItem['id'][]
  shortcutRisk: string
}

export type SdlcDeliveryGuardrailBoardContent = {
  eyebrow: string
  title: string
  description: string
  chrome: SdlcDeliveryGuardrailChrome
  authorityBadges: Record<SdlcDeliveryGuardrailAuthorityBadge, SdlcDeliveryGuardrailAuthorityBadgeCopy>
  guardrails: readonly SdlcDeliveryGuardrail[]
}

const authorityBadgesEn: Record<SdlcDeliveryGuardrailAuthorityBadge, SdlcDeliveryGuardrailAuthorityBadgeCopy> = {
  'no-aws': { label: 'No AWS write authority' },
  'scoped-oidc': { label: 'Scoped OIDC' },
  'reviewed-git': { label: 'Reviewed Git' },
  gitops: { label: 'GitOps convergence' },
  'environment-gated': { label: 'Environment-gated apply' },
}

const sdlcDeliveryGuardrailsEn = [
  {
    id: 'validate-before-authorize',
    rule: 'Validate first, authorize later',
    allowedAction: 'Pull request automation may classify changes, run checks, validate rendered manifests, and produce review evidence.',
    forbiddenShortcut: 'Do not give PR checks cloud write authority or let unreviewed branches mutate AWS, ECR, GitOps state, or the live cluster.',
    handoffResult: 'A reviewable evidence bundle that can inform merge decisions without becoming deployment authority.',
    authorityBadge: 'no-aws',
    flowStageIds: ['pr-validation-evidence', 'infra-static-checks'],
    sourceRefs: ['.github/workflows/app-pr-baseline.yml', 'docs/portfolio/CICD.md'],
    evidenceRefs: ['p0-cicd-delivery-flow', 'p0-infra-approval-gate'],
    shortcutRisk: 'If validation jobs can write to cloud or cluster state, a compromised or mistaken PR path can bypass review and turn checks into mutation.',
  },
  {
    id: 'immutable-artifacts-first',
    rule: 'Publish immutable artifacts before deployment',
    allowedAction: 'The image workflow may assume a scoped OIDC role, build affected services, and push commit-SHA images to ECR.',
    forbiddenShortcut: 'Do not let image publishing approve runtime desired state, patch Kubernetes, or replace reviewed manifest promotion.',
    handoffResult: 'A deployable image reference that promotion automation can turn into a GitOps manifest proposal.',
    authorityBadge: 'scoped-oidc',
    flowStageIds: ['image-publishing', 'manifest-promotion-pr'],
    sourceRefs: ['.github/workflows/image-ci.yml', '.github/utils/services.json', '.github/scripts/dist/detect-changed-services.mjs'],
    evidenceRefs: ['p0-cicd-delivery-flow'],
    shortcutRisk: 'Artifact creation and deployment approval are different powers; combining them could turn every successful build into a runtime change.',
  },
  {
    id: 'git-as-deployment-contract',
    rule: 'Git is the deployment contract',
    allowedAction: 'Promotion automation may propose manifest changes; reviewed Git owns the accepted desired state that Argo CD can reconcile.',
    forbiddenShortcut: 'Do not sync arbitrary CI output directly into the cluster or treat an automation-generated PR as accepted before review and merge.',
    handoffResult: 'Accepted Desired State in the watched GitOps path, with PR history and manifest diff as the audit trail.',
    authorityBadge: 'reviewed-git',
    flowStageIds: ['manifest-promotion-pr', 'accepted-desired-state', 'gitops-runtime-convergence', 'deploy-smoke'],
    sourceRefs: ['gitops/apps/vintage/kustomization.yml', 'gitops/apps/vintage/k8s/**', '.github/workflows/image-ci.yml'],
    evidenceRefs: ['p0-cicd-delivery-flow', 'p0-argocd-app-of-apps', 'p0-public-ingress'],
    shortcutRisk: 'Bypassing reviewed Git removes the durable contract between delivery automation, Argo CD, and human review.',
  },
  {
    id: 'gated-infrastructure-path',
    rule: 'Infrastructure changes use the gated Terraform path',
    allowedAction: 'Terraform may plan and apply AWS foundation, platform core, and bootstrap changes only through the separated environment-gated workflow.',
    forbiddenShortcut: 'Do not let application delivery automation inherit high-impact Terraform apply authority or mutate cloud substrate as part of app promotion.',
    handoffResult: 'Auditable plan evidence, environment approval, apply logs, and a GitOps-ready platform handoff.',
    authorityBadge: 'environment-gated',
    flowStageIds: ['platform-core-plan', 'environment-approval', 'platform-core-apply', 'cluster-bootstrap-handoff', 'gitops-platform-ownership'],
    sourceRefs: ['.github/workflows/infra-deploy.yml', 'docs/portfolio/CICD.md'],
    evidenceRefs: ['p0-infra-approval-gate', 'p0-argocd-app-of-apps'],
    shortcutRisk: 'Cloud substrate mutation has a much larger blast radius than an app rollout, so it needs separate intent, approval, and audit evidence.',
  },
  {
    id: 'rollback-through-gitops',
    rule: 'Rollback follows the same reviewed GitOps path',
    allowedAction: 'Rollback automation may verify a target image, prepare a manifest diff, open a rollback PR, and let Argo CD converge after review.',
    forbiddenShortcut: 'Do not manually patch live Deployments or skip the accepted desired-state path during incident recovery.',
    handoffResult: 'A reviewed rollback desired-state change, followed by Argo CD convergence and smoke verification evidence.',
    authorityBadge: 'gitops',
    flowStageIds: ['rollback-request', 'rollback-image-verification', 'rollback-manifest-diff', 'rollback-pr', 'rollback-accepted-desired-state', 'rollback-convergence'],
    sourceRefs: ['.github/workflows/service-image-dev-rollback.yml', 'gitops/apps/vintage/k8s/**'],
    evidenceRefs: ['p1-rollback-path'],
    shortcutRisk: 'Manual live-cluster patches create drift exactly when recovery needs traceability; GitOps rollback keeps the runtime and contract aligned.',
  },
] as const satisfies readonly SdlcDeliveryGuardrail[]

const sdlcDeliveryGuardrailContentEn: SdlcDeliveryGuardrailBoardContent = {
  eyebrow: 'Delivery Guardrails',
  title: 'Five decisions that keep CI from becoming deployment authority',
  description:
    'Each guardrail explains what a delivery actor may do, which shortcut is forbidden, and what handoff proves authority stayed in the correct boundary.',
  chrome: {
    eyebrow: 'Delivery Guardrails',
    guardrailLabel: 'Guardrail',
    authorityFlowStagesLabel: 'Authority Flow stages',
    mappedStagesLabel: 'Mapped stages',
    allowedActionLabel: 'Allowed action',
    forbiddenShortcutLabel: 'Forbidden shortcut',
    handoffResultLabel: 'Handoff result',
    shortcutRiskLabel: 'Why the shortcut is dangerous',
  },
  authorityBadges: authorityBadgesEn,
  guardrails: sdlcDeliveryGuardrailsEn,
}

const authorityBadgesZhTW: Record<SdlcDeliveryGuardrailAuthorityBadge, SdlcDeliveryGuardrailAuthorityBadgeCopy> = {
  'no-aws': { label: '無 AWS 寫入權限' },
  'scoped-oidc': { label: '受限 OIDC' },
  'reviewed-git': { label: 'Reviewed Git 權責' },
  gitops: { label: 'GitOps 收斂' },
  'environment-gated': { label: '環境核准 apply' },
}

const guardrailZhTW: Record<SdlcDeliveryGuardrailId, Pick<SdlcDeliveryGuardrail, 'rule' | 'allowedAction' | 'forbiddenShortcut' | 'handoffResult' | 'shortcutRisk'>> = {
  'validate-before-authorize': {
    rule: '先驗證，後授權',
    allowedAction: 'Pull request automation 可以分類變更、執行 checks、驗證 rendered manifests，並產生 review evidence。',
    forbiddenShortcut: '不要讓 PR checks 擁有 cloud write authority，也不要讓未審查 branches 變更 AWS、ECR、GitOps state 或 live cluster。',
    handoffResult: '一份可審查的證據包，可支援 merge decision，但本身不成為 deployment authority。',
    shortcutRisk: '如果 validation jobs 可以寫入 cloud 或 cluster state，受入侵或錯誤的 PR path 就可能繞過 review，把 checks 變成 mutation。',
  },
  'immutable-artifacts-first': {
    rule: '先發布 immutable artifacts，再部署',
    allowedAction: 'Image workflow 可以 assume scoped OIDC role、建置受影響服務，並將 commit-SHA images 推送到 ECR。',
    forbiddenShortcut: '不要讓 image publishing 同時核准 runtime desired state、patch Kubernetes，或取代 reviewed manifest promotion。',
    handoffResult: '一個可部署 image reference，promotion automation 可將它轉成 GitOps manifest proposal。',
    shortcutRisk: 'Artifact creation 與 deployment approval 是不同權力；合併兩者可能讓每次成功 build 都變成 runtime change。',
  },
  'git-as-deployment-contract': {
    rule: 'Git 是 deployment 契約',
    allowedAction: 'Promotion automation 可以提出 manifest changes；reviewed Git 擁有 Argo CD 可 reconcile 的 accepted desired state。',
    forbiddenShortcut: '不要將任意 CI output 直接 sync 到 cluster，也不要把 automation-generated PR 在 review/merge 前視為 accepted。',
    handoffResult: 'watched GitOps path 中的 Accepted Desired State，並以 PR history 與 manifest diff 作為 audit trail。',
    shortcutRisk: '繞過 reviewed Git 會移除 delivery automation、Argo CD 與 human review 之間的 durable contract。',
  },
  'gated-infrastructure-path': {
    rule: 'Infrastructure 變更走 gated Terraform path',
    allowedAction: 'Terraform 只能透過分離的 environment-gated workflow plan/apply AWS foundation、platform core 與 bootstrap changes。',
    forbiddenShortcut: '不要讓 application delivery automation 繼承高影響 Terraform apply authority，或在 app promotion 中變更 cloud substrate。',
    handoffResult: 'Auditable plan evidence、environment approval、apply logs，以及 GitOps-ready platform handoff。',
    shortcutRisk: 'Cloud substrate mutation 的 blast radius 遠大於 app rollout，因此需要分開的 intent、approval 與 audit evidence。',
  },
  'rollback-through-gitops': {
    rule: 'Rollback 走同一條 reviewed GitOps path',
    allowedAction: 'Rollback automation 可以驗證 target image、準備 manifest diff、建立 rollback PR，並在 review 後讓 Argo CD 收斂。',
    forbiddenShortcut: '不要在 incident recovery 時手動 patch live Deployments 或跳過 accepted desired-state path。',
    handoffResult: '經 review 的 rollback desired-state change，接著由 Argo CD convergence 與 smoke verification evidence 支撐。',
    shortcutRisk: 'Manual live-cluster patches 會在最需要 traceability 的復原時製造 drift；GitOps rollback 讓 runtime 與 contract 保持一致。',
  },
}

const sdlcDeliveryGuardrailContentZhTW: SdlcDeliveryGuardrailBoardContent = {
  eyebrow: 'Delivery Guardrails',
  title: '五項避免 CI 變成部署權限的決策',
  description:
    '每項 guardrail 都說明 delivery actor 可以做什麼、禁止哪個 shortcut，以及哪個 handoff result 證明權責仍留在正確邊界。',
  chrome: {
    eyebrow: 'Delivery Guardrails',
    guardrailLabel: 'Guardrail',
    authorityFlowStagesLabel: 'Authority Flow 階段',
    mappedStagesLabel: '對應階段',
    allowedActionLabel: '允許動作',
    forbiddenShortcutLabel: '禁止 shortcut',
    handoffResultLabel: '交接結果',
    shortcutRiskLabel: '為什麼 shortcut 危險',
  },
  authorityBadges: authorityBadgesZhTW,
  guardrails: sdlcDeliveryGuardrailsEn.map((guardrail) => ({ ...guardrail, ...guardrailZhTW[guardrail.id] })),
}

export function getSdlcDeliveryGuardrailContent(locale: AppLocale): SdlcDeliveryGuardrailBoardContent {
  return locale === 'zh-TW' ? sdlcDeliveryGuardrailContentZhTW : sdlcDeliveryGuardrailContentEn
}

export const sdlcDeliveryGuardrails = sdlcDeliveryGuardrailsEn

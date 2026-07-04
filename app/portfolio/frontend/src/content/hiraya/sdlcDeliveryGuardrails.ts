import type { HirayaEvidenceItem } from './types'
import type { SdlcAuthorityStageId } from './sdlcAuthorityFlow'

export type SdlcDeliveryGuardrailId =
  | 'validate-before-authorize'
  | 'immutable-artifacts-first'
  | 'git-as-deployment-contract'
  | 'gated-infrastructure-path'
  | 'rollback-through-gitops'

export type SdlcDeliveryGuardrailAuthorityBadge = 'no-aws' | 'scoped-oidc' | 'reviewed-git' | 'gitops' | 'environment-gated'

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

export const sdlcDeliveryGuardrails = [
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
    shortcutRisk: 'If validation jobs can write to cloud or cluster state, a compromised or mistaken PR path can bypass review and turn evidence collection into mutation.',
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
    shortcutRisk: 'Artifact creation and deployment approval are different powers; combining them makes every successful build a potential runtime change.',
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
    evidenceRefs: ['p0-cicd-delivery-flow', 'p0-argocd-app-of-apps', 'p2-deploy-smoke'],
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

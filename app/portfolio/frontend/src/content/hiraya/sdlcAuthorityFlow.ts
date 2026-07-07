import type { AppLocale } from '@/i18n/locales'

import type { HirayaEvidenceItem, HirayaRouteId } from './types'

export type SdlcAuthorityLaneId = 'application-delivery' | 'infrastructure-delivery' | 'rollback'

export type SdlcAuthorityConceptId = 'accepted-desired-state' | 'gitops-convergence' | 'verification-evidence'

export type SdlcAuthorityCredentialTone = 'neutral' | 'safe' | 'scoped' | 'gated' | 'gitops'

export type SdlcAuthorityStageId =
  | 'pr-validation-evidence'
  | 'image-publishing'
  | 'manifest-promotion-pr'
  | 'accepted-desired-state'
  | 'gitops-runtime-convergence'
  | 'deploy-smoke'
  | 'infra-static-checks'
  | 'platform-core-plan'
  | 'environment-approval'
  | 'platform-core-apply'
  | 'cluster-bootstrap-handoff'
  | 'gitops-platform-ownership'
  | 'rollback-request'
  | 'rollback-image-verification'
  | 'rollback-manifest-diff'
  | 'rollback-pr'
  | 'rollback-accepted-desired-state'
  | 'rollback-convergence'

export type SdlcAuthorityCredentialPosture = {
  label: string
  tone: SdlcAuthorityCredentialTone
}

export type SdlcAuthorityStage = {
  id: SdlcAuthorityStageId
  conceptId?: SdlcAuthorityConceptId
  label: string
  shortLabel?: string
  authorityHolder: string
  inputState: string
  allowedAction: string
  outputState: string
  credentialPosture: SdlcAuthorityCredentialPosture
  evidence: readonly string[]
  evidenceRefs?: readonly HirayaEvidenceItem['id'][]
  doesNotOwn: readonly string[]
}

export type SdlcAuthorityConnector = {
  from: SdlcAuthorityStageId
  to: SdlcAuthorityStageId
  label: string
}

export type SdlcAuthorityLane = {
  id: SdlcAuthorityLaneId
  label: string
  summary: string
  defaultStageId: SdlcAuthorityStageId
  stages: readonly SdlcAuthorityStage[]
  connectors: readonly SdlcAuthorityConnector[]
}

export type SdlcAuthorityFlowChrome = {
  eyebrow: string
  activePathLabel: string
  laneAriaSuffix: string
  selectedStageLabel: string
  allowedActionLabel: string
  authorityHolderLabel: string
  inputStateLabel: string
  outputStateLabel: string
  evidenceProducedLabel: string
  doesNotOwnLabel: string
}

export type SdlcAuthorityFlowContent = {
  routeId: Extract<HirayaRouteId, 'sdlc'>
  title: string
  summary: string
  chrome: SdlcAuthorityFlowChrome
  lanes: readonly SdlcAuthorityLane[]
}

const sdlcAuthorityFlowContentEn: SdlcAuthorityFlowContent = {
  chrome: {
    eyebrow: 'Authority flow',
    activePathLabel: 'active authority path',
    laneAriaSuffix: 'authority lane',
    selectedStageLabel: 'selected authority stage',
    allowedActionLabel: 'allowed action',
    authorityHolderLabel: 'authority holder',
    inputStateLabel: 'input state',
    outputStateLabel: 'output state',
    evidenceProducedLabel: 'evidence produced',
    doesNotOwnLabel: 'does not own',
  },
  routeId: 'sdlc',
  title: 'Authority flow from evidence to runtime state',
  summary:
    'Hiraya makes delivery authority easy to review: validation, artifact publishing, desired-state proposals, Git acceptance, runtime convergence, infrastructure mutation, and rollback each have a defined owner.',
  lanes: [
    {
      id: 'application-delivery',
      label: 'Application delivery',
      summary: 'Application changes move from low-risk PR evidence to reviewed Git state before Argo CD and Kubernetes update the runtime.',
      defaultStageId: 'pr-validation-evidence',
      stages: [
        {
          id: 'pr-validation-evidence',
          label: 'PR validation evidence',
          shortLabel: 'PR',
          authorityHolder: 'GitHub Actions PR checks',
          inputState: 'A proposed code, manifest, or infrastructure change in a pull request.',
          allowedAction: 'Classify the change, run application checks, validate rendered manifests, and produce review evidence without cloud write access.',
          outputState: 'A reviewable evidence bundle that helps reviewers decide whether the change is safe to merge.',
          credentialPosture: { label: 'no AWS', tone: 'safe' },
          evidence: ['Test results', 'Docker buildability', 'GitOps render output', 'static infra checks'],
          evidenceRefs: ['p0-cicd-delivery-flow'],
          doesNotOwn: ['publishing ECR images', 'changing accepted Git state', 'runtime convergence', 'Terraform apply'],
        },
        {
          id: 'image-publishing',
          label: 'SHA image artifact',
          shortLabel: 'Image',
          authorityHolder: 'Image publishing workflow',
          inputState: 'A protected-main commit that has passed the baseline checks.',
          allowedAction: 'Assume the scoped image role through OIDC, build affected services, and push immutable commit-SHA images to ECR.',
          outputState: 'Deployable ECR artifacts referenced by commit SHA tags.',
          credentialPosture: { label: 'OIDC image role', tone: 'scoped' },
          evidence: ['ECR push records', 'commit SHA tags', 'image scan report'],
          evidenceRefs: ['p0-cicd-delivery-flow'],
          doesNotOwn: ['approving runtime desired state', 'synchronizing Kubernetes', 'high-permission infrastructure mutation'],
        },
        {
          id: 'manifest-promotion-pr',
          label: 'Manifest promotion PR',
          shortLabel: 'Promote',
          authorityHolder: 'Promotion automation + reviewer',
          inputState: 'A newly published image tag and current GitOps workload manifests.',
          allowedAction: 'Create a manifest change proposal that points selected workloads at the new immutable image tag.',
          outputState: 'A pull request containing the proposed desired-state diff.',
          credentialPosture: { label: 'Git proposal', tone: 'neutral' },
          evidence: ['promotion PR diff', 'render validation', 'affected service list'],
          evidenceRefs: ['p0-cicd-delivery-flow'],
          doesNotOwn: ['merging without review policy', 'direct cluster patching', 'post-merge convergence'],
        },
        {
          id: 'accepted-desired-state',
          conceptId: 'accepted-desired-state',
          label: 'Accepted Desired State',
          shortLabel: 'Accepted',
          authorityHolder: 'Reviewed Git state',
          inputState: 'A promotion PR that has passed checks and review expectations.',
          allowedAction: 'Record the approved workload manifest change as the state Argo CD may reconcile.',
          outputState: 'Accepted Desired State in the GitOps repository path.',
          credentialPosture: { label: 'reviewed Git', tone: 'gitops' },
          evidence: ['merged PR', 'Git manifest history', 'review trail'],
          evidenceRefs: ['p0-cicd-delivery-flow'],
          doesNotOwn: ['running pods itself', 'bypassing Argo CD', 'manual Kubernetes mutation'],
        },
        {
          id: 'gitops-runtime-convergence',
          conceptId: 'gitops-convergence',
          label: 'GitOps runtime convergence',
          shortLabel: 'Runtime',
          authorityHolder: 'Argo CD + Kubernetes controllers',
          inputState: 'Accepted Desired State committed to the watched GitOps path.',
          allowedAction: 'Detect the Git change, sync manifests, and let Kubernetes roll workloads toward the declared state.',
          outputState: 'Application Runtime moving toward synced and healthy workload state.',
          credentialPosture: { label: 'GitOps', tone: 'gitops' },
          evidence: ['Argo CD sync status', 'Kubernetes rollout status', 'application health'],
          evidenceRefs: ['p0-argocd-app-of-apps', 'p0-cicd-delivery-flow'],
          doesNotOwn: ['creating new artifacts', 'approving PRs', 'Terraform platform mutation'],
        },
        {
          id: 'deploy-smoke',
          conceptId: 'verification-evidence',
          label: 'Public smoke verification',
          shortLabel: 'Smoke',
          authorityHolder: 'Deploy smoke workflow',
          inputState: 'A converged or converging runtime exposed through the public edge.',
          allowedAction: 'Verify public behavior, DNS/TLS reachability, API response, and reported GitOps health.',
          outputState: 'Release evidence that the accepted state is externally usable.',
          credentialPosture: { label: 'verify only', tone: 'safe' },
          evidence: ['public HTTP smoke', 'API response', 'DNS/TLS check', 'Argo CD health'],
          evidenceRefs: ['p0-public-ingress'],
          doesNotOwn: ['changing manifests', 'publishing images', 'mutating cluster resources'],
        },
      ],
      connectors: [
        { from: 'pr-validation-evidence', to: 'image-publishing', label: 'protected main authorizes artifact publishing' },
        { from: 'image-publishing', to: 'manifest-promotion-pr', label: 'artifact becomes a proposed manifest change' },
        { from: 'manifest-promotion-pr', to: 'accepted-desired-state', label: 'reviewed merge accepts desired state' },
        { from: 'accepted-desired-state', to: 'gitops-runtime-convergence', label: 'GitOps reconciles accepted Git state' },
        { from: 'gitops-runtime-convergence', to: 'deploy-smoke', label: 'runtime result produces verification evidence' },
      ],
    },
    {
      id: 'infrastructure-delivery',
      label: 'Infrastructure delivery',
      summary: 'High-permission cloud changes stay on the Terraform path, with plan evidence, environment approval, and bootstrap handoff kept separate from application delivery.',
      defaultStageId: 'infra-static-checks',
      stages: [
        {
          id: 'infra-static-checks',
          label: 'Credentialless static checks',
          shortLabel: 'Static',
          authorityHolder: 'Infrastructure PR checks',
          inputState: 'A proposed Terraform or platform configuration change.',
          allowedAction: 'Run formatting, validation, linting, and safe plan-oriented checks appropriate to pull request context.',
          outputState: 'Static evidence for reviewers before any apply path is considered.',
          credentialPosture: { label: 'no AWS', tone: 'safe' },
          evidence: ['terraform fmt', 'terraform validate', 'policy/static check output'],
          evidenceRefs: ['p0-infra-approval-gate'],
          doesNotOwn: ['creating cloud resources', 'approving environments', 'cluster bootstrap apply'],
        },
        {
          id: 'platform-core-plan',
          label: 'Trusted/pre-approval plan',
          shortLabel: 'Plan',
          authorityHolder: 'Terraform plan workflow',
          inputState: 'A trusted infrastructure change selected for cloud-impact review.',
          allowedAction: 'Generate plan evidence for Platform Core before an environment-gated apply is allowed.',
          outputState: 'Reviewable Terraform plan evidence that separates intent from mutation.',
          credentialPosture: { label: 'plan-scoped OIDC', tone: 'scoped' },
          evidence: ['Terraform plan', 'resource diff', 'plan artifact/log'],
          evidenceRefs: ['p0-infra-approval-gate'],
          doesNotOwn: ['app image publishing', 'automatic apply', 'Argo CD runtime convergence'],
        },
        {
          id: 'environment-approval',
          label: 'Environment approval',
          shortLabel: 'Approval',
          authorityHolder: 'GitHub environment gate',
          inputState: 'A requested infrastructure apply with plan evidence.',
          allowedAction: 'Require human approval before high-impact AWS mutation credentials are used.',
          outputState: 'An approved apply attempt with an auditable gate.',
          credentialPosture: { label: 'manual gate', tone: 'gated' },
          evidence: ['environment approval', 'run metadata', 'approver trail'],
          evidenceRefs: ['p0-infra-approval-gate'],
          doesNotOwn: ['changing Terraform code', 'runtime workload rollout', 'smoke verification'],
        },
        {
          id: 'platform-core-apply',
          label: 'Platform Core apply',
          shortLabel: 'Apply',
          authorityHolder: 'Environment-gated Terraform apply role',
          inputState: 'Approved Platform Core infrastructure intent.',
          allowedAction: 'Apply the cloud substrate changes for VPC, EKS, IAM/IRSA, DNS/ACM primitives, and admin secret prerequisites.',
          outputState: 'Rebuildable AWS Foundation and Platform Core resources for the dev environment.',
          credentialPosture: { label: 'env-gated apply', tone: 'gated' },
          evidence: ['Terraform apply log', 'state update', 'platform smoke checks'],
          evidenceRefs: ['p0-infra-approval-gate'],
          doesNotOwn: ['application promotion', 'workload image tags', 'continuous GitOps sync'],
        },
        {
          id: 'cluster-bootstrap-handoff',
          label: 'Cluster Bootstrap handoff',
          shortLabel: 'Bootstrap',
          authorityHolder: 'Cluster bootstrap apply role',
          inputState: 'A rebuilt or updated cluster that needs GitOps control established.',
          allowedAction: 'Install or refresh Argo CD handoff resources, AppProjects, and the root application entry point.',
          outputState: 'A cluster ready for GitOps-managed platform and workload state.',
          credentialPosture: { label: 'bootstrap gated', tone: 'gated' },
          evidence: ['bootstrap apply log', 'Argo CD root app', 'handoff status'],
          evidenceRefs: ['p0-argocd-app-of-apps', 'p0-infra-approval-gate'],
          doesNotOwn: ['ongoing workload release approval', 'business service behavior', 'public smoke interpretation'],
        },
        {
          id: 'gitops-platform-ownership',
          conceptId: 'gitops-convergence',
          label: 'GitOps platform ownership',
          shortLabel: 'GitOps',
          authorityHolder: 'Argo CD platform applications',
          inputState: 'Cluster Bootstrap has established the GitOps root and project boundaries.',
          allowedAction: 'Continuously reconcile platform add-ons, namespaces, controllers, monitoring, and workload application definitions from Git.',
          outputState: 'Cluster Platform state owned through GitOps rather than manual post-install changes.',
          credentialPosture: { label: 'GitOps', tone: 'gitops' },
          evidence: ['App-of-Apps health', 'platform app sync', 'resource tree'],
          evidenceRefs: ['p0-argocd-app-of-apps'],
          doesNotOwn: ['AWS substrate provisioning', 'approval for new Terraform applies', 'publishing application images'],
        },
      ],
      connectors: [
        { from: 'infra-static-checks', to: 'platform-core-plan', label: 'trusted context permits cloud-impact planning' },
        { from: 'platform-core-plan', to: 'environment-approval', label: 'plan evidence asks for approval' },
        { from: 'environment-approval', to: 'platform-core-apply', label: 'approval unlocks apply authority' },
        { from: 'platform-core-apply', to: 'cluster-bootstrap-handoff', label: 'cluster substrate enables GitOps handoff' },
        { from: 'cluster-bootstrap-handoff', to: 'gitops-platform-ownership', label: 'bootstrap transfers ongoing ownership to Argo CD' },
      ],
    },
    {
      id: 'rollback',
      label: 'Rollback',
      summary: 'Recovery follows the same reviewed GitOps authority model: verify the target image, propose a manifest diff, accept Git state, and let Argo CD converge the runtime.',
      defaultStageId: 'rollback-request',
      stages: [
        {
          id: 'rollback-request',
          label: 'Operator rollback request',
          shortLabel: 'Request',
          authorityHolder: 'Operator-triggered rollback workflow',
          inputState: 'A selected service, target image tag, and rollback reason.',
          allowedAction: 'Start a controlled recovery proposal with explicit target and reason metadata.',
          outputState: 'A traceable rollback intent for one service/image selection.',
          credentialPosture: { label: 'manual trigger', tone: 'gated' },
          evidence: ['selected service', 'target image tag', 'rollback reason'],
          evidenceRefs: ['p1-rollback-path'],
          doesNotOwn: ['patching live deployments', 'skipping Git review', 'creating new image artifacts'],
        },
        {
          id: 'rollback-image-verification',
          label: 'ECR tag verification',
          shortLabel: 'ECR check',
          authorityHolder: 'Rollback verification step',
          inputState: 'A requested rollback target image tag.',
          allowedAction: 'Verify the target image exists in ECR before proposing runtime desired-state changes.',
          outputState: 'A confirmed rollback artifact reference.',
          credentialPosture: { label: 'ECR read scope', tone: 'scoped' },
          evidence: ['ECR describe result', 'image digest/tag confirmation'],
          evidenceRefs: ['p1-rollback-path'],
          doesNotOwn: ['publishing replacement images', 'approving manifest changes', 'Kubernetes rollout'],
        },
        {
          id: 'rollback-manifest-diff',
          label: 'Manifest rollback diff',
          shortLabel: 'Diff',
          authorityHolder: 'Rollback manifest automation',
          inputState: 'A verified target image and current GitOps workload manifests.',
          allowedAction: 'Prepare the minimal manifest diff that points the service back to the selected image tag.',
          outputState: 'A reviewable rollback manifest change.',
          credentialPosture: { label: 'Git proposal', tone: 'neutral' },
          evidence: ['manifest diff', 'render validation', 'target image reference'],
          evidenceRefs: ['p1-rollback-path'],
          doesNotOwn: ['merging the change', 'directly editing cluster state', 'post-rollback smoke'],
        },
        {
          id: 'rollback-pr',
          label: 'Rollback PR',
          shortLabel: 'PR',
          authorityHolder: 'Rollback automation + reviewer',
          inputState: 'A validated rollback manifest diff.',
          allowedAction: 'Open or update the rollback pull request so the recovery path remains reviewed and auditable.',
          outputState: 'A rollback PR ready to become Accepted Desired State after review/merge.',
          credentialPosture: { label: 'reviewed PR', tone: 'gated' },
          evidence: ['rollback PR', 'review comments', 'validated render output'],
          evidenceRefs: ['p1-rollback-path'],
          doesNotOwn: ['manual kubectl rollback', 'Argo CD sync execution', 'infrastructure apply'],
        },
        {
          id: 'rollback-accepted-desired-state',
          conceptId: 'accepted-desired-state',
          label: 'Accepted Desired State',
          shortLabel: 'Accepted',
          authorityHolder: 'Reviewed Git state',
          inputState: 'A rollback PR accepted through the same Git review path.',
          allowedAction: 'Record the rollback manifest as the desired runtime state Argo CD may reconcile.',
          outputState: 'Accepted Desired State pointing the workload at the rollback image.',
          credentialPosture: { label: 'reviewed Git', tone: 'gitops' },
          evidence: ['merged rollback PR', 'Git manifest history', 'rollback audit trail'],
          evidenceRefs: ['p1-rollback-path'],
          doesNotOwn: ['running the rollout directly', 'changing image registries', 'Terraform mutation'],
        },
        {
          id: 'rollback-convergence',
          conceptId: 'gitops-convergence',
          label: 'GitOps rollback convergence',
          shortLabel: 'Converge',
          authorityHolder: 'Argo CD + Kubernetes controllers',
          inputState: 'Accepted rollback desired state in the watched GitOps path.',
          allowedAction: 'Reconcile the rollback manifest and let Kubernetes converge pods to the selected image tag.',
          outputState: 'Runtime recovered to the accepted rollback image, with post-rollback verification evidence.',
          credentialPosture: { label: 'GitOps', tone: 'gitops' },
          evidence: ['Argo CD sync status', 'rollout status', 'post-rollback smoke'],
          evidenceRefs: ['p1-rollback-path'],
          doesNotOwn: ['choosing rollback target', 'approving rollback PR', 'manual cluster edits'],
        },
      ],
      connectors: [
        { from: 'rollback-request', to: 'rollback-image-verification', label: 'target request requires artifact verification' },
        { from: 'rollback-image-verification', to: 'rollback-manifest-diff', label: 'verified artifact becomes manifest diff' },
        { from: 'rollback-manifest-diff', to: 'rollback-pr', label: 'diff becomes reviewed recovery proposal' },
        { from: 'rollback-pr', to: 'rollback-accepted-desired-state', label: 'reviewed merge accepts rollback state' },
        { from: 'rollback-accepted-desired-state', to: 'rollback-convergence', label: 'GitOps reconciles accepted rollback state' },
      ],
    },
  ],
}

const sdlcAuthorityFlowZhTWText = {
  title: '從驗證證據到 Runtime State 的 Authority Flow',
  summary:
    'Hiraya 讓 delivery authority 容易被審查：validation、artifact publishing、desired-state proposals、Git acceptance、runtime convergence、infrastructure mutation 與 rollback 都有明確 owner。',
  chrome: {
    eyebrow: 'Authority Flow',
    activePathLabel: '目前權責路徑',
    laneAriaSuffix: '權責泳道',
    selectedStageLabel: '已選擇的權責階段',
    allowedActionLabel: '允許動作',
    authorityHolderLabel: '權責持有者',
    inputStateLabel: '輸入狀態',
    outputStateLabel: '輸出狀態',
    evidenceProducedLabel: '產生的證據',
    doesNotOwnLabel: '不擁有',
  },
} satisfies Pick<SdlcAuthorityFlowContent, 'title' | 'summary' | 'chrome'>

const laneZhTW: Record<SdlcAuthorityLaneId, Pick<SdlcAuthorityLane, 'label' | 'summary'>> = {
  'application-delivery': {
    label: 'Application 交付',
    summary: 'Application 變更先從低風險 PR evidence 前進到 reviewed Git state，再由 Argo CD 與 Kubernetes 更新 runtime。',
  },
  'infrastructure-delivery': {
    label: 'Infrastructure 交付',
    summary: '高權限 cloud 變更保留在 Terraform 路徑，並將 plan evidence、environment approval 與 bootstrap handoff 和 application delivery 分離。',
  },
  rollback: {
    label: 'Rollback',
    summary: '復原沿用同一套 reviewed GitOps 權責模型：驗證目標 image、提出 manifest diff、接受 Git state，並讓 Argo CD 收斂 runtime。',
  },
}

const stageZhTW: Record<SdlcAuthorityStageId, Partial<SdlcAuthorityStage>> = {
  'pr-validation-evidence': { label: 'PR 驗證證據', shortLabel: 'PR', authorityHolder: 'GitHub Actions PR checks', inputState: 'Pull request 中提出的 code、manifest 或 infrastructure 變更。', allowedAction: '分類變更、執行 application checks、驗證 rendered manifests，並在沒有 cloud write access 的情況下產生審查證據。', outputState: '可供 review 的證據包，幫助 reviewers 判斷變更是否安全可 merge。', credentialPosture: { label: '無 AWS', tone: 'safe' }, evidence: ['測試結果', 'Docker 可建置性', 'GitOps render output', 'static infra checks'], doesNotOwn: ['發布 ECR images', '變更 accepted Git state', 'runtime convergence', 'Terraform apply'] },
  'image-publishing': { label: 'SHA image artifact', shortLabel: 'Image', authorityHolder: 'Image publishing workflow', inputState: '已通過 baseline checks 的 protected-main commit。', allowedAction: '透過 OIDC assume scoped image role，建置受影響服務，並將 immutable commit-SHA images 推送到 ECR。', outputState: '以 commit SHA tags 參照的可部署 ECR artifacts。', credentialPosture: { label: 'OIDC image role', tone: 'scoped' }, evidence: ['ECR push 紀錄', 'commit SHA tags', 'image scan report'], doesNotOwn: ['核准 runtime desired state', '同步 Kubernetes', '高權限 infrastructure mutation'] },
  'manifest-promotion-pr': { label: 'Manifest promotion PR', shortLabel: 'Promote', authorityHolder: 'Promotion automation + reviewer', inputState: '新發布的 image tag 與目前 GitOps workload manifests。', allowedAction: '建立 manifest change proposal，讓指定 workloads 指向新的 immutable image tag。', outputState: '包含 proposed desired-state diff 的 pull request。', credentialPosture: { label: 'Git proposal', tone: 'neutral' }, evidence: ['promotion PR diff', 'render validation', '受影響服務清單'], doesNotOwn: ['未經 review policy 直接 merge', '直接 patch cluster', 'post-merge convergence'] },
  'accepted-desired-state': { label: 'Accepted Desired State', shortLabel: 'Accepted', authorityHolder: 'Reviewed Git state', inputState: '已通過 checks 與 review expectations 的 promotion PR。', allowedAction: '將核准的 workload manifest 變更記錄為 Argo CD 可以 reconcile 的狀態。', outputState: 'GitOps repository path 中的 Accepted Desired State。', credentialPosture: { label: 'reviewed Git', tone: 'gitops' }, evidence: ['merged PR', 'Git manifest history', 'review trail'], doesNotOwn: ['自行運行 pods', '繞過 Argo CD', '手動 Kubernetes mutation'] },
  'gitops-runtime-convergence': { label: 'GitOps runtime convergence', shortLabel: 'Runtime', authorityHolder: 'Argo CD + Kubernetes controllers', inputState: '已提交到 watched GitOps path 的 Accepted Desired State。', allowedAction: '偵測 Git change、sync manifests，並讓 Kubernetes 將 workloads rollout 到宣告狀態。', outputState: 'Application Runtime 朝 synced 與 healthy workload state 收斂。', credentialPosture: { label: 'GitOps', tone: 'gitops' }, evidence: ['Argo CD sync status', 'Kubernetes rollout status', 'application health'], doesNotOwn: ['建立新 artifacts', '核准 PRs', 'Terraform platform mutation'] },
  'deploy-smoke': { label: 'Public smoke verification', shortLabel: 'Smoke', authorityHolder: 'Deploy smoke workflow', inputState: '透過 public edge 暴露且已收斂或正在收斂的 runtime。', allowedAction: '驗證 public behavior、DNS/TLS reachability、API response 與 reported GitOps health。', outputState: '證明 accepted state 可從外部使用的 release evidence。', credentialPosture: { label: 'verify only', tone: 'safe' }, evidence: ['public HTTP smoke', 'API response', 'DNS/TLS check', 'Argo CD health'], doesNotOwn: ['變更 manifests', '發布 images', 'mutating cluster resources'] },
  'infra-static-checks': { label: '無憑證 static checks', shortLabel: 'Static', authorityHolder: 'Infrastructure PR checks', inputState: '提出的 Terraform 或 platform configuration 變更。', allowedAction: '在 pull request context 執行 formatting、validation、linting 與安全的 plan-oriented checks。', outputState: '任何 apply path 被考慮前，先提供 reviewers 的 static evidence。', credentialPosture: { label: '無 AWS', tone: 'safe' }, evidence: ['terraform fmt', 'terraform validate', 'policy/static check output'], doesNotOwn: ['建立 cloud resources', '核准 environments', 'cluster bootstrap apply'] },
  'platform-core-plan': { label: 'Trusted/pre-approval plan', shortLabel: 'Plan', authorityHolder: 'Terraform plan workflow', inputState: '被選入 cloud-impact review 的 trusted infrastructure change。', allowedAction: '在 environment-gated apply 被允許前，產生 Platform Core plan evidence。', outputState: '將 intent 與 mutation 分開的可審查 Terraform plan evidence。', credentialPosture: { label: 'plan-scoped OIDC', tone: 'scoped' }, evidence: ['Terraform plan', 'resource diff', 'plan artifact/log'], doesNotOwn: ['app image publishing', 'automatic apply', 'Argo CD runtime convergence'] },
  'environment-approval': { label: 'Environment approval', shortLabel: 'Approval', authorityHolder: 'GitHub environment gate', inputState: '帶有 plan evidence 的 infrastructure apply request。', allowedAction: '在使用高影響 AWS mutation credentials 前要求人工 approval。', outputState: '具有 auditable gate 的 approved apply attempt。', credentialPosture: { label: 'manual gate', tone: 'gated' }, evidence: ['environment approval', 'run metadata', 'approver trail'], doesNotOwn: ['變更 Terraform code', 'runtime workload rollout', 'smoke verification'] },
  'platform-core-apply': { label: 'Platform Core apply', shortLabel: 'Apply', authorityHolder: 'Environment-gated Terraform apply role', inputState: '已核准的 Platform Core infrastructure intent。', allowedAction: 'Apply VPC、EKS、IAM/IRSA、DNS/ACM primitives 與 admin secret prerequisites 等 cloud substrate changes。', outputState: 'dev environment 可重建的 AWS Foundation 與 Platform Core resources。', credentialPosture: { label: 'env-gated apply', tone: 'gated' }, evidence: ['Terraform apply log', 'state update', 'platform smoke checks'], doesNotOwn: ['application promotion', 'workload image tags', 'continuous GitOps sync'] },
  'cluster-bootstrap-handoff': { label: 'Cluster Bootstrap handoff', shortLabel: 'Bootstrap', authorityHolder: 'Cluster bootstrap apply role', inputState: '需要建立 GitOps control 的 rebuilt 或 updated cluster。', allowedAction: '安裝或刷新 Argo CD handoff resources、AppProjects 與 root application entry point。', outputState: '準備由 GitOps 管理 platform 與 workload state 的 cluster。', credentialPosture: { label: 'bootstrap gated', tone: 'gated' }, evidence: ['bootstrap apply log', 'Argo CD root app', 'handoff status'], doesNotOwn: ['ongoing workload release approval', 'business service behavior', 'public smoke interpretation'] },
  'gitops-platform-ownership': { label: 'GitOps platform ownership', shortLabel: 'GitOps', authorityHolder: 'Argo CD platform applications', inputState: 'Cluster Bootstrap 已建立 GitOps root 與 project boundaries。', allowedAction: '從 Git 持續 reconcile platform add-ons、namespaces、controllers、monitoring 與 workload application definitions。', outputState: 'Cluster Platform state 由 GitOps 擁有，而非 manual post-install changes。', credentialPosture: { label: 'GitOps', tone: 'gitops' }, evidence: ['App-of-Apps health', 'platform app sync', 'resource tree'], doesNotOwn: ['AWS substrate provisioning', '核准新的 Terraform applies', '發布 application images'] },
  'rollback-request': { label: 'Operator rollback request', shortLabel: 'Request', authorityHolder: 'Operator-triggered rollback workflow', inputState: '選定的 service、target image tag 與 rollback reason。', allowedAction: '以明確 target 與 reason metadata 啟動受控 recovery proposal。', outputState: '針對單一 service/image selection 的 traceable rollback intent。', credentialPosture: { label: 'manual trigger', tone: 'gated' }, evidence: ['選定服務', 'target image tag', 'rollback reason'], doesNotOwn: ['patch live deployments', '跳過 Git review', '建立新 image artifacts'] },
  'rollback-image-verification': { label: 'ECR tag verification', shortLabel: 'ECR check', authorityHolder: 'Rollback verification step', inputState: '被請求的 rollback target image tag。', allowedAction: '在提出 runtime desired-state changes 前，確認 target image 存在於 ECR。', outputState: '已確認的 rollback artifact reference。', credentialPosture: { label: 'ECR read scope', tone: 'scoped' }, evidence: ['ECR describe result', 'image digest/tag confirmation'], doesNotOwn: ['發布 replacement images', '核准 manifest changes', 'Kubernetes rollout'] },
  'rollback-manifest-diff': { label: 'Manifest rollback diff', shortLabel: 'Diff', authorityHolder: 'Rollback manifest automation', inputState: '已驗證的 target image 與目前 GitOps workload manifests。', allowedAction: '準備 minimal manifest diff，讓 service 回到選定 image tag。', outputState: '可審查的 rollback manifest change。', credentialPosture: { label: 'Git proposal', tone: 'neutral' }, evidence: ['manifest diff', 'render validation', 'target image reference'], doesNotOwn: ['merge 變更', '直接編輯 cluster state', 'post-rollback smoke'] },
  'rollback-pr': { label: 'Rollback PR', shortLabel: 'PR', authorityHolder: 'Rollback automation + reviewer', inputState: '已驗證的 rollback manifest diff。', allowedAction: 'Open 或 update rollback pull request，讓 recovery path 維持 reviewed 與 auditable。', outputState: '經 review/merge 後可成為 Accepted Desired State 的 rollback PR。', credentialPosture: { label: 'reviewed PR', tone: 'gated' }, evidence: ['rollback PR', 'review comments', 'validated render output'], doesNotOwn: ['manual kubectl rollback', 'Argo CD sync execution', 'infrastructure apply'] },
  'rollback-accepted-desired-state': { label: 'Accepted Desired State', shortLabel: 'Accepted', authorityHolder: 'Reviewed Git state', inputState: '透過同一 Git review path 接受的 rollback PR。', allowedAction: '將 rollback manifest 記錄為 Argo CD 可 reconcile 的 desired runtime state。', outputState: '指向 rollback image 的 Accepted Desired State。', credentialPosture: { label: 'reviewed Git', tone: 'gitops' }, evidence: ['merged rollback PR', 'Git manifest history', 'rollback audit trail'], doesNotOwn: ['直接執行 rollout', '變更 image registries', 'Terraform mutation'] },
  'rollback-convergence': { label: 'GitOps rollback convergence', shortLabel: 'Converge', authorityHolder: 'Argo CD + Kubernetes controllers', inputState: 'watched GitOps path 中 accepted rollback desired state。', allowedAction: 'Reconcile rollback manifest，並讓 Kubernetes 將 pods 收斂到選定 image tag。', outputState: 'Runtime 回復到 accepted rollback image，並留下 post-rollback verification evidence。', credentialPosture: { label: 'GitOps', tone: 'gitops' }, evidence: ['Argo CD sync status', 'rollout status', 'post-rollback smoke'], doesNotOwn: ['選擇 rollback target', '核准 rollback PR', 'manual cluster edits'] },
}

const connectorZhTW: Record<SdlcAuthorityStageId, string> = {
  'pr-validation-evidence': 'protected main 授權 artifact publishing',
  'image-publishing': 'artifact 轉成 proposed manifest change',
  'manifest-promotion-pr': 'reviewed merge 接受 desired state',
  'accepted-desired-state': 'GitOps reconcile accepted Git state',
  'gitops-runtime-convergence': 'runtime result 產生 verification evidence',
  'infra-static-checks': 'trusted context 允許 cloud-impact planning',
  'platform-core-plan': 'plan evidence 請求 approval',
  'environment-approval': 'approval 解鎖 apply authority',
  'platform-core-apply': 'cluster substrate 啟用 GitOps handoff',
  'cluster-bootstrap-handoff': 'bootstrap 將持續 ownership 轉交 Argo CD',
  'gitops-platform-ownership': '',
  'deploy-smoke': '',
  'rollback-request': 'target request 需要 artifact verification',
  'rollback-image-verification': 'verified artifact 轉成 manifest diff',
  'rollback-manifest-diff': 'diff 轉成 reviewed recovery proposal',
  'rollback-pr': 'reviewed merge 接受 rollback state',
  'rollback-accepted-desired-state': 'GitOps reconcile accepted rollback state',
  'rollback-convergence': '',
}

function localizeSdlcAuthorityLane(lane: SdlcAuthorityLane): SdlcAuthorityLane {
  return {
    ...lane,
    ...laneZhTW[lane.id],
    stages: lane.stages.map((stage) => ({ ...stage, ...stageZhTW[stage.id] })),
    connectors: lane.connectors.map((connector) => ({ ...connector, label: connectorZhTW[connector.from] || connector.label })),
  }
}

const sdlcAuthorityFlowContentZhTW: SdlcAuthorityFlowContent = {
  ...sdlcAuthorityFlowContentEn,
  ...sdlcAuthorityFlowZhTWText,
  lanes: sdlcAuthorityFlowContentEn.lanes.map(localizeSdlcAuthorityLane),
}

export function getSdlcAuthorityFlowContent(locale: AppLocale): SdlcAuthorityFlowContent {
  return locale === 'zh-TW' ? sdlcAuthorityFlowContentZhTW : sdlcAuthorityFlowContentEn
}

export const sdlcAuthorityFlowContent = sdlcAuthorityFlowContentEn

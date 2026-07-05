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

export type SdlcAuthorityFlowContent = {
  routeId: Extract<HirayaRouteId, 'sdlc'>
  title: string
  summary: string
  lanes: readonly SdlcAuthorityLane[]
}

export const sdlcAuthorityFlowContent: SdlcAuthorityFlowContent = {
  routeId: 'sdlc',
  title: 'Authority flow from evidence to runtime state',
  summary:
    'Hiraya separates who may validate a change, publish an artifact, propose desired state, accept Git state, converge runtime, mutate infrastructure, and recover service state.',
  lanes: [
    {
      id: 'application-delivery',
      label: 'Application delivery',
      summary: 'Application changes move from credentialless PR evidence to reviewed Git state before Argo CD and Kubernetes converge runtime.',
      defaultStageId: 'pr-validation-evidence',
      stages: [
        {
          id: 'pr-validation-evidence',
          label: 'PR validation evidence',
          shortLabel: 'PR',
          authorityHolder: 'GitHub Actions PR checks',
          inputState: 'A proposed code, manifest, or infrastructure change in a pull request.',
          allowedAction: 'Classify the change, run application checks, validate rendered manifests, and produce review evidence without cloud write access.',
          outputState: 'A reviewable evidence bundle that says whether the proposed change is safe enough to merge.',
          credentialPosture: { label: 'no AWS', tone: 'safe' },
          evidence: ['test results', 'Docker buildability', 'GitOps render output', 'static infra checks'],
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
          evidence: ['ECR push record', 'commit SHA tags', 'image scan report'],
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
          evidenceRefs: ['p2-deploy-smoke'],
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
      summary: 'High-permission cloud changes stay on the Terraform path, where plan evidence, environment approval, and bootstrap handoff are separate from application delivery.',
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
      summary: 'Recovery follows the same reviewed GitOps authority model: verify the target image, propose a manifest diff, accept Git state, and let Argo CD converge.',
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
          evidenceRefs: ['p1-rollback-path', 'p2-deploy-smoke'],
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

import type { AppLocale } from '@/i18n/locales'

import type { HirayaEvidenceItem, HirayaRouteId } from './types'

export type HirayaEvidenceAssetUse =
  | 'carousel-slide'
  | 'inline-explainer'
  | 'deep-dive-link'
  | 'not-planned'

export type HirayaEvidenceStatus = 'planned' | 'ready' | 'deferred'
export type HirayaEvidenceDisplayAssetKind = 'screenshot' | 'video'

export type HirayaEvidenceDisplayAsset = {
  id: string
  kind: HirayaEvidenceDisplayAssetKind
  status: HirayaEvidenceStatus
  title: string
  caption: string
  src: string
  alt?: string
  mimeType?: string
  aspectRatio?: string
}

export type HirayaEvidenceAsset = {
  evidenceId: HirayaEvidenceItem['id']
  status: HirayaEvidenceStatus
  preferredUse: HirayaEvidenceAssetUse
  routes: readonly HirayaRouteId[]
  title: string
  caption: string
  assets: readonly HirayaEvidenceDisplayAsset[]
}

function evidenceSrc(evidenceId: string, filename: string) {
  return `/evidence/${evidenceId}/${filename}`
}

const screenshotAspectRatio = '1935 / 1352'
const videoAspectRatio = '16 / 9'

export const hirayaEvidenceAssetManifest = [
  {
    evidenceId: 'p0-cicd-delivery-flow',
    status: 'ready',
    preferredUse: 'carousel-slide',
    routes: ['sdlc'],
    title: 'Complete CI/CD delivery flow',
    caption: 'Evidence covering PR checks, image publishing, manifest promotion, Argo CD rollout, and smoke verification.',
    assets: [
      {
        id: '00-cover-next-FE-site-preview',
        kind: 'screenshot',
        status: 'ready',
        title: 'Next Storefront preview',
        caption: 'The delivered Storefront change is visible before the pipeline evidence begins.',
        src: evidenceSrc('p0-cicd-delivery-flow', '00-cover-next-FE-site-preview.webp'),
        aspectRatio: '1999 / 1356',
      },
      {
        id: '01-pr-checks',
        kind: 'screenshot',
        status: 'ready',
        title: 'Pull request checks',
        caption: 'Validation gates run before changes are accepted into the delivery path.',
        src: evidenceSrc('p0-cicd-delivery-flow', '01-pr-checks.webp'),
        aspectRatio: '1927 / 1350',
      },
      {
        id: '02-image-pipeline',
        kind: 'screenshot',
        status: 'ready',
        title: 'Image pipeline',
        caption: 'The image workflow builds and publishes the service artifact after review.',
        src: evidenceSrc('p0-cicd-delivery-flow', '02-image-pipeline.webp'),
        aspectRatio: '1927 / 1350',
      },
      {
        id: '03-promotion-pr',
        kind: 'screenshot',
        status: 'ready',
        title: 'Promotion pull request',
        caption: 'Automation proposes the GitOps manifest update as a reviewable PR.',
        src: evidenceSrc('p0-cicd-delivery-flow', '03-promotion-pr.webp'),
        aspectRatio: '1927 / 1350',
      },
      {
        id: '04-argocd-rollout-smoke',
        kind: 'video',
        status: 'ready',
        title: 'Argo CD rollout and smoke',
        caption: 'A short walkthrough shows Argo CD convergence and smoke verification after promotion.',
        src: evidenceSrc('p0-cicd-delivery-flow', '04-argocd-rollout-smoke.mp4'),
        mimeType: 'video/mp4',
        aspectRatio: videoAspectRatio,
      },
    ],
  },
  {
    evidenceId: 'p0-argocd-app-of-apps',
    status: 'ready',
    preferredUse: 'carousel-slide',
    routes: ['arch'],
    title: 'Argo CD App-of-Apps health',
    caption: 'GitOps ownership proof for platform add-ons and Vintage workload resources.',
    assets: [
      {
        id: '00-cover-argocd-health',
        kind: 'screenshot',
        status: 'ready',
        title: 'Argo CD health cover',
        caption: 'Root and child apps are Synced / Healthy.',
        src: evidenceSrc('p0-argocd-app-of-apps', '00-cover-argocd-health.webp'),
        aspectRatio: screenshotAspectRatio,
      },
      {
        id: '01-root-application',
        kind: 'screenshot',
        status: 'ready',
        title: 'Root Application',
        caption: 'Root app-of-apps owns the cluster application tree.',
        src: evidenceSrc('p0-argocd-app-of-apps', '01-root-application.webp'),
        aspectRatio: screenshotAspectRatio,
      },
      {
        id: '02-vintage-resource-tree',
        kind: 'screenshot',
        status: 'ready',
        title: 'Vintage resource tree',
        caption: 'Workload resources are visible in the Argo CD resource tree.',
        src: evidenceSrc('p0-argocd-app-of-apps', '02-vintage-resource-tree.webp'),
        aspectRatio: screenshotAspectRatio,
      },
    ],
  },
  {
    evidenceId: 'p0-infra-approval-gate',
    status: 'ready',
    preferredUse: 'carousel-slide',
    routes: ['sdlc', 'waf'],
    title: 'Infrastructure approval gate',
    caption: 'Supporting evidence for separated infrastructure authority and reviewable applies.',
    assets: [
      {
        id: '00-cover-approval-gate',
        kind: 'video',
        status: 'ready',
        title: 'Approval gate walkthrough',
        caption: 'Human approval gates infrastructure apply authority before platform mutation proceeds.',
        src: evidenceSrc('p0-infra-approval-gate', '00-cover-approval-gate.mp4'),
        mimeType: 'video/mp4',
        aspectRatio: videoAspectRatio,
      },
      {
        id: '01-terraform-plan-summary',
        kind: 'screenshot',
        status: 'ready',
        title: 'Terraform plan summary',
        caption: 'Terraform plan output is inspectable before apply.',
        src: evidenceSrc('p0-infra-approval-gate', '01-terraform-plan-summary.webp'),
        aspectRatio: '1933 / 1350',
      },
      {
        id: '02-smoke-test-success',
        kind: 'screenshot',
        status: 'ready',
        title: 'Platform smoke success',
        caption: 'Post-apply smoke testing confirms the platform path works.',
        src: evidenceSrc('p0-infra-approval-gate', '02-smoke-test-success.webp'),
        aspectRatio: screenshotAspectRatio,
      },
      {
        id: '03-terraform-platform-core-deploy',
        kind: 'screenshot',
        status: 'ready',
        title: 'Platform core deploy',
        caption: 'The platform-core deploy run records the gated infrastructure change.',
        src: evidenceSrc('p0-infra-approval-gate', '03-terraform-platform-core-deploy.webp'),
        aspectRatio: '1933 / 1350',
      },
    ],
  },
  {
    evidenceId: 'p0-public-ingress',
    status: 'ready',
    preferredUse: 'carousel-slide',
    routes: ['arch'],
    title: 'Public endpoint, DNS, TLS, and ALB ingress',
    caption: 'Public-edge proof for the shared HTTPS ingress path and controlled admin/demo endpoints.',
    assets: [
      {
        id: '00-cover-public-endpoint',
        kind: 'video',
        status: 'ready',
        title: 'Public HTTPS endpoint',
        caption: 'The public storefront endpoint is reachable over HTTPS.',
        src: evidenceSrc('p0-public-ingress', '00-cover-public-endpoint.mp4'),
        mimeType: 'video/mp4',
        aspectRatio: videoAspectRatio,
      },
      {
        id: '01-argocd-endpoint',
        kind: 'video',
        status: 'ready',
        title: 'Argo CD endpoint',
        caption: 'The controlled Argo CD endpoint is reachable through the same public ingress model.',
        src: evidenceSrc('p0-public-ingress', '01-argocd-endpoint.mp4'),
        mimeType: 'video/mp4',
        aspectRatio: videoAspectRatio,
      },
      {
        id: '02-grafana-endpoint',
        kind: 'video',
        status: 'ready',
        title: 'Grafana endpoint',
        caption: 'The controlled Grafana endpoint is reachable for the dev demo observability surface.',
        src: evidenceSrc('p0-public-ingress', '02-grafana-endpoint.mp4'),
        mimeType: 'video/mp4',
        aspectRatio: videoAspectRatio,
      },
    ],
  },
  {
    evidenceId: 'p1-rollback-path',
    status: 'ready',
    preferredUse: 'carousel-slide',
    routes: ['sdlc'],
    title: 'Rollback through GitOps PR',
    caption: 'Rollback proof showing recovery through the reviewed GitOps control plane instead of manual cluster patching.',
    assets: [
      {
        id: '00-cover-rollback-gitops',
        kind: 'video',
        status: 'ready',
        title: 'Rollback GitOps workflow',
        caption: 'The rollback flow selects an existing image and keeps recovery inside GitOps authority.',
        src: evidenceSrc('p1-rollback-path', '00-cover-rollback-gitops.mp4'),
        mimeType: 'video/mp4',
        aspectRatio: videoAspectRatio,
      },
      {
        id: '01-rollback-pr',
        kind: 'screenshot',
        status: 'ready',
        title: 'Rollback PR',
        caption: 'Automation creates a reviewable rollback pull request.',
        src: evidenceSrc('p1-rollback-path', '01-rollback-pr.webp'),
        aspectRatio: '1933 / 1350',
      },
      {
        id: '02-argocd-rollback-sync',
        kind: 'video',
        status: 'ready',
        title: 'Argo CD rollback sync',
        caption: 'Argo CD syncs the accepted rollback state and converges the workload.',
        src: evidenceSrc('p1-rollback-path', '02-argocd-rollback-sync.mp4'),
        mimeType: 'video/mp4',
        aspectRatio: videoAspectRatio,
      },
    ],
  },
  {
    evidenceId: 'p1-secrets',
    status: 'ready',
    preferredUse: 'carousel-slide',
    routes: ['waf', 'arch'],
    title: 'Secrets Manager and External Secrets',
    caption: 'Security proof that credentials are externalized and materialized at runtime without exposing values.',
    assets: [
      {
        id: '00-cover-secrets-manager',
        kind: 'screenshot',
        status: 'ready',
        title: 'Secrets Manager cover',
        caption: 'AWS Secrets Manager contains runtime and admin secrets without exposing values.',
        src: evidenceSrc('p1-secrets', '00-cover-secrets-manager.webp'),
        aspectRatio: screenshotAspectRatio,
      },
      {
        id: '01-runtime-secret-access',
        kind: 'screenshot',
        status: 'ready',
        title: 'Runtime secret access',
        caption: 'Runtime components consume externalized secrets without committing secret values to Git.',
        src: evidenceSrc('p1-secrets', '01-runtime-secret-access.webp'),
        aspectRatio: '1933 / 1350',
      },
    ],
  },
  {
    evidenceId: 'p1-grafana',
    status: 'ready',
    preferredUse: 'carousel-slide',
    routes: ['waf', 'arch'],
    title: 'Grafana observability dashboard',
    caption: 'Operational visibility proof for service health and release feedback.',
    assets: [
      {
        id: '00-cover-vintage-dashboard',
        kind: 'screenshot',
        status: 'ready',
        title: 'Vintage dashboard cover',
        caption: 'Vintage dashboard gives operator-level service visibility.',
        src: evidenceSrc('p1-grafana', '00-cover-vintage-dashboard.webp'),
        aspectRatio: screenshotAspectRatio,
      },
      {
        id: '01-compute-resources-pods',
        kind: 'screenshot',
        status: 'ready',
        title: 'Pod compute resources',
        caption: 'Pod CPU, memory, and restart signals are visible.',
        src: evidenceSrc('p1-grafana', '01-compute-resources-pods.webp'),
        aspectRatio: '1932 / 1350',
      },
      {
        id: '02-compute-resources-cluster',
        kind: 'screenshot',
        status: 'ready',
        title: 'Cluster compute resources',
        caption: 'Cluster-level compute signals provide a baseline for capacity decisions.',
        src: evidenceSrc('p1-grafana', '02-compute-resources-cluster.webp'),
        aspectRatio: '1936 / 1352',
      },
    ],
  },
  {
    evidenceId: 'p2-cost-destroy-workflow',
    status: 'ready',
    preferredUse: 'carousel-slide',
    routes: ['cost', 'waf'],
    title: 'Cost control and destroy workflow',
    caption: 'Cost-governance proof for a dev platform that can be destroyed while durable foundations are retained.',
    assets: [
      {
        id: '00-cover-destroy-workflow',
        kind: 'video',
        status: 'ready',
        title: 'Destroy workflow walkthrough',
        caption: 'The destructive workflow requires explicit operator confirmation before teardown proceeds.',
        src: evidenceSrc('p2-cost-destroy-workflow', '00-cover-destroy-workflow.mp4'),
        mimeType: 'video/mp4',
        aspectRatio: videoAspectRatio,
      },
      {
        id: '01-destroy-platform-core',
        kind: 'screenshot',
        status: 'ready',
        title: 'Platform core destroy',
        caption: 'The platform core teardown is recorded as part of cost governance evidence.',
        src: evidenceSrc('p2-cost-destroy-workflow', '01-destroy-platform-core.webp'),
        aspectRatio: '1936 / 1352',
      },
    ],
  },
] as const satisfies readonly HirayaEvidenceAsset[]

const evidenceAssetZhTWText: Partial<Record<HirayaEvidenceItem['id'], Pick<HirayaEvidenceAsset, 'title' | 'caption'>>> = {
  'p0-cicd-delivery-flow': {
    title: '完整 CI/CD 交付流程',
    caption: '證據涵蓋 PR checks、image publishing、manifest promotion、Argo CD rollout 與 smoke verification。',
  },
  'p0-argocd-app-of-apps': {
    title: 'Argo CD App-of-Apps health',
    caption: '用來支撐 platform add-ons 與 Vintage workload resources 由 GitOps 管理。',
  },
  'p0-infra-approval-gate': {
    title: 'Infrastructure approval gate',
    caption: '支撐 separated infrastructure authority 與 reviewable applies。',
  },
  'p0-public-ingress': {
    title: 'Public endpoint、DNS、TLS 與 ALB ingress',
    caption: '支撐 shared HTTPS ingress path 與受控 admin/demo endpoints 的 public-edge proof。',
  },
  'p1-rollback-path': {
    title: '透過 GitOps PR rollback',
    caption: '展示 recovery 透過已審查的 GitOps control plane，而不是手動 patch cluster。',
  },
  'p1-secrets': {
    title: 'Secrets Manager 與 External Secrets',
    caption: '證明 credentials 外部化並在 runtime materialize，同時不暴露 values。',
  },
  'p1-grafana': {
    title: 'Grafana observability dashboard',
    caption: '支撐 service health 與 release feedback 的 operational visibility proof。',
  },
  'p2-cost-destroy-workflow': {
    title: 'Cost control 與 destroy workflow',
    caption: '支撐 dev platform 可被銷毀、同時保留 durable foundations 的 cost-governance proof。',
  },
}

export function getHirayaEvidenceAssets(locale: AppLocale): readonly HirayaEvidenceAsset[] {
  if (locale !== 'zh-TW') {
    return hirayaEvidenceAssetManifest
  }

  return hirayaEvidenceAssetManifest.map((asset) => ({
    ...asset,
    ...evidenceAssetZhTWText[asset.evidenceId],
  }))
}

export function getHirayaEvidenceAsset(
  evidenceId: HirayaEvidenceItem['id'],
  assets: readonly HirayaEvidenceAsset[] = hirayaEvidenceAssetManifest,
): HirayaEvidenceAsset | undefined {
  return assets.find((asset) => asset.evidenceId === evidenceId)
}

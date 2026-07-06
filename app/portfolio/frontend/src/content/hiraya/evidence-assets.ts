import type { AppLocale } from '@/i18n/locales'

import type { HirayaEvidenceItem, HirayaRouteId } from './types'

export type HirayaEvidenceAssetKind = 'screenshot' | 'video' | 'diagram' | 'external-link'

export type HirayaEvidenceAssetUse =
  | 'carousel-slide'
  | 'inline-explainer'
  | 'deep-dive-link'
  | 'demo-video'
  | 'not-planned'

export type HirayaEvidenceAsset = {
  evidenceId: HirayaEvidenceItem['id']
  kind: HirayaEvidenceAssetKind
  status: 'planned' | 'captured' | 'deferred'
  preferredUse: HirayaEvidenceAssetUse
  routes: readonly HirayaRouteId[]
  title: string
  caption: string
  /**
   * Keep paths optional. Most Hiraya pages should explain the decision first and
   * only use screenshots where they clarify a claim.
   *
   * For static frontend assets, prefer public paths such as:
   * /hiraya/evidence/p0-public-ingress/alb-target-health.webp
   */
  src?: string
  alt?: string
}

export const hirayaEvidenceAssetManifest = [
  {
    evidenceId: 'p0-cicd-delivery-flow',
    kind: 'video',
    status: 'planned',
    preferredUse: 'demo-video',
    routes: ['sdlc'],
    title: 'Complete delivery walkthrough',
    caption: 'Primary demo video covering PR validation, image publishing, manifest promotion, Argo CD sync, rollout, and smoke verification.',
  },
  {
    evidenceId: 'p0-argocd-app-of-apps',
    kind: 'screenshot',
    status: 'planned',
    preferredUse: 'carousel-slide',
    routes: ['arch'],
    title: 'Argo CD App-of-Apps health',
    caption: 'Useful as carousel proof when discussing GitOps ownership, not as a default page centerpiece.',
  },
  {
    evidenceId: 'p0-infra-approval-gate',
    kind: 'video',
    status: 'planned',
    preferredUse: 'deep-dive-link',
    routes: ['sdlc', 'waf'],
    title: 'Infrastructure approval gate',
    caption: 'Best used as supporting evidence for separated infrastructure authority and reviewable applies.',
  },
  {
    evidenceId: 'p0-public-ingress',
    kind: 'screenshot',
    status: 'planned',
    preferredUse: 'carousel-slide',
    routes: ['arch'],
    title: 'Public endpoint, DNS, TLS, and ALB ingress',
    caption: 'Supports the public-edge claim with Route 53, ALB, certificate, Gateway/HTTPRoute, and smoke-test evidence.',
  },
  {
    evidenceId: 'p1-rollback-path',
    kind: 'video',
    status: 'planned',
    preferredUse: 'deep-dive-link',
    routes: ['sdlc'],
    title: 'Rollback through GitOps PR',
    caption: 'Use only where rollback semantics need proof; the default SDLC flow should remain text-led.',
  },
  {
    evidenceId: 'p1-secrets',
    kind: 'screenshot',
    status: 'planned',
    preferredUse: 'carousel-slide',
    routes: ['waf', 'arch'],
    title: 'Secrets Manager and External Secrets',
    caption: 'Supports security claims without exposing values. Prefer redacted screenshots and status views.',
  },
  {
    evidenceId: 'p1-grafana',
    kind: 'screenshot',
    status: 'planned',
    preferredUse: 'carousel-slide',
    routes: ['waf', 'arch'],
    title: 'Grafana observability dashboard',
    caption: 'Useful when explaining operational visibility and release feedback, but not required on every route.',
  },
  {
    evidenceId: 'p1-private-workloads',
    kind: 'screenshot',
    status: 'planned',
    preferredUse: 'carousel-slide',
    routes: ['arch', 'cost'],
    title: 'EKS private workload architecture',
    caption: 'Supports private subnet, ClusterIP, NAT egress, and shared ingress boundary claims.',
  },
  {
    evidenceId: 'p2-deploy-smoke',
    kind: 'screenshot',
    status: 'deferred',
    preferredUse: 'not-planned',
    routes: ['sdlc'],
    title: 'Deploy smoke test evidence',
    caption: 'Keep optional unless a route needs more concrete runtime verification proof beyond the primary demo video.',
  },
  {
    evidenceId: 'p2-cost-destroy-workflow',
    kind: 'screenshot',
    status: 'planned',
    preferredUse: 'carousel-slide',
    routes: ['cost', 'waf'],
    title: 'Cost control and destroy workflow',
    caption: 'Supports cost governance and sustainability claims; use selectively where the destroyable-dev-environment decision matters.',
  },
] as const satisfies readonly HirayaEvidenceAsset[]

const evidenceAssetZhTWText: Record<HirayaEvidenceItem['id'], Pick<HirayaEvidenceAsset, 'title' | 'caption' | 'alt'>> = {
  'p0-cicd-delivery-flow': {
    title: '完整 delivery walkthrough',
    caption: '主要 demo video，涵蓋 PR validation、image publishing、manifest promotion、Argo CD sync、rollout 與 smoke verification。',
  },
  'p0-argocd-app-of-apps': {
    title: 'Argo CD App-of-Apps health',
    caption: '討論 GitOps ownership 時適合作為 carousel proof，而不是預設頁面主角。',
  },
  'p0-infra-approval-gate': {
    title: 'Infrastructure approval gate',
    caption: '最適合用來支撐 separated infrastructure authority 與 reviewable applies。',
  },
  'p0-public-ingress': {
    title: 'Public endpoint、DNS、TLS 與 ALB ingress',
    caption: '用 Route 53、ALB、certificate、Gateway/HTTPRoute 與 smoke-test evidence 支撐 public-edge claim。',
  },
  'p1-rollback-path': {
    title: '透過 GitOps PR rollback',
    caption: '只在需要證明 rollback semantics 時使用；預設 SDLC flow 應維持以文字判斷為主。',
  },
  'p1-secrets': {
    title: 'Secrets Manager 與 External Secrets',
    caption: '支撐 security claims，同時不暴露 values。優先使用 redacted screenshots 與 status views。',
  },
  'p1-grafana': {
    title: 'Grafana observability dashboard',
    caption: '適合說明 operational visibility 與 release feedback，但不需要出現在每一條 route。',
  },
  'p1-private-workloads': {
    title: 'EKS private workload architecture',
    caption: '支撐 private subnet、ClusterIP、NAT egress 與 shared ingress boundary claims。',
  },
  'p2-deploy-smoke': {
    title: 'Deploy smoke test evidence',
    caption: '除非某條 route 需要比主要 demo video 更具體的 runtime verification proof，否則保持 optional。',
  },
  'p2-cost-destroy-workflow': {
    title: 'Cost control 與 destroy workflow',
    caption: '支撐 cost governance 與 sustainability claims；在 destroyable-dev-environment decision 重要時選擇性使用。',
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

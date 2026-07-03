import type { HirayaEvidenceItem, HirayaRouteId } from './types'

export type HirayaEvidenceAssetKind = 'screenshot' | 'video' | 'diagram' | 'external-link'

export type HirayaEvidenceAssetUse =
  | 'hover-preview'
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
    preferredUse: 'hover-preview',
    routes: ['arch'],
    title: 'Argo CD App-of-Apps health',
    caption: 'Useful as hover proof when discussing GitOps ownership, not as a default page centerpiece.',
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
    preferredUse: 'hover-preview',
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
    preferredUse: 'hover-preview',
    routes: ['waf', 'arch'],
    title: 'Secrets Manager and External Secrets',
    caption: 'Supports security claims without exposing values. Prefer redacted screenshots and status views.',
  },
  {
    evidenceId: 'p1-grafana',
    kind: 'screenshot',
    status: 'planned',
    preferredUse: 'hover-preview',
    routes: ['waf', 'arch'],
    title: 'Grafana observability dashboard',
    caption: 'Useful when explaining operational visibility and release feedback, but not required on every route.',
  },
  {
    evidenceId: 'p1-private-workloads',
    kind: 'screenshot',
    status: 'planned',
    preferredUse: 'hover-preview',
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
    preferredUse: 'hover-preview',
    routes: ['cost', 'waf'],
    title: 'Cost control and destroy workflow',
    caption: 'Supports cost governance and sustainability claims; use selectively where the destroyable-dev-environment decision matters.',
  },
] as const satisfies readonly HirayaEvidenceAsset[]

export function getHirayaEvidenceAsset(evidenceId: HirayaEvidenceItem['id']): HirayaEvidenceAsset | undefined {
  return hirayaEvidenceAssetManifest.find((asset) => asset.evidenceId === evidenceId)
}

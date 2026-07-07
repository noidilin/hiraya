# Hiraya evidence asset structure

This file records the current portfolio evidence delivery contract. The final public artifact directory is now the source of truth for evidence media consumed by the Hiraya frontend.

## Current decision

- Evidence assets live under `app/portfolio/frontend/public/evidence/`.
- Frontend URLs use `/evidence/{evidenceId}/{filename}`.
- Evidence carousel supports both screenshots/images and short local video clips.
- The route carousel still flattens selected evidence packages into one slide stream.
- Manifest order is authoritative; do not infer ordering from filenames at runtime.
- Existing curated assets are treated as `ready`.
- The Brief route can still use a separate external YouTube walkthrough if configured later.

## Frontend data shape

```ts
export type HirayaEvidenceDisplayAssetKind = 'screenshot' | 'video'

export type HirayaEvidenceDisplayAsset = {
  id: string
  kind: HirayaEvidenceDisplayAssetKind
  status: 'planned' | 'ready' | 'deferred'
  src: string
  title: string
  caption: string
  alt?: string
  mimeType?: string
  aspectRatio?: string
}

export type HirayaEvidenceAsset = {
  evidenceId: HirayaEvidenceItem['id']
  status: 'planned' | 'ready' | 'deferred'
  preferredUse: HirayaEvidenceAssetUse
  routes: readonly HirayaRouteId[]
  title: string
  caption: string
  assets: readonly HirayaEvidenceDisplayAsset[]
}
```

Primary manifest:

```txt
app/portfolio/frontend/src/content/hiraya/evidence-assets.ts
```

Primary renderer:

```txt
app/portfolio/frontend/src/features/hiraya/components/hiraya-route-designs.tsx
```

## Final artifact inventory

```txt
app/portfolio/frontend/public/evidence/
  p0-cicd-delivery-flow/
    00-cover-next-FE-site-preview.webp
    01-pr-checks.webp
    02-image-pipeline.webp
    03-promotion-pr.webp
    04-argocd-rollout-smoke.mp4
  p0-argocd-app-of-apps/
    00-cover-argocd-health.webp
    01-root-application.webp
    02-vintage-resource-tree.webp
  p0-infra-approval-gate/
    00-cover-approval-gate.mp4
    01-terraform-plan-summary.webp
    02-smoke-test-success.webp
    03-terraform-platform-core-deploy.webp
  p0-public-ingress/
    00-cover-public-endpoint.mp4
    01-argocd-endpoint.mp4
    02-grafana-endpoint.mp4
  p1-rollback-path/
    00-cover-rollback-gitops.mp4
    01-rollback-pr.webp
    02-argocd-rollback-sync.mp4
  p1-secrets/
    00-cover-secrets-manager.webp
    01-runtime-secret-access.webp
  p1-grafana/
    00-cover-vintage-dashboard.webp
    01-compute-resources-pods.webp
    02-compute-resources-cluster.webp
  p2-cost-destroy-workflow/
    00-cover-destroy-workflow.mp4
    01-destroy-platform-core.webp
```

## Review gate

Before publishing, verify the final committed media does not expose credentials, secret values, tokens, personal email addresses, billing/account pages, or unnecessary account identifiers. Prefer cropping, zooming, and redaction over removing proof-critical context.

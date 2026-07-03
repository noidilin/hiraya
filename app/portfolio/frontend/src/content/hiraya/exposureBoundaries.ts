import type { HirayaRouteId } from './types'

export type ExposureBoundaryClassId =
  | 'public-user-entry'
  | 'public-demo-ops-surface'
  | 'private-service'
  | 'private-data'
  | 'internal-platform-service'

export type ExposureBoundaryRow = {
  id: string
  surface: string
  exposureClass: ExposureBoundaryClassId
  entryMechanism: string
  boundaryReason: string
  devTradeoff: string
}

export type ExposureBoundaryGroup = {
  id: ExposureBoundaryClassId
  label: string
  summary: string
  rows: readonly ExposureBoundaryRow[]
}

export type ExposureBoundaryContent = {
  routeId: Extract<HirayaRouteId, 'arch'>
  title: string
  summary: string
  defaultOpenGroupId: ExposureBoundaryClassId
  groups: readonly ExposureBoundaryGroup[]
}

export const exposureBoundaryContent: ExposureBoundaryContent = {
  routeId: 'arch',
  title: 'Exposure boundary matrix',
  summary:
    'Clarifies which Hiraya surfaces are reachable from the public edge, which stay private, and which are intentionally demo-facing for portfolio review.',
  defaultOpenGroupId: 'public-user-entry',
  groups: [
    {
      id: 'public-user-entry',
      label: 'Public user entry',
      summary: 'Surfaces intended for portfolio visitors and normal demo usage.',
      rows: [
        {
          id: 'hiraya-furugi-storefront',
          surface: 'Hiraya Furugi Storefront',
          exposureClass: 'public-user-entry',
          entryMechanism: 'Route 53 → ALB → Gateway / HTTPRoute → storefront service',
          boundaryReason: 'Provides the public demo entry point while keeping backend services private.',
          devTradeoff: 'Public by design; still a disposable dev environment.',
        },
        {
          id: 'hiraya-furugi-storefront-api-path',
          surface: 'Hiraya Furugi Storefront /api path',
          exposureClass: 'public-user-entry',
          entryMechanism: 'Same-origin Storefront /api route → private gateway service',
          boundaryReason: 'Lets browser traffic reach APIs through the storefront boundary instead of exposing each backend.',
          devTradeoff: 'Convenient demo routing; production would review API gateway and auth policy more deeply.',
        },
      ],
    },
    {
      id: 'public-demo-ops-surface',
      label: 'Public demo operations surface',
      summary: 'Operations surfaces exposed for portfolio inspection, not as a default production posture.',
      rows: [
        {
          id: 'argocd',
          surface: 'Argo CD',
          exposureClass: 'public-demo-ops-surface',
          entryMechanism: 'Shared edge route',
          boundaryReason: 'Lets reviewers inspect GitOps app health and resource ownership.',
          devTradeoff: 'Public for portfolio inspection; production would restrict admin access.',
        },
        {
          id: 'grafana',
          surface: 'Grafana',
          exposureClass: 'public-demo-ops-surface',
          entryMechanism: 'Shared edge route',
          boundaryReason: 'Lets reviewers inspect service health and release feedback.',
          devTradeoff: 'Public for observability demonstration; production would restrict access and audit usage.',
        },
      ],
    },
    {
      id: 'private-service',
      label: 'Private service',
      summary: 'Application services reachable inside the cluster through Kubernetes service discovery, not directly from the internet.',
      rows: [
        {
          id: 'gateway',
          surface: 'gateway',
          exposureClass: 'private-service',
          entryMechanism: 'ClusterIP service behind Storefront /api route',
          boundaryReason: 'Aggregates backend APIs without becoming a public LoadBalancer.',
          devTradeoff: 'Simple internal gateway for demo scope.',
        },
        {
          id: 'auth',
          surface: 'auth',
          exposureClass: 'private-service',
          entryMechanism: 'ClusterIP service',
          boundaryReason: 'Authentication service remains reachable only by internal callers.',
          devTradeoff: 'Demo auth boundary; production would deepen identity/session controls.',
        },
        {
          id: 'product-service',
          surface: 'product-service',
          exposureClass: 'private-service',
          entryMechanism: 'ClusterIP service',
          boundaryReason: 'Catalog API remains private behind the gateway path.',
          devTradeoff: 'Optimized for platform demonstration, not independent public API exposure.',
        },
        {
          id: 'orders-user-services',
          surface: 'orders / order-service / user-service',
          exposureClass: 'private-service',
          entryMechanism: 'ClusterIP services',
          boundaryReason: 'Business services stay private and are composed through internal routing.',
          devTradeoff: 'Some legacy/service-boundary cleanup may remain visible in the demo.',
        },
      ],
    },
    {
      id: 'private-data',
      label: 'Private data',
      summary: 'Runtime data components stay inside the cluster boundary.',
      rows: [
        {
          id: 'vintage-postgres',
          surface: 'vintage-postgres',
          exposureClass: 'private-data',
          entryMechanism: 'StatefulSet + Headless Service + PVC',
          boundaryReason: 'Database is internal runtime state, not a public surface.',
          devTradeoff: 'Acceptable for disposable dev data; production would use stronger backup, HA, and access controls.',
        },
      ],
    },
    {
      id: 'internal-platform-service',
      label: 'Internal platform service',
      summary: 'Platform services used by controllers or dashboards but not directly exposed to visitors.',
      rows: [
        {
          id: 'prometheus',
          surface: 'Prometheus',
          exposureClass: 'internal-platform-service',
          entryMechanism: 'ClusterIP service',
          boundaryReason: 'Collects and queries metrics inside the cluster.',
          devTradeoff: 'Grafana is exposed for review; raw metrics service remains internal.',
        },
        {
          id: 'platform-controllers',
          surface: 'Platform controllers',
          exposureClass: 'internal-platform-service',
          entryMechanism: 'In-cluster controller access',
          boundaryReason: 'Controllers reconcile infrastructure/platform intent without direct visitor access.',
          devTradeoff: 'Suitable for demo visibility through Argo CD rather than exposing controller endpoints.',
        },
      ],
    },
  ],
}

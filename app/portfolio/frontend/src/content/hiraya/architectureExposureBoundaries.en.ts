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

export const exposureBoundaryContentEn = {
  routeId: 'arch',
  title: 'Exposure boundary matrix',
  summary:
    'Clarifies which Hiraya surfaces are public through the shared Gateway, which remain ClusterIP-only, and which are exposed only for portfolio review.',
  chrome: {
    eyebrow: 'Exposure boundary',
    filterEyebrow: 'table filter',
    filterLabel: 'Exposure class',
    allSurfacesLabel: 'All surfaces',
    captionAllLabel: 'all exposure classes',
    columns: {
      surface: 'Surface',
      entryMechanism: 'Entry mechanism',
      boundaryReason: 'Boundary reason',
      devTradeoff: 'Dev trade-off',
      exposureClass: 'Exposure class',
    },
  },
  defaultOpenGroupId: 'public-user-entry',
  groups: [
    {
      id: 'public-user-entry',
      label: 'Public user entry',
      summary: 'Surfaces intended for portfolio visitors and normal demo use.',
      rows: [
        {
          id: 'hiraya-furugi-storefront',
          surface: 'Hiraya Furugi Storefront',
          exposureClass: 'public-user-entry',
          entryMechanism: 'Route 53 → shared ALB/Gateway → frontend HTTPRoute → frontend ClusterIP Service',
          boundaryReason: 'Provides the public Storefront entry point while keeping backend services private.',
          devTradeoff: 'Public by design; still a disposable dev environment.',
        },
        {
          id: 'hiraya-furugi-storefront-api-path',
          surface: 'Hiraya Furugi Storefront /api path',
          exposureClass: 'public-user-entry',
          entryMechanism: 'Browser /api path → nginx proxy in frontend pod → gateway ClusterIP Service',
          boundaryReason: 'Lets browser traffic reach APIs through the Storefront origin instead of exposing each backend.',
          devTradeoff: 'Convenient demo routing; production would harden API gateway and auth policy more deeply.',
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
          entryMechanism: 'argocd.hiraya.noidilin.dev → argocd HTTPRoute → argocd-server Service',
          boundaryReason: 'Lets reviewers inspect GitOps app health and resource ownership.',
          devTradeoff: 'Public for portfolio inspection; production would restrict admin access.',
        },
        {
          id: 'grafana',
          surface: 'Grafana',
          exposureClass: 'public-demo-ops-surface',
          entryMechanism: 'grafana.hiraya.noidilin.dev → grafana HTTPRoute → kube-prometheus-stack-grafana Service',
          boundaryReason: 'Lets reviewers inspect service health and release feedback.',
          devTradeoff: 'Public for observability demonstration; production would restrict access and audit usage.',
        },
      ],
    },
    {
      id: 'private-service',
      label: 'Private service',
      summary: 'Portfolio-relevant application services reachable inside the cluster through Kubernetes service discovery, not directly from the internet.',
      rows: [
        {
          id: 'gateway',
          surface: 'gateway',
          exposureClass: 'private-service',
          entryMechanism: 'ClusterIP Service on 3001 behind the Storefront nginx /api proxy',
          boundaryReason: 'Aggregates backend APIs without becoming a public LoadBalancer.',
          devTradeoff: 'Simple internal gateway that fits the demo scope.',
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
          id: 'orders',
          surface: 'orders',
          exposureClass: 'private-service',
          entryMechanism: 'ClusterIP Service on 3005, selected by gateway /api/orders routes',
          boundaryReason: 'Owns the active Storefront checkout and order-history API without direct public exposure.',
          devTradeoff: 'Active demo contract; server-side order authorization remains a hardening item.',
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
          entryMechanism: 'StatefulSet + headless Service (clusterIP: None) + PVC',
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
          entryMechanism: 'Helm-managed ClusterIP Service',
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
} as const

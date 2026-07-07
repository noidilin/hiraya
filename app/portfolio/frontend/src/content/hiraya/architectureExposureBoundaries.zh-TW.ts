import type { ExposureBoundaryContent } from './architectureExposureBoundaries'

export const exposureBoundaryContentZhTW: ExposureBoundaryContent = {
  routeId: 'arch',
  title: 'Exposure boundary matrix',
  summary: '釐清哪些 Hiraya surfaces 會透過 shared Gateway 對外開放，哪些維持 ClusterIP-only，以及哪些只為 portfolio review 公開。',
  chrome: {
    eyebrow: 'Exposure boundary',
    filterEyebrow: 'table filter',
    filterLabel: 'Exposure class',
    allSurfacesLabel: '全部 surfaces',
    captionAllLabel: '全部 exposure classes',
    columns: {
      surface: 'Surface',
      entryMechanism: '進入機制',
      boundaryReason: '邊界理由',
      devTradeoff: 'Dev 取捨',
      exposureClass: 'Exposure class',
    },
  },
  defaultOpenGroupId: 'public-user-entry',
  groups: [
    {
      id: 'public-user-entry',
      label: 'Public user entry',
      summary: '提供給 Portfolio Visitors 與一般 demo 使用的 surfaces。',
      rows: [
        {
          id: 'hiraya-furugi-storefront',
          surface: 'Hiraya Furugi Storefront',
          exposureClass: 'public-user-entry',
          entryMechanism: 'Route 53 → shared ALB/Gateway → frontend HTTPRoute → frontend ClusterIP Service',
          boundaryReason: '提供 public Storefront entry point，同時保持 backend services private。',
          devTradeoff: '設計上就是 public；但仍然是 disposable dev environment。',
        },
        {
          id: 'hiraya-furugi-storefront-api-path',
          surface: 'Hiraya Furugi Storefront /api path',
          exposureClass: 'public-user-entry',
          entryMechanism: 'Browser /api path → nginx proxy in frontend pod → gateway ClusterIP Service',
          boundaryReason: '讓 browser traffic 透過 Storefront origin 進入 APIs，而不是公開每個 backend。',
          devTradeoff: '方便 demo routing；production 會更深入強化 API gateway 與 auth policy。',
        },
      ],
    },
    {
      id: 'public-demo-ops-surface',
      label: 'Public demo operations surface',
      summary: '為 portfolio inspection 公開的 operations surfaces，不代表預設 production posture。',
      rows: [
        {
          id: 'argocd',
          surface: 'Argo CD',
          exposureClass: 'public-demo-ops-surface',
          entryMechanism: 'argocd.hiraya.noidilin.dev → argocd HTTPRoute → argocd-server Service',
          boundaryReason: '讓 reviewers 檢視 GitOps app health 與 resource ownership。',
          devTradeoff: '為 portfolio inspection 公開；production 會限制 admin access。',
        },
        {
          id: 'grafana',
          surface: 'Grafana',
          exposureClass: 'public-demo-ops-surface',
          entryMechanism: 'grafana.hiraya.noidilin.dev → grafana HTTPRoute → kube-prometheus-stack-grafana Service',
          boundaryReason: '讓 reviewers 檢視 service health 與 release feedback。',
          devTradeoff: '為 observability demonstration 公開；production 會限制 access 並 audit usage。',
        },
      ],
    },
    {
      id: 'private-service',
      label: 'Private service',
      summary: '與 portfolio 相關的 application services 透過 Kubernetes service discovery 在 cluster 內可達，不直接從 internet 進入。',
      rows: [
        { id: 'gateway', surface: 'gateway', exposureClass: 'private-service', entryMechanism: 'ClusterIP Service on 3001 behind the Storefront nginx /api proxy', boundaryReason: '聚合 backend APIs，但不成為 public LoadBalancer。', devTradeoff: '符合 demo scope 的 simple internal gateway。' },
        { id: 'auth', surface: 'auth', exposureClass: 'private-service', entryMechanism: 'ClusterIP service', boundaryReason: 'Authentication service 只允許 internal callers 觸達。', devTradeoff: 'Demo auth boundary；production 會深化 identity/session controls。' },
        { id: 'product-service', surface: 'product-service', exposureClass: 'private-service', entryMechanism: 'ClusterIP service', boundaryReason: 'Catalog API 維持在 gateway path 後方 private。', devTradeoff: '為 platform demonstration 最佳化，而不是獨立 public API exposure。' },
        { id: 'orders', surface: 'orders', exposureClass: 'private-service', entryMechanism: 'ClusterIP Service on 3005, selected by gateway /api/orders routes', boundaryReason: '擁有 active Storefront checkout 與 order-history API，但不直接公開。', devTradeoff: 'Active demo contract；server-side order authorization 仍是 hardening item。' },
      ],
    },
    {
      id: 'private-data',
      label: 'Private data',
      summary: 'Runtime data components 留在 cluster boundary 內。',
      rows: [
        { id: 'vintage-postgres', surface: 'vintage-postgres', exposureClass: 'private-data', entryMechanism: 'StatefulSet + headless Service (clusterIP: None) + PVC', boundaryReason: 'Database 是 internal runtime state，不是 public surface。', devTradeoff: '對 disposable dev data 可接受；production 會使用更強的 backup、HA 與 access controls。' },
      ],
    },
    {
      id: 'internal-platform-service',
      label: 'Internal platform service',
      summary: '供 controllers 或 dashboards 使用、但不直接對 visitors 開放的 platform services。',
      rows: [
        { id: 'prometheus', surface: 'Prometheus', exposureClass: 'internal-platform-service', entryMechanism: 'Helm-managed ClusterIP Service', boundaryReason: '在 cluster 內收集與查詢 metrics。', devTradeoff: 'Grafana 為 review 公開；raw metrics service 維持 internal。' },
        { id: 'platform-controllers', surface: 'Platform controllers', exposureClass: 'internal-platform-service', entryMechanism: 'In-cluster controller access', boundaryReason: 'Controllers reconcile infrastructure/platform intent，不提供 direct visitor access。', devTradeoff: '透過 Argo CD 呈現 demo visibility，比公開 controller endpoints 更適合。' },
      ],
    },
  ],
}

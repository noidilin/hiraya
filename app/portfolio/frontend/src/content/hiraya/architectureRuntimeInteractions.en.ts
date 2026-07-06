import type { ArchitectureRuntimeInteractionsContent } from './architectureRuntimeInteractions'

export type ArchitectureRuntimeTabId = 'request-paths' | 'service-boundaries' | 'secret-materialization'

export type ArchitectureRuntimeFact = {
  label: string
  value: string
  note: string
}

export type RuntimePathStage = {
  id: string
  label: string
  boundary: 'public-internet' | 'public-edge' | 'application-runtime' | 'private-data'
  mechanism: string
  description: string
}

export type RuntimeRequestExample = {
  id: string
  label: string
  path: string
  stages: readonly string[]
  claim: string
}

export type RuntimeServiceBoundary = {
  id: string
  name: string
  status: 'active' | 'legacy' | 'data' | 'platform-support'
  responsibility: string
  kubernetesType: string
  port?: string
  exposure: string
  participatesIn: readonly string[]
  notes?: string
}

export type SecretMaterializationStep = {
  id: string
  label: string
  owner: string
  mechanism: string
  explanation: string
  sourceRef?: string
}

export const architectureRuntimeInteractionsContentEn: ArchitectureRuntimeInteractionsContent = {
  routeId: 'arch',
  title: 'How traffic, services, and secrets stay inside the right boundaries',
  summary:
    'After ownership and exposure are clear, this runtime inspector shows how the public Storefront, private services, and materialized runtime secrets interact without making every boundary public.',
  chrome: {
    eyebrow: 'Runtime interaction',
    tabs: {
      'request-paths': 'Request paths',
      'secret-materialization': 'Secret materialization',
    },
    statusLabels: {
      active: 'active',
      legacy: 'legacy',
      data: 'data',
      'platform-support': 'platform support',
    },
    serviceBoundaryDefaultContext: 'service boundary',
    frontendBoundaryContext: 'frontend boundary behavior',
    kubernetesLabel: 'Kubernetes',
    portLabel: 'Port',
    exposureLabel: 'Exposure',
    notApplicableLabel: 'n/a',
    requestGraphEyebrow: 'flow graph',
    requestGraphKicker: 'same-origin → private services',
    requestGraphTitle: 'One visitor path, multiple private branches',
    requestGraphDescription:
      'Storefront visitor traffic reaches only the Storefront route; API requests move through the Storefront proxy and gateway before selecting private services.',
    secretGraphEyebrow: 'materialization flow',
    secretGraphKicker: 'external source → runtime secret → pods',
    secretGraphTitle: 'Secrets move by reference, not by copying values into Git',
    secretGraphDescription: 'Hover a node to inspect the owner, mechanism, and source reference behind each materialization handoff.',
    nonClaimsEyebrow: 'non-claims',
    nonClaimsTitle: 'What this does not say',
  },
  defaultTabId: 'request-paths',
  facts: [
    {
      label: 'Region',
      value: 'ap-northeast-1',
      note: 'Disposable dev platform region.',
    },
    {
      label: 'AZs',
      value: '3',
      note: 'Public edge and private workload subnets span three availability zones.',
    },
    {
      label: 'Public routes',
      value: 'Storefront + Argo CD + Grafana',
      note: 'The Storefront user route shares the public edge with dev ops review surfaces.',
    },
    {
      label: 'Private service pattern',
      value: 'ClusterIP',
      note: 'Backends and data services stay inside Kubernetes service discovery.',
    },
  ],
  requestPaths: {
    title: 'Request paths stay same-origin until the gateway enters private services',
    summary:
      'The browser reaches the shared public edge and Storefront. Static assets stop at nginx; API calls continue through the Storefront proxy to the private gateway and selected service boundary.',
    stages: [
      {
        id: 'browser',
        label: 'Browser',
        boundary: 'public-internet',
        mechanism: 'HTTPS visitor session',
        description: 'The visitor only knows the Storefront origin and path, not the private service DNS names.',
      },
      {
        id: 'public-edge',
        label: 'Route 53 / ALB / Gateway API / HTTPRoute',
        boundary: 'public-edge',
        mechanism: 'shared public edge',
        description: 'DNS, TLS, load balancing, Gateway, and HTTPRoute publish selected hostnames and routes.',
      },
      {
        id: 'storefront',
        label: 'Hiraya Furugi Storefront',
        boundary: 'application-runtime',
        mechanism: 'frontend Service on port 3000 → nginx on 80',
        description: 'The public application entry serves the demo Storefront and keeps browser API calls same-origin.',
      },
      {
        id: 'static-assets',
        label: 'nginx static assets',
        boundary: 'application-runtime',
        mechanism: 'static file response',
        description: 'Normal page assets are served by the frontend container without entering backend services.',
      },
      {
        id: 'api-proxy',
        label: 'Storefront /api proxy',
        boundary: 'application-runtime',
        mechanism: 'same-origin /api path',
        description: 'API traffic leaves the public Storefront boundary through a controlled proxy path, not direct browser calls to backends.',
      },
      {
        id: 'gateway',
        label: 'gateway',
        boundary: 'application-runtime',
        mechanism: 'ClusterIP service on 3001',
        description: 'The private gateway chooses the backend service for /api/auth, /api/products, /api/orders, and /api/users.',
      },
      {
        id: 'auth',
        label: 'auth',
        boundary: 'application-runtime',
        mechanism: 'ClusterIP service on 3002',
        description: 'Handles login, registration, and authentication responses behind the gateway.',
      },
      {
        id: 'product-service',
        label: 'product-service',
        boundary: 'application-runtime',
        mechanism: 'ClusterIP service on 3003',
        description: 'Serves the Hiraya Furugi Catalog API for browsing and product detail requests.',
      },
      {
        id: 'orders',
        label: 'orders',
        boundary: 'application-runtime',
        mechanism: 'ClusterIP service on 3005',
        description: 'Owns the active Storefront order-history and checkout API path.',
      },
      {
        id: 'vintage-postgres',
        label: 'vintage-postgres',
        boundary: 'private-data',
        mechanism: 'StatefulSet + Headless Service + PVC on 5432',
        description: 'Internal dev data component for authentication, catalog, user, and order data.',
      },
    ],
    examples: [
      {
        id: 'catalog-browsing',
        label: 'Catalog browsing',
        path: '/api/products',
        stages: ['browser', 'public-edge', 'storefront', 'api-proxy', 'gateway', 'product-service', 'vintage-postgres'],
        claim: 'Product reads pass through the Storefront origin and gateway before reaching the private catalog service.',
      },
      {
        id: 'authentication',
        label: 'Authentication',
        path: '/api/auth/*',
        stages: ['browser', 'public-edge', 'storefront', 'api-proxy', 'gateway', 'auth', 'vintage-postgres'],
        claim: 'Login and registration are routed to auth through the private gateway, not exposed as public services.',
      },
      {
        id: 'checkout-history',
        label: 'Checkout / order history',
        path: '/api/orders/*',
        stages: ['browser', 'public-edge', 'storefront', 'api-proxy', 'gateway', 'orders', 'vintage-postgres'],
        claim: 'The active Storefront order contract is owned by orders behind the private gateway path.',
      },
    ],
  },
  serviceBoundaries: {
    title: 'Service boundaries show what participates in the Storefront path',
    summary:
      'Each card names the runtime responsibility, Kubernetes shape, exposure mode, and how the portfolio-relevant service participates in the Storefront path.',
    services: [
      {
        id: 'frontend',
        name: 'frontend',
        status: 'active',
        responsibility: 'Serves the Hiraya Furugi Storefront and same-origin /api proxy entry.',
        kubernetesType: 'Deployment + Service + HTTPRoute',
        port: '3000 → 80',
        exposure: 'Public via HTTPRoute attached to the shared Gateway.',
        participatesIn: ['Storefront pages', 'static assets', '/api proxy'],
        notes: 'The Service is ClusterIP; the route is public through Gateway API rather than a service LoadBalancer.',
      },
      {
        id: 'gateway',
        name: 'gateway',
        status: 'active',
        responsibility: 'Aggregates backend API routing for private services.',
        kubernetesType: 'Deployment + Service',
        port: '3001',
        exposure: 'ClusterIP',
        participatesIn: ['/api/auth/*', '/api/products', '/api/orders/*', '/api/users/*'],
      },
      {
        id: 'auth',
        name: 'auth',
        status: 'active',
        responsibility: 'Handles login, registration, and authentication responses.',
        kubernetesType: 'Deployment + Service',
        port: '3002',
        exposure: 'ClusterIP',
        participatesIn: ['/api/auth/*'],
      },
      {
        id: 'product-service',
        name: 'product-service',
        status: 'active',
        responsibility: 'Owns the Hiraya Furugi Catalog API for product browsing and detail data.',
        kubernetesType: 'Deployment + Service',
        port: '3003',
        exposure: 'ClusterIP',
        participatesIn: ['/api/products', 'orders product lookup'],
      },
      {
        id: 'orders',
        name: 'orders',
        status: 'active',
        responsibility: 'Owns the active Storefront checkout and order-history API contract.',
        kubernetesType: 'Deployment + Service',
        port: '3005',
        exposure: 'ClusterIP',
        participatesIn: ['/api/orders', '/api/orders/my-orders'],
        notes: 'Current dev contract remains client-gated for some order ownership behavior; do not read it as production auth hardening.',
      },
      {
        id: 'vintage-postgres',
        name: 'vintage-postgres',
        status: 'data',
        responsibility: 'Stores disposable dev data for authentication, catalog, users, and orders.',
        kubernetesType: 'StatefulSet + Headless Service + PVC',
        port: '5432',
        exposure: 'Private headless service',
        participatesIn: ['runtime database access'],
        notes: 'Useful for a rebuildable dev platform; not a production HA database claim.',
      },
    ],
  },
  secretMaterialization: {
    title: 'Secrets are referenced in Git, then materialized at runtime',
    summary:
      'GitOps owns the ExternalSecret and store reference. AWS Secrets Manager holds the secret source, External Secrets Operator reads it through IRSA, and Kubernetes receives an owned runtime Secret for pods to consume.',
    steps: [
      {
        id: 'aws-secrets-manager',
        label: 'AWS Secrets Manager',
        owner: 'AWS Foundation',
        mechanism: 'allowlisted secret source',
        explanation: 'The durable Vintage runtime secret source exists outside Git and is read by name, not copied into manifests.',
        sourceRef: '/hiraya/dev/apps/vintage',
      },
      {
        id: 'irsa-reader',
        label: 'External Secrets Operator IRSA',
        owner: 'Cluster Platform + AWS IAM',
        mechanism: 'AssumeRoleWithWebIdentity + read-only policy',
        explanation: 'The external-secrets service account can describe and read only allowlisted Secrets Manager ARNs.',
        sourceRef: 'system:serviceaccount:external-secrets:external-secrets',
      },
      {
        id: 'cluster-secret-store',
        label: 'ClusterSecretStore',
        owner: 'Cluster Platform',
        mechanism: 'AWS Secrets Manager provider in ap-northeast-1',
        explanation: 'The shared store tells External Secrets Operator which provider, region, and service account contract to use.',
        sourceRef: 'hiraya-dev-secrets-manager',
      },
      {
        id: 'external-secret',
        label: 'ExternalSecret',
        owner: 'Application Runtime GitOps',
        mechanism: 'vintage/vintage-secrets with refreshInterval: 1h',
        explanation: 'The application manifest references the ClusterSecretStore and source path, then requests a target Secret owned by the operator.',
        sourceRef: 'secretStoreRef: hiraya-dev-secrets-manager',
      },
      {
        id: 'kubernetes-secret',
        label: 'Kubernetes Secret',
        owner: 'External Secrets Operator',
        mechanism: 'target creationPolicy: Owner',
        explanation: 'ESO materializes the runtime Secret in the vintage namespace for workloads that need database credentials or connection material.',
        sourceRef: 'target.name: vintage-secrets',
      },
      {
        id: 'runtime-consumers',
        label: 'Application Runtime services',
        owner: 'Application Runtime',
        mechanism: 'pod environment references',
        explanation: 'Application services and PostgreSQL workloads consume the materialized Secret at runtime without storing values in Git.',
      },
    ],
    nonClaims: [
      'The diagram intentionally explains materialization, not the secret values or individual keys.',
      'refreshInterval: 1h is reconciliation behavior, not a rotation guarantee.',
      'This component does not claim automated rotation or production-grade audit hardening beyond the manifests and IAM policy shown here.',
    ],
  },
}

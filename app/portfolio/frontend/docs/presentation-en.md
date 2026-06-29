# Hiraya Vintage Storefront DevOps Architecture and Process Design

## 1. Solution Overview and Design Principles

Hiraya builds a microservice system on AWS for a second-hand vintage e-commerce scenario, integrating DevOps and GitOps practices. The overall architecture starts from a local Docker Compose development environment and extends to Kubernetes deployment on AWS EKS. Terraform provisions the AWS foundation and initial bootstrap resources, GitHub Actions builds container images, Argo CD manages the GitOps deployment flow, and Prometheus with Grafana provides the current observability foundation.

The design is centered on four goals: **rebuildability, verifiability, observability, and recoverability**. The AWS foundation and EKS infrastructure are provisioned by Terraform. Microservice images are produced by GitHub Actions and pushed to ECR. Kubernetes platform add-ons and application desired state are synchronized to EKS by Argo CD according to the GitOps source of truth. The application is exposed through a shared HTTPS edge, while internal workloads run in private subnets, demonstrating network isolation and delivery workflows in a way that is close to a real cloud platform.

The Hiraya architecture is designed as follows:

- Cloud platform design: AWS EKS, VPC, private subnets, NAT Gateway, S3 Gateway Endpoint, ALB, Route 53, and ACM are used to create a rebuildable dev environment that can also be publicly demonstrated.
- Infrastructure as Code: Terraform manages long-lived bootstrap resources, the AWS foundation, EKS, IRSA, and Secrets Manager resources, making the environment versioned, reviewable, and destroyable.
- CI/CD pipeline: GitHub Actions provides PR baseline checks, container image builds, ECR push, manifest promotion, infrastructure plan/apply/destroy, and rollback workflows.
- GitOps deployment: Argo CD automatically synchronizes cluster platform add-ons and workload manifests, making Git the single source of truth for Kubernetes deployment state.
- Observability: Prometheus and Grafana provide service monitoring and dashboards.

The current focus is the dev environment. The goal is to demonstrate, at a reasonable cost, a DevOps engineer’s ability to design and implement AWS, Kubernetes, CI/CD, GitOps, IaC, and observability practices.

---

## 2. Overall Architecture Design

This section explains how the system forms a public-facing, operable, and rebuildable platform on EKS, covering the AWS network boundary, Kubernetes microservice boundary, secrets management, and observability entry points.

### 2.1 AWS Network Architecture

Hiraya is deployed in the AWS `ap-northeast-1` region. A dedicated VPC hosts EKS and the shared ingress layer. The VPC uses a public/private subnet design: public subnets host the external entry points and NAT Gateway, while private subnets host EKS worker nodes and application workloads.

| Item | Design |
|---|---|
| VPC | `devops-hiraya-dev-vpc` |
| CIDR | `10.1.0.0/16` |
| Availability Zones | `ap-northeast-1a`, `ap-northeast-1c`, `ap-northeast-1d` |
| Public edge subnets | `10.1.1.0/24`, `10.1.2.0/24`, `10.1.3.0/24` |
| Private workload subnets | `10.1.11.0/24`, `10.1.12.0/24`, `10.1.13.0/24` |
| Outbound egress | Single NAT Gateway |
| AWS private access optimization | S3 Gateway VPC Endpoint |

The design aims to achieve the following:

1. Application services are not directly exposed to the public internet.  
   The frontend, gateway, and backend services all remain Kubernetes `ClusterIP` services. External traffic is centralized through the shared ALB and Gateway API, avoiding a separate LoadBalancer for every service.
2. Public edge and private workloads are separated.  
   Public subnets provide network placement for the ALB and NAT Gateway. EKS nodes and pods run in private subnets, reducing the risk of direct workload exposure.
3. DNS and TLS are automated.  
   The ACM certificate is created through Route 53 DNS validation. ExternalDNS reads hostnames from Gateway API HTTPRoutes and manages public DNS records, connecting GitOps routes with DNS automation.

The platform currently exposes the main public entry points through AWS Load Balancer Controller, Gateway API HTTPRoute, ExternalDNS, and Route 53:

- `https://hiraya.noidilin.dev`: Vintage Storefront
- `https://argocd.hiraya.noidilin.dev`: Argo CD
- `https://grafana.hiraya.noidilin.dev`: Grafana

The user request path is:

`User → Route 53 → ALB → Gateway API Gateway → HTTPRoute → Frontend Service → Nginx → Gateway → Backend Services`

This ingress architecture consists of the following components:

- Gateway API CRDs: cluster platform components managed by Argo CD through GitOps.
- AWS Load Balancer Controller: creates ALBs based on Gateway API resources.
- Shared Gateway: located in the `edge` namespace and used as the unified entry point for all public routes.
- ExternalDNS: manages Route 53 records based on HTTPRoute hostnames.
- ACM Certificate: supports `hiraya.noidilin.dev` and `*.hiraya.noidilin.dev`.
- HTTP-to-HTTPS redirect: handled at the Gateway layer.

The EKS API endpoint enables both private and public access. Public access allows GitHub-hosted runners and the developer machine to perform Terraform and Kubernetes operations during the dev stage. In a stricter production design, this can be changed by limiting source CIDRs or using a self-hosted runner inside the VPC before disabling the public endpoint.

### 2.2 Microservice Architecture

The Kubernetes application layer uses the `vintage` namespace as the main deployment boundary. Argo CD continuously monitors the desired state in Git and synchronizes manifests to the cluster.

| Component | Kubernetes Type | Service / Port | Exposure | Design Intent |
|---|---|---:|---|---|
| frontend | Deployment + Service + HTTPRoute | 3000 → 80 | Public via Gateway | Public Hiraya Furugi storefront; nginx proxies `/api` |
| gateway | Deployment + Service | 3001 | Private | API aggregation layer and unified frontend API entry point |
| auth | Deployment + Service | 3002 | Private | User login, registration, and authentication |
| product-service | Deployment + Service | 3003 | Private | Product catalog and storefront browsing API |
| orders | Deployment + Service | 3005 | Private | Main order API owner for the storefront |
| order-service | Deployment + Service | 3004 | Private | Legacy service boundary demonstrating service evolution |
| user-service | Deployment + Service | 3006 | Private | User profile/data service |
| vintage-postgres | StatefulSet + Headless Service | 5432 | Private | Internal Kubernetes dev database |

This layering makes the frontend the only public application entry point. The gateway aggregates APIs, while backend services remain behind private service boundaries. Argo CD continuously converges every Deployment, Service, HTTPRoute, and Secret reference to the desired state stored in Git.

### 2.3 Secrets and Data Initialization

Data initialization is managed by GitOps. Seed SQL is packaged as a Kubernetes ConfigMap. A restore job automatically loads the data after PostgreSQL becomes ready. After the cluster bootstrap handoff layer completes the Argo CD handoff, Argo CD creates the Vintage application and, during the first synchronization, creates the database, restore job, and application workloads according to sync waves.

Database passwords and connection strings are not committed to Git as plaintext Kubernetes Secrets. The Vintage application uses `ExternalSecret` to materialize runtime secrets from AWS Secrets Manager path `/hiraya/dev/apps/vintage`.

Admin credentials for platform management interfaces are also managed by AWS Secrets Manager: Argo CD uses `/hiraya/dev/platform/argocd-admin`, and Grafana uses `/hiraya/dev/platform/grafana-admin`. The cluster bootstrap handoff layer reads the Argo CD admin bcrypt hash during initial installation. Grafana uses External Secrets Operator to materialize the `grafana-admin` Kubernetes Secret into the `monitoring` namespace, where it is referenced by the `kube-prometheus-stack` Helm values. Secret values are not exposed as Terraform outputs and are not committed to Git.

### 2.4 Observability Foundation

The observability goal for Hiraya is to allow operators to monitor service status through dashboards. The current observability foundation is built with Prometheus and Grafana.

Argo CD installs the kube-prometheus-stack Helm chart into the `monitoring` namespace through the Monitoring application:

- Prometheus, Grafana, and Alertmanager are all configured as `ClusterIP` services.
- The Vintage dashboard is preloaded into Grafana through a ConfigMap.
- Dashboards cover request rate, response time, active requests, error rate, pod CPU/memory, pod restarts, service health, and related metrics.

Prometheus itself remains `ClusterIP`, avoiding direct exposure of core monitoring services for demo convenience. This design intentionally separates publicly demoable UIs from operational surfaces that should remain inside the cluster.

---

## 3. Hardware and Cost Estimate

This chapter focuses on EKS compute and storage choices, current pod capacity usage, and estimated 24/7 operating cost. It translates the architecture design into measurable capacity and cost assumptions.

### 3.1 EKS Compute and Storage Selection

The cloud runtime platform is Amazon EKS. The current dev environment has been validated with the following configuration:

- **AWS Region**: `ap-northeast-1`
- **EKS Cluster**: `devops-hiraya-dev-eks`
- **Kubernetes Version**: `1.34`
- **Managed Node Group**: `devops-hiraya-dev-node-group`
- **Instance Type**: `t3.medium`
- **Capacity Type**: `SPOT`
- **Node Count**: desired 3, min 2, max 3
- **Allocatable Resources per Node**: approximately 1930m CPU, 3.2 GiB memory, 17 pods
- **Disk Size**: 30 GiB
- **EBS CSI Driver**: enabled through an EKS add-on and IRSA for the PostgreSQL PVC.

This configuration is designed for a dev environment with cost control in mind, rather than for production-grade maximum availability or high throughput.

### 3.2 Current EKS Pod Capacity Usage

All 12 Argo CD applications are `Synced / Healthy`, and the route smoke test passes. The current dev cluster pod capacity across three `t3.medium` Spot nodes is as follows:

| Metric | Value |
|---|---:|
| Node count | 3 |
| Pod limit per node | 17 |
| Total cluster pod slots | 51 |
| Current running pods | 42 |
| Remaining pod slots | 9 |

Node distribution:

| Node | Pod Usage |
|---|---:|
| `ip-10-1-11-21` | 8 / 17 |
| `ip-10-1-12-124` | 17 / 17 |
| `ip-10-1-13-156` | 17 / 17 |

There is currently no `MemoryPressure`, `DiskPressure`, or `PIDPressure`, and CPU/memory pressure is low. The main constraint is not CPU or memory, but the pod/IP density of `t3.medium` on EKS. With 42 running pods, three `t3.medium` nodes are sufficient for the dev GitOps platform, but capacity is already tight, and two nodes have reached their pod slot limit.

If the node group scales down to the minimum size of two nodes, total pod slots would become `2 × 17 = 34`, which is lower than the current 42 running pods. Therefore, Spot interruption or temporary scale-down would risk leaving some pods unscheduled.

The final decision is:

- Keep the current functional testing setup: three `t3.medium` nodes are acceptable.
- Improve baseline stability: adjust node group `minSize` to 3 to avoid insufficient pod slots with only two nodes.
- Add deployment headroom: adjust `maxSize` to 4 to provide buffer for Spot replacement or short-term scaling.
- If more controllers, monitoring components, or multi-replica services are added later, consider moving to `t3.large` or another instance type with more pod/IP and memory headroom.

### 3.3 Estimated Cost and Cost Justification

The following is a rough monthly cost estimate for running the `ap-northeast-1` dev environment 24/7. Actual cost varies based on Spot market price, ALB LCU usage, NAT data processing, and data transfer.

This cost analysis follows practices from AWS Billing and Cost Management and the Well-Architected Cost Optimization Pillar: first identify major cost drivers, then validate unit prices using AWS Pricing Calculator or the Price List API, compare with actual bills in Cost Explorer, set monthly guardrails with AWS Budgets, and continuously check right-sizing recommendations with Compute Optimizer or Cost Optimization Hub. The table below is a rough order-of-magnitude estimate for architecture design. In production operation, Cost Explorer `UnblendedCost` and actual usage should be treated as the source of truth.

| Cost Item | Estimate Assumption | Estimated Monthly Cost (USD) | Justification |
|---|---|---:|---|
| EKS Control Plane | 1 cluster, about 730 hours/month | About 73 | EKS is the fixed core cost for demonstrating Kubernetes, GitOps, Gateway API, and platform engineering. |
| EC2 Spot Worker Nodes | 3 × `t3.medium` Spot, desired 3 | About 35–45 | Uses Spot to reduce compute cost while retaining enough resources for microservices and observability. |
| EBS Volumes | 3 × 20 GiB node disks + 10 GiB PostgreSQL PVC | About 6–8 | Supports node runtime and dev database persistent volume with low, predictable cost. |
| NAT Gateway | Single NAT Gateway + light data processing | About 45–55+ | Private nodes need outbound access for image pulls, packages, and AWS API calls; a single NAT is a dev trade-off between cost and private networking. |
| ALB / Gateway Ingress | 1 shared ALB + low-traffic LCU | About 18–25 | Shared ingress serves the storefront, Argo CD, and Grafana without creating one LoadBalancer per service. |
| Route 53 / ACM | 1 hosted zone, few DNS queries; ACM public certificate | About 0.5–1 | Supports a real HTTPS domain demo; ACM public certificates have no additional charge. |
| Secrets Manager | A small number of secrets for Vintage, Argo CD, Grafana, etc. | About 1–2 | Externalizes runtime/admin credentials and keeps passwords out of Git and Terraform outputs. |
| ECR | Multiple microservice repositories, small image storage | About 1–3 | Retains artifacts for image promotion and rollback; lifecycle policies can clean up old images. |

---

## 4. Full Software Development Lifecycle CI/CD Process Design

Hiraya’s delivery pipeline is built around a complete SDLC and divided into five clearly separated delivery mechanisms: pull request validation, image publishing, GitOps promotion, infrastructure delivery, and rollback. This design ensures every change can be validated, reviewed, tracked, and recovered.

Core design decisions:

1. Validate first, authorize later: the PR stage runs tests, builds, and manifest rendering without cloud permissions. Only trusted `main` branch workflows or approved environments can obtain AWS OIDC permissions.
2. Produce artifacts before deployment: services are first built as immutable container images and tagged with the commit SHA, allowing source, image, and runtime state to be correlated.
3. Git as the deployment contract: CI does not directly modify the Kubernetes runtime. All deployment state moves through GitOps manifest PRs and is applied by Argo CD after merge.
4. Infrastructure changes are controlled: infrastructure changes require manual triggers, environment approval, and plan review evidence, and are separated from normal application releases.
5. Rollback follows the same control path: rollback is not a manual cluster patch. It is a rollback manifest PR, after which Argo CD converges the desired state to the selected version.

### 4.1 Pull Request Validation Flow

All PRs first enter a low-privilege validation gate. This stage does not provide AWS credentials and does not allow registry writes or cluster changes. The pipeline determines the change scope based on service directories and only runs necessary checks for affected microservices, avoiding unnecessary builds that waste time and cost.

PR validation includes:

- Service ownership classification: determines whether changes belong to the frontend, gateway, backend service, GitOps manifest, or infrastructure layer.
- Application baseline: runs package dependency graph checks, service directory validation, backend contract tests, frontend unit tests, static build, typecheck, and lint.
- GitOps render validation: validates deployment manifests, service connection settings, route configuration, port mapping, and environment variable contracts.
- Docker build-only gate: if a change affects an image, the PR only builds the image; it does not push images or log in to ECR.
- Infrastructure static checks: statically validates Terraform modules, Helm/Kustomize rendered output, and Kubernetes schemas. Trusted PRs additionally produce Terraform plan evidence for reviewer inspection.

The goal of this stage is to give reviewers enough evidence before merge: test results, container buildability, GitOps render output, and infrastructure plan output. Cloud write permissions are deferred to later trusted stages, reducing supply-chain and permission-abuse risks.

### 4.2 Image Publishing and Artifact Promotion Flow

When an application change is merged into the protected `main` branch, the pipeline enters the image publishing flow. The system re-detects changed services and reruns baseline validation before obtaining AWS credentials, ensuring the current `main` branch state remains buildable, testable, and deployable.

Image publishing is designed as follows:

1. Build a matrix only for affected services, avoiding rebuilds of all microservices every time.
2. GitHub Actions obtains short-lived AWS credentials through OIDC and is only authorized to push to designated ECR repositories.
3. Each image uses the Git commit SHA as its tag, forming an unambiguous deployment artifact.
4. The image build target platform is fixed to Linux/amd64 to ensure consistent behavior on EKS worker nodes.
5. Vulnerability scanning provides visibility into HIGH/CRITICAL risks before and after image push. It is currently an advisory gate and can later be upgraded to a blocking gate.
6. After image publishing completes, the pipeline does not deploy directly. Instead, it creates a manifest promotion PR.

Artifact promotion is performed through Git PRs. The promotion PR only updates image tags for the relevant services, producing a small and easy-to-review diff while still applying branch protection, required checks, and reviewer processes. This decouples the build artifact from deployment desired state: ECR stores deployable artifacts, while GitOps manifests decide which artifact enters the environment.

ECR repositories are managed by the long-lived bootstrap layer and are not deleted when the rebuildable EKS platform is destroyed. This preserves image history, rollback targets, and supply-chain traceability across platform rebuilds.

### 4.3 GitOps Synchronization and Deployment Flow

After a manifest promotion PR is merged, Git becomes the only deployment contract. Argo CD monitors the desired state on the `main` branch and synchronizes changes to EKS. This avoids giving CI runners long-term responsibility for cluster changes and allows runtime drift to be automatically detected and corrected.

GitOps synchronization is designed as follows:

- The cluster bootstrap handoff layer only creates Argo CD, AppProjects, and the root application, completing the handoff from Terraform to GitOps.
- The root application uses the app-of-apps pattern to create cluster platform and Vintage workload child applications.
- Argo CD owns Kubernetes platform add-ons over the long term, including namespaces, Gateway API CRDs, StorageClass, External Secrets Operator, AWS Load Balancer Controller, ExternalDNS, edge gateway resources, the monitoring stack, public admin interface routes, and Vintage workloads.
- Application image tag changes update the deployment template and trigger a Kubernetes rollout. Service and HTTPRoute names remain stable so the traffic entry point does not change between versions.
- After a GitOps merge, a public smoke test validates that the storefront shell and main API paths are available, providing deployment verification evidence.

This design creates clear CI/CD responsibility boundaries: CI validates, builds, scans, and proposes desired state changes; Argo CD deploys, synchronizes, and corrects drift; Kubernetes performs rollouts and service routing.

### 4.4 Infrastructure Delivery Flow

Infrastructure delivery is designed as an independent and controlled change channel. VPC, EKS, IAM, DNS, ACM, IRSA, and platform admin secrets are high-permission, high-impact resources, so they are not mixed into the same automated path as normal application image promotion.

Infrastructure layers:

| Layer | Owner / Executor | Responsibility | Lifecycle |
|---|---|---|---|
| Project bootstrap layer | Terraform / reviewed setup | Remote state access, GitHub OIDC roles, ECR, long-lived runtime secrets | Long-lived |
| Platform core layer | Environment-gated Terraform apply | VPC, EKS, node group, ACM/DNS primitives, AWS-side IRSA roles, admin secrets | Rebuildable |
| Cluster bootstrap handoff layer | Environment-gated Terraform apply | Argo CD installation, AppProjects, root application handoff | Recreated after platform core rebuild |
| Cluster platform layer | Argo CD | Controllers, CRDs, namespaces, shared gateway, monitoring | Continuous GitOps sync |
| GitOps application layer | Argo CD | Vintage Storefront workload manifests | Continuous GitOps sync |

The deploy flow first generates a refreshed Terraform plan as review evidence. After GitHub Environment approval, the platform core layer is applied. Once EKS and AWS-side prerequisites are complete, the cluster bootstrap handoff layer installs Argo CD and hands off the root application. Finally, platform smoke tests verify namespaces, gateway, HTTPRoute, Argo CD application health, and public endpoints.

The destroy flow runs in reverse order: first suspend or prune GitOps resources, keep AWS Load Balancer Controller and ExternalDNS running long enough to clean up ALB/DNS dependent resources, then clean up PVC/EBS resources, and finally destroy the cluster bootstrap handoff layer and platform core layer. The project bootstrap layer is retained so ECR, OIDC roles, state access, and long-lived secrets can support the next rebuild.

### 4.5 Rollback and Operational Evidence

Rollback uses the same GitOps control plane as deployment. After an operator selects a service and an existing ECR image tag, the pipeline verifies that the target artifact exists, generates a manifest diff, runs render validation, and creates a rollback PR. After the PR is merged, Argo CD converges the runtime state to the selected image tag.

This mechanism makes rollback reviewable and traceable. Every rollback records the reason, target version, manifest diff, validation result, and subsequent smoke test evidence. The overall SDLC evidence includes PR diffs, baseline summaries, Docker build results, vulnerability scan reports, Terraform plans, promotion/rollback diffs, Argo CD sync health, and public smoke test results.

---

## 5. Mapping to the Six Pillars of the AWS Well-Architected Framework

Hiraya uses the AWS Well-Architected Framework as its architectural guideline to demonstrate design trade-offs and engineering capability. The following sections explain how the design maps to the six pillars.

### 5.1 Operational Excellence

Terraform modularizes management of the long-lived bootstrap layer, platform core AWS/EKS foundation, and cluster bootstrap handoff to Argo CD. Argo CD continuously synchronizes the cluster platform layer and workload manifests. GitHub Actions builds images and updates manifests, while Argo CD synchronizes GitOps state to Kubernetes. Prometheus and Grafana provide the monitoring foundation and help engineers troubleshoot with data.

Demonstration highlights:

- Terraform manages the long-lived bootstrap layer, AWS foundation, and Argo CD handoff in separated layers.
- GitHub Actions provides PR validation, image promotion, infrastructure plan/apply/destroy.
- Argo CD continuously converges cluster state back to the GitOps desired state.
- Deploy smoke tests and rollback workflows make post-deployment verification and recovery demonstrable.

Services and tools used: Terraform, GitHub Actions, EKS, ECR, Argo CD, Route 53, ExternalDNS, AWS Load Balancer Controller, External Secrets Operator, AWS Secrets Manager, Prometheus, Grafana

### 5.2 Security

The security design focuses on minimal exposure, short-lived credentials, externalized secrets, and cloud-native identity integration. Worker nodes and services run in private subnets, while the public entry point is centralized through the shared ALB/Gateway. GitHub Actions uses OIDC to assume AWS IAM roles instead of storing long-lived access keys.

Demonstration highlights:

- Private EKS worker subnets reduce the risk of direct workload exposure.
- Application services remain `ClusterIP` and are exposed only through Gateway routes.
- ACM provides HTTPS certificates, while Route 53 and ExternalDNS manage DNS.
- ECR immutable tags and scan-on-push improve image supply-chain security.
- IRSA allows Kubernetes service accounts to obtain scoped AWS permissions.
- AWS Secrets Manager stores the Vintage DB runtime secret, Grafana admin secret, and Argo CD admin secret, preventing passwords from being committed to Git.
- External Secrets Operator uses scoped read-only IRSA to materialize Kubernetes Secrets from Secrets Manager.

Future hardening directions: automate secret rotation and include CloudTrail audit; further restrict EKS API public CIDRs; evolve Trivy scans from advisory checks to blocking gates.

Services and tools used: IAM, OIDC, IRSA, AWS Secrets Manager, External Secrets Operator, EKS private subnets, ACM, ALB, Route 53, ECR image scanning, Kubernetes Secret

### 5.3 Reliability

Reliability is centered on rebuildable environments, GitOps self-healing, and post-deployment verification. The EKS managed node group spans three private subnets. Argo CD automatically synchronizes manifests. PostgreSQL preserves dev data through an EBS PVC. Deploy smoke tests verify that the public storefront is available.

Demonstration highlights:

- Managed node group provides Kubernetes worker capacity across AZs.
- GitOps automated sync can correct drift from non-Git sources.
- StatefulSet + EBS PVC demonstrates Kubernetes persistent storage.
- The infrastructure destroy workflow includes EBS/PVC cleanup steps to reduce teardown residue.
- The rollback workflow returns to a selected ECR image tag through a PR.

Future hardening directions: add replicas, readiness/liveness probes, PodDisruptionBudgets, resource requests/limits, and HPA for critical services.

Services and tools used: EKS managed node group, EBS CSI, Argo CD, GitHub Actions deploy smoke

### 5.4 Performance Efficiency

Performance efficiency is reflected in service decomposition, shared ingress, reasonable dev node sizing, and metrics-driven operations. The gateway provides a unified frontend API entry point, while backend services can be built and deployed independently. The Spot `t3.medium` node group balances cost and demo capacity.

Demonstration highlights:

- Microservice decomposition clarifies service ownership and image pipeline boundaries.
- Gateway aggregation reduces direct frontend dependencies on multiple backend endpoints.
- The nginx same-origin `/api` proxy reduces browser CORS and routing complexity.
- Prometheus/Grafana provide an entry point for performance observation.

Future improvement directions: extend ServiceMonitor coverage to all active backend services; add resource requests/limits so scheduling and autoscaling are more accurate; use dashboard data for right-sizing.

Services and tools used: EKS, Prometheus, Grafana, kube-prometheus-stack, Gateway API, ALB

### 5.5 Cost Optimization

Hiraya uses a dev-only rebuildable platform with cost control as a premise. Long-lived resources are limited to foundational resources such as ECR, IAM, and necessary Secrets Manager secrets. EKS, VPC, and controllers can be destroyed through workflows. The node group uses Spot capacity, and public ingress uses a shared ALB to avoid creating a separate LoadBalancer for each service.

Demonstration highlights:

- Spot managed node group reduces compute cost.
- Shared ALB/Gateway reduces duplicated ingress resources.
- S3 Gateway Endpoint reduces dependency on NAT when private subnets access S3.
- Infrastructure destroy workflow supports cleaning up the rebuildable platform after demos.

Cost trade-offs: EKS control plane, NAT Gateway, ALB, Secrets Manager, and Route 53 still incur cost. Therefore, the destroy workflow is part of cost governance.

Services and tools used: EKS, EC2 Spot managed node group, NAT Gateway, ALB, ECR, AWS Secrets Manager, Terraform destroy workflow

### 5.6 Sustainability

For Hiraya, sustainability means avoiding idle resources, reducing repeated builds, and making the environment easy to shut down. GitOps, immutable images, and IaC allow the environment to be rebuilt when a demo is needed, instead of keeping all resources running indefinitely.

Demonstration highlights:

- Rebuildable platform reduces idle cloud resources.
- Shared ingress reduces duplicate LoadBalancers.
- Spot capacity and max node count limit the upper bound of dev compute resources.
- Observability can support future right-sizing decisions.
- ECR lifecycle policies can be used later to clean up old images.

Services and tools used: EKS, EC2 Spot, ECR lifecycle, Prometheus, Grafana, Terraform

# Hiraya DevOps Portfolio

This context defines the project-specific language used to describe the portfolio platform, its operational roles, and its AI-assisted operations capability.

## Language

**Vintage Storefront**:
The public demo commerce experience in Hiraya where visitors browse vintage products and place orders.
_Avoid_: frontend, current frontend, vintage frontend

**Application Runtime**:
The Ownership Boundary where Hiraya's workload services execute behind the public edge, including application pods, private services, and runtime data components.
_Avoid_: Vintage Storefront, Hiraya EKS Project, app layer

**Runtime Interaction**:
The architecture-route explanation model for how Hiraya behaves inside established boundaries: public request paths, private service composition, and secret materialization.
_Avoid_: Ownership Flow, Exposure Class, complete topology graph, CI/CD flow

**Request Path**:
A visitor-facing runtime path from browser entry through the Public Edge, selected Application Runtime services, and runtime data components.
_Avoid_: Ownership Flow, infrastructure dependency graph, every network hop

**Secret Materialization**:
The runtime process where External Secrets Operator reads allowlisted AWS Secrets Manager entries and creates Kubernetes Secrets consumed by workloads.
_Avoid_: secret values, committed credentials, full rotation/audit design

**Service Boundary**:
A named Application Runtime service or data component with a responsibility, Kubernetes exposure mode, and role in Storefront request paths.
_Avoid_: microservice project, generic pod, every Kubernetes object

**Hiraya EKS Project**:
The disposable EKS-hosted demonstration system that combines the Vintage Storefront with the cloud and Kubernetes platform needed to deliver and operate it.
_Avoid_: microservice project, EKS app, cluster app

**Hiraya Portfolio**:
The public project introduction experience in Hiraya where Portfolio Visitors learn about the platform and use Hiraya Guide.
_Avoid_: frontend, portfolio frontend, project site

**Portfolio Proof Path**:
The brief-route explanation model that shows why Hiraya is a platform demonstration: design goals, EKS runtime, GitOps delivery, and evidence media connect into one claim before visitors inspect route-specific details.
_Avoid_: screenshot gallery, static site intro, marketing hero, complete architecture walkthrough

**Platform Proof Map**:
The brief-route architecture graph model that uses one high-level map to orient Portfolio Visitors across source/change authority, durable foundations, disposable AWS/EKS runtime, Vintage workload paths, and proof surfaces without becoming a complete topology walkthrough.
_Avoid_: Runtime Interaction, Ownership Flow, Authority Flow, screenshot gallery, exhaustive AWS resource diagram

**Proof Lens**:
A selectable Brief-route graph focus that highlights one evidence-backed claim across the Platform Proof Map, such as visitor request proof, delivery/GitOps proof, rebuild/destroy proof, or operations evidence proof.
_Avoid_: generic graph filter, arbitrary node selection, screenshot tab

**Hiraya Furugi**:
The customer-facing brand presented inside the Vintage Storefront.
_Avoid_: new frontend, FE rewrite, store frontend

**Hiraya Furugi Storefront**:
The branded customer-facing surface of the Vintage Storefront used when naming public reachability surfaces.
_Avoid_: Hiraya Storefront, generic storefront, frontend

**Hiraya Furugi Catalog**:
The product assortment presented by Hiraya Furugi in the Vintage Storefront.
_Avoid_: candidate catalog, new frontend data, FE catalog

**Kira**:
The AI-assisted SRE persona that helps diagnose incidents by explaining likely root causes, supporting evidence, immediate fixes, and prevention steps.
_Avoid_: chatbot, bot, generic assistant

**Operator**:
A person allowed to inspect operational signals and use Kira to investigate the health of the deployed platform.
_Avoid_: anonymous user, public visitor, customer

**Portfolio Visitor**:
A person evaluating Hiraya as a portfolio project from outside the platform team. Portfolio Visitors receive curated project explanations, not live operational access.
_Avoid_: user, anonymous user, public visitor, customer

**Project Bootstrap**:
The durable foundation for Hiraya's dev environment that survives cluster rebuilds and holds cross-cutting setup for state access, repository automation, image repositories, and durable workload secrets.
_Avoid_: bootstrap, account bootstrap

**Platform Core**:
The Terraform lifecycle boundary that builds Hiraya's cluster, networking, identity, and public-domain prerequisites for workloads.
_Avoid_: platform stack, core stack, AWS Foundation

**AWS Foundation**:
The presentation-facing Ownership Boundary for the AWS cloud substrate in Hiraya, including the resources and managed services that other boundaries depend on.
_Avoid_: Platform Core, cloud stuff, AWS layer

**Portfolio Stack**:
The durable cloud boundary that keeps Hiraya Portfolio and Hiraya Guide available independently of the disposable cluster.
_Avoid_: Project Bootstrap, Platform Core, EKS app stack

**Cluster Platform**:
The shared in-cluster capabilities that make Hiraya workloads reachable, observable, and operable, excluding the presentation-facing public exposure boundary.
_Avoid_: cluster add-ons, shared controllers, Public Edge

**Public Edge**:
The Ownership Boundary that controls Hiraya's public HTTPS exposure through shared ingress, DNS, certificate, and route-publishing mechanisms.
_Avoid_: Cluster Platform, public services, internet layer

**Exposure Class**:
A portfolio explanation category that describes how reachable a Hiraya surface is, such as public user entry, public demo operations surface, private service, private data, or internal platform service.
_Avoid_: security group, network tier, service type

**Cluster Bootstrap**:
The reproducible handoff that establishes GitOps control for a Hiraya cluster.
_Avoid_: one-time setup, Argo installer

**Ownership Boundary**:
A responsibility zone in the Hiraya EKS Project that clarifies who primarily owns a part of the platform explanation and what it intentionally does not own.
_Avoid_: tool group, architecture box, service area

**Boundary Stack**:
The compact visual representation of one Ownership Boundary, containing the Internal Layers that belong to that responsibility zone.
_Avoid_: layer, card, generic component

**Internal Layer**:
A compact item inside a Boundary Stack that names a tool, resource, or mechanism belonging to that Ownership Boundary without turning it into a separate relationship graph.
_Avoid_: boundary, stack, node

**Ownership Flow**:
The read order that explains how Hiraya's Ownership Boundaries hand responsibility from change authority to cloud foundation, cluster capabilities, public exposure, workload runtime, and feedback.
_Avoid_: traffic flow, dependency graph, topology

**Delivery Authority**:
The Ownership Boundary for proposing, validating, and approving application and infrastructure changes before another boundary owns the resulting runtime or cloud state.
_Avoid_: CI/CD pipeline, GitHub Actions, deployment layer

**Authority Flow**:
The SDLC explanation model that shows how change authority moves from validation evidence, to artifact publishing, to proposed desired-state changes, to accepted Git state, to GitOps/runtime convergence.
_Avoid_: pipeline stepper, deployment timeline, tool chain

**Capacity Trade-off Ledger**:
The cost-route explanation model that treats Hiraya's dev platform spend as explicit architectural choices: fixed platform costs, savings mechanisms, capacity headroom, and remaining operational risk.
_Avoid_: monthly bill table, cheapest possible AWS demo, production cost commitment

**Well-Architected Maturity Judgment**:
The WAF-route explanation model that separates each pillar into what is strong now, what is an intentional disposable-dev-platform trade-off, and what should harden next before production.
_Avoid_: six-pillar checklist, compliance badge, production-readiness claim, generic best-practice scorecard

**Delivery Guardrail**:
An SDLC rule that states the allowed action, the shortcut Hiraya intentionally avoids, and the handoff result that preserves authority boundaries.
_Avoid_: generic best practice, pipeline step, compliance checkbox

**Accepted Desired State**:
The reviewed Git state that Argo CD is allowed to reconcile into the cluster after promotion, rollback, or platform handoff changes are accepted.
_Avoid_: deployed commit, CI output, workflow result

**Observation**:
The Ownership Boundary for feedback and verification signals that help explain whether Hiraya's runtime and release decisions are working.
_Avoid_: monitoring stack, Grafana, Cluster Platform

**Public Gateway Access**:
The platform-granted ability for a namespace to publish routes through Hiraya's shared public edge.
_Avoid_: public label, internet flag

**Diagnosis Session**:
A focused conversation between an Operator and Kira about one operational symptom or incident, where follow-up questions reuse the prior investigative context.
_Avoid_: stateless prompt, isolated question

**Guide Session**:
A browser-scoped conversation between a Portfolio Visitor and Hiraya Guide where follow-up questions reuse the prior project-explanation context.
_Avoid_: persistent history, account conversation, Diagnosis Session

**Hiraya Guide**:
The portfolio-facing assistant that helps Portfolio Visitors understand Hiraya through curated project explanations.
_Avoid_: Kira, chatbot, bot, generic assistant

**Curated Project Knowledge**:
The approved project explanations Hiraya Guide may use when answering Portfolio Visitor questions.
_Avoid_: repo dump, raw repository snapshot, live operational data

**Target Team Permission Model**:
The intended team-role access design Hiraya Guide may explain as target-state, without claiming it is fully implemented.
_Avoid_: current IAM state, implemented permissions, team RBAC

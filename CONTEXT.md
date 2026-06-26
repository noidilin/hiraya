# Hiraya DevOps Portfolio

This context defines the project-specific language used to describe the portfolio platform, its operational roles, and its AI-assisted operations capability.

## Language

**Vintage Storefront**:
The public demo commerce experience in Hiraya where visitors browse vintage products and place orders.
_Avoid_: frontend, current frontend, vintage frontend

**Hiraya Portfolio**:
The public project introduction experience in Hiraya where Portfolio Visitors learn about the platform and use Hiraya Guide.
_Avoid_: frontend, portfolio frontend, project site

**Hiraya Furugi**:
The customer-facing brand presented inside the Vintage Storefront.
_Avoid_: new frontend, FE rewrite, store frontend

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
The cloud foundation of Hiraya that provides the cluster, networking, identity, and public-domain prerequisites for workloads.
_Avoid_: platform stack, core stack

**Portfolio Stack**:
The durable cloud boundary that keeps Hiraya Portfolio and Hiraya Guide available independently of the disposable cluster.
_Avoid_: Project Bootstrap, Platform Core, EKS app stack

**Cluster Platform**:
The shared in-cluster capabilities that make Hiraya workloads reachable, observable, and operable.
_Avoid_: cluster add-ons, shared controllers

**Cluster Bootstrap**:
The reproducible handoff that establishes GitOps control for a Hiraya cluster.
_Avoid_: one-time setup, Argo installer

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

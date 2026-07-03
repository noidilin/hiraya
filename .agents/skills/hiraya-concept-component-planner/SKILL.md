---
name: hiraya-concept-component-planner
description: Guides a planning/grilling session to choose one important concept for a Hiraya Portfolio route/domain and design a custom primary explanatory component for it before implementation. Use when discussing /hiraya/brief, /hiraya/arch, /hiraya/cost, /hiraya/sdlc, or /hiraya/waf component concepts, route-specific explanation design, ownership/cost/SDLC/WAF concepts, or when the user wants to plan a Hiraya FE component rather than code immediately.
---

# Hiraya Concept Component Planner

## Mission

Guide the user through a **concept-first planning session** for one Hiraya Portfolio route/domain. The goal is to identify the concept that most needs explanation, then design the clearest route-specific component to convey it.

Do **not** implement during this skill. End by writing a detailed implementation plan for a later agent.

## Ground Rules

- Focus the whole session on the concept to convey in the selected domain.
- Design for explanation quality, not screenshot quantity.
- Build domain/topic-specific components; do not start from generic reusable shells.
- Keep route topics fixed: `brief`, `arch`, `cost`, `sdlc`, `waf`.
- Evidence assets are optional support, not the component's purpose.
- Screenshots are usually hover/focus proof, not default content.
- If a question is answerable from files, inspect files instead of asking.
- Ask one question at a time and recommend an answer.
- When terminology is settled, update `CONTEXT.md` inline using `grill-with-docs` behavior.
- Consider deployment impact before future implementation, but this session is planning-only.

## Concept-First Workflow

1. **Select route/domain**
   - Identify the target route: `brief`, `arch`, `cost`, `sdlc`, or `waf`.
   - If unspecified, ask which route to plan.

2. **Find the explanatory gap**
   - Inspect current content/components/docs.
   - Ask: what concept is still unclear or under-explained?
   - Phrase the concept in one short canonical phrase.

3. **Define audience outcomes**
   - HR: what should be understood in 30 seconds?
   - Tech lead: what should be inspectable in 2–3 minutes?
   - What claim must stand without screenshots?

4. **Choose the component metaphor**
   - Examples: ownership viewer, exposure matrix, authority flow, trade-off ledger, maturity board, cost driver model.
   - Decide what the component explicitly does **not** explain.

5. **Set terms and boundaries**
   - Resolve overloaded words.
   - Add stable terms to `CONTEXT.md` when they become project language.
   - Keep implementation details out of `CONTEXT.md`.

6. **Specify data/content model**
   - Prefer content-owned data files over hardcoded component copy.
   - Identify project data to re-collect from Terraform, GitOps, docs, workflows, or reports.

7. **Write implementation plan**
   - One component design spec per doc under `app/portfolio/frontend/docs/design/`.
   - Stop after the plan unless the user explicitly starts implementation later.

## Existing Architecture Precedents

Planned architecture components:

- `ArchitectureOwnershipExplorer`: explains Ownership Boundaries using Boundary Stacks and Internal Layers.
- `ExposureBoundaryMatrix`: explains public/private reachability by Exposure Class.

Follow their planning discipline, not necessarily their visual form.

## Route Starting Hypotheses

Use these only as starting points; grill the user before locking decisions.

- **brief**: explain the portfolio proof path — why Hiraya is a platform demonstration, not just a static site or app demo.
- **arch**: explain ownership/reachability boundaries before topology or screenshots.
- **cost**: explain cost as architectural trade-off — what is deliberately paid for, what is saved, and what risk remains visible.
- **sdlc**: explain delivery authority separation — CI creates evidence/artifacts/proposals; reviewed Git and GitOps own accepted desired state and runtime convergence.
- **waf**: explain maturity judgment — strong now, intentional dev trade-off, and harden next across Well-Architected pillars.

## Avoid

Avoid primary components that are:

- screenshot galleries
- generic card grids
- video placeholders
- asset/evidence attachment surfaces
- complete docs pages inside one component
- topology graphs of every tool integration
- reusable abstractions before route concepts are clear
- marketing sections that hide architectural decision-making
- production-readiness claims beyond the disposable dev platform

Route-specific avoidances:

- **arch**: avoid collapsing ownership, exposure, traffic, secrets, and observability into one mega-graph.
- **cost**: avoid only a pricing table; explain trade-offs and capacity risk.
- **sdlc**: avoid a generic CI/CD stepper with no authority model.
- **waf**: avoid treating pillars as compliance badges or equal generic cards.

## Files To Inspect

Always inspect:

- `CONTEXT.md`
- `app/portfolio/frontend/src/content/hiraya/en.ts`
- `app/portfolio/frontend/src/content/hiraya/types.ts`
- `app/portfolio/frontend/src/features/hiraya/components/hiraya-route-designs.tsx`
- existing `app/portfolio/frontend/docs/design/hiraya-*-plan.md`

Route-specific sources:

- **SDLC**: `.github/workflows/`, `docs/portfolio/CICD.md`, platform/deploy/rollback runbooks, `gitops/apps/vintage/`
- **Cost**: `infra/envs/dev/platform-core/terraform.tfvars`, `infra/modules/eks/`, `infra/modules/vpc/`, `docs/adr/0006-dev-eks-node-instance-size.md`, `docs/reports/`
- **WAF**: `docs/portfolio/ARCHITECTURE.md`, `docs/portfolio/SECURITY_GATES.md`, `docs/portfolio/DECISIONS.md`, `docs/evidence-checklist.md`
- **Architecture**: architecture ownership/exposure plan docs, Terraform/GitOps files relevant to the concept
- **Brief**: portfolio docs and route content that define the overall proof story

## Plan Output Template

Write one spec per component:

`app/portfolio/frontend/docs/design/hiraya-{route-or-concept}-{component-name}-plan.md`

Include:

- goal and route placement
- concept being explained
- settled terminology
- audience outcomes
- primary visual metaphor
- interaction model
- data/content model
- content/data sources to inspect
- non-goals
- implementation steps
- accessibility/visual requirements
- verification steps
- acceptance criteria

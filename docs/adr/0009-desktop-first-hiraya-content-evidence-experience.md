# Desktop-first Hiraya Content and Evidence Experience

- Status: Accepted
- Current architecture: [Portfolio stack](../architecture/portfolio-stack.md)
- Supersedes: none
- Superseded by: none

The Hiraya portfolio routes under `/hiraya` will prioritize the desktop presentation experience. The primary visitor experience is expected to be a recruiter, reviewer, interviewer, or self-guided demo viewer using a laptop/desktop screen, so the route layouts may use dense technical cards, wide tables, architecture frames, timeline views, and hover/focus evidence previews. Mobile layouts must remain readable and navigable, but mobile parity is not the primary design constraint for this section.

Hiraya route content is sourced from `docs/presentation-en.md` and modeled in `app/portfolio/frontend/src/content/hirayaContent.ts`. The five routes map to the five presentation sections: brief, architecture, cost, SDLC, and Well-Architected. Route copy should avoid unsupported production claims and should frame Hiraya as a dev-only, rebuildable DevOps portfolio platform that demonstrates AWS/EKS, Terraform, GitHub Actions, Argo CD, GitOps, private workloads, shared HTTPS ingress, secrets integration, and observability.

Evidence media is a progressive enhancement, not a blocker for route implementation. `docs/evidence-checklist.md` remains the planning checklist for screenshots and recordings. The frontend content model may reference evidence through planned media slots using states such as `planned`, `placeholder`, and `ready`. Until assets exist, routes should render clear placeholders rather than broken images or empty sections.

The brief route may include an embedded YouTube walkthrough video as the high-level introduction to the full platform. The SDLC route may later include or link a delivery-flow recording that demonstrates PR validation, image publishing, ECR push, manifest promotion, Argo CD sync, rollout, and smoke verification. Videos should not autoplay and should be loaded in a way that does not make basic page content depend on third-party media availability.

Desktop evidence cards may reveal screenshots on hover or keyboard focus so implementation claims can be inspected without turning each page into a static screenshot gallery. For mobile and touch devices, the fallback may be tap-to-open preview dialogs or simple inline links. Screenshots must be curated and redacted so account identifiers, secret values, credentials, tokens, and sensitive runtime details are not exposed.

Architecture diagrams are allowed to be implemented as reserved frames before the final diagram assets exist. The architecture route should therefore support a placeholder frame for a future AWS/EKS diagram showing Route 53, ALB/Gateway API, EKS private workloads, Argo CD, ECR, Secrets Manager, External Secrets Operator, Prometheus, and Grafana. The diagram can be produced separately and dropped into the existing frame later without changing the route structure.

This decision keeps current frontend implementation unblocked while preserving a clear path to stronger evidence-backed portfolio pages. It also documents why the Hiraya section favors desktop density and hover-driven inspection over a mobile-first marketing layout.

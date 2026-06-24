# PRD: GitOps-Owned Cluster Platform Refactor

Local implementation reference: [`docs/plan/gitops-refactor-implementation.md`](./gitops-refactor-implementation.md)
Related ADR: [`docs/adr/0007-gitops-owned-cluster-platform.md`](../adr/0007-gitops-owned-cluster-platform.md)

## Problem Statement

Hiraya's dev platform currently mixes AWS infrastructure, Kubernetes resources, and Helm add-ons in one Terraform-owned platform workflow. That coupling makes the CI/CD path fragile: a Terraform pre-approval plan can fail because the planning role lacks Kubernetes authorization, even when the intended change is mostly AWS-side infrastructure. It also blurs ownership between Terraform and GitOps, makes destroy/recreate workflows harder to reason about, and leaves platform add-ons, admin routes, observability, and application manifests split across inconsistent deployment mechanisms.

The Operator needs a clean, industry-aligned ownership model for the dev EKS platform: Terraform should own the cloud foundation and AWS-side identity/secret primitives, while Argo CD should own the Cluster Platform and workload desired state. The platform should remain reproducible, disposable, and demonstrably deployable to AWS EKS through the portfolio CI/CD pipeline.

## Solution

Refactor Hiraya dev into the layered ADR-0007 model:

- **Project Bootstrap** remains the durable dev foundation for Terraform state access, GitHub OIDC roles, ECR repositories, and durable workload secrets.
- **Platform Core** becomes the AWS/EKS foundation and must not use Kubernetes or Helm providers.
- **Cluster Bootstrap** becomes a separate Terraform state that runs after Platform Core and installs Argo CD plus the app-of-apps GitOps root.
- **Cluster Platform** becomes Argo CD-owned and contains shared in-cluster capabilities such as Gateway API CRDs, AWS Load Balancer Controller, ExternalDNS, External Secrets Operator, edge Gateway resources, logging, monitoring, and public admin routes.
- **GitOps Apps** remain Argo CD-owned workload manifests, starting with Vintage Storefront.

The migration should be delivered as one reviewable PR with phased commits and a checklist. There is no live dev infrastructure to preserve, so the migration should use new Terraform state keys and rebuild the disposable dev platform rather than performing Terraform state surgery. After the post-merge deploy-and-destroy acceptance run succeeds, dev infrastructure should be left destroyed to avoid cost.

## User Stories

1. As an Operator, I want Platform Core Terraform to avoid Kubernetes and Helm providers, so that infrastructure planning does not require live cluster authorization.
2. As an Operator, I want Project Bootstrap to remain durable across cluster rebuilds, so that repository automation, ECR, state access, and durable workload secrets survive disposable EKS environments.
3. As an Operator, I want Platform Core to own VPC, EKS, node groups, managed add-ons, ACM, DNS primitives, IAM, IRSA, CloudWatch log groups, and platform admin secrets, so that cloud resources have one clear source of truth.
4. As an Operator, I want Cluster Bootstrap to own only the Argo CD installation and GitOps handoff, so that Argo CD can take over long-lived in-cluster desired state without mixing responsibilities with Platform Core.
5. As an Operator, I want Argo CD to own Cluster Platform add-ons, so that shared in-cluster capabilities are reconciled from Git rather than Terraform state.
6. As an Operator, I want Argo CD to own Vintage Storefront manifests, so that workload changes continue to flow through GitOps.
7. As an Operator, I want the legacy monolithic platform stack retired, so that future agents do not see two competing deployment models.
8. As an Operator, I want new Terraform state keys for Platform Core and Cluster Bootstrap, so that the refactor avoids fragile migration/import operations.
9. As an Operator, I want a dedicated GitHub cluster-bootstrap role, so that Kubernetes bootstrap and smoke checks are separated from AWS infrastructure mutation.
10. As a security-conscious Operator, I want GitHub plan and Platform Core apply roles to lose Kubernetes API access, so that least privilege matches the new ownership seam.
11. As a security-conscious Operator, I want IRSA roles to trust exact namespace/service-account subjects, so that controller AWS permissions cannot be assumed by arbitrary service accounts.
12. As a security-conscious Operator, I want AWS Load Balancer Controller, ExternalDNS, External Secrets Operator, and Fluent Bit to each have scoped IRSA roles, so that AWS permissions are auditable by controller.
13. As a security-conscious Operator, I want unused WAF and Shield permissions removed from the AWS Load Balancer Controller policy, so that deferred features do not create unnecessary privilege.
14. As an Operator, I want platform admin credentials generated into AWS Secrets Manager, so that public Argo CD and Grafana routes are backed by strong generated secrets rather than committed values.
15. As an Operator, I want to retrieve Argo CD and Grafana admin passwords through AWS Secrets Manager CLI, so that secret values do not need to be exposed through Terraform outputs.
16. As an Operator, I want Vintage Storefront runtime secrets moved out of plaintext Kubernetes manifests, so that the app baseline has a better security posture.
17. As an Operator, I want Project Bootstrap to own durable Vintage Storefront secrets, so that app credentials survive disposable cluster rebuilds.
18. As an Operator, I want External Secrets Operator to materialize Kubernetes Secrets from stable Secrets Manager names, so that application and platform manifests stay Git-safe.
19. As an Operator, I want ESO read permissions scoped to allowlisted secret ARNs, so that in-cluster secret access remains least-privilege.
20. As an Operator, I want Public Gateway Access to be platform-granted, so that workload apps cannot self-authorize internet exposure by labeling their own namespaces.
21. As an Operator, I want Cluster Platform to own public workload namespaces, so that namespace labels and route attachment permissions have one owner.
22. As an Operator, I want Cluster Bootstrap to own the special Argo CD namespace, so that Argo CD can be installed before GitOps-managed namespace ownership begins.
23. As an Operator, I want service owners to own HTTPRoute objects, so that routing changes live with the service they expose.
24. As an Operator, I want Edge to own only the shared Gateway, GatewayClass, Gateway configuration, and redirect route, so that shared edge policy is centralized without taking over all service routes.
25. As a portfolio viewer, I want the existing public hostnames to continue working after rebuild, so that the demo URLs remain stable.
26. As an Operator, I want ExternalDNS to own HTTPRoute-derived Route 53 records, so that DNS follows Gateway API desired state and asynchronous ALB creation.
27. As an Operator, I want the edge Gateway to avoid committed VPC IDs and ACM certificate ARNs, so that destroy/recreate does not require manual GitOps value edits.
28. As an Operator, I want AWS Load Balancer Controller VPC and certificate discovery used where possible, so that GitOps values remain stable across rebuilds.
29. As an Operator, I want only one active matching ACM certificate for the Hiraya hostnames in-region, so that certificate discovery remains deterministic enough.
30. As an Operator, I want Gateway API and AWS Load Balancer Controller CRDs vendored and pinned in Git, so that Cluster Platform syncs are reproducible and reviewable.
31. As an Operator, I want CRDs protected from automatic prune, so that deleting a child Application does not accidentally cascade-delete dependent resources.
32. As an Operator, I want one Argo CD Application per platform add-on, so that add-on health, sync status, and upgrade blast radius are visible.
33. As an Operator, I want platform add-on versions pinned, so that rebuilds are reproducible and upgrades happen through reviewed PRs.
34. As an Operator, I want Argo CD sync waves to order namespaces, CRDs, controllers, edge resources, monitoring, logging, admin access, and workloads, so that first bootstrap convergence is predictable.
35. As an Operator, I want Argo CD automated sync and self-heal for platform and workload desired state, so that main-branch changes reconcile without GitHub needing Argo credentials.
36. As an Operator, I want GitHub Actions to validate GitOps manifests but not trigger Argo syncs, so that CI does not need public Argo CD credentials.
37. As an Operator, I want the deploy workflow to apply Platform Core first and Cluster Bootstrap second, so that Argo CD installation only runs after the EKS foundation exists.
38. As an Operator, I want the deploy workflow to run Kubernetes and public route smoke checks, so that successful deploys prove the platform converged end-to-end.
39. As an Operator, I want smoke checks to avoid the Argo CD API, so that deployment validation does not require storing Argo credentials in GitHub Actions.
40. As an Operator, I want the dev EKS API public access toggle to remain explicit, so that GitHub-hosted runners can bootstrap and smoke-test until a private runner exists.
41. As an Operator, I want the destroy workflow to suspend the root Argo app before pruning children, so that the root app cannot recreate resources during teardown.
42. As an Operator, I want destroy to prune workload apps before platform controllers, so that PVCs, ALBs, DNS records, and controller-owned resources can be cleaned up by their reconcilers.
43. As an Operator, I want AWS Load Balancer Controller and ExternalDNS to remain running until their managed AWS resources are gone, so that ALB and DNS cleanup is deterministic.
44. As an Operator, I want Vintage PostgreSQL data reset on rebuild, so that dev remains disposable and avoids AZ-bound EBS preservation complexity.
45. As an Operator, I want disposable Platform Core admin secrets force-deleted on destroy, so that stable secret names can be reused immediately on the next rebuild.
46. As an implementation agent, I want a detailed local implementation plan, so that I can implement the migration without re-opening design decisions.
47. As an implementation agent, I want the implementation plan referenced from the PRD, so that issue work can point back to the local file-level plan.
48. As an implementation agent, I want a clear GitOps directory model, so that platform and workload manifests are not mixed in a flat tree.
49. As an implementation agent, I want image promotion paths updated with the GitOps move, so that the microservice image pipeline keeps working after Vintage manifests move.
50. As a reviewer, I want the one migration PR to use phased commits and a checklist, so that a large diff remains reviewable.
51. As a reviewer, I want static CI to prove Terraform and GitOps renderability without cluster credentials, so that PR review remains safe and fast.
52. As a reviewer, I want a Platform Core speculative plan in trusted PR CI, so that AWS-side infrastructure drift and intent remain visible before merge.
53. As a reviewer, I want Cluster Bootstrap excluded from PR planning, so that PR CI does not depend on a live cluster.
54. As a maintainer, I want runbooks and infrastructure docs updated, so that future deploy/destroy operations follow the new ownership model.
55. As a maintainer, I want stale ADOT ownership language corrected, so that future Kira observability work follows ADR-0007.
56. As a maintainer, I want post-merge acceptance to include deploy and destroy, so that both creation and teardown paths are proven before considering the migration complete.
57. As a maintainer, I want dev left destroyed after acceptance, so that verification does not create ongoing AWS cost.
58. As a future Kira implementer, I want pod logs under a platform-wide Hiraya dev log group name, so that observability naming is not tied only to Vintage Storefront.
59. As a future Kira implementer, I want ADOT deferred but clearly assigned to Cluster Platform for in-cluster collector manifests, so that AIOps work can resume without ownership ambiguity.
60. As a future agent, I want ADR-0007 to be respected as the source of ownership truth, so that the monolithic Terraform model is not accidentally restored.

## Implementation Decisions

- Use ADR-0007 as the governing architectural decision for this migration.
- Deliver the migration as one PR, but structure it with phased commits and a PR checklist.
- Keep Project Bootstrap as a manual/local stack because it creates the GitHub roles used by automation.
- Add a dedicated GitHub cluster-bootstrap role for Cluster Bootstrap, Kubernetes smoke checks, and ordered GitOps cleanup.
- Split the legacy monolithic platform into Platform Core and Cluster Bootstrap Terraform states.
- Retire the legacy monolithic platform stack before merging the migration PR.
- Platform Core owns AWS/EKS foundations only and must not configure Kubernetes or Helm providers.
- Platform Core owns AWS-side IAM and IRSA for GitOps-owned controllers.
- Platform Core owns EKS managed add-ons, including EBS CSI.
- Platform Core owns platform admin Secrets Manager resources for Argo CD and Grafana.
- Project Bootstrap owns durable Vintage Storefront dev secrets.
- Use AWS-managed Secrets Manager encryption keys for this dev migration.
- Use manual Terraform-controlled rotation for dev admin and workload secrets rather than automatic rotation.
- Store Argo CD's stable admin bcrypt hash in the Platform Core Argo admin secret JSON.
- Do not output generated secret values from Terraform; Operators read them from Secrets Manager.
- Force-delete disposable Platform Core admin secrets on destroy so stable names can be reused immediately.
- Use ESO to materialize Kubernetes Secrets from AWS Secrets Manager.
- Scope ESO IRSA permissions to allowlisted secret ARNs.
- Consumers own ExternalSecret mappings; Cluster Platform owns the secret store/controller.
- Keep IRSA rather than switching to EKS Pod Identity.
- Preserve fixed controller service-account subjects for AWS Load Balancer Controller, ExternalDNS, Fluent Bit, and ESO.
- Remove unused WAF and Shield permissions from the AWS Load Balancer Controller IRSA policy because those features are deferred.
- Argo CD remains public through the shared edge for dev, using strong generated credentials only.
- Grafana remains public through the shared edge for dev, using strong generated credentials only.
- Do not add SSO, WAF, or IP allowlisting in this migration.
- Cluster Bootstrap owns Argo CD installation, the Argo CD namespace, AppProjects, and the root Application.
- Argo CD uses a root app-of-apps model that tracks the main branch.
- Use dedicated Argo CD AppProjects for platform and workload apps, with moderate allowlists to start.
- Cluster Platform owns one Argo CD Application per platform add-on.
- Use sync waves and automated self-heal/prune for normal resources.
- Protect CRDs from automatic prune.
- Vendor and pin Gateway API and AWS Load Balancer Controller CRDs.
- Let monitoring own its chart CRDs with no-prune protection where needed.
- Use remote Helm charts with adjacent committed values for upstream add-ons.
- Preserve existing add-on chart versions first, except where adding a new required add-on.
- Avoid committed dynamic AWS IDs that change on rebuild, especially VPC IDs and ACM certificate ARNs.
- Rely on AWS Load Balancer Controller VPC discovery and ACM certificate discovery where possible.
- Keep an operational rule that only one active matching ACM certificate should exist for Hiraya hostnames in the deployment region.
- Platform Core may expose stable non-secret identifiers and fixed IRSA role ARNs for GitOps values.
- Public Gateway Access is platform-granted, not app-self-granted.
- Cluster Platform owns public workload namespaces and their public access labels.
- Cluster Bootstrap owns the special Argo CD namespace because Argo CD cannot GitOps-create its own namespace before it exists.
- Edge owns shared Gateway resources and HTTP-to-HTTPS redirect only.
- Service owners own service-specific HTTPRoute objects.
- ExternalDNS remains the owner of public DNS records derived from Gateway API routes.
- Rename the pod log group to a platform-wide Hiraya dev name.
- Defer ADOT implementation, but keep future ownership aligned with Terraform for AWS/IAM/CloudWatch-side resources and Argo CD for in-cluster manifests.
- Move Vintage Storefront manifests under the workload GitOps tree.
- Remove the app-owned Vintage namespace manifest because Cluster Platform grants Public Gateway Access.
- Replace the committed Vintage Kubernetes Secret with an ExternalSecret.
- Keep Vintage ServiceMonitor and Grafana dashboard declarations owned by the app.
- Keep Vintage PostgreSQL reset-on-rebuild behavior.
- Update image promotion, rollback, service catalog, and app baseline assumptions to follow the new Vintage manifest locations.
- Replace stack-specific backend writer logic with a generic Terraform backend writer.
- Deploy workflow applies Platform Core after approval, then applies Cluster Bootstrap as a separate state/job.
- Deploy workflow verifies convergence with Kubernetes and route smoke checks using the cluster-bootstrap role.
- CI validates GitOps and Terraform without requiring cluster credentials.
- Trusted PR CI performs a fast speculative Platform Core plan only.
- Destroy workflow suspends root GitOps reconciliation, prunes child Applications in explicit order, waits for controller cleanup, then destroys Cluster Bootstrap and Platform Core.
- Post-merge acceptance requires both deploy and destroy to succeed.
- Leave dev infrastructure destroyed after acceptance.

## Testing Decisions

- Tests should validate external behavior at the highest available seam: rendered desired state, Terraform plans/validation, workflow behavior, deploy convergence, public routes, and destroy cleanup. Avoid tests that assert private implementation structure when an external behavior can be tested instead.
- The first seam is static repository validation: Terraform formatting, Terraform validation, module contract tests, GitOps rendering, Helm rendering, schema linting where practical, service catalog validation, and app baseline checks.
- The second seam is trusted PR infrastructure planning: Platform Core should produce a fast speculative plan without Kubernetes access. Cluster Bootstrap should not be planned in PR CI because it depends on a live cluster.
- The third seam is deploy workflow behavior: Platform Core apply must complete before Cluster Bootstrap apply, and Cluster Bootstrap must create Argo CD plus the GitOps root without the core apply role needing Kubernetes access.
- The fourth seam is Argo CD convergence: child Applications should become synced/healthy through GitOps reconciliation from main, with no GitHub-triggered Argo API sync.
- The fifth seam is public route behavior: Vintage Storefront, Argo CD, and Grafana routes should return accepted HTTP status codes through the shared edge after reconciliation.
- The sixth seam is secret materialization behavior: ESO should create the Kubernetes secrets needed by Grafana and Vintage from AWS Secrets Manager values, without committed plaintext secrets.
- The seventh seam is destroy behavior: root app reconciliation must be stopped, child Applications must prune in the intended order, controller-managed ALB/DNS/EBS resources must disappear, and Terraform destroy must remove Cluster Bootstrap and Platform Core cleanly.
- Existing Terraform module contract tests are prior art for validating refactored AWS-only modules.
- Existing GitOps render checks are prior art for validating Kustomize output without cluster credentials.
- Existing app baseline and service catalog tests are prior art for validating image manifest paths and promotion behavior.
- Existing public route smoke checks are prior art for validating post-deploy public endpoint behavior.
- Existing destroy cleanup scripts are prior art for EBS/PVC cleanup, but they must be adapted to the new Argo-owned model.
- Add or update tests around the absence of Kubernetes/Helm provider usage in Platform Core if a high-level validation can catch that boundary.
- Add or update tests around GitHub role separation through generated policy assertions where practical.
- Add or update tests around new GitOps tree rendering so the root app-of-apps and Vintage workload app are both renderable.
- Add or update tests around manifest promotion fast-path behavior so bot image-tag-only PRs still avoid unnecessary Terraform planning.

## Out of Scope

- Implementing ADOT or the broader Kira AIOps feature.
- Migrating to EKS Pod Identity.
- Adding Argo CD or Grafana SSO.
- Adding WAF, Shield, or IP allowlisting for public admin routes.
- Moving the EKS API to private-only access.
- Introducing self-hosted private GitHub runners.
- Preserving Vintage PostgreSQL data across rebuilds.
- Introducing RDS or another managed database for Vintage Storefront.
- Performing Terraform state surgery to preserve the legacy monolithic platform state.
- Creating a multi-environment promotion model beyond dev.
- Upgrading existing platform add-on chart versions unless required for the migration.
- Rewriting unrelated historical reports or plans beyond notes needed to avoid ownership contradictions.
- Changing the current public hostnames.
- Replacing Gateway API with Ingress.
- Adding a reloader controller for secret rotation automation.

## Further Notes

- The detailed local implementation plan is maintained at `docs/plan/gitops-refactor-implementation.md`; agents implementing this PRD should use that file as the operational checklist and file-level guide.
- This PRD intentionally avoids reopening decisions already recorded in ADR-0007.
- The migration should be implemented as one PR, but the PR should be organized into phased commits matching Project Bootstrap, Platform Core, Cluster Bootstrap, GitOps, CI/CD, destroy, and documentation work.
- After the PR merges, Project Bootstrap must be applied locally from main before the new deploy workflow can succeed, because the new cluster-bootstrap role and durable Vintage secrets must exist first.
- Acceptance is not complete until both the deploy workflow and destroy workflow succeed from main.

# EKS network redesign for dev

- Status: Accepted; shared-controller ownership seam superseded by [ADR-0007](0007-gitops-owned-cluster-platform.md)
- Current architecture: [Platform lifecycle](../architecture/platform-lifecycle.md), [Ownership boundaries](../architecture/boundaries.md)
- Supersedes: none
- Superseded by: partial ownership model superseded by [ADR-0007](0007-gitops-owned-cluster-platform.md)

The dev EKS platform will move from public worker nodes to private EKS nodes in private subnets, with a single public shared ALB at the edge, one NAT Gateway plus an S3 gateway endpoint for private outbound egress, and EKS API private access enabled while public API access remains an explicit temporary dev toggle. This improves the portfolio network design without adopting the full cost of production HA networking.

Historical shared-controller decision: Terraform owned platform infrastructure and shared controllers, including VPC, EKS, Gateway API CRDs, AWS Load Balancer Controller, ExternalDNS, ACM validation, the shared `edge` Gateway, and admin routes. ADR-0007 supersedes that ownership seam: Platform Core now owns AWS/EKS foundations only, while Argo CD owns Cluster Platform add-ons, edge resources, admin routes, and workload manifests. ExternalDNS still reads HTTPRoute hostnames and owns public DNS aliases because the ALB is created asynchronously by the Kubernetes controller.

Consequences: the dev platform should be destroyed and recreated rather than migrated in place; Route 53 hostname records are controller-driven via ExternalDNS with TXT ownership; ArgoCD and Grafana are public through HTTPS on the shared ALB with strong Terraform-generated credentials; Prometheus remains private via port-forward; Kubernetes NetworkPolicy is deferred to a later hardening phase. Initial GitHub-hosted infra deploy workflows depend on the explicit temporary public EKS API endpoint; moving the EKS API to private-only access requires a runner with private network reachability, such as a VPC-hosted self-hosted runner.

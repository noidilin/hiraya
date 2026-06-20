# EKS network redesign for dev

Status: accepted

The dev EKS platform will move from public worker nodes to private EKS nodes in private subnets, with a single public shared ALB at the edge, one NAT Gateway plus an S3 gateway endpoint for private outbound egress, and EKS API private access enabled while public API access remains an explicit temporary dev toggle. This improves the portfolio network design without adopting the full cost of production HA networking.

Terraform owns platform infrastructure and shared controllers: VPC, EKS, Gateway API CRDs, AWS Load Balancer Controller, ExternalDNS, ACM validation, the shared `edge` Gateway, and admin routes for Terraform-owned namespaces. GitOps owns application manifests and the `hiraya.noidilin.dev` app HTTPRoute in the `vintage` namespace; ExternalDNS reads HTTPRoute hostnames and owns public DNS aliases because the ALB is created asynchronously by the Kubernetes controller.

Consequences: the dev platform should be destroyed and recreated rather than migrated in place; Route 53 hostname records are controller-driven via ExternalDNS with TXT ownership; ArgoCD and Grafana are public through HTTPS on the shared ALB with strong Terraform-generated credentials; Prometheus remains private via port-forward; Kubernetes NetworkPolicy is deferred to a later hardening phase. Initial GitHub-hosted infra deploy workflows depend on the explicit temporary public EKS API endpoint; moving the EKS API to private-only access requires a runner with private network reachability, such as a VPC-hosted self-hosted runner.

# Gateway API on EKS Resources

## Knowledge

- [Gateway API: Introduction — Kubernetes SIG Network](https://gateway-api.sigs.k8s.io/)
  Official Gateway API project introduction. Use for: role-oriented model, Gateway vs API gateway distinction, Gateway/GatewayClass/HTTPRoute concepts.
- [Gateway API — Kubernetes Documentation](https://kubernetes.io/docs/concepts/services-networking/gateway/)
  Official Kubernetes concept guide. Use for: resource model, request flow, GatewayClass/Gateway/HTTPRoute definitions.
- [Gateway API — AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/latest/guide/gateway/gateway/)
  Official AWS Load Balancer Controller docs. Use for: how Gateway API maps to AWS ALB/NLB, CRD prerequisites, feature gates, target-type implications.
- [Gateway API Route Sources — ExternalDNS](https://github.com/kubernetes-sigs/external-dns/blob/master/docs/sources/gateway-api.md)
  Official ExternalDNS Gateway API source documentation. Use for: how HTTPRoute hostnames become DNS records and where DNS annotations belong.
- [Hiraya ADR: EKS network redesign](../docs/adr/0001-eks-network-redesign.md)
  Project decision record. Use for: local ownership rules between Terraform, GitOps, ExternalDNS, and controller-created ALB resources.
- [Hiraya infra README](../infra/README.md)
  Project infrastructure notes. Use for: validation commands, intended public access flow, and ClusterIP expectations for frontend/gateway services.
- [Provision an EKS cluster — HashiCorp Developer](https://developer.hashicorp.com/terraform/tutorials/kubernetes/eks)
  Official Terraform tutorial for EKS. Use for: the AWS-side building blocks that create the cluster before Kubernetes resources can be managed.
- [Manage Kubernetes resources with Terraform — HashiCorp Developer](https://developer.hashicorp.com/terraform/tutorials/kubernetes/kubernetes-provider)
  Official Terraform tutorial for the Kubernetes provider. Use for: how Terraform connects to a Kubernetes API server and why CRDs often require a separate first step.
- [Helm Provider — Terraform Registry](https://registry.terraform.io/providers/hashicorp/helm/latest/docs)
  Official Terraform Helm provider documentation. Use for: how Terraform authenticates to Kubernetes and installs software packages into the cluster.
- [helm_release — Terraform Registry](https://registry.terraform.io/providers/hashicorp/helm/latest/docs/resources/release)
  Official resource documentation. Use for: explaining charts, releases, values, wait behavior, and CRD installation behavior.
- [Helm Docs](https://helm.sh/docs/)
  Official Helm documentation. Use for: Helm as the Kubernetes package manager and chart/release vocabulary.
- [Custom Resources — Kubernetes Documentation](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/)
  Official Kubernetes CRD concept page. Use for: explaining CRDs, custom resources, and custom controllers.
- [IAM roles for service accounts — Amazon EKS](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html)
  Official AWS IRSA documentation. Use for: explaining how Kubernetes service accounts receive least-privilege AWS permissions.
- [Assign IAM roles to Kubernetes service accounts — Amazon EKS](https://docs.aws.amazon.com/eks/latest/userguide/associate-service-account-role.html)
  Official setup documentation. Use for: trust policy shape, service account annotations, and pod-to-AWS permission flow.
- [ExternalDNS on AWS — ExternalDNS docs](https://kubernetes-sigs.github.io/external-dns/latest/docs/tutorials/aws/)
  Official ExternalDNS AWS tutorial. Use for: Route 53 permissions, IRSA/Pod Identity options, Helm deployment, TXT registry behavior.

## Wisdom (Communities)

- [Kubernetes Slack: SIG Network channels](https://slack.k8s.io/)
  High-signal place for Gateway API implementation and operator questions. Use for: ambiguous Gateway API behavior or conformance questions.
- [AWS Containers Roadmap GitHub](https://github.com/aws/containers-roadmap)
  AWS public containers roadmap and issue tracker. Use for: AWS Load Balancer Controller and EKS feature limitations or roadmap signals.
- [AWS Load Balancer Controller GitHub issues](https://github.com/kubernetes-sigs/aws-load-balancer-controller/issues)
  Practical troubleshooting source from maintainers and users. Use for: controller reconciliation bugs, ALB/Gateway API edge cases.

## Gaps

- Add a local runbook entry after the next live validation of `kubectl get gateway -A`, `kubectl get httproute -A`, ExternalDNS logs, and actual Route 53 ALIAS records.

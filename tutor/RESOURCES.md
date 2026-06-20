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

## Wisdom (Communities)

- [Kubernetes Slack: SIG Network channels](https://slack.k8s.io/)
  High-signal place for Gateway API implementation and operator questions. Use for: ambiguous Gateway API behavior or conformance questions.
- [AWS Containers Roadmap GitHub](https://github.com/aws/containers-roadmap)
  AWS public containers roadmap and issue tracker. Use for: AWS Load Balancer Controller and EKS feature limitations or roadmap signals.
- [AWS Load Balancer Controller GitHub issues](https://github.com/kubernetes-sigs/aws-load-balancer-controller/issues)
  Practical troubleshooting source from maintainers and users. Use for: controller reconciliation bugs, ALB/Gateway API edge cases.

## Gaps

- Add a local runbook entry after the next live validation of `kubectl get gateway -A`, `kubectl get httproute -A`, ExternalDNS logs, and actual Route 53 ALIAS records.

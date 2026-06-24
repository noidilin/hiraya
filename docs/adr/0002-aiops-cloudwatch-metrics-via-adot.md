# AIOps metrics through CloudWatch via ADOT

Status: accepted; in-cluster ADOT ownership refined by ADR-0007

Kira will use CloudWatch Logs and CloudWatch Metrics as its operational query surface instead of querying Prometheus directly. EKS and application metrics needed for AIOps diagnosis will be exported from inside the cluster by ADOT to the `Hiraya/AIOps` CloudWatch namespace with a deliberately small, low-cardinality metric set; Prometheus remains private for Grafana dashboards and port-forwarded operator access only.

ADR-0007 refines ownership for that observability export plumbing: Platform Core owns AWS/IAM/CloudWatch-side resources, while Argo CD-owned Cluster Platform manifests own future in-cluster ADOT collector resources. The separate AIOps stack consumes the resulting CloudWatch Logs, CloudWatch Metrics, and EKS read APIs. This avoids exposing Prometheus through a public or internal load balancer and keeps all AIOps Lambda functions outside the VPC, trading direct Prometheus query flexibility for a simpler AWS-native integration path that fits the private-node network redesign.

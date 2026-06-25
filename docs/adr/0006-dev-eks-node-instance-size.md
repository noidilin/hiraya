# Dev EKS node instance size

Status: accepted

The dev EKS managed node group originally used three Spot `t3.large` nodes instead of three Spot `t3.medium` nodes. The Vintage microservice stack ran alongside platform add-ons, Gateway API, monitoring, logging, and Argo CD, and the previous `t3.medium` capacity hit the EKS pod-density limit before the AZ-bound `vintage-postgres-0` StatefulSet could schedule. Because the Postgres EBS volume is bound to a single Availability Zone, simply relying on another small node was less deterministic than increasing per-node pod capacity across all existing AZs.

AIOps implementation and CloudWatch pod log forwarding are now postponed, so the dev platform removes Fluent Bit while keeping in-cluster Prometheus/Grafana observability enabled through `platform-monitoring`. The dev node group reverts to three Spot `t3.medium` nodes to reduce runtime cost. `desired_size`, `min_size`, and `max_size` remain unchanged; if scheduling pressure returns, revisit Karpenter/Cluster Autoscaler, VPC CNI prefix delegation, workload requests, or re-enable `t3.large` before expanding the add-on footprint again.

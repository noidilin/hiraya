# Dev EKS node instance size

Status: accepted

The dev EKS managed node group will use three Spot `t3.large` nodes instead of three Spot `t3.medium` nodes. The Vintage microservice stack now runs alongside platform add-ons, Gateway API, monitoring, logging, and Argo CD, and the previous `t3.medium` capacity hit the EKS pod-density limit before the AZ-bound `vintage-postgres-0` StatefulSet could schedule. Because the Postgres EBS volume is bound to a single Availability Zone, simply relying on another small node is less deterministic than increasing per-node pod capacity across all existing AZs.

This raises dev runtime cost compared with `t3.medium`, but keeps the topology simple for the portfolio environment and avoids introducing autoscaling or VPC CNI prefix delegation as a prerequisite for the microservice baseline. `desired_size`, `min_size`, and `max_size` remain unchanged for now; future cost optimization can revisit Karpenter/Cluster Autoscaler, prefix delegation, or a smaller add-on footprint once the service image pipeline and GitOps baseline are stable.

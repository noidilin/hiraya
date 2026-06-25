region   = "ap-northeast-1"
vpc_name = "devops-hiraya-dev-vpc"
vpc_cidr = "10.1.0.0/16"

availability_zones = [
  "ap-northeast-1a",
  "ap-northeast-1c",
  "ap-northeast-1d",
]

public_subnet_cidrs = [
  "10.1.1.0/24",
  "10.1.2.0/24",
  "10.1.3.0/24",
]

private_subnet_cidrs = [
  "10.1.11.0/24",
  "10.1.12.0/24",
  "10.1.13.0/24",
]

# Disabled by default to avoid dev log ingestion cost; enable when debugging network traffic.
enable_vpc_flow_logs = false

# Temporary dev access: broad public EKS API access remains explicit while the
# platform is reachable from a changing workstation IP. Replace with /32 CIDRs.
eks_endpoint_public_access       = true
eks_endpoint_private_access      = true
eks_endpoint_public_access_cidrs = ["0.0.0.0/0"]

cluster_name    = "devops-hiraya-dev-eks"
node_group_name = "devops-hiraya-dev-node-group"

# Local/dev workstation applies use the AWS IAM Identity Center Dev role. The
# GitHub infra apply role is always included by main.tf for CI applies.
cluster_admin_principal_arns = [
  "arn:aws:iam::549475122024:role/aws-reserved/sso.amazonaws.com/ap-northeast-1/AWSReservedSSO_Dev_c315945bb49b88d5",
]

instance_types = ["t3.medium"]
capacity_type  = "SPOT"

# Three t3.medium nodes are used while AIOps and CloudWatch pod log forwarding
# are postponed. Prometheus/Grafana observability remains enabled in-cluster.
desired_size = 3
min_size     = 2
max_size     = 3

disk_size = 20

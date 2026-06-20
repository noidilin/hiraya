mock_provider "aws" {}

run "plans_private_node_network_foundation" {
  command = plan

  variables {
    vpc_name           = "test-vpc"
    cidr_block         = "10.1.0.0/16"
    availability_zones = ["ap-northeast-1a", "ap-northeast-1c", "ap-northeast-1d"]
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
    cluster_name = "test-eks"
  }

  assert {
    condition     = length(aws_subnet.public) == 3 && length(aws_subnet.private) == 3
    error_message = "VPC must plan three public edge subnets and three private workload subnets."
  }

  assert {
    condition     = alltrue([for subnet in aws_subnet.public : subnet.map_public_ip_on_launch]) && alltrue([for subnet in aws_subnet.private : !subnet.map_public_ip_on_launch])
    error_message = "Only public edge subnets should map public IPs on launch."
  }

  assert {
    condition     = alltrue([for subnet in aws_subnet.public : subnet.tags["kubernetes.io/role/elb"] == "1"]) && alltrue([for subnet in aws_subnet.private : subnet.tags["kubernetes.io/role/internal-elb"] == "1"])
    error_message = "Subnets must expose Kubernetes public/internal load balancer role tags."
  }

  assert {
    condition     = length(aws_nat_gateway.nat) == 1 && length(aws_route_table.private) == 3 && length(aws_route.private_nat) == 3 && alltrue([for route in aws_route.private_nat : route.destination_cidr_block == "0.0.0.0/0"])
    error_message = "Private subnet route tables must share one NAT Gateway for outbound internet egress."
  }

  assert {
    condition     = aws_vpc_endpoint.s3.vpc_endpoint_type == "Gateway" && length(aws_route_table.private) == 3
    error_message = "Private route tables must include an S3 Gateway VPC endpoint path."
  }

  assert {
    condition     = length(aws_flow_log.vpc) == 0
    error_message = "VPC Flow Logs support must be disabled by default."
  }
}

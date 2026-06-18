region   = "ap-northeast-1"
vpc_name = "devops-hiraya-dev-vpc"
vpc_cidr = "10.1.0.0/16"

subnets = [
  {
    name              = "subnet-1"
    cidr_block        = "10.1.1.0/24"
    availability_zone = "ap-northeast-1a"
  },

  {
    name              = "subnet-2",
    cidr_block        = "10.1.2.0/24",
    availability_zone = "ap-northeast-1c"
  },
  {
    name              = "subnet-3",
    cidr_block        = "10.1.3.0/24",
    availability_zone = "ap-northeast-1d"
  }
]

cluster_name    = "devops-hiraya-dev-eks"
node_group_name = "devops-hiraya-dev-node-group"

instance_types = ["t3.medium"]
capacity_type  = "SPOT"

desired_size = 2
min_size     = 1
max_size     = 2

disk_size = 20

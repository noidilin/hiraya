data "aws_caller_identity" "current" {}

data "aws_partition" "current" {}

locals {
  namespace            = "amazon-cloudwatch"
  service_account_name = "aws-for-fluent-bit"
  oidc_issuer          = replace(var.oidc_issuer_url, "https://", "")

  default_permissions_boundary_arn = "arn:${data.aws_partition.current.partition}:iam::${data.aws_caller_identity.current.account_id}:policy/lab-devops-permissions-boundary"
  permissions_boundary_arn         = coalesce(var.permissions_boundary_arn, local.default_permissions_boundary_arn)

  log_group_arn  = "arn:${data.aws_partition.current.partition}:logs:${var.region}:${data.aws_caller_identity.current.account_id}:log-group:${var.log_group_name}"
  log_stream_arn = "${local.log_group_arn}:log-stream:*"

  tags = merge(var.tags, {
    Terraform          = "true"
    "eks:cluster-name" = var.cluster_name
  })
}

resource "aws_cloudwatch_log_group" "pod_logs" {
  name              = var.log_group_name
  retention_in_days = var.log_retention_days

  tags = merge(local.tags, {
    Name = var.log_group_name
  })
}

data "aws_iam_policy_document" "fluent_bit_assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [var.oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.oidc_issuer}:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.oidc_issuer}:sub"
      values   = ["system:serviceaccount:${local.namespace}:${local.service_account_name}"]
    }
  }
}

resource "aws_iam_role" "fluent_bit" {
  name                 = "${var.cluster_name}-fluent-bit-irsa"
  permissions_boundary = local.permissions_boundary_arn
  assume_role_policy   = data.aws_iam_policy_document.fluent_bit_assume_role.json

  tags = merge(local.tags, {
    Name = "${var.cluster_name}-fluent-bit-irsa"
  })
}

data "aws_iam_policy_document" "fluent_bit_cloudwatch" {
  statement {
    sid = "WritePodLogs"

    actions = [
      "logs:CreateLogStream",
      "logs:DescribeLogStreams",
      "logs:PutLogEvents"
    ]

    resources = [
      local.log_group_arn,
      local.log_stream_arn
    ]
  }
}

resource "aws_iam_role_policy" "fluent_bit_cloudwatch" {
  name   = "FluentBitCloudWatchPolicy"
  role   = aws_iam_role.fluent_bit.id
  policy = data.aws_iam_policy_document.fluent_bit_cloudwatch.json
}

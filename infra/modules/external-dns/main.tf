terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
    kubernetes = {
      source = "hashicorp/kubernetes"
    }
    helm = {
      source = "hashicorp/helm"
    }
  }
}

locals {
  namespace            = "external-dns"
  service_account_name = "external-dns"
  oidc_provider_host   = replace(var.oidc_issuer_url, "https://", "")
}

data "aws_route53_zone" "this" {
  name         = var.hosted_zone_name
  private_zone = false
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [var.oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.oidc_provider_host}:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.oidc_provider_host}:sub"
      values   = ["system:serviceaccount:${local.namespace}:${local.service_account_name}"]
    }
  }
}

resource "aws_iam_role" "external_dns" {
  name                 = "${var.cluster_name}-external-dns"
  permissions_boundary = var.permissions_boundary_arn
  assume_role_policy   = data.aws_iam_policy_document.assume_role.json

  tags = var.tags
}

data "aws_iam_policy_document" "external_dns" {
  statement {
    sid = "Route53ZoneChanges"
    actions = [
      "route53:ChangeResourceRecordSets",
      "route53:ListResourceRecordSets",
      "route53:ListTagsForResources"
    ]
    resources = [data.aws_route53_zone.this.arn]
  }

  statement {
    sid = "Route53ZoneDiscovery"
    actions = [
      "route53:ListHostedZones",
      "route53:ListHostedZonesByName"
    ]
    resources = ["*"]
  }

  statement {
    sid       = "Route53ChangeStatus"
    actions   = ["route53:GetChange"]
    resources = ["arn:aws:route53:::change/*"]
  }
}

resource "aws_iam_policy" "external_dns" {
  name        = "${var.cluster_name}-external-dns"
  description = "Route 53 permissions for ExternalDNS in ${var.cluster_name}."
  policy      = data.aws_iam_policy_document.external_dns.json

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "external_dns" {
  role       = aws_iam_role.external_dns.name
  policy_arn = aws_iam_policy.external_dns.arn
}

resource "kubernetes_namespace_v1" "external_dns" {
  metadata {
    name = local.namespace
  }
}

resource "helm_release" "external_dns" {
  name       = "external-dns"
  namespace  = kubernetes_namespace_v1.external_dns.metadata[0].name
  repository = "https://kubernetes-sigs.github.io/external-dns/"
  chart      = "external-dns"
  version    = var.chart_version

  wait    = true
  timeout = 300

  values = [
    yamlencode({
      provider = {
        name = "aws"
      }
      sources       = ["gateway-httproute"]
      policy        = "sync"
      registry      = "txt"
      txtOwnerId    = var.txt_owner_id
      domainFilters = [var.managed_domain]
      extraArgs = {
        "aws-zone-type"         = "public"
        "aws-zone-match-parent" = null
      }
      triggerLoopOnEvent = true
      serviceAccount = {
        create = true
        name   = local.service_account_name
        annotations = {
          "eks.amazonaws.com/role-arn" = aws_iam_role.external_dns.arn
        }
      }
    })
  ]

  depends_on = [aws_iam_role_policy_attachment.external_dns]
}

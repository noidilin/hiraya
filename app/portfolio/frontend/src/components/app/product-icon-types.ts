export type ProductIconId =
  | 'github'
  | 'github-actions'
  | 'terraform'
  | 'aws'
  | 'aws-vpc'
  | 'aws-eks'
  | 'aws-ecr'
  | 'aws-secrets-manager'
  | 'aws-route53-alb'
  | 'kubernetes'
  | 'argo-cd'
  | 'prometheus'
  | 'grafana'
  | 'postgres'

export function isAwsProductIcon(icon: ProductIconId) {
  return icon === 'aws' || icon.startsWith('aws-')
}

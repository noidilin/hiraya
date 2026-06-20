# Dev platform cutover runbook

Related: [PRD #1](https://github.com/noidilin/hiraya/issues/1), [issue #7](https://github.com/noidilin/hiraya/issues/7), [ADR 0001](../adr/0001-eks-network-redesign.md), [network improvement plan](../plan/network-improvement.md), [infra README](../../infra/README.md).

## Purpose

This runbook documents the human-approved cutover for the dev EKS network redesign. It is intentionally written as a future deployment checklist: preparing this document must not perform the live destroy/apply.

## Safety warning

**Destructive operation:** the approved migration model is to destroy and recreate the disposable dev platform stack. Running `terraform destroy` in `infra/envs/dev/platform` deletes the dev EKS cluster, node group, VPC, NAT Gateway, ALB/Gateway resources, platform add-ons, Terraform-managed ACM validation records for the platform certificate, and Kubernetes workloads in the cluster.

Do not execute the cutover unless all of these are true:

- The maintainer has explicitly approved dev downtime and disposable platform deletion for this session.
- The current branch/commit to deploy has been reviewed.
- Bootstrap and platform Terraform state backends are reachable.
- No one is relying on the current dev cluster, Argo CD, Grafana, or app URL.
- The operator understands this runbook recreates dev infrastructure; it is not an in-place migration.

## Resource ownership boundary

### Durable bootstrap resources: preserve

These resources are outside the disposable platform stack and should not be destroyed during this cutover:

- Externally managed Terraform remote-state S3 bucket.
- `infra/envs/dev/bootstrap` state and resources.
- ECR repositories and image-push IAM/OIDC resources created by the bootstrap stack.
- The Route 53 hosted zone for `noidilin.dev`.
- GitHub repository, Actions secrets/variables, and GitOps manifests.

Use the bootstrap stack only for read-only verification unless a separate bootstrap change is approved.

### Disposable platform stack: recreate

The cutover operates only on `infra/envs/dev/platform`, which owns the dev platform:

- VPC, public/private subnets, route tables, Internet Gateway, NAT Gateway, and S3 Gateway VPC endpoint.
- EKS cluster, private managed node group, OIDC provider, and Kubernetes providers.
- ACM certificate for `hiraya.noidilin.dev` and `*.hiraya.noidilin.dev`, including DNS validation records.
- AWS Load Balancer Controller, Gateway API CRDs, ExternalDNS, edge Gateway, Argo CD, monitoring/Grafana/Prometheus, and Fluent Bit.
- Terraform-owned admin routes and generated Argo CD/Grafana credentials stored in Terraform state.

## Pre-cutover checks

Run these before requesting final approval:

```bash
git status --short
terraform -chdir=infra/envs/dev/platform fmt -check -recursive
terraform -chdir=infra/envs/dev/platform init -backend-config=backend.hcl
terraform -chdir=infra/envs/dev/platform validate
terraform -chdir=infra/envs/dev/platform plan
kubectl kustomize gitops
helm template edge-gateway infra/modules/edge-gateway/chart
helm template argocd-route infra/modules/argocd/admin-route
helm template grafana-route infra/modules/monitoring/admin-route
```

Confirm the platform plan shows the expected private-node redesign, including public/private subnets, single NAT Gateway, S3 Gateway endpoint, EKS private endpoint access, explicit public endpoint CIDRs, AWS Load Balancer Controller, ExternalDNS, Gateway resources, admin routes, and no public Prometheus route.

## Approved cutover procedure

Only run this section after explicit human approval in the deployment session.

1. Announce dev downtime.
2. Confirm the target commit and Terraform workspace/state backend.
3. Destroy only the disposable platform stack:

   ```bash
   cd infra/envs/dev/platform
   terraform destroy
   ```

4. Recreate the platform from the approved commit:

   ```bash
   terraform apply
   ```

5. Update kubeconfig for the recreated cluster if needed:

   ```bash
   aws eks update-kubeconfig --region ap-northeast-1 --name hiraya-dev
   ```

6. Run the post-apply checklist below before declaring cutover complete.

## Post-apply verification checklist

### Terraform outputs

```bash
terraform -chdir=infra/envs/dev/platform output
terraform -chdir=infra/envs/dev/platform output -raw argocd_admin_hostname
terraform -chdir=infra/envs/dev/platform output -raw argocd_admin_password
```

Expected: outputs are present; sensitive admin password retrieval works for the operator and is not committed to Git. Retrieve Grafana credentials using the Terraform output if exposed by the platform stack, or from Terraform state in the deployment session without writing the secret to disk.

### Private node placement

```bash
kubectl get nodes -o wide
aws ec2 describe-instances \
  --filters "Name=tag:eks:cluster-name,Values=hiraya-dev" "Name=instance-state-name,Values=running" \
  --query 'Reservations[].Instances[].{InstanceId:InstanceId,SubnetId:SubnetId,PrivateIp:PrivateIpAddress,PublicIp:PublicIpAddress}' \
  --output table
```

Expected: worker nodes are registered and have private IPs only; `PublicIp` is empty; node subnets match Terraform private subnet outputs.

### EKS endpoint posture

```bash
aws eks describe-cluster --name hiraya-dev \
  --query 'cluster.resourcesVpcConfig.{Private:endpointPrivateAccess,Public:endpointPublicAccess,PublicCidrs:publicAccessCidrs,SubnetIds:subnetIds}'
```

Expected: private endpoint access is `true`; public endpoint access is enabled only as the explicit dev setting; public CIDRs match `infra/envs/dev/platform/terraform.tfvars` and are recognized as temporary dev access.

### NAT and S3 egress

```bash
VPC_ID=$(aws eks describe-cluster --name hiraya-dev --query 'cluster.resourcesVpcConfig.vpcId' --output text)
aws ec2 describe-route-tables --filters "Name=vpc-id,Values=${VPC_ID}"
kubectl run egress-check --rm -i --restart=Never --image=curlimages/curl -- https://github.com
kubectl run s3-check --rm -i --restart=Never --image=amazon/aws-cli -- s3 ls
```

Expected: private route tables point default outbound traffic to the single NAT Gateway; S3 Gateway endpoint is associated with private route tables; test pods can reach required internet/AWS endpoints.

### Controller health

```bash
kubectl get pods -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller
kubectl logs -n kube-system deploy/aws-load-balancer-controller --tail=100
kubectl get pods -n external-dns
kubectl logs -n external-dns deploy/external-dns --tail=100
```

Expected: AWS Load Balancer Controller and ExternalDNS pods are running without repeated reconciliation errors.

### Gateway readiness and route attachment

```bash
kubectl get gateway -A
kubectl describe gateway -n edge public
kubectl get httproute -A
kubectl describe httproute -n vintage frontend
kubectl describe httproute -n argocd argocd
kubectl describe httproute -n monitoring grafana
kubectl get namespace vintage argocd monitoring --show-labels
```

Expected: the shared `edge/public` Gateway is accepted and programmed; app, Argo CD, and Grafana HTTPRoutes are accepted and attached; allowed namespaces carry `hiraya.noidilin.dev/public-gateway-access=true`; Prometheus has no HTTPRoute.

### DNS records

```bash
dig +short hiraya.noidilin.dev
dig +short argocd.hiraya.noidilin.dev
dig +short grafana.hiraya.noidilin.dev
aws route53 list-resource-record-sets --hosted-zone-id <NOIDILIN_DEV_ZONE_ID> \
  --query "ResourceRecordSets[?contains(Name, 'hiraya.noidilin.dev')]"
```

Expected: ExternalDNS-created public records and TXT ownership records exist for app, Argo CD, and Grafana; records target the shared public ALB.

### TLS and HTTP redirect

```bash
curl -I http://hiraya.noidilin.dev
curl -I https://hiraya.noidilin.dev
curl -I https://argocd.hiraya.noidilin.dev
curl -I https://grafana.hiraya.noidilin.dev
openssl s_client -connect hiraya.noidilin.dev:443 -servername hiraya.noidilin.dev </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -dates
```

Expected: HTTP redirects to HTTPS; HTTPS uses a valid ACM certificate covering `hiraya.noidilin.dev` and `*.hiraya.noidilin.dev`.

### App and `/api` behavior

```bash
curl -fsS https://hiraya.noidilin.dev >/tmp/hiraya-home.html
curl -I https://hiraya.noidilin.dev/api
kubectl get svc -n vintage frontend gateway -o wide
kubectl logs -n vintage deploy/frontend --tail=100
```

Expected: frontend loads publicly through the Gateway/ALB; `/api` continues to flow through the frontend nginx proxy to the in-cluster `gateway` service; frontend and gateway Services remain `ClusterIP`.

### Argo CD

```bash
kubectl get pods -n argocd
kubectl get svc -n argocd argocd-server -o jsonpath='{.spec.type}{"\n"}'
curl -I https://argocd.hiraya.noidilin.dev
```

Expected: Argo CD pods are healthy; `argocd-server` remains `ClusterIP`; login page is reachable over HTTPS with Terraform-generated credentials.

### Grafana and Prometheus-private behavior

```bash
kubectl get pods -n monitoring
kubectl get svc -n monitoring | grep -E 'grafana|prometheus'
curl -I https://grafana.hiraya.noidilin.dev
kubectl get httproute -A | grep -i prometheus || true
kubectl -n monitoring port-forward svc/kube-prometheus-stack-prometheus 9090:9090
```

Expected: Grafana is reachable only through the approved public hostname and requires Terraform-generated credentials; Prometheus has no public DNS record/HTTPRoute and is reachable through `kubectl port-forward` only.

## Rollback guidance

If post-apply verification fails and cannot be fixed quickly:

1. Preserve evidence first: Terraform plan/apply output, controller logs, Gateway and HTTPRoute descriptions, ExternalDNS logs, and relevant AWS console screenshots.
2. Revert the network redesign implementation to the previous known-good commit/branch.
3. From `infra/envs/dev/platform`, run a fresh `terraform plan` against the reverted code.
4. After human approval, destroy the failed disposable platform stack and recreate from the previous known-good code:

   ```bash
   terraform destroy
   terraform apply
   ```

5. Re-run the previous platform's known-good smoke tests.

Temporary mitigations while debugging:

- Remove or disable only the broken HTTPRoute if a single hostname is failing.
- Use `kubectl port-forward` for Argo CD, Grafana, or Prometheus operator access.
- Keep Prometheus private; do not add an emergency public route for it.

## Troubleshooting notes

### AWS Load Balancer Controller

Symptoms: Gateway not programmed, no ALB, HTTPRoutes unattached, or repeated controller errors.

Checks:

```bash
kubectl logs -n kube-system deploy/aws-load-balancer-controller
kubectl describe gateway -n edge public
kubectl get events -A --sort-by=.lastTimestamp | tail -50
aws elbv2 describe-load-balancers --names hiraya-dev-public
```

Common causes: missing Gateway API CRDs, invalid Gateway annotations/listeners, IRSA trust or permission boundary mismatch, subnet discovery tags missing, ACM certificate ARN invalid, or AWS quota limits.

### ExternalDNS

Symptoms: DNS records missing, stale, or not targeting the ALB.

Checks:

```bash
kubectl logs -n external-dns deploy/external-dns
kubectl get httproute -A -o yaml | grep -A3 hostnames
aws route53 list-resource-record-sets --hosted-zone-id <NOIDILIN_DEV_ZONE_ID>
```

Common causes: unsupported/incorrect `gateway-httproute` source configuration, missing route attachment, hosted-zone IAM scope mismatch, TXT owner ID conflict, or Route 53 propagation delay.

### ACM certificate

Symptoms: HTTPS listener missing, certificate pending validation, or TLS mismatch.

Checks:

```bash
aws acm list-certificates
aws acm describe-certificate --certificate-arn <CERTIFICATE_ARN>
aws route53 list-resource-record-sets --hosted-zone-id <NOIDILIN_DEV_ZONE_ID> | grep _acme-challenge -A5
```

Common causes: validation records not created, wrong hosted zone, certificate not issued yet, or Gateway referencing the wrong certificate ARN.

### Route 53 and DNS propagation

Symptoms: `dig` returns no records, old ALB, or inconsistent answers.

Checks:

```bash
dig hiraya.noidilin.dev
dig @8.8.8.8 hiraya.noidilin.dev
dig TXT hiraya.noidilin.dev
```

Common causes: propagation delay, ExternalDNS TXT ownership conflict, records outside the managed domain filter, or cached stale records.

### Gateway API reconciliation

Symptoms: `Accepted=False`, `ResolvedRefs=False`, or `Programmed=False` on Gateway/HTTPRoute status.

Checks:

```bash
kubectl describe gateway -n edge public
kubectl describe httproute -n vintage frontend
kubectl describe httproute -n argocd argocd
kubectl describe httproute -n monitoring grafana
kubectl get crd | grep gateway.networking.k8s.io
```

Common causes: namespace missing the public Gateway access label, wrong parentRef namespace/name, backend Service name or port mismatch, missing CRDs, or controller version not supporting the configured Gateway API resources.

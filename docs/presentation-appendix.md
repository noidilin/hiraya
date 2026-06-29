## 附錄 A、技術回顧

Hiraya 最適合以「一次完整交付流程」來呈現：

1. **從 GitHub PR 開始**
   展示 app baseline、test、build、GitOps render validation 與 服務目錄驅動的變更判斷。

2. **建立並推送 container image**
   展示 Buildx、ECR immutable tag、Trivy scan 與 AWS OIDC role assumption。

3. **透過 PR promotion 更新 GitOps manifest**
   展示 image tag promotion 不直接寫入 main，而是由 GitHub App 建立可審查的 PR。

4. **由 Argo CD 同步到 EKS**
   展示 GitOps 期望狀態、sync status、self-heal 與 Kubernetes workloads。

5. **透過 public URL 驗證部署結果**
   展示 `https://hiraya.noidilin.dev`、Gateway API、ExternalDNS、ALB 與 deploy smoke。

6. **在 Grafana 觀察服務狀態**
   展示 dashboard、metrics 與基本維運觀察流程。

7. **示範 rollback path**
   展示以既有 ECR image tag 建立 rollback PR，讓回復流程同樣可審查與可追蹤。

這條 demo storyline 能清楚說明 Hiraya 不是單一 web app，而是一個完整的 cloud-native delivery platform。

### 技術亮點摘要

- **AWS EKS private workload architecture**：private worker nodes + shared public ALB/Gateway。
- **Terraform IaC layering**：長期保留的初始建置、AWS foundation 與 Argo CD 交接 分離。
- **GitHub Actions CI/CD**：PR baseline、image pipeline、infra pipeline、deploy smoke、rollback workflow。
- **GitOps 管理的 cluster 平台**：Argo CD 在初始建置後長期管理 Helm-based 平台附加元件 與 workload manifests。
- **供應鏈安全實務**：ECR immutable tags、scan on push、Trivy 提示型掃描、OIDC credentials。
- **Secrets management**：AWS Secrets Manager + External Secrets Operator 管理 DB、Grafana 與 Argo CD admin credentials。
- **Observability foundation**：Prometheus/Grafana dashboard。

---

## 附錄 B、後續深化方向

為了更接近 production-grade reference architecture，可優先深化以下方向：

1. **Secret rotation and audit**
   在已導入 AWS Secrets Manager 與 External Secrets Operator 的基礎上，補齊定期 rotation、CloudTrail audit review、least-privilege policy review 與 credential access runbook。

2. **Runtime reliability**
   為 frontend、gateway 與 active backend services 加入 readiness/liveness probes、resource requests/limits、HPA、PDB 與多副本策略。

3. **Observability coverage**
   將 ServiceMonitor coverage 從 gateway 擴展到所有 active backend services，並整理 low-cardinality metrics 供 Grafana dashboard 使用。

4. **Security hardening**
   收斂 EKS API public CIDR、加入 Kubernetes NetworkPolicy、讓 Trivy scan 逐步成為 阻擋型檢查門檻，並強化 Argo CD / Grafana public access policy。

透過這些深化方向，Hiraya 可以進一步演進為更完整的 cloud-native platform reference，持續展示 DevOps 與 SRE 的整合能力。

---

## 附錄 C、資料庫與資料持久化策略

資料層相關討論集中於本附錄，避免在主架構章節中混合已實作平台能力與資料庫延伸選項。主文僅保留 `vintage-postgres` 作為 microservice dependency 與可靠性/成本討論中的必要引用。

### A.1 目前 dev database 設計

資料層使用 Kubernetes 內部 PostgreSQL StatefulSet，目的在於讓 dev environment 可完整重建，並同時展示 persistent volume、StorageClass 與 GitOps 初始建置流程的整合方式。

| 項目 | 設計 |
|---|---|
| Database image | `postgres:15-alpine` |
| Kubernetes type | StatefulSet |
| Replica | 1 |
| StorageClass | `hiraya-ebs-gp3` |
| PVC size | 10 GiB |
| Volume type | EBS gp3, encrypted |
| Service | Headless Service `vintage-postgres` |
| Readiness check | `pg_isready -U postgres` |

資料初始化由 GitOps 管理：

- Dev seed data 以 SQL dump 形式納入 GitOps 管理。
- Kustomize 產生 `vintage-db-dump` ConfigMap。
- Restore Job 等待 PostgreSQL ready 後匯入資料。
- Argo CD sync wave 確保 database、restore job 與 application deployment 依序建立。

此設計呈現「環境可重建」的能力：當可重建平台被 destroy 後重新 apply，GitOps 可以再次建立 namespace、database、restore job 與 application workloads，使 demo environment 回到預期狀態。

### A.2 設計取捨與 production data layer option

目前選擇 in-cluster PostgreSQL，是為了在 dev 成本、可展示性與可重建平台之間取得平衡。它適合展示 Kubernetes StatefulSet、EBS CSI、PVC、restore job 與 GitOps sync wave，但不應被解讀為 production-grade database architecture。

若要展示更完整 AWS architecture，可將 in-cluster PostgreSQL 延伸為 Amazon RDS 或 Aurora，並導入以下能力：

- Secrets Manager + External Secrets Operator 管理 database credentials，並定義 rotation / restore drill 流程。
- Automated backup、point-in-time recovery 與 restore drill。
- Migration tool 管理 schema change，而不是只依賴 seed SQL restore。
- Least-privilege IAM 與 network policy / security group boundary。
- Multi-AZ database option 與明確的 RPO/RTO 設計。

因此資料庫策略的定位是：dev 階段以 in-cluster PostgreSQL 支援低成本 demo 與環境可重建；production 延伸則應改由 managed database service 承擔可用性、備份、維運與安全責任。

# Hiraya DevOps Portfolio Evidence Checklist

本清單用來規劃截圖與螢幕錄影素材，目標是證明 Hiraya 不是單一 web app，而是一套完整的 cloud-native delivery platform。優先順序依 portfolio 價值排序。

## P0 — 必備 evidence

### 1. 完整 CI/CD 交付流程

**建議形式**：螢幕錄影

- [ ] 建立一個 application PR
- [ ] 顯示 PR checks：baseline、test、build-only、GitOps render
- [ ] Merge 到 `main`
- [ ] 顯示 image pipeline 開始執行
- [ ] 顯示 image build 成功
- [ ] 顯示 ECR push 成功
- [ ] 顯示 Trivy scan 結果
- [ ] 顯示 bot 建立 manifest promotion PR
- [ ] Merge promotion PR
- [ ] 顯示 Argo CD 自動 sync
- [ ] 顯示 EKS workload rollout
- [ ] 開啟 public storefront 驗證新版本

**價值**：證明平台具備完整 delivery flow，而不只是手動部署 application。

### 2. Argo CD GitOps App-of-Apps 狀態

**建議形式**：截圖 + 短錄影

- [ ] Argo CD root Application
- [ ] child Applications 全部 `Synced / Healthy`
- [ ] platform apps：External Secrets、AWS Load Balancer Controller、ExternalDNS、monitoring
- [ ] Vintage workload app
- [ ] 點進一個 Application 查看 resource tree
- [ ] 顯示 Deployment、Service、HTTPRoute、ExternalSecret 等 resources

**價值**：展示 GitOps ownership，證明 cluster 平台元件與 workloads 由 Argo CD 管理。

### 3. Infrastructure deploy with approval gate

**建議形式**：螢幕錄影

- [ ] GitHub Actions infrastructure deploy workflow
- [ ] Terraform plan artifact / summary
- [ ] GitHub Environment approval gate
- [ ] approval 後才 apply
- [ ] apply platform core
- [ ] apply cluster 初始交接層
- [ ] platform smoke test 成功

**價值**：展示 infrastructure 變更是 gated、可審查、可重建的流程。

### 4. Public endpoint + DNS + HTTPS ingress

**建議形式**：截圖 + 短錄影

- [ ] 開啟 `https://hiraya.noidilin.dev`
- [ ] 顯示 HTTPS certificate 有效
- [ ] 顯示 storefront 可用
- [ ] 開啟 browser devtools network，確認 `/api/products` 正常
- [ ] 顯示 Argo CD / Grafana public endpoints
- [ ] 截圖 Route 53 records 或 ExternalDNS-managed records
- [ ] 截圖 ALB listener / target group health

**價值**：展示 ingress、DNS、TLS、ALB 與 Gateway API 的整合成果。

## P1 — 高價值加分 evidence

### 5. Rollback path

**建議形式**：螢幕錄影

- [ ] 選擇一個 service
- [ ] 顯示目前 image tag
- [ ] 觸發 rollback workflow
- [ ] 選擇既有 ECR image tag
- [ ] workflow 驗證 image tag 存在
- [ ] bot 建立 rollback PR
- [ ] Merge rollback PR
- [ ] Argo CD sync
- [ ] workload rollout 回舊版本
- [ ] storefront / API smoke test 成功

**價值**：展示 rollback 也走 PR 與 GitOps 控制面，而不是手動 patch cluster。

### 6. Secrets Manager + External Secrets

**建議形式**：截圖

- [ ] AWS Secrets Manager secret list：Vintage、Argo CD admin、Grafana admin
- [ ] 不露出 secret value
- [ ] External Secrets Operator pods healthy
- [ ] ExternalSecret status `Ready`
- [ ] Kubernetes Secret 已被 materialize
- [ ] Grafana 使用 externalized admin secret
- [ ] Vintage app 使用 DB runtime secret

**價值**：展示 secret 不進 Git、不進 Terraform output，而是由 AWS Secrets Manager 與 External Secrets Operator 管理。

### 7. Grafana observability dashboard

**建議形式**：短錄影 + 截圖

- [ ] Grafana login
- [ ] Vintage dashboard
- [ ] request rate
- [ ] response time
- [ ] error rate
- [ ] active requests
- [ ] pod CPU / memory
- [ ] pod restart
- [ ] service health
- [ ] 邊操作 storefront 邊觀察 metrics 變化

**價值**：展示 observability 不是只安裝工具，而是能用 dashboard 觀察服務狀態。

### 8. EKS private workload architecture

**建議形式**：截圖

- [ ] EKS node group 位於 private subnets
- [ ] Services 大多為 `ClusterIP`
- [ ] 只有 shared ALB 對外
- [ ] Gateway / HTTPRoute 對外導流
- [ ] security group / subnet route table 截圖
- [ ] NAT Gateway 作為 private egress

**價值**：展示 AWS network boundary 設計，而不是將每個 service 都暴露為 LoadBalancer。

## P2 — 補強可信度 evidence

### 9. ECR image supply chain

**建議形式**：截圖

- [ ] ECR repositories
- [ ] image tag 使用 commit SHA
- [ ] image scan 結果
- [ ] immutable tag setting
- [ ] lifecycle policy（若已設定）

**價值**：補強 artifact traceability 與 container image supply chain practice。

### 10. Terraform state / module layering

**建議形式**：截圖

- [ ] Terraform plan summary
- [ ] state backend / workspace
- [ ] 初始建置層、platform core、cluster 交接層的分層
- [ ] destroy workflow 保留長期資源
- [ ] plan/apply logs 中顯示 resource changes

**價值**：證明 IaC 分層與 lifecycle 管理。

### 11. Deploy smoke test evidence

**建議形式**：截圖

- [ ] GitHub Actions deploy smoke success
- [ ] storefront HTTP status
- [ ] `/api/products` response
- [ ] Argo CD health check
- [ ] public DNS resolution

**價值**：展示部署不是只看 pipeline green，而是真的驗證服務可用。

### 12. Cost control / destroy workflow

**建議形式**：短錄影或截圖

- [ ] Destroy workflow typed confirmation
- [ ] GitOps prune
- [ ] PVC/EBS cleanup
- [ ] destroy cluster 初始交接層
- [ ] destroy platform core
- [ ] 保留 ECR / Secrets / OIDC roles
- [ ] AWS console 確認 EKS/VPC/ALB 已清除

**價值**：展示 dev platform 可銷毀，且成本治理已納入操作流程。

## 最小建議素材組合

如果時間有限，至少準備以下 evidence：

1. [ ] 完整 CI/CD 交付流程錄影（2–4 分鐘）
2. [ ] Argo CD App-of-Apps 截圖
3. [ ] Infrastructure approval gate 錄影
4. [ ] Rollback path 錄影
5. [ ] Grafana dashboard 截圖
6. [ ] Secrets Manager + External Secrets 截圖
7. [ ] Public HTTPS storefront 截圖

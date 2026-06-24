# Hiraya Vintage Storefront + AIOps DevOps Portfolio 報告

## 一、專題概覽與設計理念

本專題在 AWS 雲端環境上，建立一套以精品電商為情境的微服務系統，並整合 DevOps、GitOps、可觀測性與 AI 輔助運維能力。整體架構從本地 Docker Compose 開發環境出發，延伸至 AWS EKS 上的 Kubernetes 部署，搭配 Terraform 建置基礎設施、GitHub Actions 建置容器映像、ArgoCD 管理 GitOps 部署流程，最後以 Prometheus、Grafana 與 Amazon Bedrock Agent 作為 AIOps 診斷層的基礎。

整體設計以「可重建、可驗證、可觀測、可回復」為主軸。AWS 上的 dev platform 由 Terraform 建置，微服務映像由 GitHub Actions 產生並推送至 ECR，Kubernetes desired state 由 Argo CD 依 GitOps 目錄同步到 EKS。應用對外透過 shared HTTPS edge 提供服務，內部工作負載則部署於 private subnets，以接近真實雲端平台的方式呈現網路隔離與交付流程。

本專題展示的能力重點如下：

- **雲端平台設計**：以 AWS EKS、VPC、private subnets、NAT Gateway、S3 Gateway Endpoint、ALB、Route 53 與 ACM 建立可對外展示且可重建的 dev platform。
- **Infrastructure as Code**：使用 Terraform 管理 durable bootstrap resources 與 disposable platform resources，讓環境具備版本化、可審查與可銷毀特性。
- **CI/CD Pipeline**：以 GitHub Actions 建立 PR baseline、container image build、ECR push、manifest promotion、infra plan/apply/destroy 與 rollback workflow。
- **GitOps Deployment**：使用 Argo CD 自動同步 `gitops/` 中的 Kubernetes manifests，讓 Git 成為部署狀態的單一事實來源。
- **Observability**：透過 Prometheus、Grafana 與 CloudWatch Logs 呈現服務監控、dashboard 與集中式日誌能力。
- **AIOps 延伸設計**：以 Kira 作為 AI-assisted SRE assistant 的規劃概念，說明 Amazon Bedrock Agent、Lambda tools、CloudWatch evidence 與 Diagnosis Session 的未來整合方向。

專題的範圍刻意聚焦在 **dev environment**。這代表系統的目標不是宣稱已達 production SLA，而是以合理成本展示 DevOps engineer 在 AWS、Kubernetes、CI/CD、GitOps、IaC 與 observability 上的架構思考與實作能力。

---

## 二、整體架構設計

### 2.1 網路架構

Hiraya 的網路架構部署於 **AWS ap-northeast-1**，以一個專用 VPC 承載 EKS platform 與 shared ingress layer。VPC 使用 public/private subnet 分層設計：public subnets 負責對外入口與 NAT Gateway，private subnets 承載 EKS worker nodes 與應用工作負載。

| 項目 | 設計 |
|---|---|
| VPC | `devops-hiraya-dev-vpc` |
| CIDR | `10.1.0.0/16` |
| Availability Zones | `ap-northeast-1a`, `ap-northeast-1c`, `ap-northeast-1d` |
| Public edge subnets | `10.1.1.0/24`, `10.1.2.0/24`, `10.1.3.0/24` |
| Private workload subnets | `10.1.11.0/24`, `10.1.12.0/24`, `10.1.13.0/24` |
| Outbound egress | Single NAT Gateway |
| AWS private access optimization | S3 Gateway VPC Endpoint |

此設計凸顯三個 DevOps portfolio 重點：

1. **應用服務不直接暴露到公網**
   Frontend、gateway、backend services 皆維持 Kubernetes `ClusterIP`。對外流量集中由 shared ALB 與 Gateway API 控制，避免每個 service 建立自己的 LoadBalancer。

2. **public edge 與 private workloads 分離**
   Public subnets 提供 ALB 與 NAT Gateway 所需的網路位置；EKS nodes 與 pods 位於 private subnets，降低工作負載直接暴露風險。

3. **DNS 與 TLS 自動化**
   ACM certificate 透過 Route 53 DNS validation 建立，ExternalDNS 讀取 Gateway API HTTPRoute hostnames 後管理 public DNS records，讓 GitOps route 與 DNS 自動銜接。

對外流量路徑如下：

`User → Route 53 → ALB → Gateway API Gateway → HTTPRoute → frontend Service → nginx → gateway → backend services`

此入口架構由以下元件組成：

- **Gateway API CRDs**：由 Terraform 管理並安裝到 cluster。
- **AWS Load Balancer Controller**：負責依 Gateway API resources 建立 ALB。
- **Shared Gateway**：位於 `edge` namespace，作為所有 public routes 的統一入口。
- **ExternalDNS**：依 HTTPRoute hostnames 管理 Route 53 records。
- **ACM Certificate**：支援 `hiraya.noidilin.dev` 與 `*.hiraya.noidilin.dev`。
- **HTTP to HTTPS redirect**：由 Gateway layer 處理。

EKS API endpoint 同時啟用 private access 與 public access。public access 是為了讓 GitHub-hosted runners 與開發端在 dev 階段能執行 Terraform 與 Kubernetes 操作；在更嚴格的 production 設計中，可改為限定來源 CIDR 或使用 VPC 內 self-hosted runner 後關閉 public endpoint。

#### 2.1.1 微服務架構

Kubernetes application layer 以 `vintage` namespace 為主要部署邊界。Argo CD 監控 repository 中的 `gitops/` 目錄，並將 manifests 同步至 cluster。

| 元件 | Kubernetes 類型 | Service / Port | 對外性質 | Portfolio 展示重點 |
|---|---|---:|---|---|
| frontend | Deployment + Service + HTTPRoute | 3000 → 80 | Public via Gateway | 對外展示的 Hiraya Furugi storefront；nginx proxy `/api` |
| gateway | Deployment + Service | 3001 | Private | API aggregation layer，統一前端 API entrypoint |
| auth | Deployment + Service | 3002 | Private | 使用者登入、註冊、驗證 |
| product-service | Deployment + Service | 3003 | Private | 商品型錄與 storefront browsing API |
| orders | Deployment + Service | 3005 | Private | Storefront 的主要 order API owner |
| order-service | Deployment + Service | 3004 | Private | legacy service boundary，呈現服務演進情境 |
| user-service | Deployment + Service | 3006 | Private | 使用者資料服務 |
| vintage-postgres | StatefulSet + Headless Service | 5432 | Private | Kubernetes 內部 dev database |

對外展示的主要 endpoint 為：

- Storefront：`https://hiraya.noidilin.dev`
- Argo CD：`https://argocd.hiraya.noidilin.dev`
- Grafana：`https://grafana.hiraya.noidilin.dev`

這讓 portfolio demo 可以從三個角度呈現：

1. **使用者視角**：瀏覽 public storefront。
2. **平台工程視角**：在 Argo CD 查看 GitOps sync 狀態。
3. **維運視角**：在 Grafana 觀察服務 metrics 與 dashboard。

Prometheus 本身保持 `ClusterIP`，避免為了 demo 直接暴露核心監控服務。此設計刻意將「可公開展示的 UI」與「應保留在 cluster 內的 operation surface」分開。

### 2.2 計算與應用層

雲端執行平台為 **Amazon EKS**。目前 dev 環境實測狀態如下：

- **AWS Region**：`ap-northeast-1`
- **EKS Cluster**：`devops-hiraya-dev-eks`
- **Kubernetes 版本**：`1.34`
- **Managed Node Group**：`devops-hiraya-dev-node-group`
- **Instance Type**：`t3.medium`
- **Capacity Type**：`SPOT`
- **節點數量**：desired 3、min 2、max 3
- **單節點可配置資源**：約 1930m CPU、3.2 GiB memory、17 pods
- **磁碟大小**：30 GiB
- **EBS CSI Driver**：透過 EKS Add-on 與 IRSA 啟用，供 PostgreSQL PVC 使用。

#### 2.2.1 規格選擇的決策考量

此組規格的選擇以 **dev environment 可展示性、成本控制與接近真實平台設計** 為主要權衡，而不是追求 production 等級的最大可用性或高吞吐量。

目前平台透過 AWS Load Balancer Controller、Gateway API HTTPRoute、ExternalDNS 與 Route 53 對外發布主要入口：

- `https://hiraya.noidilin.dev`：Vintage Storefront
- `https://argocd.hiraya.noidilin.dev`：Argo CD
- `https://grafana.hiraya.noidilin.dev`：Grafana

### 2.2.1 目前 GitOps Pod 容量使用狀態

本次重建 `cluster-bootstrap` 後，Argo CD 12 個 Application 皆為 `Synced / Healthy`，route smoke test 也通過。當前 dev 叢集在 3 台 `t3.medium` Spot 節點上的 Pod 容量如下：

| 指標 | 數值 |
|---|---:|
| 節點數 | 3 |
| 單節點 pod 上限 | 17 |
| 叢集 pod slot 總數 | 51 |
| 目前 Running pods | 42 |
| 剩餘 pod slot | 9 |

節點分布如下：

| 節點 | Pod 使用量 |
|---|---:|
| `ip-10-1-11-21` | 8 / 17 |
| `ip-10-1-12-124` | 17 / 17 |
| `ip-10-1-13-156` | 17 / 17 |

目前沒有 `MemoryPressure`、`DiskPressure` 或 `PIDPressure`，CPU 與記憶體壓力也偏低；主要限制不是 CPU/memory，而是 **t3.medium 在 EKS 上的 pod/IP 密度**。以目前 42 個 Running pods 來看，3 台 `t3.medium` 足夠支撐 dev GitOps 平台，但容量已偏緊，且其中兩台節點已達 pod slot 上限。

若 Node Group 依照 min size 降到 2 台，總 pod slot 會變成 `2 × 17 = 34`，低於目前 42 個 Running pods，因此 Spot 中斷或短暫縮容時會有 Pod 無法排程的風險。

建議：

- 維持目前功能測試：3 台 `t3.medium` 可接受。
- 提高基本穩定性：將 Node Group `minSize` 調整為 3，避免 2 節點時 pod slot 不足。
- 增加部署餘裕：將 `maxSize` 調整為 4，讓 Spot 替換或短期擴容有緩衝。
- 若後續加入更多 controller、monitoring、AIOps 或多副本服務，建議改用 `t3.large` 或其他 pod/IP 與記憶體餘裕更高的 instance type。

#### 2.2.2 預估成本與支出合理性

以下為 ap-northeast-1 dev environment 若 **24/7 持續運行** 的粗估月成本，實際金額會依 Spot market price、log 量、ALB LCU、NAT data processing 與資料傳輸量變動。

此成本分析方法參考 **AWS Billing and Cost Management** 與 **Well-Architected Cost Optimization Pillar** 的實務做法：先拆分主要 cost drivers，再以 AWS Pricing Calculator / Price List API 驗證單價、以 Cost Explorer 對照實際帳單、以 Budgets 設定 monthly guardrail，並用 Compute Optimizer 或 Cost Optimization Hub 持續檢查 right-sizing 建議。下表屬於架構設計階段的 rough order-of-magnitude estimate；正式營運時應以 Cost Explorer 的 `UnblendedCost` 與實際 usage 為準。

| 成本項目 | 估算假設 | 預估月費（USD） | 合理性說明 |
|---|---|---:|---|
| EKS control plane | 1 個 cluster，約 730 小時/月 | 約 73 | EKS 是本專題展示 Kubernetes、GitOps、Gateway API 與 platform engineering 的核心固定成本。 |
| EC2 Spot worker nodes | 3 × `t3.medium` Spot，desired 3 | 約 35–45 | 以 Spot 換取較低運算成本，同時保留足夠資源給 microservices 與 observability。 |
| EBS volumes | 3 × 20 GiB node disk + 10 GiB PostgreSQL PVC | 約 6–8 | 支援 node runtime 與 dev database persistent volume，成本低且可預期。 |
| NAT Gateway | Single NAT Gateway + 少量 data processing | 約 45–55+ | private nodes 需要對外拉取映像、套件與呼叫 AWS APIs；只用單一 NAT 是 dev 成本與私有網路設計的折衷。 |
| ALB / Gateway ingress | 1 個 shared ALB + 低流量 LCU | 約 18–25 | 以 shared ingress 服務 storefront、Argo CD 與 Grafana，避免每個 service 各建 LoadBalancer。 |
| Route 53 / ACM | 1 個 hosted zone、少量 DNS queries；ACM public certificate | 約 0.5–1 | 支援正式 HTTPS domain demo；ACM certificate 本身不另收費。 |
| CloudWatch Logs | 14 天 retention、低到中等 dev log volume | 約 1–5 | 提供集中式日誌與後續 AIOps evidence，並透過 retention 控制成本。 |
| ECR | 多個 microservice repositories，少量 image storage | 約 1–3 | 保留 image promotion 與 rollback 所需 artifact；可搭配 lifecycle policy 清理舊映像。 |

- 本地：`app/microservices/database/vintage_full.sql`
- K8s：`gitops/apps/vintage/k8s/database/vintage_full.sql`
- Restore Job：`gitops/apps/vintage/k8s/database/restore-job.yml`

目前 `gitops/apps/vintage/kustomization.yml` 已將 SQL dump 建為 ConfigMap，並將 restore job 納入 Kustomize resources；Cluster Bootstrap 佈建 Argo CD root app 後會自動建立 `vintage` Application，由 Argo CD 在首次 sync 時執行 restore job 載入種子資料。

資料庫密碼與連線字串不再以明文 Kubernetes Secret committed 到 Git；Vintage 透過 `ExternalSecret` 從 AWS Secrets Manager `/hiraya/dev/apps/vintage` materialize runtime secret。

#### Container Registry

ECR repositories 由 Terraform bootstrap stack 建立，屬於 durable resources，不會隨 disposable platform destroy 而刪除。

- `hiraya-frontend`
- `hiraya-gateway`
- `hiraya-auth`
- `hiraya-order-service`
- `hiraya-orders`
- `hiraya-product-service`
- `hiraya-user-service`

ECR 設計重點：

- **Immutable image tags**：以 commit SHA 作為部署版本，避免 tag 被覆寫。
- **Scan on push**：上傳映像後自動執行 vulnerability scan。
- **force delete disabled**：降低誤刪 repository 與歷史映像的風險。

#### CI/CD Flow

- 目前觸發方式為 `workflow_dispatch`，也就是手動觸發。
- Matrix 同時建置 7 個服務映像。
- 映像推送至 ECR，tag 使用 Git commit SHA。
- `update-manifests` job 會更新 `gitops/apps/vintage/k8s/` 中的 image tag，並 commit 回 repository。

GitOps 層由 Argo CD 管理：

- Cluster Bootstrap Terraform 透過 Helm 安裝 Argo CD 至 `argocd` namespace。
- Cluster Bootstrap 建立 root `hiraya-root` Application，監控 `gitops/clusters/dev/root` app-of-apps path。
- Root app 建立 Cluster Platform 與 Vintage child Applications；目前已啟用 automated sync，包含 `prune: true` 與 `selfHeal: true`，讓 dev 環境可在首次 provisioning 後自動部署並持續回復到 Git 狀態。

#### Infrastructure Pipeline

可觀測性目前由 Prometheus、Grafana 與 AIOps Assistant 基礎設計組成；Pod log forwarding 待後續 logging design 補齊。

- `infra-ci.yml`：執行 Terraform fmt/validate、module tests、Helm render、GitOps render；trusted PR 可產生 Terraform plan。
- `infra-deploy.yml`：手動觸發 dev deploy，先產生 plan artifact，再經 GitHub Environment approval 後 apply。
- `infra-destroy.yml`：手動觸發 destroy，要求 typed confirmation，並先清理 Kubernetes EBS volumes，避免資源殘留。

Argo CD Cluster Platform 透過 Helm 安裝 `kube-prometheus-stack` 至 `monitoring` namespace：

- Prometheus、Grafana、Alertmanager 皆設為 `ClusterIP`。
- `gitops/apps/vintage/k8s/grafana-dashboard.yml` 以 ConfigMap 方式預載 Vintage dashboard。
- Dashboard 涵蓋 request rate、response time、active requests、error rate、Pod CPU/Memory、Pod restart、service health 等指標。

Hiraya 的 observability layer 目標是讓 operator 能用 dashboard 與 logs 觀察服務狀態，並為後續 AIOps 功能保留可查詢的 evidence source。本章僅描述目前已納入平台設計的監控與日誌基礎；尚未完整實作的 AIOps 功能移至第五章作為後續深化方向討論。

#### Prometheus / Grafana

目前 dev platform 不部署 Fluent Bit，也不建立專用的 Pod log forwarding Log Group。AIOps 的 `fetch_logs` 應等未來 logging design 明確定義允許查詢的 CloudWatch Logs group 後再啟用相關能力。

#### CloudWatch Logs

Fluent Bit module 將 Kubernetes pod logs forward 到 CloudWatch Logs：

- Log group：`/eks/vintage/pods`
- Retention：14 天
- Namespace：`amazon-cloudwatch`
- IAM integration：IRSA role for `aws-for-fluent-bit`

CloudWatch Logs 是後續 AIOps 設計中的主要 evidence source。透過集中式日誌，Kira 可以查詢特定 service、namespace、time range 的錯誤訊息，並整理成診斷脈絡。

---

## 三、AWS Well-Architected Framework 六大支柱對應

本專題以 AWS Well-Architected Framework 作為架構說明語言，呈現設計取捨與工程能力。以下內容不是單純檢查表，而是說明 Hiraya 如何在 dev portfolio 範圍內對應六大支柱。

### 3.1 卓越營運（Operational Excellence）

Terraform 將 durable bootstrap、Platform Core AWS/EKS foundation、Cluster Bootstrap Argo CD handoff 模組化管理；Argo CD 負責 Cluster Platform 與 workload manifests。GitHub Actions 負責建置映像與更新 manifests，Argo CD 負責將 GitOps 狀態同步至 Kubernetes。AIOps Assistant 透過 Bedrock Agent 將 logs、metrics、EKS health 串成診斷流程，協助工程師用資料驅動方式排查問題。

展示重點：

- Terraform 將 bootstrap resources 與 platform resources 分層。
- GitHub Actions 提供 PR validation、image promotion、infra plan/apply/destroy。
- Argo CD 讓 cluster state 持續回到 GitOps desired state。
- Deploy smoke 與 rollback workflow 讓部署後驗證與回復流程可被展示。

使用服務與工具：Terraform, GitHub Actions, EKS, ECR, Argo CD, Route 53, ExternalDNS, AWS Load Balancer Controller, Prometheus, Grafana, CloudWatch Logs

### 3.2 安全性（Security）

安全性設計聚焦在最小暴露面、短期憑證與雲端原生身份整合。Worker nodes 與 services 位於 private subnets，對外入口集中在 shared ALB/Gateway；GitHub Actions 使用 OIDC assume AWS IAM roles，而不是保存長期 access keys。

展示重點：

- Private EKS worker subnets 降低工作負載直接暴露風險。
- Application Services 維持 `ClusterIP`，只透過 Gateway route 對外。
- ACM 提供 HTTPS certificate，Route 53 與 ExternalDNS 管理 DNS。
- ECR immutable tags 與 scan-on-push 提升映像供應鏈安全性。
- IRSA 讓 Kubernetes service accounts 取得 scoped AWS permissions。

延伸強化方向：secrets 可由 GitOps 明文轉向 AWS Secrets Manager、SOPS、Sealed Secrets 或 External Secrets；EKS API public CIDR 可進一步收斂；Trivy scan 可由 advisory 演進為 blocking gate。

使用服務與工具：IAM, OIDC, IRSA, EKS private subnets, ACM, ALB, Route 53, ECR Image Scanning, Kubernetes Secret

### 3.3 可靠性（Reliability）

可靠性設計以可重建環境、GitOps self-healing 與部署後驗證為核心。EKS managed node group 跨三個 private subnets，Argo CD 自動同步 manifests，PostgreSQL 透過 EBS PVC 保留 dev data，deploy smoke 檢查 public storefront 是否可用。

展示重點：

- Managed node group 提供跨 AZ 的 Kubernetes worker capacity。
- GitOps automated sync 可修正非 Git 來源的漂移。
- StatefulSet + EBS PVC 展示 Kubernetes persistent storage。
- Infra destroy workflow 包含 EBS/PVC 清理步驟，降低 teardown 殘留。
- Rollback workflow 以 PR 方式回到指定 ECR image tag。

延伸強化方向：critical services 可增加 replicas、readiness/liveness probes、PodDisruptionBudget、resource requests/limits 與 HPA；資料庫延伸策略集中於附錄 A。

使用服務與工具：EKS Managed Node Group, EBS CSI, Argo CD, GitHub Actions deploy smoke, CloudWatch Logs

### 3.4 效能效率（Performance Efficiency）

效能效率體現在服務拆分、shared ingress、合理的 dev node sizing 與 metrics-driven operation。Gateway 統一前端 API entrypoint，backend services 可獨立 build 與 deploy；Spot `t3.medium` node group 在成本與 demo 容量之間取得平衡。

展示重點：

- 微服務拆分讓 service ownership 與 image pipeline 更清楚。
- Gateway aggregation 減少前端直接依賴多個 backend endpoints。
- nginx same-origin `/api` proxy 降低瀏覽器 CORS 與 routing 複雜度。
- Prometheus/Grafana 提供效能觀測入口。

延伸強化方向：擴充 ServiceMonitor coverage 至所有 active backend services；加入 resource requests/limits 讓 scheduler 與 autoscaling 更準確；以 dashboard 資料做 right-sizing。

使用服務與工具：EKS, Prometheus, Grafana, kube-prometheus-stack, Gateway API, ALB

### 3.5 成本最佳化（Cost Optimization）

專題採取 dev-only disposable platform，以 portfolio demo 成本控制為前提。Durable resources 只保留 ECR 與 IAM 等基礎資源，EKS/VPC/controllers 可透過 workflow destroy。Node group 使用 Spot capacity，public ingress 採 shared ALB，避免每個服務各自建立 LoadBalancer。

展示重點：

- Spot managed node group 降低 compute cost。
- Shared ALB/Gateway 降低 ingress resource 重複建立。
- S3 Gateway Endpoint 減少 private subnets 存取 S3 時經 NAT 的依賴。
- CloudWatch Logs retention 設定為 14 天，控制 log storage 成本。
- Infra destroy workflow 支援 demo 後清除 disposable platform。

成本取捨：EKS control plane、NAT Gateway、ALB、CloudWatch Logs 與 Route 53 仍會產生成本；因此本專題將 destroy workflow 視為成本治理的一部分。

使用服務與工具：EKS, EC2 Spot Managed Node Group, NAT Gateway, ALB, ECR, CloudWatch Logs, Terraform destroy workflow

### 3.6 永續性（Sustainability）

永續性在本 portfolio 中對應到避免閒置資源、減少重複建置與讓環境可關閉。GitOps、immutable image 與 IaC 讓環境能在需要展示時重建，不需要長期維持所有資源常開。

展示重點：

- Disposable platform 降低閒置雲端資源。
- Shared ingress 減少重複 LoadBalancer。
- Spot capacity 與 max node count 限制 dev compute 上限。
- Observability data 可作為後續 right-sizing 依據。
- ECR lifecycle policy 可作為後續映像清理方向。

使用服務與工具：EKS, EC2 Spot, ECR lifecycle, Prometheus, Grafana, Terraform

---

## 四、Portfolio 展示重點

Hiraya 作為 DevOps portfolio，最適合以「一次完整交付流程」來呈現：

1. **從 GitHub PR 開始**
   展示 app baseline、test、build、GitOps render validation 與 service catalog 驅動的變更判斷。

2. **建立並推送容器映像**
   展示 Buildx、ECR immutable tag、Trivy scan 與 AWS OIDC role assumption。

3. **透過 PR promotion 更新 GitOps manifest**
   展示 image tag promotion 不直接寫入 main，而是由 GitHub App 建立可審查的 PR。

4. **由 Argo CD 同步到 EKS**
   展示 GitOps desired state、sync status、self-heal 與 Kubernetes workloads。

5. **透過 public URL 驗證部署結果**
   展示 `https://hiraya.noidilin.dev`、Gateway API、ExternalDNS、ALB 與 deploy smoke。

6. **在 Grafana / CloudWatch 觀察服務狀態**
   展示 dashboard、pod logs 與 operator diagnosis workflow。

7. **示範 rollback path**
   展示以既有 ECR image tag 建立 rollback PR，讓回復流程同樣可審查與可追蹤。

這條 demo storyline 能清楚說明專案不是單一 web app，而是一個完整的 cloud-native delivery platform。

### 技術亮點摘要

- **AWS EKS private workload architecture**：private worker nodes + shared public ALB/Gateway。
- **Terraform IaC layering**：bootstrap durable resources 與 platform disposable resources 分離。
- **GitHub Actions CI/CD**：PR baseline、image pipeline、infra pipeline、deploy smoke、rollback workflow。
- **GitOps with Argo CD**：GitOps application 自動 sync、prune、self-heal。
- **Supply chain practices**：ECR immutable tags、scan on push、Trivy advisory scan、OIDC credentials。
- **Observability foundation**：Prometheus/Grafana dashboard + Fluent Bit to CloudWatch Logs。
- **AIOps roadmap**：Kira 作為尚未完整實作的 Bedrock Agent-based SRE assistant，規劃連接 logs、metrics 與 diagnosis workflow。

---

## 五、AIOps 功能規劃與後續深化方向

第五章聚焦尚未完整實作的 AIOps feature。它不放在第二章的已實作平台架構中，而是作為下一階段深化方向：先說明 Kira 的目標與預期診斷流程，再列出其他 production-grade improvement direction。

### 5.1 AIOps feature：Kira

Kira 是本專題規劃中的 AI-assisted SRE assistant。它的目標不是取代 operator，而是幫助 operator 更快完成以下工作：

1. 收集 CloudWatch Logs、CloudWatch Metrics 與 EKS health evidence。
2. 將錯誤訊息、時間線與服務狀態整理成 Diagnosis Session。
3. 產生可能根因、影響範圍與修復建議。
4. 將分析結果回饋給 operator，由人類決定是否採取修復行動。

目前 `app/aiops/` 保留可展示的原型元素，但尚未視為正式完成的 platform feature：

- Streamlit UI
- Bedrock Agent deploy script
- IAM setup script
- Lambda action tools
- OpenAPI schemas

正式設計方向以 ADR 0002 為準：Kira 應查詢 **CloudWatch Logs + CloudWatch Metrics**，其中 metrics 由 ADOT 從 cluster 內部 export 到 CloudWatch。這個方向避免把 Prometheus 直接暴露給外部工具，也讓 AIOps integration 更貼近 AWS-native operation model。

AIOps 在 portfolio 中的價值，是把傳統 DevOps pipeline、observability 與 incident diagnosis 串成一個完整故事：

`Service change → CI/CD → GitOps deploy → Monitoring/logging → Incident evidence → Kira diagnosis → Operator decision`

### 5.2 AIOps 優先實作方向

1. **CloudWatch metric path**
   依 ADR 0002 實作 ADOT → CloudWatch Metrics，讓 Kira 的 Lambda tools 查詢 CloudWatch Logs / Metrics / EKS APIs，而不是直接依賴 Prometheus endpoint。

2. **Bedrock Agent action boundary**
   將 Lambda tools 限定為 read-only diagnosis actions，例如查詢 log、查詢 metrics、讀取 deployment 狀態與整理事件時間線，避免 AI assistant 直接執行破壞性修復。

3. **Diagnosis Session model**
   定義一次診斷需要保存的欄位：incident window、affected service、evidence links、hypothesis、recommended action 與 operator decision，讓 AIOps 輸出可審查、可回顧。

4. **Demo integration**
   將 Kira flow 與既有 storefront / Grafana / CloudWatch demo 串接，讓 portfolio 能展示「部署 → 觀測 → 診斷」的完整流程。

### 5.3 其他後續深化方向

為了讓 portfolio 更接近 production-grade reference architecture，可在 AIOps 之外優先深化以下方向：

1. **Secrets management**
   將 GitOps 中的資料庫密碼與 connection string 移出明文 manifests，導入 AWS Secrets Manager、External Secrets、SOPS 或 Sealed Secrets。

2. **Runtime reliability**
   為 frontend、gateway 與 active backend services 加入 readiness/liveness probes、resource requests/limits、HPA、PDB 與多副本策略。

3. **Observability coverage**
   將 ServiceMonitor coverage 從 gateway 擴展到所有 active backend services，並整理 low-cardinality metrics 供 Grafana 與 Kira 使用。

4. **Security hardening**
   收斂 EKS API public CIDR、加入 Kubernetes NetworkPolicy、讓 Trivy scan 逐步成為 blocking gate，並強化 Argo CD / Grafana credential handling。

5. **Application modernization**
   延續 Hiraya Furugi frontend rebrand / Vite migration，使 storefront UI 更適合 portfolio presentation，同時驗證現有 CI/CD pipeline 對實際功能改版的支援能力。

透過這些深化方向，Hiraya 可以從 dev portfolio 進一步演進為更完整的 cloud-native platform reference，持續展示 DevOps、SRE 與 AIOps 的整合能力。

---

## 附錄 A、資料庫與資料持久化策略

資料層相關討論集中於本附錄，避免在主架構章節中混合已實作平台能力與資料庫延伸選項。主文僅保留 `vintage-postgres` 作為 microservice dependency 與可靠性/成本討論中的必要引用。

### A.1 目前 dev database 設計

資料層使用 Kubernetes 內部 PostgreSQL StatefulSet，目的在於讓 dev environment 可完整重建，並同時展示 persistent volume、StorageClass 與 GitOps bootstrap 的整合方式。

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

- `gitops/k8s/database/vintage_full.sql` 保存 dev seed data。
- Kustomize 產生 `vintage-db-dump` ConfigMap。
- Restore Job 等待 PostgreSQL ready 後匯入資料。
- Argo CD sync wave 確保 database、restore job 與 application deployment 依序建立。

此設計展示了「環境可重建」的能力：當 disposable platform 被 destroy 後重新 apply，GitOps 可以再次建立 namespace、database、restore job 與 application workloads，使 demo environment 回到預期狀態。

### A.2 設計取捨與 production data layer option

本 portfolio 目前選擇 in-cluster PostgreSQL，是為了在 dev 成本、可展示性與可銷毀平台之間取得平衡。它適合展示 Kubernetes StatefulSet、EBS CSI、PVC、restore job 與 GitOps sync wave，但不應被解讀為 production-grade database architecture。

若要展示更完整 AWS architecture，可將 in-cluster PostgreSQL 延伸為 Amazon RDS 或 Aurora，並導入以下能力：

- Secrets Manager 或 External Secrets 管理 database credentials。
- Automated backup、point-in-time recovery 與 restore drill。
- Migration tool 管理 schema change，而不是只依賴 seed SQL restore。
- Least-privilege IAM 與 network policy / security group boundary。
- Multi-AZ database option 與明確的 RPO/RTO 設計。

因此資料庫策略的定位是：dev 階段以 in-cluster PostgreSQL 支援低成本 demo 與環境可重建；production 延伸則應改由 managed database service 承擔可用性、備份、維運與安全責任。

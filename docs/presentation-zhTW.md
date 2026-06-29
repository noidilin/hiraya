# Hiraya Vintage Storefront DevOps 架構流程設計

## 一、方案概覽與設計理念

Hiraya 在 AWS 雲端環境上建立一套以二手古著電商為情境的微服務系統，並整合 DevOps 與 GitOps。整體架構從本地 Docker Compose 開發環境出發，延伸至 AWS EKS 上的 Kubernetes 部署，搭配 Terraform 建置 AWS foundation 與初始建置資源、GitHub Actions 建置 Container Image、Argo CD 管理 GitOps 部署流程，並以 Prometheus 與 Grafana 作為目前主要監控基礎。

整體設計以「可重建、可驗證、可觀測、可回復」為主軸。AWS foundation 與 EKS 基礎由 Terraform 建置，Microservice Image 由 GitHub Actions 產生並推送至 ECR，Kubernetes 平台附加元件與 Application 的期望狀態則由 Argo CD 依 GitOps 期望狀態同步到 EKS。應用對外透過 Shared HTTPS Edge 提供服務，內部工作負載則部署於 Private Subnets，以接近真實雲端平台的方式呈現網路隔離與交付流程。

Hiraya 架構設計如下：

- 雲端平台設計：以 AWS EKS、VPC、private subnets、NAT Gateway、S3 Gateway Endpoint、ALB、Route 53 與 ACM 建立可對外展示且可重建的 Dev 環境。
- Infrastructure as Code：使用 Terraform 管理長期保留的初始建置資源、AWS foundation、EKS、IRSA 與 Secrets Manager resources，讓環境具備版本化、可審查與可銷毀特性。
- CI/CD Pipeline：以 GitHub Actions 建立 PR baseline、container image build、ECR push、manifest promotion、infra plan/apply/destroy 與 rollback workflow。
- GitOps Deployment：使用 Argo CD 自動同步 Cluster 平台附加元件與 Workload Manifests，讓 Git 成為 Kubernetes 部署狀態的單一事實來源。
- Observability：透過 Prometheus 與 Grafana 呈現服務監控與 Dashboard。

目前以 Dev 環境為主要規劃重點，以合理成本展示 DevOps 工程師在 AWS、Kubernetes、CI/CD、GitOps、IaC 與 Observability 上的架構設計與落地能力。

---

## 二、整體架構設計

從 AWS 網路邊界、Kubernetes 微服務邊界、Secrets 管理，到 Observability 入口，說明系統如何在 EKS 上形成可對外服務、可維運、可重建的整體平台。

### 2.1 AWS 網路架構

Hiraya 的網路架構部署於 AWS ap-northeast-1，以一個專用 VPC 承載 EKS 與 Shared Ingress Layer。VPC 使用 Public/Private Subnet 分層設計：Public Subnets 負責對外入口與 NAT Gateway，Private Subnets 承載 EKS Worker Nodes 與應用工作負載。

| 項目 | 設計 |
|---|---|
| VPC | `devops-hiraya-dev-vpc` |
| CIDR | `10.1.0.0/16` |
| Availability Zones | `ap-northeast-1a`, `ap-northeast-1c`, `ap-northeast-1d` |
| Public edge subnets | `10.1.1.0/24`, `10.1.2.0/24`, `10.1.3.0/24` |
| Private workload subnets | `10.1.11.0/24`, `10.1.12.0/24`, `10.1.13.0/24` |
| Outbound egress | Single NAT Gateway |
| AWS private access optimization | S3 Gateway VPC Endpoint |

設計的初衷是希望達到：

1. 應用服務不直接暴露到公網
   Frontend、Gateway、Backend Services 皆維持 Kubernetes `ClusterIP`。對外流量集中由 Shared ALB 與 Gateway API 控制，避免每個 Service 建立自己的 LoadBalancer。
2. Public Edge 與 Private Workloads 分離
   Public Subnets 提供 ALB 與 NAT Gateway 所需的網路位置；EKS Nodes 與 Pods 位於 Private Subnets，降低工作負載直接暴露風險。
3. DNS 與 TLS 自動化
   ACM Certificate 透過 Route 53 DNS Validation 建立，ExternalDNS 讀取 Gateway API HTTPRoute Hostnames 後管理 Public DNS Records，讓 GitOps Route 與 DNS 自動銜接。

目前平台透過 AWS Load Balancer Controller、Gateway API HTTPRoute、ExternalDNS 與 Route 53 對外發布主要入口：

- `https://hiraya.noidilin.dev`：Vintage Storefront
- `https://argocd.hiraya.noidilin.dev`：Argo CD
- `https://grafana.hiraya.noidilin.dev`：Grafana

而用戶連接路徑如下：

`User → Route 53 → ALB → Gateway API Gateway → HTTPRoute → Frontend Service → Nginx → Gateway → Backend Services`

此入口架構由以下元件組成：

- Gateway API CRDs：由 Argo CD 納入 GitOps 管理的 Cluster 平台。
- AWS Load Balancer Controller：負責依 Gateway API Resources 建立 ALB。
- Shared Gateway：位於 `edge` Namespace，作為所有 Public Routes 的統一入口。
- ExternalDNS：依 HTTPRoute Hostnames 管理 Route 53 Records。
- ACM Certificate：支援 `hiraya.noidilin.dev` 與 `*.hiraya.noidilin.dev`。
- HTTP to HTTPS Redirect：由 Gateway Layer 處理。

EKS API Endpoint 同時啟用 Private Access 與 Public Access。Public Access 是為了讓 GitHub-hosted Runners 與開發端在 Dev 階段能執行 Terraform 與 Kubernetes 操作；在更嚴格的 Production 設計中，可改為限定來源 CIDR 或使用 VPC 內 Self-Hosted Runner 後關閉 Public Endpoint。

### 2.2 微服務架構

Kubernetes Application Layer 以 `vintage` Namespace 為主要部署邊界。Argo CD 持續監控 Git 中的期望狀態，並將 Manifests 同步至 Cluster。

| 元件 | Kubernetes 類型 | Service / Port | 對外性質 | 設計意圖 |
|---|---|---:|---|---|
| frontend | Deployment + Service + HTTPRoute | 3000 → 80 | Public via Gateway | 對外展示的 Hiraya Furugi storefront；nginx proxy `/api` |
| gateway | Deployment + Service | 3001 | Private | API aggregation layer，統一前端 API entrypoint |
| auth | Deployment + Service | 3002 | Private | 使用者登入、註冊、驗證 |
| product-service | Deployment + Service | 3003 | Private | 商品型錄與 storefront browsing API |
| orders | Deployment + Service | 3005 | Private | Storefront 的主要 order API owner |
| order-service | Deployment + Service | 3004 | Private | legacy service boundary，呈現服務演進情境 |
| user-service | Deployment + Service | 3006 | Private | 使用者資料服務 |
| vintage-postgres | StatefulSet + Headless Service | 5432 | Private | Kubernetes 內部 dev database |

此分層讓 Frontend 成為唯一對外的 Application Entry Point；Gateway 負責聚合 API，Backend Services 則保持私有服務邊界。Argo CD 負責讓每個 Deployment、Service、HTTPRoute 與 Secret reference 持續收斂到 Git 中的期望狀態。

### 2.3 Secrets 與資料初始化機制

資料初始化由 GitOps 管理。Seed SQL 會被包裝成 Kubernetes ConfigMap，Restore Job 會在 PostgreSQL Ready 後自動載入資料。Cluster 初始交接層完成 Argo CD 交接後，Argo CD 會建立 Vintage Application，並在首次同步時依 Sync Wave 建立 Database、Restore Job 與 Application Workloads。

資料庫密碼與連線字串不以明文 Kubernetes Secret Committed 到 Git；Vintage 透過 `ExternalSecret` 從 AWS Secrets Manager `/hiraya/dev/apps/vintage` Materialize Runtime Secret。

平台管理介面的 Admin Credentials 也由 AWS Secrets Manager 管理：Argo CD 使用 `/hiraya/dev/platform/argocd-admin`，Grafana 使用 `/hiraya/dev/platform/grafana-admin`。Cluster 初始交接層讀取 Argo CD Admin bcrypt hash 進行初始安裝；Grafana 則透過 External Secrets Operator 將 `grafana-admin` Kubernetes Secret materialize 到 `monitoring` Namespace，供 `kube-prometheus-stack` Helm Values 引用。Secret Values 不作為 Terraform Output，也不 Committed 到 Git。

### 2.4 可觀測性基礎

Hiraya 的 Observability 目標是讓 Operator 能用 Dashboard 觀察服務狀態，可觀測性目前由 Prometheus 與 Grafana 基礎設計組成。

Argo CD 透過 Monitoring Application 安裝 kube-prometheus-stack Helm Chart 至 `monitoring` Namespace：

- Prometheus、Grafana、Alertmanager 皆設為 `ClusterIP`。
- Vintage Dashboard 以 ConfigMap 方式預載至 Grafana。
- Dashboard 涵蓋 Request Rate、Response Time、Active Requests、Error Rate、Pod CPU/Memory、Pod Restart、Service Health 等指標。

Prometheus 本身保持 `ClusterIP`，避免為了在 Demo 中直接暴露核心監控服務。此設計刻意將「可公開展示的 UI」與「應保留在 Cluster 內的維運操作面」分開。

---

## 三、硬體及費用試算

本章聚焦 EKS 運算與儲存資源選型、目前 Pod 容量使用狀態與 24/7 運行成本估算，將架構設計轉換成可量化的容量與費用假設。

### 3.1 EKS 運算與儲存規格選型

雲端執行平台為 Amazon EKS。目前 Dev 環境實測狀態如下：

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

此組規格的設計以 Dev 環境出發為考量進行成本控制，而不是追求 Production 等級的最大可用性或高吞吐量。

### 3.2 目前 EKS Pod 容量使用狀態

Argo CD 12 個 Application 皆為 `Synced / Healthy`，Route Smoke Test 也通過。當前 Dev Cluster 在 3 台 `t3.medium` Spot 節點上的 Pod 容量如下：

| 指標 | 數值 |
|---|---:|
| 節點數 | 3 |
| 單節點 Pod 上限 | 17 |
| Cluster Pod Slot 總數 | 51 |
| 目前 Running Pods | 42 |
| 剩餘 Pod Slot | 9 |

節點分布如下：

| 節點 | Pod 使用量 |
|---|---:|
| `ip-10-1-11-21` | 8 / 17 |
| `ip-10-1-12-124` | 17 / 17 |
| `ip-10-1-13-156` | 17 / 17 |

目前沒有 `MemoryPressure`、`DiskPressure` 或 `PIDPressure`，CPU 與記憶體壓力也偏低；主要限制不是 CPU/Memory，而是 t3.medium 在 EKS 上的 Pod/IP 密度。以目前 42 個 Running Pods 來看，3 台 `t3.medium` 足夠支撐 dev GitOps 平台，但容量已偏緊，且其中兩台節點已達 Pod Slot 上限。

若 Node Group 依照 min size 降到 2 台，總 Pod Slot 會變成 `2 × 17 = 34`，低於目前 42 個 Running Pods，因此 Spot 中斷或短暫縮容時會有 Pod 無法排程的風險。

因此最終決定採取以下設計：

- 維持目前功能測試：3 台 `t3.medium` 可接受。
- 提高基本穩定性：將 Node Group `minSize` 調整為 3，避免 2 節點時 Pod Slot 不足。
- 增加部署餘裕：將 `maxSize` 調整為 4，讓 Spot 替換或短期擴容有緩衝。
- 若後續加入更多 Controller、Monitoring 或多副本服務，建議改用 `t3.large` 或其他 Pod/IP 與記憶體餘裕更高的 Instance Type。

### 3.3 預估成本與支出合理性

以下為 ap-northeast-1 Dev 環境若 24/7 持續運行的粗估月成本，實際金額會依 Spot 市場價格、ALB LCU、NAT Data Processing 與資料傳輸量變動。

此成本分析方法參考 AWS Billing and Cost Management 與 Well-Architected Cost Optimization Pillar 的實務做法：先拆分主要 Cost Drivers，再以 AWS Pricing Calculator / Price List API 驗證單價、以 Cost Explorer 對照實際帳單、以 Budgets 設定 Monthly Guardrail，並用 Compute Optimizer 或 Cost Optimization Hub 持續檢查 Right-Sizing 建議。下表屬於架構設計階段的 Rough Order-of-magnitude Estimate；正式營運時應以 Cost Explorer 的 `UnblendedCost` 與實際 Usage 為準。

| 成本項目 | 估算假設 | 預估月費（USD） | 合理性說明 |
|---|---|---:|---|
| EKS Control Plane | 1 個 cluster，約 730 小時/月 | 約 73 | EKS 是展示 Kubernetes、GitOps、Gateway API 與 platform engineering 的核心固定成本。 |
| EC2 Spot Worker Nodes | 3 × `t3.medium` Spot，desired 3 | 約 35–45 | 以 Spot 換取較低運算成本，同時保留足夠資源給 microservices 與 observability。 |
| EBS Volumes | 3 × 20 GiB node disk + 10 GiB PostgreSQL PVC | 約 6–8 | 支援 node runtime 與 dev database persistent volume，成本低且可預期。 |
| NAT Gateway | Single NAT Gateway + 少量 data processing | 約 45–55+ | private nodes 需要對外拉取 image、套件與呼叫 AWS APIs；只用單一 NAT 是 dev 成本與私有網路設計的折衷。 |
| ALB / Gateway Ingress | 1 個 shared ALB + 低流量 LCU | 約 18–25 | 以 shared ingress 服務 storefront、Argo CD 與 Grafana，避免每個 service 各建 LoadBalancer。 |
| Route 53 / ACM | 1 個 hosted zone、少量 DNS queries；ACM public certificate | 約 0.5–1 | 支援正式 HTTPS domain demo；ACM certificate 本身不另收費。 |
| Secrets Manager | Vintage、Argo CD、Grafana 等少量 secrets | 約 1–2 | 將 runtime/admin credentials 外部化，避免密碼進入 Git 或 Terraform outputs。 |
| ECR | 多個 microservice repositories，少量 image storage | 約 1–3 | 保留 image promotion 與 rollback 所需 artifact；可搭配 lifecycle policy 清理舊 image。 |

---

## 四、完整軟體開發週期 CI/CD 流程設計

Hiraya 的交付管線以完整 SDLC 為核心，將整體流程分成五個責任清楚的交付機制：Pull Request Validation、Image 發布、GitOps Promotion、Infrastructure 交付與 Rollback。這樣的設計讓每一次變更都能被驗證、審查、追蹤與回復。

核心設計決策如下：

1. 先驗證，後授權：PR 階段先執行不需要雲端權限的測試、建置與 Manifest Rendering；只有可信任的 main Branch 或經核准的 Environment 才能取得 AWS OIDC 權限。
2. 先產生 Artifact，再部署：服務先被建置成 Immutable Container Image，並以 Commit SHA 作為部署版本，讓 Source、Image 與執行期狀態可以對應。
3. Git 作為 Deployment 契約：CI 不直接修改 Kubernetes Runtime；所有部署狀態都透過 GitOps Manifest PR 推進，合併後由 Argo CD Reconciliation 落地。
4. Infrastructure 變更需受控：Infrastructure 變更需要人工觸發、環境核准與 Plan 審查證據，並與一般 Application 發布分離。
5. Rollback 走同一條控制路徑：回復不是手動 Patch Cluster，而是提交 Rollback Manifest PR，再由 Argo CD 將期望狀態收斂到指定版本。

### 4.1 Pull Request 驗證流程

所有 PR 先進入低權限驗證關卡。此階段不提供 AWS Credentials，也不允許 Registry 寫入權限或 Cluster 變更。Pipeline 會根據服務目錄判斷變更範圍，只對受影響的 Microservices 執行必要檢查，避免無差別建置造成等待時間與成本浪費。

PR Validation 包含：

- 服務歸屬分類：判斷變更屬於 Frontend、Gateway、Backend Service、GitOps Manifest 或 Infrastructure Layer。
- Application Baseline：執行套件相依圖檢查、服務目錄驗證、Backend Contract Tests、Frontend Unit Tests、Static Build、typecheck 與 lint。
- GitOps Render Validation：驗證 Deployment Manifests、服務連線設定、路由設定、連接埠對應與環境變數契約是否一致。
- Docker 僅建置 Gate：若變更會影響 Image，PR 只執行僅建置，不推送 Image，也不登入 ECR。
- Infrastructure Static Checks：對 Terraform Modules、Helm/Kustomize Render Output 與 Kubernetes Schema 進行靜態驗證；可信任 PR 會額外產生 Terraform Plan 審查證據供 Reviewer 判斷。

這個階段的目標是讓 Reviewer 在 merge 前取得充分審查證據：測試結果、Container Buildability、GitOps Render 結果與 Infrastructure Plan。雲端寫入權限被延後到後續可信任階段，降低 Supply Chain 與權限濫用風險。

### 4.2 Image 發布與 artifact promotion 流程

當 Application Change 合併到受保護的 main Branch 後，Pipeline 才進入 Image 發布流程。系統會重新偵測 Changed Services，並在取得 AWS Credentials 前再次執行 Baseline Validation，確保 main Branch 狀態仍然可建置、可測試、可部署。

Image 發布設計如下：

1. 只針對受影響服務建立 Build Matrix，避免每次都建置全部 Microservices。
2. GitHub Actions 透過 OIDC 取得短期 AWS Credentials，並只授權推送指定 ECR Repositories。
3. 每個 Image 使用 Git commit SHA 作為 Tag，形成不可混淆的 Deployment Artifact。
4. Image Build 目標平台固定為 Linux/amd64，確保在 EKS Worker Nodes 上行為一致。
5. Vulnerability Scan 在 Image Push 前後提供 HIGH/CRITICAL 風險可視性；目前定位為提示型檢查門檻，後續可提升為阻擋型檢查門檻。
6. Image Publish 完成後，Pipeline 不直接部署，而是建立 Manifest Promotion PR。

Artifact Promotion 透過 Git PR 完成。Promotion PR 只更新對應服務的 image tag，diff 小、容易審查，也能套用 Branch Protection、Required Checks 與 Reviewer Process。這讓「Build Artifact」與「Deployment 期望狀態」解耦：ECR 保存可部署 Artifact，GitOps Manifest 決定哪個 Artifact 進入環境。

ECR Repositories 由長期保留的初始建置層管理，不會隨可重建 EKS Platform Destroy 而刪除。這使 Image History、Rollback Targets 與供應鏈追蹤證據可以跨平台重建保存。

### 4.3 GitOps 同步與部署流程

Manifest Promotion PR 合併後，Git 成為唯一 Deployment 契約。Argo CD 監控 main Branch 期望狀態，並將變更同步到 EKS。這個模式避免 CI Runner 持有長期 Cluster 變更責任，也讓 Runtime Drift 可以被自動偵測與修正。

GitOps 同步設計如下：

- Cluster 初始交接層只負責建立 Argo CD、AppProjects 與 Root Application，完成 Terraform 到 GitOps 的交接。
- Root Application 採 app-of-apps 模式，建立 Cluster 平台層與 Vintage Workload Child Applications。
- Argo CD 長期擁有 Kubernetes 平台附加元件，包括 Namespaces、Gateway API CRDs、StorageClass、External Secrets Operator、AWS Load Balancer Controller、ExternalDNS、Edge Gateway Resources、Monitoring Stack、對外 Admin 介面路由與 Vintage Workloads。
- Application Image Tag 變更會更新 Deployment Template，觸發 Kubernetes Rollout；Service 與 HTTPRoute 維持穩定名稱，讓流量入口不因版本變更而改變。
- GitOps Merge 後會執行對外 Smoke Test，確認 Storefront Shell 與主要 API Path 可用，提供部署驗證證據。

這個設計讓 CI/CD 職責邊界清楚：CI 負責驗證、建置、掃描與提出期望狀態變更；Argo CD 負責部署、同步與 Drift Correction；Kubernetes 負責 Rollout 與 Service Routing。

### 4.4 Infrastructure 交付流程

Infrastructure 交付流程被設計成獨立且受控的變更通道。VPC、EKS、IAM、DNS、ACM、IRSA 與 Platform Admin Secrets 都屬於高權限、高影響範圍資源，因此不與一般 Application Image Promotion 混在同一條自動部署路徑。

Infrastructure 分層如下：

| Layer | Owner / executor | 負責內容 | Lifecycle |
|---|---|---|---|
| 專案初始建置層 | Terraform / Reviewed Setup | Remote State Access、GitHub OIDC Roles、ECR、長期保留的 Runtime Secrets | 長期保留 |
| 平台核心層 | Environment-gated Terraform Apply | VPC、EKS、Node Group、ACM/DNS Primitives、AWS-side IRSA Roles、admin Secrets | 可重建 |
| Cluster 初始交接層 | Environment-gated Terraform Apply | Argo CD Installation、AppProjects、root Application 交接 | 平台核心層重建後重新建立 |
| Cluster 平台層 | Argo CD | Controllers、CRDs、Namespaces、Shared Gateway、Monitoring | 持續 GitOps sync |
| GitOps 應用層 | Argo CD | Vintage Storefront Workload Manifests | 持續 GitOps sync |

Deploy 流程先產生 Refreshed Terraform Plan 作為審查證據，經 GitHub Environment 核准後才 Apply 平台核心層。EKS 與 AWS-side Prerequisites 完成後，Cluster 初始交接層再安裝 Argo CD 並交接 root Application。最後由平台 Smoke Test 驗證 Namespace、Gateway、HTTPRoute、Argo CD Application Health 與 Public Endpoints。

Destroy 流程採反向順序：先暫停或 Prune GitOps Resources，保留 AWS Load Balancer Controller 與 ExternalDNS 足夠時間清理 ALB/DNS 連帶資源，再清理 PVC/EBS，最後 Destroy Cluster 初始交接層與平台核心層。專案初始建置層保留，確保 ECR、OIDC Roles、State Access 與長期保留的 Secrets 可支援下次重建。

### 4.5 Rollback 與維運證據

Rollback 使用與 Deployment 相同的 GitOps 控制面。Operator 選定服務與既有 ECR Image Tag 後，Pipeline 會驗證目標 Artifact 存在、產生 Manifest Diff、執行 Render Validation，然後建立 Rollback PR。PR 合併後，Argo CD 將執行期狀態收斂到指定 Image Tag。

這個機制讓 Rollback 也具備審查紀錄與可追蹤性：每次回復都有原因、目標版本、Manifest diff、Validation Result 與後續 Smoke Test 證據。整體 SDLC 審查證據包含 PR diff、Baseline Summary、Docker Build Result、Vulnerability Scan Report、Terraform Plan、Promotion / Rollback diff、Argo CD Sync Health 與 Public Smoke Result。

---

## 五、AWS Well-Architected Framework 六大支柱對應

Hiraya 以 AWS Well-Architected Framework 作為架構原則，呈現設計取捨與工程能力。以下說明系統如何在 Hiraya 的設計中對應六大支柱。

### 5.1 卓越營運（Operational Excellence）

Terraform 將長期保留的初始建置、平台核心層 AWS/EKS Foundation、Cluster 初始交接層的 Argo CD 交接進行模組化管理；Argo CD 負責長期同步 Cluster 平台層與 Workload Manifests。GitHub Actions 負責建置 Image 與更新 Manifests，Argo CD 負責將 GitOps 狀態同步至 Kubernetes。Prometheus 與 Grafana 提供監控基礎，協助工程師用資料驅動方式排查問題。

展示重點：

- Terraform 將長期保留的初始建置、AWS foundation 與 Argo CD 交接分層管理。
- GitHub Actions 提供 PR validation、image promotion、infra plan/apply/destroy。
- Argo CD 讓 Cluster 狀態持續回到 GitOps 期望狀態。
- Deploy Smoke 與 Rollback workflow 讓部署後驗證與回復流程可被展示。

使用服務與工具：Terraform, GitHub Actions, EKS, ECR, Argo CD, Route 53, ExternalDNS, AWS Load Balancer Controller, External Secrets Operator, AWS Secrets Manager, Prometheus, Grafana

### 5.2 安全性（Security）

安全性設計聚焦在最小暴露面、短期憑證、Secret 外部化與雲端原生身份整合。Worker Nodes 與 Services 位於 Private Subnets，對外入口集中在 Shared ALB/Gateway；GitHub Actions 使用 OIDC Assume AWS IAM Roles，而不是保存長期 Access Keys。

展示重點：

- Private EKS Worker Subnets 降低工作負載直接暴露風險。
- Application Services 維持 `ClusterIP`，只透過 Gateway Route 對外。
- ACM 提供 HTTPS certificate，Route 53 與 ExternalDNS 管理 DNS。
- ECR Immutable tags 與 scan-on-push 提升 Image 供應鏈安全性。
- IRSA 讓 Kubernetes Service Accounts 取得 Scoped AWS Permissions。
- AWS Secrets Manager 保存 Vintage DB Runtime Secret、Grafana Admin Secret 與 Argo CD Admin Secret，避免將密碼 Committed 到 Git。
- External Secrets Operator 透過 Scoped read-only IRSA 從 Secrets Manager Materialize Kubernetes Secrets。

延伸強化方向：Secret Rotation 可進一步自動化並納入 CloudTrail Audit；EKS API Public CIDR 可進一步收斂；Trivy Scan 可由提示型檢查演進為阻擋型檢查門檻。

使用服務與工具：IAM, OIDC, IRSA, AWS Secrets Manager, External Secrets Operator, EKS Private Subnets, ACM, ALB, Route 53, ECR Image Scanning, Kubernetes Secret

### 5.3 可靠性（Reliability）

可靠性設計以可重建環境、GitOps Self-healing 與部署後驗證為核心。EKS Managed Node Group 跨三個 Private Subnets，Argo CD 自動同步 Manifests，PostgreSQL 透過 EBS PVC 保留 Dev Data，Deploy Smoke 檢查 Public Storefront 是否可用。

展示重點：

- Managed Node Group 提供跨 AZ 的 Kubernetes Worker Capacity。
- GitOps Automated Sync 可修正非 Git 來源的漂移。
- StatefulSet + EBS PVC 展示 Kubernetes Persistent Storage。
- Infra Destroy Workflow 包含 EBS/PVC 清理步驟，降低 Teardown 殘留。
- Rollback Workflow 以 PR 方式回到指定 ECR Image Tag。

延伸強化方向：Critical Services 可增加 Replicas、Readiness/Liveness Probes、PodDisruptionBudget、Resource Requests/Limits 與 HPA。

使用服務與工具：EKS Managed Node Group, EBS CSI, Argo CD, GitHub Actions Deploy Smoke

### 5.4 效能效率（Performance Efficiency）

效能效率體現在服務拆分、Shared Ingress、合理的 Dev Node Sizing 與 Metrics-driven Operation。Gateway 統一前端 API Entrypoint，Backend Services 可獨立 Build 與 Deploy；Spot `t3.medium` Node Group 在成本與 Demo 容量之間取得平衡。

展示重點：

- 微服務拆分讓服務歸屬與 Image Pipeline 更清楚。
- Gateway Aggregation 減少前端直接依賴多個 Backend Endpoints。
- nginx Same-origin `/api` Proxy 降低瀏覽器 CORS 與 Routing 複雜度。
- Prometheus/Grafana 提供效能觀測入口。

延伸強化方向：擴充 ServiceMonitor Coverage 至所有 Active Backend Services；加入 Resource Requests/Limits 讓 Scheduler 與 autoscaling 更準確；以 Dashboard 資料做 Right-sizing。

使用服務與工具：EKS, Prometheus, Grafana, kube-prometheus-stack, Gateway API, ALB

### 5.5 成本最佳化（Cost Optimization）

Hiraya 採取 dev-only 可重建平台，以成本控制為前提。長期保留資源只保留 ECR、IAM 與必要 Secrets Manager Secrets 等基礎資源，EKS/VPC/Controllers 可透過 Workflow Destroy。Node Group 使用 Spot Capacity，Public Ingress 採 Shared ALB，避免每個服務各自建立 LoadBalancer。

展示重點：

- Spot Managed Node Group 降低 Compute Cost。
- Shared ALB/Gateway 降低 Ingress Resource 重複建立。
- S3 Gateway Endpoint 減少 Private Subnets 存取 S3 時經 NAT 的依賴。
- Infra Destroy Workflow 支援 Demo 後清除可重建平台。

成本取捨：EKS Control Plane、NAT Gateway、ALB、Secrets Manager 與 Route 53 仍會產生成本；因此 Destroy Workflow 是成本治理的一部分。

使用服務與工具：EKS, EC2 Spot Managed Node Group, NAT Gateway, ALB, ECR, AWS Secrets Manager, Terraform Destroy Workflow

### 5.6 永續性（Sustainability）

永續性在 Hiraya 中對應到避免閒置資源、減少重複建置與讓環境可關閉。GitOps、Immutable Image 與 IaC 讓環境能在需要展示時重建，不需要長期維持所有資源常開。

展示重點：

- 可重建 Platform 降低閒置雲端資源。
- Shared Ingress 減少重複 LoadBalancer。
- Spot Capacity 與 Max Node Count 限制 dev 運算資源上限。
- Observability 可作為後續 Right-sizing 依據。
- ECR Lifecycle Policy 可作為後續 Image 清理方向。

使用服務與工具：EKS, EC2 Spot, ECR lifecycle, Prometheus, Grafana, Terraform

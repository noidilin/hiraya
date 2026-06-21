# Vintage Microservices + AIOps 專題架構分析報告

## 一、專題概覽與設計理念

本專題在 AWS 雲端環境上，建立一套以精品電商為情境的微服務系統，並整合 DevOps、GitOps、可觀測性與 AI 輔助運維能力。整體架構從本地 Docker Compose 開發環境出發，延伸至 AWS EKS 上的 Kubernetes 部署，搭配 Terraform 建置基礎設施、GitHub Actions 建置容器映像、ArgoCD 管理 GitOps 部署流程，最後以 Prometheus、Grafana、CloudWatch Logs 與 Amazon Bedrock Agent 組成 AIOps 診斷層。

核心設計理念：

- **微服務拆分與 API Gateway 聚合**：前端 React UI 透過 Gateway 統一呼叫後端服務，後端依領域拆分為 Auth、Product、Order、Orders、User 等服務，降低單體應用耦合度。
- **容器化與 Kubernetes 標準化部署**：所有服務皆具備 Dockerfile，雲端環境透過 EKS 執行 Deployment、Service、StatefulSet 與 ServiceMonitor，建立可重複部署的容器平台。
- **Infrastructure as Code**：AWS VPC、EKS、Node Group、ECR、EBS CSI Driver、ArgoCD、Prometheus/Grafana 皆以 Terraform 管理，讓環境可追蹤、可重建。
- **CI/CD + GitOps 分層**：GitHub Actions 負責建置並推送容器映像至 ECR，再更新 Kubernetes manifest；ArgoCD 監控 GitOps 目錄，將 Git 狀態同步到 EKS。
- **可觀測性內建**：本地環境以 Prometheus 直接 scrape 各服務 `/metrics`，EKS 環境透過 kube-prometheus-stack、ServiceMonitor 與 Grafana Dashboard 觀察請求量、延遲、錯誤率、Pod CPU/Memory 與重啟次數。
- **AI 輔助運維特色**：AIOps Assistant（Kira）使用 Amazon Bedrock Agent，透過 Lambda action groups 查詢 CloudWatch Logs、Prometheus 指標與 EKS 健康狀態，協助進行根因分析、證據整理與修復建議。

---

## 二、整體架構設計

### 2.1 網路架構

目前 Terraform 在 `us-east-1` 建立一個自訂 VPC：

- **VPC CIDR**：`10.1.0.0/16`
- **Public Subnet**：三個公有子網，分布於 `us-east-1a`、`us-east-1b`、`us-east-1c`
  - `10.1.1.0/24`
  - `10.1.2.0/24`
  - `10.1.3.0/24`
- **Internet Gateway**：Public route table 將 `0.0.0.0/0` 指向 IGW。
- **Kubernetes Load Balancer 標籤**：Subnet 標記 `kubernetes.io/role/elb = 1` 與 `kubernetes.io/cluster/eks-cluster = owned`，供 EKS 建立外部 ELB 使用。

目前架構重點是教學與成本控制，因此 Terraform 目前只建立公有子網，尚未建立 Private Subnet、NAT Gateway、VPC Endpoint 或多層網路隔離。EKS API Endpoint 設定為 public access enabled、private access disabled，代表管理面可從公網連線；這對教學環境方便，但若進入正式環境，建議補上 Private Subnet、私有節點、受控 API 存取來源與 VPC Endpoint。

### 2.2 計算與應用層

雲端執行平台為 **Amazon EKS**：

- **EKS Cluster**：`eks-cluster`
- **Kubernetes 版本**：Terraform 設定為 `1.34`
- **Managed Node Group**：`eks-node-group`
- **Instance Type**：`m7i-flex.large`
- **Capacity Type**：`ON_DEMAND`
- **節點數量**：desired 1、min 1、max 2
- **磁碟大小**：30 GiB
- **EBS CSI Driver**：透過 EKS Add-on 與 IRSA 啟用，供 PostgreSQL PVC 使用。

應用層部署在 Kubernetes `vintage` namespace：

| 元件 | Kubernetes 類型 | 副本數 | Port | 說明 |
|---|---:|---:|---:|---|
| frontend | Deployment + ClusterIP Service | 1 | 3000 | React 前端 UI |
| gateway | Deployment + ClusterIP Service | 1 | 3001 | API Gateway，轉發至後端服務 |
| auth | Deployment + ClusterIP Service | 1 | 3002 | 登入、註冊、驗證 |
| product-service | Deployment + ClusterIP Service | 1 | 3003 | 商品型錄與庫存 |
| order-service | Deployment + ClusterIP Service | 1 | 3004 | 購物車與結帳流程 |
| orders | Deployment + ClusterIP Service | 1 | 3005 | 訂單歷史與管理 |
| user-service | Deployment + ClusterIP Service | 1 | 3006 | 使用者資料與帳戶管理 |
| vintage-postgres | StatefulSet + Headless Service | 1 | 5432 | PostgreSQL 資料庫 |

目前所有 Service 皆為 `ClusterIP`，因此主要透過 `kubectl port-forward` 存取前端、Gateway、Prometheus、Grafana 與 ArgoCD。這適合教學與實驗環境；若要對外正式服務，建議新增 Ingress Controller 或 LoadBalancer Service，並補上 TLS、WAF、DNS 與流量限制。

### 2.3 資料庫與資料持久化策略

資料庫採用 Kubernetes 內的 PostgreSQL StatefulSet：

- **Image**：`postgres:15-alpine`
- **副本數**：1
- **StorageClass**：`gp2`
- **PVC 容量**：10 GiB
- **Service**：Headless Service `vintage-postgres`
- **資料庫用途**：支援 `auth_db`、`products_db`、`orders_db`、`users_db` 等服務資料庫。

本地 Docker Compose 與 Kubernetes 都採用 PostgreSQL，並附有完整 SQL dump 與 restore job：

- 本地：`app/microservices/database/vintage_full.sql`
- K8s：`gitops/k8s/database/vintage_full.sql`
- Restore Job：`gitops/k8s/database/restore-job.yml`

目前 `gitops/kustomization.yml` 已將 SQL dump 建為 ConfigMap，並將 restore job 納入 Kustomize resources；Terraform 佈建 ArgoCD 後會自動建立 `vintage` Application，由 ArgoCD 在首次 sync 時執行 restore job 載入種子資料。

目前資料庫密碼與連線字串存放於 `gitops/secrets.yml` 的 `stringData`，例如 `POSTGRES_PASSWORD=postgres123`。此方式便於教學，但正式環境建議改用 External Secrets、AWS Secrets Manager、Sealed Secrets 或 SOPS，並避免明文密碼進入 Git。

### 2.4 容器映像、CI/CD 與 GitOps 層

容器映像儲存在 Amazon ECR，Terraform 建立 7 個 project-prefixed repository name：

- `hiraya-frontend`
- `hiraya-gateway`
- `hiraya-auth`
- `hiraya-order-service`
- `hiraya-orders`
- `hiraya-product-service`
- `hiraya-user-service`

ECR 設定包含：

- **scan_on_push = true**：映像推送時啟用掃描。
- **image_tag_mutability = MUTABLE**：目前允許覆寫 tag；正式環境建議改為 immutable tag，以提高供應鏈可追蹤性。
- **force_delete = true**：便於教學清理，但正式環境需謹慎使用。

GitHub Actions pipeline 位於 `.github/workflows/image-ci.yml`：

- 目前觸發方式為 `workflow_dispatch`，也就是手動觸發。
- Matrix 同時建置 7 個服務映像。
- 映像推送至 ECR，tag 使用 Git commit SHA。
- `update-manifests` job 會更新 `gitops/k8s/` 中的 image tag，並 commit 回 repository。

GitOps 層由 ArgoCD 管理：

- Terraform 透過 Helm 安裝 ArgoCD 至 `argocd` namespace。
- Terraform 讀取 `infra/modules/argocd/application.yml` 作為 Application spec，並透過 ArgoCD Helm release 建立，監控 repository 的 `gitops` path。
- 目前已啟用 automated sync，包含 `prune: true` 與 `selfHeal: true`，讓 dev 環境可在首次 provisioning 後自動部署並持續回復到 Git 狀態。

### 2.5 可觀測性與 AIOps 層（專題特色）

可觀測性由 Prometheus、Grafana、CloudWatch Logs 與 AIOps Assistant 組成。

**Prometheus / Grafana**

Terraform 透過 Helm 安裝 `kube-prometheus-stack` 至 `monitoring` namespace：

- Prometheus、Grafana、Alertmanager 皆設為 `ClusterIP`。
- `gitops/k8s/grafana-dashboard.yml` 以 ConfigMap 方式預載 Vintage dashboard。
- Dashboard 涵蓋 request rate、response time、active requests、error rate、Pod CPU/Memory、Pod restart、service health 等指標。

目前 Kubernetes 內的 `ServiceMonitor` 只選取 label `app: gateway`，代表 EKS 環境目前主要 scrape Gateway 的 `/metrics`。本地 Docker Compose 的 Prometheus 設定則 scrape gateway、auth、product-service、order-service、orders、user-service 等所有服務。若要讓雲端可觀測性完整對齊本地環境，建議為所有後端服務加上 `app` label 與 ServiceMonitor selector。

**CloudWatch Logs**

專案文件提供 Fluent Bit 安裝方式，將 Pod logs forwarding 至 CloudWatch Log Group：

- 預設 Log Group：`/eks/vintage/pods`
- AIOps Lambda `fetch_logs` 會查詢此 log group。

CloudWatch Logs forwarding 目前由 Terraform 平台堆疊預設安裝：`infra/modules/fluent-bit` 會建立 `/eks/vintage/pods` Log Group、IRSA role，並透過 Helm 安裝 `aws-for-fluent-bit` 到 `amazon-cloudwatch` namespace。

**Amazon Bedrock Agent — Kira**

AIOps Assistant 位於 `app/aiops/`，核心設計如下：

- **Streamlit UI**：`app.py` 提供聊天式操作介面。
- **Bedrock Agent**：Agent 名稱 `aiops-assistant`，角色設定為資深 SRE「Kira」。
- **Foundation Model**：部署腳本目前使用 `qwen.qwen3-32b-v1:0`。
- **Lambda Action Groups**：
  - `aiops-fetch-logs`：查詢 CloudWatch Logs。
  - `aiops-fetch-metrics`：查詢 Prometheus 指標。
  - `aiops-fetch-health`：查詢 EKS cluster、node group 與 deployment/pod 健康狀態。
- **IAM**：`setup-iam.sh` 建立 `aiops-lambda-role` 與 `aiops-bedrock-agent-role`，授權 Lambda 查詢 logs/EKS，以及授權 Bedrock Agent invoke Lambda 與 foundation model。

目前 AIOps 層屬於「互動式 AI 診斷助理」：工程師透過 Streamlit 或 Bedrock Agent 詢問問題，Kira 再主動查詢 logs、metrics 與 health 資料。它尚未實作 CloudWatch Alarm → SNS/SQS → Lambda → Bedrock 的全自動告警閉環；若專題目標是無人值守事件處理，可在現有 Kira 基礎上再加入事件驅動流程。

---

## 三、AWS Well-Architected Framework 六大支柱對應

本專題以教學、可重複部署與 AIOps 展示為核心，在 AWS Well-Architected Framework 六大支柱上已有明確對應，同時也保留多個可深化的正式環境改善點。

### 3.1 卓越營運（Operational Excellence）

Terraform 將 VPC、EKS、ECR、ArgoCD、Prometheus/Grafana 模組化管理，降低手動建置差異。GitHub Actions 負責建置映像與更新 manifests，ArgoCD 負責將 GitOps 狀態同步至 Kubernetes。AIOps Assistant 透過 Bedrock Agent 將 logs、metrics、EKS health 串成診斷流程，協助工程師用資料驅動方式排查問題。

使用服務：Terraform, EKS, ECR, GitHub Actions, ArgoCD, Prometheus, Grafana, Lambda, Amazon Bedrock

### 3.2 安全性（Security）

目前已具備基本 IAM role 分工：EKS Cluster Role、Node Role、EBS CSI IRSA Role、AIOps Lambda Role、Bedrock Agent Role。ECR 啟用 scan on push，可在映像進入部署流程時進行基礎掃描。Kubernetes 應用服務大多為 ClusterIP，不直接暴露到公網。

需改善處：目前所有 EKS node subnet 為 public subnet；EKS API endpoint 只啟用 public access；Kubernetes Secret 以明文 YAML 形式存在 Git；ArgoCD server 設定 `server.insecure = true`；ECR tag 可變。若正式化，建議改為 private subnet、限制 API endpoint CIDR、導入 Secrets Manager/External Secrets、啟用 TLS 與 immutable images。

使用服務：IAM, IRSA, EKS, ECR Image Scanning, Kubernetes Secret, ArgoCD

### 3.3 可靠性（Reliability）

EKS Managed Node Group 提供節點層的受管運維能力，Node Group 設定 min 1、max 2，可在節點層進行有限擴展。PostgreSQL 使用 StatefulSet 與 EBS PVC，資料不會因 Pod 重建而遺失。Prometheus/Grafana 與 Kira 可協助提早發現服務錯誤、Pod restart、deployment unavailable 等狀態。

需改善處：目前各應用 Deployment 副本數皆為 1，PostgreSQL 也是單副本；尚未看到 liveness probe、資源 requests/limits、Horizontal Pod Autoscaler 或正式備份排程。若追求高可靠性，應增加多副本、PodDisruptionBudget、HPA、readiness/liveness probes、資料庫備份與跨 AZ 策略。

使用服務：EKS Managed Node Group, StatefulSet, EBS CSI, Prometheus, Grafana

### 3.4 效能效率（Performance Efficiency）

微服務拆分讓不同領域服務可獨立建置、部署與擴展。Gateway 集中路由降低前端整合複雜度。Prometheus 可觀測 request rate、latency、error rate、CPU、memory 與 event loop lag，協助定位效能瓶頸。EKS Node Group max size 2，具備基礎水平擴展能力。

需改善處：目前 Kubernetes manifests 尚未設定 CPU/memory requests 與 limits，也未設定 HPA；ServiceMonitor 在 EKS 只 scrape gateway，無法完整掌握所有後端服務效能。正式化時應補齊服務層 metrics、HPA、壓力測試與節點/Pod sizing 策略。

使用服務：EKS, Prometheus, Grafana, kube-prometheus-stack

### 3.5 成本最佳化（Cost Optimization）

本專題以單一 EKS cluster、1–2 個 on-demand worker nodes、ClusterIP 服務與 port-forward 存取方式降低教學環境的外部負載平衡器成本。PostgreSQL 運行在 EKS StatefulSet 中，避免額外建立 RDS 成本。Terraform 可快速 destroy 環境，降低閒置資源費用。

需注意：EKS control plane 本身有固定成本，`m7i-flex.large` on-demand 節點也會產生持續費用；若只是短期教學或 demo，建議使用排程關閉、Spot nodes、較小 instance type，或在完成實驗後執行 `terraform destroy`。若正式營運，則需在成本與可用性之間重新平衡，可能導入 RDS、ALB、NAT Gateway、CloudWatch Logs 等額外成本。

使用服務：EKS, EC2 Managed Node Group, ECR, Terraform

### 3.6 永續性（Sustainability）

容器化與 Kubernetes 可讓服務按需部署，並透過 GitOps 避免環境漂移與重複建立。Node Group max size 2 避免過度擴張，Terraform destroy 流程可釋放不使用的實驗資源。Prometheus/Grafana 提供資源使用率資料，有助於未來依實際負載調整節點與 Pod 規格，減少閒置運算浪費。

可深化方向包含：設定 requests/limits 與 HPA、使用 Spot 或 Graviton instance、定期檢查閒置 ECR images、為非必要環境建立自動關閉排程。

使用服務：EKS, Prometheus, Grafana, Terraform, ECR

---

## 四、目前專案成熟度與建議改善項目

### 已完成亮點

- 已有完整微服務應用、Docker Compose、本地資料庫與監控配置。
- Terraform 已可建立 VPC、EKS、ECR、Prometheus/Grafana、ArgoCD、ArgoCD bootstrap Application 與 EBS CSI Driver。
- GitOps manifests 已涵蓋 frontend、gateway、backend services、PostgreSQL、restore job、ServiceMonitor 與 Grafana dashboard。
- CI pipeline 已能以 matrix 方式建置 7 個服務並更新 image tags。
- AIOps Assistant 已具備 Bedrock Agent、Lambda tools、Streamlit UI 與 IAM setup/deploy script。

### 建議優先改善

1. **修正文件與實作差異**：README 說 CI 在 push main 觸發，但目前 workflow 只有 `workflow_dispatch`；可視需求補上 `push` trigger。
2. **補齊雲端監控範圍**：目前 EKS ServiceMonitor 只 scrape gateway，建議擴充到所有後端服務。
3. **強化 Secret 管理**：避免 `postgres123` 與 DB URL 明文提交到 Git，改用 External Secrets 或 AWS Secrets Manager。
4. **正式化網路安全**：加入 private subnets、私有節點、NAT/VPC endpoints、EKS endpoint access control。
5. **增加應用可靠性設定**：為 Deployment 加上 readiness/liveness probes、resources requests/limits、HPA 與多副本。
6. **正式化資料初始化**：目前 dev bootstrap 已由 ArgoCD 執行 restore job；若正式化，可再導入 init job / migration job 管理 schema 與 seed data。
7. **AIOps 從互動式升級為事件驅動**：若目標是完整自動運維閉環，可加入 CloudWatch Alarm 或 Prometheus Alertmanager → SNS/SQS/EventBridge → Lambda → Bedrock Agent 的自動診斷流程。

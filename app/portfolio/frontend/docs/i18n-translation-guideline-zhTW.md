# i18n Translation Guideline: English → zh-TW

Source comparison:

- `app/portfolio/frontend/docs/presentation-en.md`
- `app/portfolio/frontend/docs/presentation-zhTW.md`

This report captures the translation style used by the existing presentation documents and should be used as the baseline guideline when implementing actual frontend i18n copy for the portfolio app.

---

## 1. Translation Goal

The zh-TW translation should read like a polished Taiwanese technical portfolio, not like a literal translation. The preferred style is:

- Formal, concise, and architecture-oriented.
- Natural Traditional Chinese used in Taiwan.
- DevOps/cloud technical terms preserved when they are common industry terms.
- English terms kept when they are product names, AWS/Kubernetes concepts, pipeline names, or UI/system labels.
- Chinese explanation added around English technical terms when it improves readability.

Example pattern:

| English | zh-TW style |
|---|---|
| DevOps Architecture and Process Design | DevOps 架構流程設計 |
| Solution Overview and Design Principles | 方案概覽與設計理念 |
| Observability Foundation | 可觀測性基礎 |
| Rollback and Operational Evidence | Rollback 與維運證據 |

---

## 2. Language and Locale Rules

Use **Traditional Chinese for Taiwan**.

Preferred wording:

| Concept | Preferred zh-TW |
|---|---|
| architecture | 架構 |
| design | 設計 |
| overview | 概覽 |
| principle | 理念 / 原則 |
| environment | 環境 |
| development environment | Dev 環境 |
| production | Production |
| public internet | 公網 |
| public-facing | 對外 / 可對外展示 |
| internal/private | 內部 / 私有 |
| workload | 工作負載 |
| service boundary | 服務邊界 |
| entry point | 入口 / entrypoint |
| source of truth | 單一事實來源 |
| desired state | 期望狀態 |
| evidence | 證據 / 審查證據 |
| validation | 驗證 |
| reviewable | 可審查 |
| destroyable | 可銷毀 |
| rebuildable | 可重建 |
| observable | 可觀測 |
| recoverable | 可回復 |

Avoid Simplified Chinese terms such as `网络`, `数据`, `节点`, `镜像`, `项目`, `运维`, `优化`. Use `網路`, `資料`, `節點`, `映像` or `Image`, `專案`, `維運`, `最佳化`.

---

## 3. Technical Term Strategy

### 3.1 Keep product and platform names in English

Do not translate official product names or tool names:

- AWS
- Amazon EKS / EKS
- Kubernetes
- Terraform
- GitHub Actions
- Argo CD
- Prometheus
- Grafana
- Route 53
- ACM
- ALB
- ECR
- IAM
- OIDC
- IRSA
- AWS Secrets Manager
- External Secrets Operator
- AWS Load Balancer Controller
- Gateway API
- ExternalDNS
- CloudTrail
- Trivy

### 3.2 Keep Kubernetes resource kinds in English

Keep Kubernetes object kinds and API concepts in English, especially when shown as platform concepts or code-adjacent UI copy:

- Namespace
- Deployment
- Service
- StatefulSet
- Headless Service
- ConfigMap
- Secret
- ExternalSecret
- HTTPRoute
- Gateway
- StorageClass
- ServiceMonitor
- PodDisruptionBudget
- Resource Requests/Limits
- HPA
- PVC / EBS PVC
- ClusterIP

Example:

- `Frontend、Gateway、Backend Services 皆維持 Kubernetes ClusterIP。`
- `Argo CD 負責讓每個 Deployment、Service、HTTPRoute 與 Secret reference 持續收斂到 Git 中的期望狀態。`

### 3.3 Keep DevOps process names in English when they are pipeline concepts

The existing translation keeps many delivery concepts in English because they are recognizable DevOps vocabulary:

- PR / Pull Request
- CI/CD Pipeline
- GitOps
- Rollback
- Smoke Test
- Baseline Validation
- Image Publish
- Artifact Promotion
- Manifest Promotion PR
- Infrastructure Plan / Apply / Destroy
- Drift Correction
- Branch Protection
- Required Checks

Use Chinese verbs around these terms:

- `執行 Pull Request 驗證`
- `建立 Manifest Promotion PR`
- `觸發 Kubernetes Rollout`
- `執行對外 Smoke Test`
- `產生 Terraform Plan 審查證據`

---

## 4. Tone and Sentence Style

### 4.1 Prefer explanatory technical prose

The zh-TW copy should be clear and professional. It should explain intent, trade-offs, and operational value.

English:

> The design is centered on four goals: rebuildability, verifiability, observability, and recoverability.

zh-TW style:

> 整體設計以「可重建、可驗證、可觀測、可回復」為主軸。

Guideline:

- Translate meaning, not sentence structure.
- Prefer compact Chinese phrases for lists of qualities.
- Use `以……為主軸`, `聚焦在……`, `目標是……`, `此設計……` for architecture rationale.

### 4.2 Use active design-language

Preferred patterns:

| English pattern | zh-TW pattern |
|---|---|
| is designed to | 設計為 / 設計以 |
| aims to achieve | 希望達到 / 目標是 |
| is responsible for | 負責 |
| provides | 提供 |
| enables | 讓 / 啟用 |
| reduces risk | 降低風險 |
| avoids | 避免 |
| demonstrates | 展示 / 呈現 |
| validates | 驗證 |
| manages | 管理 |
| synchronizes | 同步 |
| materializes | materialize / Materialize |
| converges | 收斂 |

### 4.3 Keep paragraphs readable

For longer English paragraphs, zh-TW may be slightly restructured to improve flow. Avoid overly long translated sentences. Split if needed.

---

## 5. Formatting and Typography

Follow these formatting conventions:

1. Use Traditional Chinese punctuation: `，` `。` `：` `；` `（ ）`.
2. Keep code/resource names in backticks unchanged.
3. Keep URLs unchanged.
4. Keep arrows in request paths unchanged: `User → Route 53 → ALB`.
5. Keep table schemas and numeric values unchanged unless the column header is translated.
6. Keep service ports, CIDRs, regions, instance types, and secret paths unchanged.
7. Use spaces between Chinese and inline English technical terms where it improves readability.

Examples:

- `GitHub Actions 透過 OIDC 取得短期 AWS Credentials。`
- `Vintage 透過 ExternalSecret 從 AWS Secrets Manager /hiraya/dev/apps/vintage Materialize Runtime Secret。`
- `Public Subnets 提供 ALB 與 NAT Gateway 所需的網路位置。`

---

## 6. Glossary for i18n Work

Use this glossary consistently in frontend i18n strings.

| English | zh-TW |
|---|---|
| Vintage Storefront | Vintage Storefront / 古著電商 storefront |
| DevOps Architecture | DevOps 架構 |
| Process Design | 流程設計 |
| Solution Overview | 方案概覽 |
| Design Principles | 設計理念 |
| Overall Architecture | 整體架構 |
| AWS Network Architecture | AWS 網路架構 |
| Microservice Architecture | 微服務架構 |
| Secrets and Data Initialization | Secrets 與資料初始化機制 |
| Observability Foundation | 可觀測性基礎 |
| Hardware and Cost Estimate | 硬體及費用試算 |
| Compute and Storage Selection | 運算與儲存規格選型 |
| Pod Capacity Usage | Pod 容量使用狀態 |
| Estimated Cost | 預估成本 |
| Cost Justification | 支出合理性 |
| Pull Request Validation | Pull Request 驗證 |
| Image Publishing | Image 發布 |
| Artifact Promotion | artifact promotion |
| GitOps Synchronization | GitOps 同步 |
| Deployment Flow | 部署流程 |
| Infrastructure Delivery | Infrastructure 交付 |
| Rollback | Rollback |
| Operational Evidence | 維運證據 |
| Operational Excellence | 卓越營運 |
| Security | 安全性 |
| Reliability | 可靠性 |
| Performance Efficiency | 效能效率 |
| Cost Optimization | 成本最佳化 |
| Sustainability | 永續性 |
| Public Subnets | Public Subnets |
| Private Subnets | Private Subnets |
| Private Workloads | Private Workloads / 私有工作負載 |
| Shared Ingress Layer | Shared Ingress Layer / 共享入口層 |
| Shared Gateway | Shared Gateway |
| Public Routes | Public Routes |
| Public Endpoint | Public Endpoint |
| Private Access | Private Access |
| Public Access | Public Access |
| Admin Credentials | Admin Credentials |
| Runtime Secret | Runtime Secret |
| Desired State | 期望狀態 |
| Drift | 漂移 |
| Drift Correction | Drift Correction / 漂移修正 |
| Smoke Test | Smoke Test |
| Review Evidence | 審查證據 |
| Supply Chain | 供應鏈 |
| Short-lived Credentials | 短期憑證 |
| Long-lived Secrets | 長期保留的 Secrets |
| Right-sizing | Right-sizing |
| Guardrail | Guardrail |

---

## 7. UI Copy Guidelines for Actual i18n Implementation

Although the source documents are architecture presentations, the same translation strategy should guide app UI copy.

### 7.1 User-facing marketing copy

Use more natural zh-TW and translate more fully.

| English UI copy | zh-TW recommendation |
|---|---|
| Discover curated vintage pieces | 探索精選古著單品 |
| Shop new arrivals | 逛逛最新上架 |
| View product details | 查看商品詳情 |
| Add to cart | 加入購物車 |
| Checkout | 結帳 |

### 7.2 Technical portfolio copy

Keep DevOps terms in English when they represent real tools, workflows, or resume keywords.

| English UI copy | zh-TW recommendation |
|---|---|
| Deployed on AWS EKS | 部署於 AWS EKS |
| GitOps managed by Argo CD | 由 Argo CD 管理 GitOps 部署 |
| CI/CD powered by GitHub Actions | 透過 GitHub Actions 建立 CI/CD Pipeline |
| Observability with Prometheus and Grafana | 以 Prometheus 與 Grafana 建立可觀測性基礎 |
| Infrastructure provisioned by Terraform | 由 Terraform 建置 Infrastructure |

### 7.3 Buttons and labels

For short UI labels, prefer concise natural Chinese unless the term is a proper noun.

| English | zh-TW |
|---|---|
| Learn More | 了解更多 |
| View Architecture | 查看架構 |
| View Pipeline | 查看 Pipeline |
| View Dashboard | 查看 Dashboard |
| Read Case Study | 閱讀案例 |
| Open Demo | 開啟 Demo |
| Retry | 重試 |
| Loading | 載入中 |
| Error | 錯誤 |
| Success | 成功 |

---

## 8. i18n Key Naming Recommendations

For implementation, keep keys language-neutral and domain-based. Do not encode English text into key names.

Recommended key structure:

```ts
{
  "hero.title": "...",
  "hero.subtitle": "...",
  "nav.architecture": "...",
  "nav.pipeline": "...",
  "architecture.network.title": "...",
  "architecture.microservices.title": "...",
  "pipeline.prValidation.title": "...",
  "pipeline.gitOps.title": "...",
  "common.loading": "...",
  "common.error": "..."
}
```

Guidelines:

- Use stable semantic keys, not full English phrases.
- Keep AWS/Kubernetes identifiers as interpolation values when dynamic.
- Do not translate resource names, domains, secret paths, regions, ports, or code identifiers.
- Allow zh-TW strings to be longer than English strings; avoid fixed-width UI assumptions.
- For mixed Chinese/English strings, check spacing visually in the UI.

---

## 9. Review Checklist

Before accepting a zh-TW translation, verify:

- [ ] Traditional Chinese is used consistently.
- [ ] AWS, Kubernetes, DevOps, and product names remain unchanged.
- [ ] Key architecture terms match the glossary.
- [ ] The tone sounds like a Taiwanese technical portfolio, not machine translation.
- [ ] Numeric values, URLs, CIDRs, ports, regions, paths, and resource names are unchanged.
- [ ] Tables preserve the same meaning and structure.
- [ ] UI strings are concise and fit expected layouts.
- [ ] English terms kept in zh-TW are intentional and common in DevOps context.
- [ ] No Simplified Chinese variants remain.

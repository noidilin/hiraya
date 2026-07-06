export const resources = {
  en: {
    translation: {
      app: {
        eyebrow: 'Lazy CI/CD lab',
        title: 'Interactive CI/CD starter',
        description:
          'A bilingual teaching surface for CI/CD concepts, now with richer motion primitives for visual explanations.',
        simulate: 'Simulate run',
        reset: 'Reset',
        runs: 'Runs simulated with Zustand: {{count}}',
      },
      common: {
        language: {
          switchToTraditionalChinese: 'Switch locale to Traditional Chinese',
          switchToEnglish: 'Switch locale to English',
        },
        nav: {
          chapters: 'Chapters',
          openChapters: 'Open chapters',
          hiraya: 'Hiraya',
          openHiraya: 'Open Hiraya',
          repository: 'Hiraya repository',
          openRepository: 'Open Hiraya repository on GitHub',
        },
      },
      guide: {
        launcher: {
          ask: 'Ask Hiraya Guide',
          minimize: 'Minimize Guide',
        },
        panel: {
          eyebrow: 'assistant panel',
          title: 'Hiraya Guide',
          close: 'Close',
          closeAria: 'Close Hiraya Guide',
          inputPlaceholder: 'Ask about Hiraya architecture or CI/CD...',
          send: 'Send message',
          cited: 'cited',
          thinking: 'Asking curated knowledge...',
          retrieving: 'retrieving',
          ready: 'ready',
          starterInfrastructure: 'How does Hiraya deploy infrastructure?',
          starterSecurity: 'What security gates are implemented?',
          starterScope: 'What is intentionally out of scope for the guide?',
        },
      },
      hiraya: {
        hero: {
          evidenceSlots: 'Evidence slots',
        },
        evidence: {
          eyebrow: 'Evidence',
          previous: 'Previous evidence',
          next: 'Next evidence',
          screenshotEvidence: 'screenshot evidence',
          status: {
            planned: 'planned',
            captured: 'captured',
            deferred: 'deferred',
          },
          kind: {
            screenshot: 'screenshot',
            video: 'video',
            diagram: 'diagram',
            externalLink: 'external link',
          },
          frame: {
            video: 'Video walkthrough frame · 16:9',
            screenshot: 'MacBook Pro 14-inch capture frame · 1512 × 982',
          },
          placeholder: {
            videoSlot: 'Video evidence slot',
            videoDescription: 'Add a video source to the evidence manifest to turn this support card into a playable walkthrough.',
          },
          briefVideo: {
            title: 'Primary portfolio walkthrough',
            fallbackCaption: 'A focused recording keeps the Brief route proof-led without turning the overview into a long media gallery.',
            stages: ['PR validation', 'Image publishing', 'Manifest promotion', 'Argo CD sync', 'Rollout + smoke'],
            frameLabel: 'Brief proof video · delivery walkthrough',
            missingTitle: 'Video evidence slot',
            missingDescription: 'Drop the final walkthrough file into the evidence manifest and this frame becomes the playable Brief proof.',
            walkthroughBadge: '16:9 walkthrough',
            routeAnchorBadge: 'Brief route anchor',
          },
          carousels: {
            architecture: {
              title: 'Evidence behind the architecture decisions',
              description: 'Each capture anchors one architecture claim without turning the page into a detached screenshot gallery.',
              previews: {
                publicIngress: ['Route 53 records', 'ALB target group health', 'Browser TLS and /api smoke test'],
                appOfApps: ['Root app Synced/Healthy', 'Platform child applications', 'Vintage resource tree'],
                privateWorkloads: ['Private node group subnets', 'ClusterIP services', 'NAT and route table evidence'],
              },
            },
            cost: {
              title: 'Evidence behind the cost decisions',
              description: 'Financial proof stays close to the trade-off analysis, one operational capture at a time.',
              previews: {
                destroyWorkflow: ['Destroy workflow run', 'Terraform destroy logs', 'AWS console cleanup check'],
                privateWorkloads: ['kubectl pod density', 'Managed node group sizing', 'Scheduling headroom'],
              },
            },
            sdlc: {
              title: 'Evidence behind the delivery loop',
              description: 'Pipeline captures sit beside the SDLC model so each delivery stage has concrete proof.',
              previews: {
                deliveryFlow: ['GitHub Actions checks', 'ECR image push + scan', 'Argo CD sync + smoke test'],
                rollbackPath: ['Target image verification', 'Rollback PR diff', 'Post-rollback smoke test'],
                infraApproval: ['Terraform plan', 'Environment approval', 'Platform smoke result'],
              },
            },
            waf: {
              previews: {
                secrets: ['Secrets Manager list', 'ExternalSecret Ready', 'No secret values shown'],
                grafana: ['Request rate', 'Response time', 'Pod CPU/memory'],
                destroyWorkflow: ['Destroy workflow', 'PVC/EBS cleanup', 'EKS/VPC/ALB removed'],
              },
            },
          },
        },
        proofPoints: {
          eyebrow: 'Proof points',
          title: 'Claims are connected to implementation evidence',
          description:
            'Each card frames a portfolio claim as something that can be inspected through the evidence checklist or future media previews.',
        },
        mediaSlots: {
          eyebrow: 'Evidence media',
          title: 'Planned media slots render as safe placeholders',
          description:
            'Screenshots, diagrams, and videos are progressive enhancements. Until curated assets exist, the route shows explicit placeholders instead of broken embeds.',
          status: {
            planned: 'Planned',
            placeholder: 'Placeholder',
            ready: 'Ready',
          },
          type: {
            introVideo: 'intro video',
            screenshotHover: 'screenshot hover',
            diagramFrame: 'diagram frame',
          },
          reservedArchitectureFrame: 'Reserved architecture frame',
          curatedMediaSlot: 'Curated media slot',
          missingMediaDescription:
            'Assets can be attached later without changing the content contract. Missing media is intentionally not loaded.',
        },
        flow: {
          eyebrow: 'Delivery flow',
          title: 'Reviewed change path from pull request to rollback',
          description:
            'The SDLC route renders each control path as a separate card so validation, artifact publishing, GitOps sync, infrastructure delivery, and rollback remain visibly distinct.',
        },
        pillars: {
          eyebrow: 'Six pillars',
          title: 'Well-Architected reading of implementation trade-offs',
          description:
            'The route connects AWS Well-Architected language to current implementation evidence, explicit dev trade-offs, and future hardening work.',
          highlights: 'Highlights',
          futureHardening: 'Future hardening',
        },
      },
      stack: {
        title: 'Frontend tooling',
        items: [
          'Vite + React + TypeScript',
          'TanStack Router + Query',
          'Zustand',
          'shadcn/ui + Tailwind',
          'GSAP + React Flow + Remotion',
          'i18next + react-i18next',
          'React Bits visual components',
        ],
      },
      flow: {
        commit: 'Commit',
        test: 'Test',
        deploy: 'Deploy',
        timeline: 'CI/CD timeline',
      },
      visuals: {
        title: 'Motion palette',
        transitionBefore: 'Code enters the pipeline',
        transitionAfter: 'Release reaches production',
        trailTitle: 'Pointer trail',
        trailSubtitle: 'Pixel Trail',
        gridTitle: 'Shape Grid',
        gridSubtitle: 'Canvas background layer',
      },
    },
  },
  'zh-TW': {
    translation: {
      app: {
        eyebrow: 'Lazy CI/CD 實驗室',
        title: '互動式 CI/CD 入門',
        description: '支援繁中與英文的教學介面，加入更多動態視覺元件來說明 CI/CD 流程。',
        simulate: '模擬執行',
        reset: '重設',
        runs: 'Zustand 模擬執行次數：{{count}}',
      },
      common: {
        language: {
          switchToTraditionalChinese: '切換語言為繁體中文',
          switchToEnglish: '切換語言為英文',
        },
        nav: {
          chapters: '章節',
          openChapters: '開啟章節',
          hiraya: 'Hiraya',
          openHiraya: '開啟 Hiraya',
          repository: 'Hiraya repository',
          openRepository: '在 GitHub 開啟 Hiraya repository',
        },
      },
      guide: {
        launcher: {
          ask: '詢問 Hiraya Guide',
          minimize: '最小化 Guide',
        },
        panel: {
          eyebrow: 'assistant panel',
          title: 'Hiraya Guide',
          close: '關閉',
          closeAria: '關閉 Hiraya Guide',
          inputPlaceholder: '詢問 Hiraya architecture 或 CI/CD...',
          send: '送出訊息',
          cited: '引用',
          thinking: '正在查詢整理好的知識...',
          retrieving: '查詢中',
          ready: '就緒',
          starterInfrastructure: 'Hiraya 如何部署 infrastructure？',
          starterSecurity: '目前實作哪些 security gates？',
          starterScope: 'Guide 刻意不處理哪些範圍？',
        },
      },
      hiraya: {
        hero: {
          evidenceSlots: '證據素材槽',
        },
        evidence: {
          eyebrow: '證據',
          previous: '上一個證據',
          next: '下一個證據',
          screenshotEvidence: '截圖證據',
          status: {
            planned: '規劃中',
            captured: '已擷取',
            deferred: '延後',
          },
          kind: {
            screenshot: '截圖',
            video: '影片',
            diagram: '圖表',
            externalLink: '外部連結',
          },
          frame: {
            video: '影片導覽畫面 · 16:9',
            screenshot: 'MacBook Pro 14 吋擷取畫面 · 1512 × 982',
          },
          placeholder: {
            videoSlot: '影片證據槽',
            videoDescription: '把影片來源接到 evidence manifest 後，這張支援卡就會變成可播放的 walkthrough。',
          },
          briefVideo: {
            title: '主要 portfolio walkthrough',
            fallbackCaption: '聚焦的錄影讓 Brief route 維持證據導向，而不把 overview 變成冗長媒體相簿。',
            stages: ['PR 驗證', '映像檔發布', 'Manifest 升版', 'Argo CD 同步', 'Rollout 與 smoke 檢查'],
            frameLabel: 'Brief 證明影片 · 交付導覽',
            missingTitle: '影片證據槽',
            missingDescription: '把最終 walkthrough 檔案放進 evidence manifest 後，這個 frame 就會成為可播放的 Brief proof。',
            walkthroughBadge: '16:9 導覽影片',
            routeAnchorBadge: 'Brief 路由錨點',
          },
          carousels: {
            architecture: {
              title: '支撐架構決策的證據',
              description: '每張擷取畫面都錨定一個 architecture claim，而不是把頁面變成脫節的 screenshot gallery。',
              previews: {
                publicIngress: ['Route 53 records', 'ALB target group health', 'Browser TLS 與 /api smoke test'],
                appOfApps: ['Root app Synced/Healthy', 'Platform child applications', 'Vintage resource tree'],
                privateWorkloads: ['Private node group subnets', 'ClusterIP services', 'NAT 與 route table evidence'],
              },
            },
            cost: {
              title: '支撐成本決策的證據',
              description: '財務證據貼近取捨分析，一次只展示一個 operational capture。',
              previews: {
                destroyWorkflow: ['Destroy workflow run', 'Terraform destroy logs', 'AWS console cleanup check'],
                privateWorkloads: ['kubectl pod density', 'Managed node group sizing', 'Scheduling headroom'],
              },
            },
            sdlc: {
              title: '支撐 delivery loop 的證據',
              description: 'Pipeline captures 放在 SDLC model 旁邊，讓每個 delivery stage 都有具體 proof。',
              previews: {
                deliveryFlow: ['GitHub Actions checks', 'ECR image push + scan', 'Argo CD sync + smoke test'],
                rollbackPath: ['Target image verification', 'Rollback PR diff', 'Post-rollback smoke test'],
                infraApproval: ['Terraform plan', 'Environment approval', 'Platform smoke result'],
              },
            },
            waf: {
              previews: {
                secrets: ['Secrets Manager list', 'ExternalSecret Ready', '不顯示 secret values'],
                grafana: ['Request rate', 'Response time', 'Pod CPU/memory'],
                destroyWorkflow: ['Destroy workflow', 'PVC/EBS cleanup', 'EKS/VPC/ALB removed'],
              },
            },
          },
        },
        proofPoints: {
          eyebrow: '證據重點',
          title: '主張都連到可檢視的實作證據',
          description: '每張卡片都把 portfolio 主張整理成可透過證據清單或未來媒體預覽檢查的內容。',
        },
        mediaSlots: {
          eyebrow: '證據媒體',
          title: '規劃中的媒體槽會以安全 placeholder 呈現',
          description: '截圖、架構圖與影片是漸進增強項目。在整理好的素材存在前，頁面會顯示明確 placeholder，而不是載入破損 embed。',
          status: {
            planned: '規劃中',
            placeholder: 'Placeholder',
            ready: '已就緒',
          },
          type: {
            introVideo: '導覽影片',
            screenshotHover: '截圖 hover',
            diagramFrame: '架構圖框架',
          },
          reservedArchitectureFrame: '預留架構圖框架',
          curatedMediaSlot: '策展媒體槽',
          missingMediaDescription: '素材可在之後接上，不需要改動內容契約。缺少的媒體會刻意不載入。',
        },
        flow: {
          eyebrow: '交付流程',
          title: '從 pull request 到 rollback 的審查式變更路徑',
          description: 'SDLC 路線會將每個控制路徑拆成獨立卡片，讓 validation、artifact publishing、GitOps sync、infrastructure delivery 與 rollback 保持清楚可見。',
        },
        pillars: {
          eyebrow: '六大支柱',
          title: '以 Well-Architected 閱讀實作取捨',
          description: '此路線將 AWS Well-Architected 語言連到目前的實作證據、明確的 dev trade-off 與未來 hardening 工作。',
          highlights: '重點',
          futureHardening: '未來強化',
        },
      },
      stack: {
        title: '前端工具',
        items: [
          'Vite + React + TypeScript',
          'TanStack Router + Query',
          'Zustand',
          'shadcn/ui + Tailwind',
          'GSAP + React Flow + Remotion',
          'i18next + react-i18next',
          'React Bits 視覺元件',
        ],
      },
      flow: {
        commit: '提交',
        test: '測試',
        deploy: '部署',
        timeline: 'CI/CD 時間軸',
      },
      visuals: {
        title: '動態視覺庫',
        transitionBefore: '程式碼進入流水線',
        transitionAfter: '版本抵達正式環境',
        trailTitle: '游標軌跡',
        trailSubtitle: 'Pixel Trail',
        gridTitle: 'Shape Grid',
        gridSubtitle: 'Canvas 背景層',
      },
    },
  },
} as const

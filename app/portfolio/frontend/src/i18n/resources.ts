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
          zhTWMachineTranslationWarning: 'Note: zh-TW copy is LLM-translated and pending human review.',
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
            ready: 'ready',
            deferred: 'deferred',
          },
          kind: {
            screenshot: 'screenshot',
            video: 'video',
            diagram: 'diagram',
            externalLink: 'external link',
          },
          frame: {
            video: 'Portfolio evidence video',
            screenshot: 'Portfolio evidence image',
          },
          placeholder: {
            videoSlot: 'Video evidence preview',
            videoDescription: 'This support card becomes a playable walkthrough when curated video evidence is available.',
          },
          briefVideo: {
            title: 'Project walkthrough on YouTube',
            fallbackCaption: 'One focused external walkthrough connects the Brief route to delivery, rollback, and cost-governance evidence.',
            stages: ['PR validation', 'Image publishing', 'Manifest promotion', 'Argo CD sync', 'Rollback + destroy'],
            frameLabel: 'Brief proof video · YouTube walkthrough',
            missingTitle: 'Walkthrough coming soon',
            missingDescription: 'A concise YouTube walkthrough will connect delivery, rollback, and cost-control evidence once it is ready.',
            workInProgressNotice:
              'Route-specific videos and screenshots are already available in the Architecture, SDLC, Cost, and Well-Architected sections.',
            walkthroughBadge: 'YouTube walkthrough',
            routeAnchorBadge: 'Brief route anchor',
            youtubeBadge: 'YouTube',
          },
          carousels: {
            architecture: {
              title: 'Evidence behind the architecture decisions',
              description: 'Each capture anchors one architecture claim without turning the page into a detached screenshot gallery.',
              previews: {
                publicIngress: ['Public HTTPS storefront', 'Shared ingress endpoints', 'Browser runtime proof'],
                appOfApps: ['Root app Synced/Healthy', 'Platform child applications', 'Vintage resource tree'],
              },
            },
            cost: {
              title: 'Evidence behind the cost decisions',
              description: 'Financial proof stays close to the trade-off analysis, one operational capture at a time.',
              previews: {
                destroyWorkflow: ['Destroy workflow run', 'Terraform destroy logs', 'AWS console cleanup check'],
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
            'Each card frames a portfolio claim as something reviewers can inspect through implementation evidence.',
        },
        mediaSlots: {
          eyebrow: 'Evidence media',
          title: 'Evidence media stays explicit and reviewable',
          description:
            'Screenshots, diagrams, and videos support the explanation when they are curated. Until then, the page shows clear availability states instead of broken embeds.',
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
            'This media item is not available yet; the surrounding explanation remains usable without it.',
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
          zhTWMachineTranslationWarning: '提醒：zh-TW 內容目前由 LLM 翻譯，尚待人工審閱。',
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
            ready: '已就緒',
            deferred: '延後',
          },
          kind: {
            screenshot: '截圖',
            video: '影片',
            diagram: '圖表',
            externalLink: '外部連結',
          },
          frame: {
            video: '證據影片',
            screenshot: '證據圖片',
          },
          placeholder: {
            videoSlot: '影片證據預覽',
            videoDescription: '整理好的 video evidence 可用時，這張支援卡就會變成可播放的 walkthrough。',
          },
          briefVideo: {
            title: 'YouTube project walkthrough',
            fallbackCaption: '一支聚焦的外部 walkthrough 會把 Brief route 連到 delivery、rollback 與 cost-governance evidence。',
            stages: ['PR 驗證', '映像檔發布', 'Manifest 升版', 'Argo CD 同步', 'Rollback 與 destroy'],
            frameLabel: 'Brief 證明影片 · YouTube walkthrough',
            missingTitle: 'Walkthrough 即將推出',
            missingDescription: '一支精簡的 YouTube walkthrough 會在準備好後串起 delivery、rollback 與 cost-control evidence。',
            workInProgressNotice:
              'Architecture、SDLC、Cost 與 Well-Architected 區段已提供各路線的影片與截圖證據。',
            walkthroughBadge: 'YouTube walkthrough',
            routeAnchorBadge: 'Brief 路由錨點',
            youtubeBadge: 'YouTube',
          },
          carousels: {
            architecture: {
              title: '支撐架構決策的證據',
              description: '每張擷取畫面都錨定一個 architecture claim，而不是把頁面變成脫節的 screenshot gallery。',
              previews: {
                publicIngress: ['Public HTTPS storefront', 'Shared ingress endpoints', 'Browser runtime proof'],
                appOfApps: ['Root app Synced/Healthy', 'Platform child applications', 'Vintage resource tree'],
              },
            },
            cost: {
              title: '支撐成本決策的證據',
              description: '財務證據貼近取捨分析，一次只展示一個 operational capture。',
              previews: {
                destroyWorkflow: ['Destroy workflow run', 'Terraform destroy logs', 'AWS console cleanup check'],
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
          title: '主張都連到實作證據',
          description: '每張卡片都把 portfolio 主張整理成 reviewers 可透過 implementation evidence 檢查的內容。',
        },
        mediaSlots: {
          eyebrow: '證據媒體',
          title: '證據媒體保持明確且可審查',
          description: '截圖、架構圖與影片在素材整理完成後支撐說明。在此之前，頁面會顯示清楚的可用狀態，而不是載入破損 embed。',
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
          missingMediaDescription: '這個 media item 尚未可用；周圍說明仍可獨立閱讀。'
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

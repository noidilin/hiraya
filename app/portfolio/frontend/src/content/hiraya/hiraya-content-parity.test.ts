import { describe, expect, it } from 'vitest'

import { hirayaPagesEn } from './en'
import { hirayaPagesZhTW } from './zh-TW'
import { expectStableListParity } from './parity-test-helpers'
import { resources } from '@/i18n/resources'

import { getHirayaRouteDesignContent } from './route-design-content'
import type { HirayaPageContent } from './types'

const enPages: readonly HirayaPageContent[] = hirayaPagesEn
const zhPages: readonly HirayaPageContent[] = hirayaPagesZhTW

describe('Hiraya localized content parity', () => {
  it('resolves route-design content from an explicit locale', () => {
    const en = getHirayaRouteDesignContent('en')
    const zhTW = getHirayaRouteDesignContent('zh-TW')

    expect(en.briefProofPathOverview[0]?.label).toBe('Design goals')
    expect(zhTW.briefProofPathOverview[0]?.label).toBe('設計目標')
  })

  it('keeps Brief proof-path stable structure aligned while allowing translated prose', () => {
    const en = getHirayaRouteDesignContent('en')
    const zhTW = getHirayaRouteDesignContent('zh-TW')

    expectStableListParity(zhTW.briefProofPathOverview, en.briefProofPathOverview, (card) => ({
      id: card.id,
      value: card.value,
      evidenceRefs: card.evidenceRefs ?? [],
      sourceRefs: card.sourceRefs,
      bulletCount: card.detailBullets.length,
    }))
  })

  it('keeps Brief Platform Proof Map stable while localizing proof lenses and node explanations', () => {
    const en = getHirayaRouteDesignContent('en')
    const zhTW = getHirayaRouteDesignContent('zh-TW')

    expect(zhTW.briefPlatformProofMap.title).toBe('從 source authority 到 public proof 的一張地圖')
    expect(zhTW.briefPlatformProofMap.lenses[0]?.label).toBe('Visitor request 證據')
    expect(zhTW.briefPlatformProofMap.nodes.find((node) => node.id === 'repo-change')?.detail).toBe(
      'Application、GitOps 或 infrastructure intent 先從可 review 的 source 開始，而不是 console mutation。',
    )

    expectStableListParity(zhTW.briefPlatformProofMap.zones, en.briefPlatformProofMap.zones, (zone) => ({
      id: zone.id,
      position: zone.position,
      size: zone.size,
    }))
    expectStableListParity(zhTW.briefPlatformProofMap.nodes, en.briefPlatformProofMap.nodes, (node) => ({
      id: node.id,
      zoneId: node.zoneId,
      code: node.code,
      kind: node.kind,
      role: node.role,
      toolIcon: node.toolIcon,
      position: node.position,
      sourceRefs: node.sourceRefs,
    }))
    expectStableListParity(zhTW.briefPlatformProofMap.edges, en.briefPlatformProofMap.edges, (edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      lensIds: edge.lensIds,
    }))
    expectStableListParity(zhTW.briefPlatformProofMap.lenses, en.briefPlatformProofMap.lenses, (lens) => ({
      id: lens.id,
      highlightedNodeIds: lens.highlightedNodeIds,
      evidenceRefs: lens.evidenceRefs ?? [],
      nextRoute: lens.nextRoute,
    }))
  })

  it('keeps Architecture ownership structures aligned while localizing visitor-facing copy', () => {
    const en = getHirayaRouteDesignContent('en')
    const zhTW = getHirayaRouteDesignContent('zh-TW')

    expect(zhTW.architectureOwnership.title).toBe('把架構先設計成清楚的 Ownership Boundaries')
    expect(zhTW.architectureOwnership.chrome.responsibilityLabel).toBe('責任範圍')
    expect(zhTW.architectureOwnership.boundaries[0]?.layers[0]?.brief).toBe('定義 Accepted Desired State 可以進入的位置。')

    expectStableListParity(zhTW.architectureOwnership.boundaries, en.architectureOwnership.boundaries, (boundary) => ({
      id: boundary.id,
      layerIds: boundary.layers.map((layer) => layer.id),
      supportingMechanisms: boundary.supportingMechanisms,
    }))
    expectStableListParity(zhTW.architectureOwnership.connectors, en.architectureOwnership.connectors, (connector) => ({
      from: connector.from,
      to: connector.to,
    }))
  })

  it('keeps Architecture exposure matrix structures aligned while localizing table copy', () => {
    const en = getHirayaRouteDesignContent('en')
    const zhTW = getHirayaRouteDesignContent('zh-TW')

    expect(zhTW.architectureExposureBoundaries.chrome.columns.boundaryReason).toBe('邊界理由')
    expect(zhTW.architectureExposureBoundaries.groups[0]?.rows[0]?.boundaryReason).toBe('提供 public Storefront entry point，同時保持 backend services private。')

    expectStableListParity(zhTW.architectureExposureBoundaries.groups, en.architectureExposureBoundaries.groups, (group) => ({
      id: group.id,
      rowIds: group.rows.map((row) => row.id),
      exposureClasses: group.rows.map((row) => row.exposureClass),
      rowCount: group.rows.length,
    }))
  })

  it('keeps Architecture runtime interaction structures aligned while localizing request and secret explanations', () => {
    const en = getHirayaRouteDesignContent('en')
    const zhTW = getHirayaRouteDesignContent('zh-TW')

    expect(zhTW.architectureRuntimeInteractions.chrome.requestGraphTitle).toBe('一條 visitor path，分支到多個 private services')
    expect(zhTW.architectureRuntimeInteractions.secretMaterialization.nonClaims[0]).toBe('這張圖刻意只解釋 materialization，不展示 secret values 或 individual keys。')

    expect(zhTW.architectureRuntimeInteractions.defaultTabId).toBe(en.architectureRuntimeInteractions.defaultTabId)
    expectStableListParity(zhTW.architectureRuntimeInteractions.requestPaths.stages, en.architectureRuntimeInteractions.requestPaths.stages, (stage) => ({
      id: stage.id,
      boundary: stage.boundary,
    }))
    expectStableListParity(zhTW.architectureRuntimeInteractions.requestPaths.examples, en.architectureRuntimeInteractions.requestPaths.examples, (example) => ({
      id: example.id,
      path: example.path,
      stages: example.stages,
    }))
    expectStableListParity(zhTW.architectureRuntimeInteractions.serviceBoundaries.services, en.architectureRuntimeInteractions.serviceBoundaries.services, (service) => ({
      id: service.id,
      name: service.name,
      status: service.status,
      port: service.port,
      kubernetesType: service.kubernetesType,
    }))
    expectStableListParity(zhTW.architectureRuntimeInteractions.secretMaterialization.steps, en.architectureRuntimeInteractions.secretMaterialization.steps, (step) => ({
      id: step.id,
      sourceRef: step.sourceRef,
    }))
  })

  it('keeps WAF maturity judgment structures aligned while localizing visitor-facing copy', () => {
    const en = getHirayaRouteDesignContent('en')
    const zhTW = getHirayaRouteDesignContent('zh-TW')

    expect(zhTW.wafMaturityJudgment.title).toBe('區分已被證明的強項、可接受的 dev 取捨，以及下一步強化路徑')
    expect(zhTW.wafMaturityJudgment.stateCopy['strong-now'].label).toBe('目前強項')
    expect(zhTW.wafMaturityJudgment.chrome.evidenceSupportLabel).toBe('證據支撐')

    expectStableListParity(zhTW.wafMaturityJudgment.pillars, en.wafMaturityJudgment.pillars, (pillar) => ({
      id: pillar.id,
      tools: pillar.tools,
      strongNow: pillar.strongNow.map((item) => ({
        id: item.id,
        state: item.state,
        evidenceRefs: item.evidenceRefs ?? [],
        sourceRefs: item.sourceRefs,
      })),
      devTradeoffs: pillar.devTradeoffs.map((item) => ({
        id: item.id,
        state: item.state,
        evidenceRefs: item.evidenceRefs ?? [],
        sourceRefs: item.sourceRefs,
      })),
      hardenNext: pillar.hardenNext.map((item) => ({
        id: item.id,
        state: item.state,
        evidenceRefs: item.evidenceRefs ?? [],
        sourceRefs: item.sourceRefs,
      })),
    }))
  })

  it('keeps SDLC authority flow semantics stable while localizing authority copy', () => {
    const en = getHirayaRouteDesignContent('en')
    const zhTW = getHirayaRouteDesignContent('zh-TW')

    expect(zhTW.sdlcAuthorityFlow.title).toBe('從驗證證據到 Runtime State 的 Authority Flow')
    expect(zhTW.sdlcAuthorityFlow.chrome.selectedStageLabel).toBe('已選擇的權責階段')
    expect(zhTW.sdlcAuthorityFlow.lanes[0]?.label).toBe('Application 交付')
    expect(zhTW.sdlcAuthorityFlow.lanes[0]?.stages[0]?.label).toBe('PR 驗證證據')

    expectStableListParity(zhTW.sdlcAuthorityFlow.lanes, en.sdlcAuthorityFlow.lanes, (lane) => ({
      id: lane.id,
      defaultStageId: lane.defaultStageId,
      stages: lane.stages.map((stage) => ({
        id: stage.id,
        conceptId: stage.conceptId,
        credentialTone: stage.credentialPosture.tone,
        evidenceRefs: stage.evidenceRefs ?? [],
      })),
      connectors: lane.connectors.map((connector) => ({ from: connector.from, to: connector.to })),
    }))
  })

  it('keeps SDLC delivery guardrails stable while localizing rule copy and badges', () => {
    const en = getHirayaRouteDesignContent('en')
    const zhTW = getHirayaRouteDesignContent('zh-TW')

    expect(zhTW.sdlcDeliveryGuardrails.title).toBe('五項避免 CI 變成部署權限的 Delivery Guardrails')
    expect(zhTW.sdlcDeliveryGuardrails.chrome.authorityFlowStagesLabel).toBe('Authority Flow 階段')
    expect(zhTW.sdlcDeliveryGuardrails.authorityBadges['no-aws'].label).toBe('無 AWS 寫入權限')
    expect(zhTW.sdlcDeliveryGuardrails.guardrails[0]?.rule).toBe('先驗證，後授權')

    expectStableListParity(zhTW.sdlcDeliveryGuardrails.guardrails, en.sdlcDeliveryGuardrails.guardrails, (guardrail) => ({
      id: guardrail.id,
      authorityBadge: guardrail.authorityBadge,
      flowStageIds: guardrail.flowStageIds,
      sourceRefs: guardrail.sourceRefs,
      evidenceRefs: guardrail.evidenceRefs ?? [],
    }))
  })

  it('keeps Cost capacity trade-off ledger stable while localizing visitor-facing decisions', () => {
    const en = getHirayaRouteDesignContent('en')
    const zhTW = getHirayaRouteDesignContent('zh-TW')

    expect(zhTW.costCapacityTradeoffLedger.title).toBe('容量取捨帳本')
    expect(zhTW.costCapacityTradeoffLedger.tabs.tradeoffAnalysis.label).toBe('取捨分析')
    expect(zhTW.costCapacityTradeoffLedger.chrome.tableColumns.justification).toBe('支出合理性')
    expect(zhTW.costCapacityTradeoffLedger.capacity.currentTerraformSizing).toEqual(en.costCapacityTradeoffLedger.capacity.currentTerraformSizing)

    expect(zhTW.costCapacityTradeoffLedger.tradeoffs[0]?.monthlyEstimate).toBe('約 73 美元')
    expect(zhTW.costCapacityTradeoffLedger.estimateRows[0]?.monthlyEstimate).toBe('約 73 美元')
    expectStableListParity(zhTW.costCapacityTradeoffLedger.tradeoffs, en.costCapacityTradeoffLedger.tradeoffs, (tradeoff) => ({
      id: tradeoff.id,
      tradeoffClass: tradeoff.tradeoffClass,
      sourceRefs: tradeoff.sourceRefs,
    }))
    expectStableListParity(zhTW.costCapacityTradeoffLedger.estimateRows, en.costCapacityTradeoffLedger.estimateRows, (row) => ({
      category: row.category,
    }))
    expect(zhTW.costCapacityTradeoffLedger.capacity).toMatchObject({
      nodeCount: en.costCapacityTradeoffLedger.capacity.nodeCount,
      podLimitPerNode: en.costCapacityTradeoffLedger.capacity.podLimitPerNode,
      totalPodSlots: en.costCapacityTradeoffLedger.capacity.totalPodSlots,
      currentRunningPods: en.costCapacityTradeoffLedger.capacity.currentRunningPods,
      remainingPodSlots: en.costCapacityTradeoffLedger.capacity.remainingPodSlots,
      sourceRefs: en.costCapacityTradeoffLedger.capacity.sourceRefs,
    })
  })

  it('keeps evidence asset metadata stable while localizing titles and captions', () => {
    const en = getHirayaRouteDesignContent('en')
    const zhTW = getHirayaRouteDesignContent('zh-TW')

    expect(zhTW.evidenceAssets.find((asset) => asset.evidenceId === 'p1-secrets')?.title).toBe('Secrets Manager 與 External Secrets')

    expectStableListParity(zhTW.evidenceAssets, en.evidenceAssets, (asset) => ({
      evidenceId: asset.evidenceId,
      status: asset.status,
      preferredUse: asset.preferredUse,
      routes: asset.routes,
      assets: asset.assets.map((evidenceAsset) => ({
        id: evidenceAsset.id,
        kind: evidenceAsset.kind,
        status: evidenceAsset.status,
        src: evidenceAsset.src,
      })),
    }))
  })

  it('keeps reusable evidence carousel chrome covered by i18next resources', () => {
    const enEvidence = resources.en.translation.hiraya.evidence
    const zhEvidence = resources['zh-TW'].translation.hiraya.evidence

    expect(zhEvidence.eyebrow).toBe('證據')
    expect(zhEvidence.previous).toBe('上一個證據')
    expect(zhEvidence.carousels.architecture.title).toBe('支撐架構決策的證據')
    expect(zhEvidence.carousels.cost.previews.destroyWorkflow).toHaveLength(enEvidence.carousels.cost.previews.destroyWorkflow.length)
    expect(zhEvidence.carousels.sdlc.previews.deliveryFlow).toHaveLength(enEvidence.carousels.sdlc.previews.deliveryFlow.length)
    expect(zhEvidence.carousels.waf.previews.secrets).toHaveLength(enEvidence.carousels.waf.previews.secrets.length)
  })

  it('keeps locale page structures aligned', () => {
    expect(zhPages).toHaveLength(enPages.length)

    enPages.forEach((enPage, pageIndex) => {
      const zhPage = zhPages[pageIndex]
      expect(zhPage.id).toBe(enPage.id)
      expect(zhPage.sourceDoc).toBe(enPage.sourceDoc)
      expect(zhPage.sourceSection).toBe(enPage.sourceSection)
      expect(zhPage.metrics ?? []).toHaveLength(enPage.metrics?.length ?? 0)
      expect((zhPage.proofPoints ?? []).map((item) => item.id)).toEqual((enPage.proofPoints ?? []).map((item) => item.id))
      expect((zhPage.mediaSlots ?? []).map((item) => ({ id: item.id, type: item.type, status: item.status, evidenceRefs: item.evidenceRefs }))).toEqual(
        (enPage.mediaSlots ?? []).map((item) => ({ id: item.id, type: item.type, status: item.status, evidenceRefs: item.evidenceRefs })),
      )
      expect((zhPage.flow ?? []).map((item) => item.id)).toEqual((enPage.flow ?? []).map((item) => item.id))
      expect((zhPage.pillars ?? []).map((item) => ({ id: item.id, tools: item.tools }))).toEqual(
        (enPage.pillars ?? []).map((item) => ({ id: item.id, tools: item.tools })),
      )
      expect(zhPage.sections.map((section) => section.id)).toEqual(enPage.sections.map((section) => section.id))

      enPage.sections.forEach((section, sectionIndex) => {
        const zhSection = zhPage.sections[sectionIndex]
        expect(zhSection.table?.columns.length ?? 0).toBe(section.table?.columns.length ?? 0)
        expect(zhSection.table?.rows.length ?? 0).toBe(section.table?.rows.length ?? 0)
        section.table?.rows.forEach((row, rowIndex) => {
          expect(zhSection.table?.rows[rowIndex]).toHaveLength(row.length)
        })
      })
    })
  })
})

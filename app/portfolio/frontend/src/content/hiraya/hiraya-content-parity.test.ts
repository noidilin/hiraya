import { describe, expect, it } from 'vitest'

import { hirayaPagesEn } from './en'
import { hirayaPagesZhTW } from './zh-TW'
import { expectStableListParity } from './parity-test-helpers'
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

  it('keeps evidence asset metadata stable while localizing titles and captions', () => {
    const en = getHirayaRouteDesignContent('en')
    const zhTW = getHirayaRouteDesignContent('zh-TW')

    expect(zhTW.evidenceAssets.find((asset) => asset.evidenceId === 'p1-secrets')?.title).toBe('Secrets Manager 與 External Secrets')

    expectStableListParity(zhTW.evidenceAssets, en.evidenceAssets, (asset) => ({
      evidenceId: asset.evidenceId,
      kind: asset.kind,
      status: asset.status,
      preferredUse: asset.preferredUse,
      routes: asset.routes,
      src: asset.src,
    }))
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

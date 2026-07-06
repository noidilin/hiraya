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

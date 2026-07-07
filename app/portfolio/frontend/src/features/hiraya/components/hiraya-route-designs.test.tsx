/* @vitest-environment jsdom */

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { findHirayaPage } from '@/content/hiraya/content'
import { getHirayaRouteDesignContent } from '@/content/hiraya/route-design-content'

let container: HTMLDivElement
let root: Root

async function renderSdlcRouteDesign() {
  await import('@/i18n')
  const { HirayaRouteDesign } = await import('./hiraya-route-designs')

  await act(async () => {
    root.render(<HirayaRouteDesign page={findHirayaPage('sdlc', 'en')} content={getHirayaRouteDesignContent('en')} />)
  })
}

describe('Hiraya route evidence carousel layout', () => {
  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
    vi.stubGlobal('ResizeObserver', class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    })
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.unstubAllGlobals()
  })

  it('constrains the high-slide-count SDLC evidence carousel to the route column', async () => {
    await renderSdlcRouteDesign()

    const nextButton = container.querySelector('button[aria-label="Next evidence"]')
    expect(nextButton).toBeInstanceOf(HTMLButtonElement)

    const evidenceSection = nextButton?.closest('section')
    expect(evidenceSection?.className).toContain('min-w-0')
    expect(evidenceSection?.className).toContain('overflow-hidden')

    const carousel = Array.from(evidenceSection?.querySelectorAll('div') ?? []).find((element) =>
      String(element.className).includes('group/hover'),
    )
    expect(carousel?.className).toContain('max-w-full')

    const carouselTrack = Array.from(evidenceSection?.querySelectorAll('div') ?? []).find((element) =>
      String(element.className).includes('cursor-grab'),
    )
    expect(carouselTrack?.className).toContain('min-w-0')
    expect(carouselTrack?.className).toContain('max-w-full')

    expect(container.querySelectorAll('button[aria-label^="Go to slide"]').length).toBe(12)
  })
})

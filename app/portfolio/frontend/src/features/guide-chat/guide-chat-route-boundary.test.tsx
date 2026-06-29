/* @vitest-environment jsdom */

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let container: HTMLDivElement
let root: Root

function stubBrowserApis() {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('fetch', vi.fn())
  vi.stubGlobal(
    'ResizeObserver',
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  Element.prototype.scrollIntoView = vi.fn()
}

async function renderAppAt(pathname: string) {
  window.history.pushState({}, '', pathname)

  vi.doMock('@/features/lab/pages/kinetic-lab-page', () => ({
    KineticLabPage: () => <main>Lab route</main>,
  }))
  vi.doMock('@/features/lab/pages/visual-reference-gallery', () => ({
    VisualReferenceGallery: () => <main>Visuals route</main>,
  }))

  const { default: App } = await import('@/App')

  await act(async () => {
    root.render(<App />)
  })
}

function textContent() {
  return container.textContent ?? ''
}

describe('Guide chat route boundary', () => {
  beforeEach(() => {
    vi.resetModules()
    stubBrowserApis()
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.unstubAllGlobals()
  })

  it('shows the Guide chat launcher on Hiraya pages', async () => {
    await renderAppAt('/hiraya/brief')

    expect(textContent()).toContain('Ask Hiraya Guide')
  })

  it('does not show the Guide chat launcher outside Hiraya pages', async () => {
    await renderAppAt('/visuals')

    expect(textContent()).toContain('Visuals route')
    expect(textContent()).not.toContain('Ask Hiraya Guide')
  })
})

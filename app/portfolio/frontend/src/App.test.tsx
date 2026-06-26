/* @vitest-environment jsdom */

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let container: HTMLDivElement
let root: Root

async function renderApp() {
  const { default: App } = await import('./App')
  await act(async () => {
    root.render(<App />)
  })
}

function textContent() {
  return container.textContent ?? ''
}

function clickButton(label: string) {
  const button = Array.from(container.querySelectorAll('button')).find((candidate) =>
    (candidate.textContent ?? '').includes(label),
  )

  if (!button) throw new Error(`Could not find button containing ${label}`)

  return act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

describe('Hiraya Portfolio narrative shell', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => `uuid-${Math.random()}`) })
    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.unstubAllGlobals()
  })

  it('presents the portfolio narrative using established glossary language', async () => {
    vi.stubGlobal('fetch', vi.fn())

    await renderApp()

    expect(textContent()).toContain('Hiraya Portfolio')
    expect(textContent()).toContain('Portfolio Visitors')
    expect(textContent()).toContain('Vintage Storefront remains the EKS/GitOps demonstration workload')
    expect(textContent()).toContain('Curated Project Knowledge')
    expect(textContent()).toContain('Target Team Permission Model')
  })

  it('renders answered responses with normalized citations from the Guide API', async () => {
    const fetcher = vi.fn(async () =>
      new Response(
        JSON.stringify({
          status: 'answered',
          answer: 'Hiraya uses a durable Portfolio Stack for the public project story.',
          sessionId: 'guide-session-1',
          citations: [{ title: 'Architecture', source: 'docs/portfolio/ARCHITECTURE.md' }],
        }),
        { status: 200 },
      ),
    )
    vi.stubGlobal('fetch', fetcher)

    await renderApp()
    await clickButton('How does Hiraya deploy infrastructure?')

    expect(fetcher).toHaveBeenCalledWith('/api/guide/chat', expect.objectContaining({ method: 'POST' }))
    expect(textContent()).toContain('answered')
    expect(textContent()).toContain('Hiraya uses a durable Portfolio Stack')
    expect(textContent()).toContain('Architecture · docs/portfolio/ARCHITECTURE.md')
  })

  it('keeps the browser-scoped Guide Session on follow-up questions', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: 'answered', answer: 'First answer.', sessionId: 'guide-session-1', citations: [] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: 'refused', answer: 'I only answer from curated project knowledge.', sessionId: 'guide-session-1', citations: [] }), {
          status: 200,
        }),
      )
    vi.stubGlobal('fetch', fetcher)

    await renderApp()
    await clickButton('How does Hiraya deploy infrastructure?')
    await clickButton('What security gates are implemented?')

    expect(JSON.parse(fetcher.mock.calls[1]?.[1]?.body as string)).toEqual({
      message: 'What security gates are implemented?',
      sessionId: 'guide-session-1',
    })
    expect(textContent()).toContain('refused')
  })

  it('renders not-ready and transport error states clearly', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: 'not_ready', answer: 'The knowledge base is still being prepared.', citations: [] }), {
          status: 200,
        }),
      )
      .mockRejectedValueOnce(new Error('network down'))
    vi.stubGlobal('fetch', fetcher)

    await renderApp()
    await clickButton('How does Hiraya deploy infrastructure?')
    await clickButton('What security gates are implemented?')

    expect(textContent()).toContain('not ready')
    expect(textContent()).toContain('The knowledge base is still being prepared.')
    expect(textContent()).toContain('error')
    expect(textContent()).toContain('The Guide API is not reachable yet.')
  })
})

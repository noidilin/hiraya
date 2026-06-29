/* @vitest-environment jsdom */

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let container: HTMLDivElement
let root: Root

async function renderGuideChat() {
  const { GuideChatLauncher } = await import('./components/guide-chat-launcher')
  await act(async () => {
    root.render(<GuideChatLauncher />)
  })
}

async function clickButton(label: string | RegExp) {
  const button = Array.from(container.querySelectorAll('button')).find((candidate) => {
    const text = candidate.textContent ?? ''
    return typeof label === 'string' ? text.includes(label) : label.test(text)
  })

  if (!button) throw new Error(`Could not find button containing ${label.toString()}`)

  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

async function submitPrompt(prompt: string) {
  const textarea = container.querySelector('textarea')
  if (!textarea) throw new Error('Could not find Guide prompt textarea')

  await act(async () => {
    const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
    valueSetter?.call(textarea, prompt)
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: prompt }))
  })

  const sendButton = container.querySelector('button[aria-label="Send message"]')
  if (!sendButton) throw new Error('Could not find Guide send button')

  await act(async () => {
    sendButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

function textContent() {
  return container.textContent ?? ''
}

describe('Hiraya Guide chat launcher', () => {
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
    Element.prototype.scrollIntoView = vi.fn()
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.unstubAllGlobals()
  })

  it('opens from a minimized global launcher and renders the initial guide intro', async () => {
    vi.stubGlobal('fetch', vi.fn())

    await renderGuideChat()
    expect(textContent()).toContain('Ask Hiraya Guide')

    await clickButton('Ask Hiraya Guide')

    expect(textContent()).toContain('Hiraya Guide is ready for API wiring')
    expect(textContent()).toContain('How does Hiraya deploy infrastructure?')
  })

  it('submits a typed prompt to the same-origin Guide API and renders the answer with citations', async () => {
    const fetcher = vi.fn(async () =>
      new Response(
        JSON.stringify({
          status: 'answered',
          answer: 'Hiraya deploys through validated CI/CD and GitOps.',
          sessionId: 'guide-session-1',
          citations: [{ title: 'Architecture', source: 'docs/portfolio/ARCHITECTURE.md' }],
        }),
        { status: 200 },
      ),
    )
    vi.stubGlobal('fetch', fetcher)

    await renderGuideChat()
    await clickButton('Ask Hiraya Guide')
    await submitPrompt('How does Hiraya deploy infrastructure?')

    expect(fetcher).toHaveBeenCalledWith('/api/guide/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'How does Hiraya deploy infrastructure?' }),
    })
    expect(textContent()).toContain('answered')
    expect(textContent()).toContain('Hiraya deploys through validated CI/CD and GitOps.')
    expect(textContent()).toContain('Architecture · docs/portfolio/ARCHITECTURE.md')
  })

  it('keeps the browser-scoped Guide session on follow-up questions', async () => {
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

    await renderGuideChat()
    await clickButton('Ask Hiraya Guide')
    await clickButton('How does Hiraya deploy infrastructure?')
    await clickButton('What security gates are implemented?')

    expect(JSON.parse(fetcher.mock.calls[1]?.[1]?.body as string)).toEqual({
      message: 'What security gates are implemented?',
      sessionId: 'guide-session-1',
    })
    expect(textContent()).toContain('refused')
  })

  it('shows safe fallback copy when the Guide API response is unexpected', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ status: 'unknown' }), { status: 200 }))
    vi.stubGlobal('fetch', fetcher)

    await renderGuideChat()
    await clickButton('Ask Hiraya Guide')
    await clickButton('How does Hiraya deploy infrastructure?')

    expect(textContent()).toContain('error')
    expect(textContent()).toContain('The Guide API is not reachable yet.')
  })
})

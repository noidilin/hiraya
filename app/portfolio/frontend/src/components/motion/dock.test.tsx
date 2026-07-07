/* @vitest-environment jsdom */

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { Dock, DockItem } from './dock'

let container: HTMLDivElement
let root: Root

async function settleTooltip() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
}

describe('DockItem tooltip composition', () => {
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

  it('forwards TooltipTrigger props when rendered as a button', async () => {
    await act(async () => {
      root.render(
        <TooltipProvider>
          <Dock>
            <Tooltip>
              <TooltipTrigger asChild>
                <DockItem aria-label="Switch locale" onClick={() => {}}>
                  EN
                </DockItem>
              </TooltipTrigger>
              <TooltipContent>zh-TW copy is LLM-translated</TooltipContent>
            </Tooltip>
          </Dock>
        </TooltipProvider>,
      )
    })

    const trigger = container.querySelector('button[aria-label="Switch locale"]')
    expect(trigger).toBeInstanceOf(HTMLButtonElement)

    if (!(trigger instanceof HTMLButtonElement)) {
      throw new Error('Expected a button tooltip trigger')
    }

    await act(async () => {
      trigger.focus()
    })
    await settleTooltip()

    expect(document.body.textContent).toContain('zh-TW copy is LLM-translated')
  })
})

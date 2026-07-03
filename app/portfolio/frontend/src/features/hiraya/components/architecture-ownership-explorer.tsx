import type { ReactNode } from 'react'
import { Fragment, useMemo, useState } from 'react'

import { Tabs, TabsList, TabsTrigger } from '@/components/motion/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type {
  ArchitectureOwnershipBoundary,
  ArchitectureOwnershipBoundaryId,
  ArchitectureOwnershipConnector,
  ArchitectureOwnershipContent,
  ArchitectureOwnershipInternalLayer,
} from '@/content/hiraya/architectureOwnership'
import { cn } from '@/lib/utils'

import { HirayaSectionFrame, HirayaSectionHeader, HirayaTag } from './hiraya-section'

type ArchitectureOwnershipExplorerProps = {
  content: ArchitectureOwnershipContent
  className?: string
}

function connectorId(connector: ArchitectureOwnershipConnector) {
  return `${connector.from}:${connector.to}`
}

function InternalLayerItem({ layer }: { layer: ArchitectureOwnershipInternalLayer }) {
  return (
    <li>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            role="group"
            aria-label={`${layer.label}. ${layer.brief}`}
            className="block border border-border/80 bg-background/72 px-2.5 py-2 text-xs leading-5 text-foreground outline-none transition duration-150 hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/5 focus-visible:border-primary/65 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none"
          >
            {layer.label}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-64">
          <span className="font-medium">{layer.label}</span>
          <span className="block text-muted-foreground">{layer.brief}</span>
        </TooltipContent>
      </Tooltip>
    </li>
  )
}

function BoundaryStack({
  boundary,
  index,
  state,
  onSelect,
}: {
  boundary: ArchitectureOwnershipBoundary
  index: number
  state: 'selected' | 'adjacent' | 'muted'
  onSelect: () => void
}) {
  return (
    <article
      onClick={onSelect}
      className={cn(
        'relative h-full border bg-background/82 p-3 shadow-sm backdrop-blur-sm transition-colors',
        state === 'selected' && 'border-primary/75 bg-primary/10 ring-1 ring-primary/25',
        state === 'adjacent' && 'border-primary/35 bg-background/90',
        state === 'muted' && 'border-border/90 opacity-70 hover:opacity-100',
      )}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onSelect()
        }}
        onFocus={onSelect}
        className="block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
      >
        <div className="border-b border-border/75 pb-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
            {String(index + 1).padStart(2, '0')} · boundary stack
          </p>
          <h3 className="mt-1 text-sm font-semibold tracking-normal text-foreground xl:text-base">{boundary.label}</h3>
        </div>
        <p className="mt-2 text-[11px] leading-4 text-muted-foreground">Owner: {boundary.primaryOwner}</p>
      </button>

      <ol className="mt-3 grid gap-2">
        {boundary.layers.map((layer) => (
          <InternalLayerItem key={layer.id} layer={layer} />
        ))}
      </ol>
    </article>
  )
}

function OwnershipTimeline({
  boundaries,
  connectors,
  activeConnectorIds,
}: {
  boundaries: readonly ArchitectureOwnershipBoundary[]
  connectors: readonly ArchitectureOwnershipConnector[]
  activeConnectorIds: Set<string>
}) {
  return (
    <div className="border border-border/80 bg-background/72 p-3 shadow-sm backdrop-blur-sm">
      <div className="grid grid-cols-[repeat(11,minmax(0,1fr))] items-center gap-2">
        {boundaries.map((boundary, index) => {
          const connector = connectors.find((item) => item.from === boundary.id)
          const isActive = connector ? activeConnectorIds.has(connectorId(connector)) : false

          return (
            <Fragment key={boundary.id}>
              <div className="grid justify-items-center gap-1 text-center">
                <span className="grid size-6 place-items-center border border-primary/35 bg-card font-mono text-[10px] font-semibold text-primary">
                  {index + 1}
                </span>
                <span className="hidden font-mono text-[9px] uppercase leading-3 tracking-normal text-muted-foreground md:block">
                  {boundary.shortLabel}
                </span>
              </div>
              {connector ? (
                <div className={cn('grid gap-1 text-center transition-colors', isActive ? 'text-primary' : 'text-muted-foreground')}>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1">
                    <span className={cn('h-px', isActive ? 'bg-primary' : 'bg-border')} />
                    <span className="font-mono text-[10px] leading-none">→</span>
                    <span className={cn('h-px', isActive ? 'bg-primary' : 'bg-border')} />
                  </div>
                  <span className="font-mono text-[8px] uppercase leading-3 tracking-normal sm:text-[9px]">{connector.label}</span>
                </div>
              ) : null}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}

function DetailSection({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('min-w-0', className)}>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">{title}</p>
      <div className="mt-2 text-sm leading-6 text-muted-foreground">{children}</div>
    </section>
  )
}

function BoundaryDetail({ boundary }: { boundary: ArchitectureOwnershipBoundary }) {
  return (
    <aside className="border-t border-border bg-card/78 p-5">
      <div className="grid gap-5">
        <div className="grid gap-4 xl:grid-cols-[0.72fr_1fr_1fr] xl:items-stretch">
          <div className="border-r border-border/70 pr-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">selected boundary</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-normal text-foreground">{boundary.label}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Primary owner: <span className="font-medium text-foreground">{boundary.primaryOwner}</span>
            </p>
          </div>

          <div className="border-l-2 border-primary pl-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">responsibility</p>
            <p className="mt-2 text-base leading-7 text-foreground">{boundary.responsibility}</p>
          </div>

          <div className="border-l-2 border-primary pl-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">design decision</p>
            <p className="mt-2 text-base leading-7 text-foreground">{boundary.decision}</p>
          </div>
        </div>

        <div className="grid gap-5 border-t border-border pt-5 xl:grid-cols-[1.2fr_0.9fr_0.9fr]">
          <DetailSection title="Owned/control layers">
            <ul className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-1">
              {boundary.layers.map((layer) => (
                <li key={layer.id} className="flex gap-2 text-xs leading-5">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    <span className="font-medium text-foreground">{layer.label}</span> — {layer.brief}
                  </span>
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection title="Supporting mechanisms">
            <div className="flex flex-wrap gap-2">
              {boundary.supportingMechanisms.map((mechanism) => (
                <HirayaTag key={mechanism}>{mechanism}</HirayaTag>
              ))}
            </div>
          </DetailSection>

          <DetailSection title="Does not own">
            <ul className="grid gap-1">
              {boundary.doesNotOwn.map((item) => (
                <li key={item} className="text-xs leading-5">
                  <span className="mr-2 font-mono text-primary">//</span>
                  {item}
                </li>
              ))}
            </ul>
          </DetailSection>
        </div>
      </div>
    </aside>
  )
}

export function ArchitectureOwnershipExplorer({ content, className }: ArchitectureOwnershipExplorerProps) {
  const [selectedBoundaryId, setSelectedBoundaryId] = useState<ArchitectureOwnershipBoundaryId>('delivery-authority')

  const selectedBoundaryIndex = content.boundaries.findIndex((boundary) => boundary.id === selectedBoundaryId)
  const selectedBoundary = content.boundaries[selectedBoundaryIndex] ?? content.boundaries[0]

  const adjacentBoundaryIds = useMemo(
    () =>
      new Set(
        [content.boundaries[selectedBoundaryIndex - 1]?.id, content.boundaries[selectedBoundaryIndex + 1]?.id].filter(
          Boolean,
        ) as ArchitectureOwnershipBoundaryId[],
      ),
    [content.boundaries, selectedBoundaryIndex],
  )

  const activeConnectorIds = useMemo(
    () =>
      new Set(
        content.connectors
          .filter((connector) => connector.from === selectedBoundaryId || connector.to === selectedBoundaryId)
          .map(connectorId),
      ),
    [content.connectors, selectedBoundaryId],
  )

  return (
    <HirayaSectionFrame className={cn('overflow-hidden', className)}>
      <HirayaSectionHeader eyebrow="Ownership explorer" title={content.title} description={content.summary} />

      <Tabs variant="dock" value={selectedBoundaryId} onValueChange={(value) => setSelectedBoundaryId(value as ArchitectureOwnershipBoundaryId)}>
        <div className="border-b border-border bg-card/70 px-5 py-3">
          <TabsList className="flex flex-wrap rounded-xl border border-border/80 bg-background/70 p-1">
            {content.boundaries.map((boundary) => (
              <TabsTrigger
                key={boundary.id}
                value={boundary.id}
                className="min-h-9 rounded-xl px-3 py-2 text-xs"
                indicatorClassName="rounded-xl"
              >
                {boundary.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      <TooltipProvider>
        <div className="relative overflow-hidden bg-card/80">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border),transparent_64%)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border),transparent_70%)_1px,transparent_1px)] bg-[size:24px_24px] opacity-25" />

          <div className="relative grid gap-4 p-5">
            <OwnershipTimeline
              boundaries={content.boundaries}
              connectors={content.connectors}
              activeConnectorIds={activeConnectorIds}
            />

            <div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-2 xl:grid-cols-6">
              {content.boundaries.map((boundary, index) => {
                const state =
                  boundary.id === selectedBoundary.id ? 'selected' : adjacentBoundaryIds.has(boundary.id) ? 'adjacent' : 'muted'

                return (
                  <BoundaryStack
                    key={boundary.id}
                    boundary={boundary}
                    index={index}
                    state={state}
                    onSelect={() => setSelectedBoundaryId(boundary.id)}
                  />
                )
              })}
            </div>
          </div>

          <div className="relative">
            <BoundaryDetail boundary={selectedBoundary} />
          </div>
        </div>
      </TooltipProvider>
    </HirayaSectionFrame>
  )
}

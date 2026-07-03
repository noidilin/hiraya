import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'

import { Tabs, TabsList, TabsTrigger } from '@/components/motion/tabs'
import type {
  SdlcAuthorityConnector,
  SdlcAuthorityFlowContent,
  SdlcAuthorityLane,
  SdlcAuthorityLaneId,
  SdlcAuthorityStage,
  SdlcAuthorityStageId,
} from '@/content/hiraya/sdlcAuthorityFlow'
import { cn } from '@/lib/utils'

import { HirayaSectionFrame, HirayaSectionHeader, HirayaTag } from './hiraya-section'

type SdlcAuthorityFlowProps = {
  content: SdlcAuthorityFlowContent
  className?: string
}

type StageState = 'selected' | 'active-lane' | 'shared-concept' | 'muted'

function connectorId(connector: SdlcAuthorityConnector) {
  return `${connector.from}:${connector.to}`
}

function findLaneForStage(content: SdlcAuthorityFlowContent, stageId: SdlcAuthorityStageId) {
  return content.lanes.find((lane) => lane.stages.some((stage) => stage.id === stageId))
}

function findStage(content: SdlcAuthorityFlowContent, stageId: SdlcAuthorityStageId) {
  for (const lane of content.lanes) {
    const stage = lane.stages.find((item) => item.id === stageId)
    if (stage) return { stage, lane }
  }

  const fallbackLane = content.lanes[0]
  return { stage: fallbackLane.stages[0], lane: fallbackLane }
}

function CredentialBadge({ stage }: { stage: SdlcAuthorityStage }) {
  const toneClass = {
    neutral: 'border-border bg-muted/50 text-muted-foreground',
    safe: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    scoped: 'border-sky-500/35 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    gated: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    gitops: 'border-primary/40 bg-primary/10 text-primary',
  }[stage.credentialPosture.tone]

  return (
    <span className={cn('inline-flex border px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-normal', toneClass)}>
      {stage.credentialPosture.label}
    </span>
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

function StageNode({
  stage,
  state,
  laneLabel,
  onSelect,
}: {
  stage: SdlcAuthorityStage
  state: StageState
  laneLabel: string
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={state === 'selected'}
      onClick={onSelect}
      onFocus={onSelect}
      className={cn(
        'grid min-h-32 w-40 shrink-0 content-between gap-3 border bg-background/80 p-3 text-left outline-none transition duration-150 focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none 2xl:w-44',
        state === 'selected' && 'border-primary/80 bg-primary/10 shadow-sm ring-1 ring-primary/30',
        state === 'active-lane' && 'border-border hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/5',
        state === 'shared-concept' && 'border-primary/45 bg-primary/5',
        state === 'muted' && 'border-border/80 opacity-60 hover:opacity-90',
      )}
    >
      <span>
        <span className="font-mono text-[9px] font-semibold uppercase leading-3 tracking-normal text-muted-foreground">
          {laneLabel}
        </span>
        <span className="mt-1.5 block text-xs font-semibold leading-4 text-foreground">{stage.label}</span>
        <span className="mt-1.5 block text-[10px] leading-4 text-muted-foreground">{stage.authorityHolder}</span>
      </span>
      <CredentialBadge stage={stage} />
    </button>
  )
}

function LaneConnector({ connector, active }: { connector: SdlcAuthorityConnector; active: boolean }) {
  return (
    <div className="grid min-h-32 w-20 shrink-0 content-center gap-2 text-center" aria-hidden={!active}>
      <div className={cn('grid grid-cols-[1fr_auto_1fr] items-center gap-1', active ? 'text-primary' : 'text-muted-foreground')}>
        <span className={cn('h-px', active ? 'bg-primary' : 'bg-border')} />
        <span className="font-mono text-[10px] leading-none">→</span>
        <span className={cn('h-px', active ? 'bg-primary' : 'bg-border')} />
      </div>
      <span
        className={cn(
          'min-h-8 text-pretty font-mono text-[8px] uppercase leading-3 tracking-normal transition-opacity',
          active ? 'opacity-100 text-primary' : 'opacity-0',
        )}
      >
        {connector.label}
      </span>
    </div>
  )
}

function AuthorityLane({
  lane,
  activeLaneId,
  selectedStage,
  activeConnectorIds,
  onSelectStage,
}: {
  lane: SdlcAuthorityLane
  activeLaneId: SdlcAuthorityLaneId
  selectedStage: SdlcAuthorityStage
  activeConnectorIds: Set<string>
  onSelectStage: (stageId: SdlcAuthorityStageId) => void
}) {
  const activeLane = lane.id === activeLaneId

  return (
    <section
      className="grid gap-4 border border-border/75 bg-background/45 p-4 transition-colors lg:grid-cols-[13rem_minmax(0,1fr)]"
      aria-label={`${lane.label} authority lane`}
    >
      <div className="border-b border-border/70 pb-3 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">active authority path</p>
        <h3 className="mt-1.5 text-lg font-semibold tracking-normal text-foreground">{lane.label}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{lane.summary}</p>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max items-stretch">
          {lane.stages.map((stage) => {
            const connector = lane.connectors.find((item) => item.from === stage.id)
            const state: StageState =
              stage.id === selectedStage.id
                ? 'selected'
                : stage.conceptId && stage.conceptId === selectedStage.conceptId
                  ? 'shared-concept'
                  : activeLane
                    ? 'active-lane'
                    : 'muted'

            return (
              <div key={stage.id} className="flex items-stretch">
                <StageNode
                  stage={stage}
                  state={state}
                  laneLabel={lane.label}
                  onSelect={() => onSelectStage(stage.id)}
                />
                {connector ? <LaneConnector connector={connector} active={activeConnectorIds.has(connectorId(connector))} /> : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function StageDetail({ stage, lane }: { stage: SdlcAuthorityStage; lane: SdlcAuthorityLane }) {
  return (
    <aside className="border-t border-border bg-card/78 p-5">
      <div className="grid gap-5">
        <div className="grid gap-4 xl:grid-cols-[0.72fr_1fr_1fr] xl:items-stretch">
          <div className="border-b border-border/70 pb-4 xl:border-b-0 xl:border-r xl:pb-0 xl:pr-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">selected authority stage</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-normal text-foreground">{stage.label}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Lane: <span className="font-medium text-foreground">{lane.label}</span>
            </p>
            <div className="mt-3">
              <CredentialBadge stage={stage} />
            </div>
          </div>

          <div className="border-l-2 border-primary pl-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">allowed action</p>
            <p className="mt-2 text-base leading-7 text-foreground">{stage.allowedAction}</p>
          </div>

          <div className="border-l-2 border-primary pl-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">authority holder</p>
            <p className="mt-2 text-base leading-7 text-foreground">{stage.authorityHolder}</p>
          </div>
        </div>

        <div className="grid gap-5 border-t border-border pt-5 xl:grid-cols-[1fr_1fr_1.1fr_0.9fr]">
          <DetailSection title="input state">{stage.inputState}</DetailSection>
          <DetailSection title="output state">{stage.outputState}</DetailSection>

          <DetailSection title="evidence produced">
            <div className="flex flex-wrap gap-2">
              {stage.evidence.map((item) => (
                <HirayaTag key={item}>{item}</HirayaTag>
              ))}
              {stage.evidenceRefs?.map((item) => (
                <HirayaTag key={item}>{item}</HirayaTag>
              ))}
            </div>
          </DetailSection>

          <DetailSection title="does not own">
            <ul className="grid gap-1.5">
              {stage.doesNotOwn.map((item) => (
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

export function SdlcAuthorityFlow({ content, className }: SdlcAuthorityFlowProps) {
  const [activeLaneId, setActiveLaneId] = useState<SdlcAuthorityLaneId>('application-delivery')
  const [selectedStageId, setSelectedStageId] = useState<SdlcAuthorityStageId>('pr-validation-evidence')

  const { stage: selectedStage, lane: selectedLane } = findStage(content, selectedStageId)

  const activeConnectorIds = useMemo(
    () =>
      new Set(
        selectedLane.connectors
          .filter((connector) => connector.from === selectedStage.id || connector.to === selectedStage.id)
          .map(connectorId),
      ),
    [selectedLane.connectors, selectedStage.id],
  )

  const handleLaneChange = (value: string) => {
    const nextLane = content.lanes.find((lane) => lane.id === value)
    if (!nextLane) return

    setActiveLaneId(nextLane.id)
    setSelectedStageId(nextLane.defaultStageId)
  }

  const handleStageSelect = (stageId: SdlcAuthorityStageId) => {
    const nextLane = findLaneForStage(content, stageId)
    if (!nextLane) return

    setActiveLaneId(nextLane.id)
    setSelectedStageId(stageId)
  }

  return (
    <HirayaSectionFrame className={cn('overflow-hidden', className)}>
      <HirayaSectionHeader eyebrow="Authority flow" title={content.title} description={content.summary} />

      <Tabs variant="dock" value={activeLaneId} onValueChange={handleLaneChange}>
        <div className="border-b border-border bg-card/70 px-5 py-3">
          <TabsList className="flex flex-wrap rounded-xl border border-border/80 bg-background/70 p-1">
            {content.lanes.map((lane) => (
              <TabsTrigger key={lane.id} value={lane.id} className="min-h-9 rounded-xl px-3 py-2 text-xs" indicatorClassName="rounded-xl">
                {lane.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      <div className="relative overflow-hidden bg-card/80">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border),transparent_64%)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border),transparent_70%)_1px,transparent_1px)] bg-[size:24px_24px] opacity-25" />

        <div className="relative p-5">
          <AuthorityLane
            lane={selectedLane}
            activeLaneId={activeLaneId}
            selectedStage={selectedStage}
            activeConnectorIds={activeConnectorIds}
            onSelectStage={handleStageSelect}
          />
        </div>

        <div className="relative">
          <StageDetail stage={selectedStage} lane={selectedLane} />
        </div>
      </div>
    </HirayaSectionFrame>
  )
}

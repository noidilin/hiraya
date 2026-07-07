import type { ReactNode } from 'react'
import { Fragment, useMemo, useState } from 'react'

import type {
  SdlcAuthorityConnector,
  SdlcAuthorityFlowContent,
  SdlcAuthorityLane,
  SdlcAuthorityLaneId,
  SdlcAuthorityStage,
  SdlcAuthorityStageId,
} from '@/content/hiraya/sdlcAuthorityFlow'
import { cn } from '@/lib/utils'

import { HirayaSectionShell, HirayaTag } from './hiraya-section'

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
  return (
    <span className="inline-flex border border-border bg-background/75 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-normal text-muted-foreground">
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
      onMouseEnter={onSelect}
      onFocus={onSelect}
      onClick={onSelect}
      className={cn(
        'grid min-h-32 w-full min-w-40 shrink-0 content-between gap-3 border bg-background/80 p-3 text-left outline-none transition duration-150 focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none',
        state === 'selected' && 'border-primary/45 bg-background shadow-sm ring-1 ring-primary/20',
        state === 'active-lane' && 'border-border hover:-translate-y-0.5 hover:border-primary/35 hover:bg-background',
        state === 'shared-concept' && 'border-primary/30 bg-background/90',
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

function StageTimeline({
  stages,
  connectors,
  activeConnectorIds,
}: {
  stages: readonly SdlcAuthorityStage[]
  connectors: readonly SdlcAuthorityConnector[]
  activeConnectorIds: Set<string>
}) {
  const timelineColumnCount = Math.max(stages.length * 2 - 1, 1)

  return (
    <div className="border border-border/80 bg-background/72 p-3 shadow-sm backdrop-blur-sm">
      <div
        className="grid min-w-[62rem] items-center gap-2"
        style={{ gridTemplateColumns: `repeat(${timelineColumnCount}, minmax(0, 1fr))` }}
      >
        {stages.map((stage, index) => {
          const connector = connectors.find((item) => item.from === stage.id)
          const isActive = connector ? activeConnectorIds.has(connectorId(connector)) : false

          return (
            <Fragment key={stage.id}>
              <div className="grid justify-items-center gap-1 text-center">
                <span className="grid size-6 place-items-center border border-primary/35 bg-card font-mono text-[10px] font-semibold text-primary">
                  {index + 1}
                </span>
                <span className="break-words font-mono text-[8px] uppercase leading-3 tracking-normal text-muted-foreground sm:text-[9px]">
                  {stage.shortLabel ?? stage.label}
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

function AuthorityLane({
  lane,
  activeLaneId,
  selectedStage,
  activeConnectorIds,
  onSelectStage,
  content,
}: {
  lane: SdlcAuthorityLane
  activeLaneId: SdlcAuthorityLaneId
  selectedStage: SdlcAuthorityStage
  activeConnectorIds: Set<string>
  onSelectStage: (stageId: SdlcAuthorityStageId) => void
  content: SdlcAuthorityFlowContent
}) {
  const activeLane = lane.id === activeLaneId

  return (
    <section
      className="grid min-w-0 gap-4 border border-border/75 bg-background/45 p-4 transition-colors"
      aria-label={`${lane.label} ${content.chrome.laneAriaSuffix}`}
    >
      <div className="grid min-w-0 gap-4 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <div className="min-w-0 border-b border-border/70 pb-3 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">{content.chrome.activePathLabel}</p>
          <h3 className="mt-1.5 text-lg font-semibold tracking-normal text-foreground">{lane.label}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{lane.summary}</p>
        </div>

        <div className="min-w-0 overflow-x-auto pb-1">
          <StageTimeline stages={lane.stages} connectors={lane.connectors} activeConnectorIds={activeConnectorIds} />
          <div
            className="mt-3 grid min-w-[62rem] items-stretch gap-3"
            style={{ gridTemplateColumns: `repeat(${lane.stages.length}, minmax(0, 1fr))` }}
          >
            {lane.stages.map((stage) => {
              const state: StageState =
                stage.id === selectedStage.id
                  ? 'selected'
                  : stage.conceptId && stage.conceptId === selectedStage.conceptId
                    ? 'shared-concept'
                    : activeLane
                      ? 'active-lane'
                      : 'muted'

              return (
                <StageNode
                  key={stage.id}
                  stage={stage}
                  state={state}
                  laneLabel={lane.label}
                  onSelect={() => onSelectStage(stage.id)}
                />
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function StageDetail({ stage, content }: { stage: SdlcAuthorityStage; content: SdlcAuthorityFlowContent }) {
  return (
    <aside className="border-t border-border bg-card/78 p-5">
      <div className="grid gap-5">
        <div className="grid gap-4 xl:grid-cols-[0.72fr_1fr_1fr] xl:items-stretch">
          <div className="border-b border-border/70 pb-4 xl:border-b-0 xl:border-r xl:pb-0 xl:pr-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">{content.chrome.selectedStageLabel}</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-normal text-foreground">{stage.label}</h3>
          </div>

          <div className="border-l-2 border-primary pl-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">{content.chrome.allowedActionLabel}</p>
            <p className="mt-2 text-base leading-7 text-foreground">{stage.allowedAction}</p>
          </div>

          <div className="border-l-2 border-primary pl-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">{content.chrome.authorityHolderLabel}</p>
            <p className="mt-2 text-base leading-7 text-foreground">{stage.authorityHolder}</p>
          </div>
        </div>

        <div className="grid gap-5 border-t border-border pt-5 xl:grid-cols-[1fr_1fr_1.1fr_0.9fr]">
          <DetailSection title={content.chrome.inputStateLabel}>{stage.inputState}</DetailSection>
          <DetailSection title={content.chrome.outputStateLabel}>{stage.outputState}</DetailSection>

          <DetailSection title={content.chrome.evidenceProducedLabel}>
            <div className="flex flex-wrap gap-2">
              {stage.evidence.map((item) => (
                <HirayaTag key={item}>{item}</HirayaTag>
              ))}
            </div>
          </DetailSection>

          <DetailSection title={content.chrome.doesNotOwnLabel}>
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
    <HirayaSectionShell
      className={cn('min-w-0 overflow-hidden', className)}
      eyebrow={content.chrome.eyebrow}
      title={content.title}
      description={content.summary}
      tabs={{
        items: content.lanes.map((lane) => ({ value: lane.id, label: lane.label })),
        value: activeLaneId,
        onValueChange: handleLaneChange,
      }}
    >
      <div className="relative overflow-hidden bg-card/80">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border),transparent_64%)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border),transparent_70%)_1px,transparent_1px)] bg-[size:24px_24px] opacity-25" />

        <div className="relative min-w-0 p-5">
          <AuthorityLane
            lane={selectedLane}
            activeLaneId={activeLaneId}
            selectedStage={selectedStage}
            activeConnectorIds={activeConnectorIds}
            onSelectStage={handleStageSelect}
            content={content}
          />
        </div>

        <div className="relative">
          <StageDetail stage={selectedStage} content={content} />
        </div>
      </div>
    </HirayaSectionShell>
  )
}

import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, GitMerge, KeyRound, ShieldCheck } from 'lucide-react'

import type { SdlcAuthorityFlowContent, SdlcAuthorityStageId } from '@/content/hiraya/sdlcAuthorityFlow'
import type { SdlcDeliveryGuardrail, SdlcDeliveryGuardrailBoardContent } from '@/content/hiraya/sdlcDeliveryGuardrails'
import { cn } from '@/lib/utils'

import { HirayaSectionFrame, HirayaSectionHeader, HirayaTag } from './hiraya-section'

type SdlcDeliveryGuardrailBoardProps = {
  content: SdlcDeliveryGuardrailBoardContent
  authorityFlow: SdlcAuthorityFlowContent
  className?: string
}

function buildStageLabelMap(authorityFlow: SdlcAuthorityFlowContent) {
  return new Map<SdlcAuthorityStageId, string>(
    authorityFlow.lanes.flatMap((lane) => lane.stages.map((stage) => [stage.id, stage.label] as const)),
  )
}

function GuardrailBadge({ guardrail, content }: { guardrail: SdlcDeliveryGuardrail; content: SdlcDeliveryGuardrailBoardContent }) {
  const badgeCopy = content.authorityBadges[guardrail.authorityBadge]

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/75 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
      <ShieldCheck className="size-3" aria-hidden="true" />
      {badgeCopy.label}
    </span>
  )
}


export function SdlcDeliveryGuardrailBoard({ content, authorityFlow, className }: SdlcDeliveryGuardrailBoardProps) {
  const guardrails = content.guardrails
  const [expandedId, setExpandedId] = useState<SdlcDeliveryGuardrail['id']>(guardrails[0]?.id ?? 'validate-before-authorize')
  const stageLabels = useMemo(() => buildStageLabelMap(authorityFlow), [authorityFlow])
  const selectedGuardrail = guardrails.find((guardrail) => guardrail.id === expandedId) ?? guardrails[0]
  const selectedGuardrailIndex = selectedGuardrail ? guardrails.findIndex((guardrail) => guardrail.id === selectedGuardrail.id) : -1

  return (
    <HirayaSectionFrame className={cn('min-w-0', className)}>
      <HirayaSectionHeader
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
      />
      <div className="grid min-w-0 gap-4 p-5 xl:grid-cols-[18rem_minmax(0,1fr)] xl:items-start">
        <div className="grid min-w-0 gap-2">
          {guardrails.map((guardrail, index) => {
            const expanded = guardrail.id === expandedId

            return (
              <article
                key={guardrail.id}
                className={cn(
                  'grid min-w-0 content-start border bg-background/72 transition-colors',
                  expanded ? 'border-primary/55 shadow-sm' : 'border-border hover:border-primary/35',
                )}
              >
                <button
                  type="button"
                  className="grid h-full content-start gap-2 p-3 text-left outline-none ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-expanded={expanded}
                  aria-controls="guardrail-detail-panel"
                  onClick={() => setExpandedId(guardrail.id)}
                  onMouseEnter={() => setExpandedId(guardrail.id)}
                  onFocus={() => setExpandedId(guardrail.id)}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-sm font-semibold leading-5 tracking-normal text-foreground">{guardrail.rule}</h3>
                  </div>
                </button>
              </article>
            )
          })}
        </div>

        {selectedGuardrail ? (
          <section
            id="guardrail-detail-panel"
            className="min-w-0 border border-border bg-background/78 xl:sticky xl:top-24"
            aria-label={`${selectedGuardrail.rule} details`}
          >
            <div className="border-b border-border bg-muted/35 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">
                  {content.chrome.guardrailLabel} {String(selectedGuardrailIndex + 1).padStart(2, '0')}
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  <div className="group relative">
                    <span
                      tabIndex={0}
                      className="inline-flex cursor-help items-center rounded-full border border-border bg-background/75 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      {content.chrome.authorityFlowStagesLabel}
                    </span>
                    <div className="pointer-events-none absolute right-0 top-full z-20 mt-2 hidden w-80 border border-border bg-popover p-3 shadow-xl group-hover:block group-focus-within:block">
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">{content.chrome.mappedStagesLabel}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedGuardrail.flowStageIds.map((stageId) => (
                          <HirayaTag key={stageId}>{stageLabels.get(stageId) ?? stageId}</HirayaTag>
                        ))}
                      </div>
                    </div>
                  </div>
                  <GuardrailBadge guardrail={selectedGuardrail} content={content} />
                </div>
              </div>
              <h3 className="mt-3 text-lg font-semibold tracking-normal text-foreground">{selectedGuardrail.rule}</h3>
            </div>

            <div className="grid gap-4 p-4">
              <div className="grid gap-3 lg:grid-cols-3">
                <div className="border border-border bg-background/70 p-4">
                  <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
                    <CheckCircle2 className="size-3" aria-hidden="true" />
                    {content.chrome.allowedActionLabel}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{selectedGuardrail.allowedAction}</p>
                </div>
                <div className="border border-border bg-background/70 p-4">
                  <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
                    <AlertTriangle className="size-3" aria-hidden="true" />
                    {content.chrome.forbiddenShortcutLabel}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{selectedGuardrail.forbiddenShortcut}</p>
                </div>
                <div className="border border-border bg-background/70 p-4">
                  <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
                    <GitMerge className="size-3" aria-hidden="true" />
                    {content.chrome.handoffResultLabel}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{selectedGuardrail.handoffResult}</p>
                </div>
              </div>

              <div className="border border-border bg-background/70 p-4">
                <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
                  <KeyRound className="size-3" aria-hidden="true" />
                  {content.chrome.shortcutRiskLabel}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{selectedGuardrail.shortcutRisk}</p>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </HirayaSectionFrame>
  )
}

import {
  Boxes,
  ClipboardCheck,
  Code2,
  Database,
  FileCode2,
  FileCog,
  KeyRound,
  UserCheck,
} from 'lucide-react'

import { cn } from '@/lib/utils'

import {
  IconBadge,
  StatusBadge,
  TrustTradeoffShell,
  toneClasses,
  type Tone,
  type VisualProps,
} from './shared/trust-tradeoff-kit'

const generatedItems = [
  { id: 'code', label: 'Code branch', status: 'pass', gate: 'unit + policy', Icon: Code2 },
  { id: 'tests', label: 'Test draft', status: 'pass', gate: 'coverage signal', Icon: ClipboardCheck },
  { id: 'scripts', label: 'Script edit', status: 'hold', gate: 'review shell effects', Icon: FileCode2 },
  { id: 'permissions', label: 'Permission scope', status: 'hold', gate: 'least privilege review', Icon: KeyRound },
  { id: 'config', label: 'Config change', status: 'hold', gate: 'env diff review', Icon: FileCog },
  { id: 'migration', label: 'Migration', status: 'block', gate: 'compatibility gap', Icon: Database },
  { id: 'deps', label: 'Dependency', status: 'pass', gate: 'scan + lockfile', Icon: Boxes },
] as const

const evidenceTokens = [
  { label: 'Tests ran', detail: 'recorded result', tone: 'success' },
  { label: 'Scan attached', detail: 'dependency evidence', tone: 'success' },
  { label: 'Human review', detail: 'held until judged', tone: 'warning' },
] as const satisfies readonly { label: string; detail: string; tone: Tone }[]

export function AiAssistedChangeFunnelSlideVisual({ className }: VisualProps) {
  return (
    <TrustTradeoffShell
      className={className}
      title="AI-generated work validation funnel"
      code="AI_FUNNEL_03"
      status="input not authority"
      ariaLabel="AI generated code, tests, scripts, configuration, migrations, and dependency changes enter validation gates before becoming evidence or human review holds"
      railContent={
        <div className="grid content-start gap-3">
          <div className="rounded-md border border-primary/25 bg-accent/70 p-2">
            <p className="font-mono text-[9px] font-semibold uppercase leading-4 text-primary">funnel rule</p>
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
              Generated work is input. Trust starts only after checks produce evidence or a visible review hold.
            </p>
          </div>
          <div className="grid gap-2" aria-label="Validation outcomes">
            {evidenceTokens.map((token) => (
              <div
                key={token.label}
                className={cn('min-w-0 rounded-md border p-2', toneClasses[token.tone].border, toneClasses[token.tone].bg)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-semibold leading-4 text-foreground">{token.label}</p>
                  <StatusBadge tone={token.tone}>{token.tone === 'warning' ? 'review hold' : 'evidence'}</StatusBadge>
                </div>
                <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{token.detail}</p>
              </div>
            ))}
          </div>
          <div className="rounded-md border border-border bg-card/82 p-2">
            <div className="flex items-center gap-2">
              <IconBadge Icon={UserCheck} tone="muted" />
              <p className="text-xs font-semibold leading-4 text-foreground">Approval remains separate</p>
            </div>
          </div>
        </div>
      }
    >
      <div className="grid h-full min-h-[26rem] grid-rows-[auto_minmax(0,1fr)_auto] gap-3">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4" aria-label="Generated input tokens">
          {generatedItems.map((item) => {
            const tone: Tone = item.status === 'pass' ? 'success' : item.status === 'hold' ? 'warning' : 'danger'
            const Icon = item.Icon

            return (
              <div
                key={item.id}
                className={cn(
                  'min-w-0 rounded-md border bg-card/82 p-2 transition-transform duration-200 motion-reduce:transition-none',
                  toneClasses[tone].border,
                  item.status === 'pass' && 'motion-safe:translate-x-1',
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <IconBadge Icon={Icon} tone={tone} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-4 text-foreground">{item.label}</p>
                    <p className={cn('truncate font-mono text-[8px] uppercase leading-3 tracking-normal', toneClasses[tone].text)}>
                      {item.status === 'pass' ? 'pass' : item.status === 'hold' ? 'hold' : 'block'}
                    </p>
                  </div>
                </div>
                <p className="mt-1 truncate text-[10px] leading-4 text-muted-foreground">{item.gate}</p>
              </div>
            )
          })}
        </div>

        <div className="relative flex min-h-0 w-full items-center justify-center py-2">
          <div
            aria-hidden="true"
            className="absolute inset-x-[14%] top-2 h-[calc(100%-1rem)] bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--primary),transparent_72%),color-mix(in_oklch,var(--primary),transparent_95%))]"
            style={{ clipPath: 'polygon(8% 0, 92% 0, 68% 100%, 32% 100%)' }}
          />
          <div className="relative z-10 grid w-full max-w-[32rem] gap-3">
            {['Static checks', 'Policy gates', 'Evidence split'].map((label, index) => (
              <div
                key={label}
                className={cn(
                  'mx-auto flex h-14 items-center justify-center rounded-md border bg-card/92 px-4 text-center font-mono text-[10px] font-semibold uppercase leading-4 tracking-normal shadow-sm',
                  index === 0 && 'w-full border-primary/25 text-primary',
                  index === 1 && 'w-4/5 border-chart-4/35 text-chart-4',
                  index === 2 && 'w-3/5 border-border text-muted-foreground',
                )}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3" aria-label="Validated output summary">
          <StatusBadge tone="success">evidence lane</StatusBadge>
          <StatusBadge tone="warning">review hold</StatusBadge>
          <StatusBadge tone="danger">blocked gap</StatusBadge>
        </div>
      </div>
    </TrustTradeoffShell>
  )
}

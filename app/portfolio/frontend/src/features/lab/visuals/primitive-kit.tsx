import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Bot,
  BrainCircuit,
  Clock3,
  Code2,
  Database,
  FileCheck2,
  Gauge,
  KeyRound,
  PackageCheck,
  Route,
  ScanSearch,
  Server,
  ShieldCheck,
  Sparkles,
  TimerReset,
  User,
  XCircle,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type PrimitiveProps = {
  className?: string
}

type PrimitiveShellProps = PrimitiveProps & {
  label: string
  code: string
  status?: string
  children: ReactNode
  footer?: ReactNode
}

function PrimitiveShell({ className, label, code, status, children, footer }: PrimitiveShellProps) {
  return (
    <section
      aria-label={label}
      className={cn(
        'relative flex min-h-[190px] overflow-hidden rounded-lg border border-border/80 bg-background/45',
        'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_46%_42%,color-mix(in_oklch,var(--primary),transparent_92%),transparent_48%)]',
        'after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border),transparent_68%)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border),transparent_72%)_1px,transparent_1px)] after:bg-[size:24px_24px] after:opacity-25',
        className,
      )}
    >
      <div className="relative z-10 flex min-h-[190px] w-full flex-col">
        <header className="flex min-w-0 items-center justify-between gap-2 border-b border-border/70 bg-card/72 px-3 py-2 backdrop-blur-md">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 font-mono text-[10px] font-semibold uppercase leading-4 tracking-normal text-primary">
              {code}
            </span>
            <span className="truncate text-[10px] font-medium uppercase leading-4 tracking-normal text-muted-foreground">
              {label}
            </span>
          </div>
          {status ? (
            <Badge
              variant="outline"
              className="h-5 max-w-[45%] shrink-0 truncate rounded-sm border-primary/25 bg-accent px-2 font-mono text-[8px] font-semibold uppercase tracking-normal text-primary"
            >
              {status}
            </Badge>
          ) : null}
        </header>
        <div className="flex min-h-0 flex-1 items-center justify-center p-3 sm:p-4">{children}</div>
        {footer ? <footer className="border-t border-border/70 bg-muted/45 px-3 py-2">{footer}</footer> : null}
      </div>
    </section>
  )
}

const loopStages = [
  { code: 'VAL', label: 'Validate', x: 100, y: 30, active: false },
  { code: 'BLD', label: 'Build', x: 160.6, y: 65, active: true },
  { code: 'INF', label: 'Infra', x: 160.6, y: 135, active: false },
  { code: 'APP', label: 'Deploy', x: 100, y: 170, active: false },
  { code: 'VRF', label: 'Verify', x: 39.4, y: 135, active: false },
  { code: 'FBK', label: 'Feedback', x: 39.4, y: 65, active: false },
]

export function SixStageLoopPrimitive({ className }: PrimitiveProps) {
  return (
    <PrimitiveShell className={className} label="Lifecycle orchestration" code="LOOP_06" status="active">
      <div className="relative flex w-full max-w-[19rem] items-center justify-center">
        <svg
          role="img"
          aria-label="Six stage loop from validate, build, infrastructure, deploy, verify, and feedback"
          viewBox="0 0 200 200"
          className="h-auto w-full max-w-[14rem] overflow-visible sm:max-w-[15rem]"
        >
          <circle cx="100" cy="100" r="70" fill="none" className="stroke-border" strokeWidth="1.5" />
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            className="stroke-primary/35"
            strokeWidth="2"
            strokeDasharray="8 8"
          >
            <animateTransform
              attributeName="transform"
              dur="18s"
              from="0 100 100"
              repeatCount="indefinite"
              to="360 100 100"
              type="rotate"
            />
          </circle>
          <path d="M160.6 65 A70 70 0 0 1 100 170" fill="none" className="stroke-primary" strokeWidth="2" />
          <circle cx="139.5" cy="157.8" r="4" className="fill-primary status-pulse-active" />
          <text
            x="100"
            y="97"
            textAnchor="middle"
            className="fill-muted-foreground/55 font-mono text-[6px] font-bold uppercase tracking-normal"
          >
            TRUSTED
          </text>
          <text
            x="100"
            y="107"
            textAnchor="middle"
            className="fill-muted-foreground/55 font-mono text-[6px] font-bold uppercase tracking-normal"
          >
            DELIVERY
          </text>
          {loopStages.map((stage) => (
            <g key={stage.code} transform={`translate(${stage.x} ${stage.y})`}>
              <rect
                x="-21"
                y="-12"
                width="42"
                height="24"
                rx="3"
                className={cn(stage.active ? 'fill-card stroke-primary' : 'fill-card stroke-border')}
                strokeWidth={stage.active ? '2' : '1'}
              />
              <text
                dy="0.35em"
                textAnchor="middle"
                className={cn(
                  'font-mono text-[8px] font-bold tracking-normal',
                  stage.active ? 'fill-primary' : 'fill-muted-foreground',
                )}
              >
                {stage.code}
              </text>
              <title>{stage.label}</title>
            </g>
          ))}
        </svg>
      </div>
    </PrimitiveShell>
  )
}

const evidencePoints = [
  { code: 'SRC', label: 'Source', tone: 'muted', left: '0%' },
  { code: 'TEST', label: 'Tests', tone: 'muted', left: '20%' },
  { code: 'SHA', label: 'Signature', tone: 'active', left: '40%' },
  { code: 'ENV', label: 'Env', tone: 'queued', left: '60%' },
  { code: 'LOG', label: 'Logs', tone: 'risk', left: '80%' },
  { code: 'RBK', label: 'Rollback', tone: 'queued', left: '100%' },
] as const

export function EvidenceChainPrimitive({ className }: PrimitiveProps) {
  return (
    <PrimitiveShell className={className} label="Compliance trail" code="EVIDENCE_01" status="audit verified">
      <div className="grid w-full max-w-[31rem] gap-7">
        <div className="relative mx-auto h-16 w-[calc(100%-1.5rem)]">
          <div className="absolute left-0 right-0 top-7 h-px bg-border" />
          <div className="animated-flow-line absolute left-[18%] right-[39%] top-[1.625rem] h-1 rounded-full" />
          {evidencePoints.map((point) => (
            <TooltipProvider key={point.code}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    style={{ left: point.left }}
                    className={cn(
                      'absolute top-3 flex -translate-x-1/2 flex-col items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      point.tone === 'active' && 'z-10 scale-110',
                    )}
                    aria-label={`${point.label} evidence node`}
                  >
                    <span
                      className={cn(
                        'flex size-7 items-center justify-center rounded-full border bg-card font-mono text-[8px] font-semibold uppercase tracking-normal',
                        point.tone === 'active' && 'border-primary text-primary shadow-sm ring-2 ring-primary/10',
                        point.tone === 'risk' && 'border-destructive/35 text-destructive/80',
                        point.tone === 'queued' && 'border-border text-muted-foreground/45',
                        point.tone === 'muted' && 'border-border text-muted-foreground',
                      )}
                    >
                      {point.code}
                    </span>
                    {point.tone === 'active' ? (
                      <span className="mt-1 size-1.5 rounded-full bg-primary status-pulse-active" />
                    ) : null}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{point.label}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="min-w-0 rounded-md border border-border bg-muted/50 p-3">
            <p className="truncate font-mono text-[9px] font-semibold uppercase leading-4 tracking-normal text-muted-foreground">
              provenance key
            </p>
            <p className="mt-1 truncate font-mono text-[11px] font-semibold leading-4 tracking-normal text-primary">
              sha256:88ae90...
            </p>
          </div>
          <div className="min-w-0 rounded-md border border-border bg-muted/50 p-3">
            <p className="truncate font-mono text-[9px] font-semibold uppercase leading-4 tracking-normal text-muted-foreground">
              status
            </p>
            <p className="mt-1 truncate font-mono text-[11px] font-semibold leading-4 tracking-normal text-foreground">
              [ active signing ]
            </p>
          </div>
        </div>
      </div>
    </PrimitiveShell>
  )
}

const permissionColumns = ['VAL', 'BLD', 'PUB', 'PLN', 'APL', 'DPY'] as const
const permissionRows = [
  { label: 'Read code', values: ['allow', 'allow', 'allow', 'allow', 'allow', 'allow'] },
  { label: 'Write artifact', values: ['none', 'active', 'allow', 'none', 'none', 'none'] },
  { label: 'Read secret', values: ['deny', 'deny', 'deny', 'none', 'allow', 'allow'] },
  { label: 'Deploy app', values: ['none', 'none', 'none', 'none', 'none', 'gate'] },
] as const

function PermissionMark({ value }: { value: (typeof permissionRows)[number]['values'][number] }) {
  if (value === 'gate') {
    return <span className="block truncate font-mono text-[8px] font-semibold uppercase text-destructive">Gate</span>
  }

  return (
    <span
      aria-label={value}
      className={cn(
        'mx-auto block size-2.5 rounded-sm',
        value === 'allow' && 'bg-primary',
        value === 'active' && 'bg-primary status-pulse-active',
        value === 'deny' && 'border border-destructive/35 bg-card',
        value === 'none' && 'border border-border bg-card',
      )}
    />
  )
}

export function PermissionLanesPrimitive({ className }: PrimitiveProps) {
  return (
    <PrimitiveShell className={className} label="Identity matrix" code="PERMS_02" status="least privilege">
      <div className="w-full overflow-x-auto rounded-md border border-border bg-card/70">
        <table className="w-full min-w-[27rem] border-collapse text-left">
          <caption className="sr-only">Permission lanes by pipeline stage</caption>
          <thead>
            <tr className="bg-muted/60">
              <th className="border-b border-r border-border px-2 py-2 text-[10px] font-semibold leading-4 text-foreground">
                Scope
              </th>
              {permissionColumns.map((column) => (
                <th
                  key={column}
                  className="border-b border-r border-border px-2 py-2 text-center font-mono text-[9px] font-semibold leading-4 text-muted-foreground last:border-r-0"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissionRows.map((row) => (
              <tr key={row.label} className={row.label === 'Deploy app' ? 'bg-destructive/5' : undefined}>
                <th className="max-w-[7rem] truncate border-b border-r border-border px-2 py-2 text-xs font-medium leading-4 text-foreground">
                  {row.label}
                </th>
                {row.values.map((value, index) => (
                  <td
                    key={`${row.label}-${permissionColumns[index]}`}
                    className="border-b border-r border-border px-2 py-2 text-center last:border-r-0"
                  >
                    <PermissionMark value={value} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PrimitiveShell>
  )
}

const serviceNodes = [
  { id: 'lib', label: 'LIB', x: 60, y: 40, tone: 'muted' },
  { id: 'db', label: 'DB_01', x: 140, y: 40, tone: 'muted' },
  { id: 'ext', label: 'EXT', x: 170, y: 100, tone: 'ghost' },
  { id: 'blocked', label: 'BLOCKED', x: 140, y: 160, tone: 'risk' },
  { id: 'svc-b', label: 'SVC_B', x: 60, y: 160, tone: 'muted' },
  { id: 'feat', label: 'FEAT', x: 30, y: 100, tone: 'muted' },
] as const

export function AffectedServiceGraphPrimitive({ className }: PrimitiveProps) {
  return (
    <PrimitiveShell className={className} label="Blast radius analysis" code="GRAPH_03" status="targeted">
      <svg
        role="img"
        aria-label="Affected service graph with service A connected to dependencies, downstream service, and one blocked target"
        viewBox="0 0 200 200"
        className="h-auto w-full max-w-[15rem] overflow-visible"
      >
        <g fill="none" strokeLinecap="round">
          <line x1="100" y1="100" x2="60" y2="40" className="stroke-primary/55" strokeWidth="1.6" />
          <line x1="100" y1="100" x2="140" y2="40" className="stroke-primary/55" strokeWidth="1.6" />
          <line x1="100" y1="100" x2="170" y2="100" className="stroke-border" strokeWidth="1" strokeDasharray="3 4" />
          <line x1="100" y1="100" x2="132" y2="148" className="stroke-destructive" strokeWidth="2" />
          <line x1="100" y1="100" x2="60" y2="160" className="stroke-primary/55" strokeWidth="1.6" />
          <line x1="100" y1="100" x2="30" y2="100" className="stroke-primary/55" strokeWidth="1.6" />
        </g>
        <rect
          x="70"
          y="84"
          width="60"
          height="32"
          rx="4"
          className="fill-card stroke-primary"
          strokeWidth="2"
        />
        <text
          x="100"
          y="104"
          textAnchor="middle"
          className="fill-primary font-mono text-[7px] font-bold tracking-normal"
        >
          SERVICE_A
        </text>
        {serviceNodes.map((node) => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r="14"
              className={cn(
                node.tone === 'risk' ? 'fill-destructive/10 stroke-destructive' : 'fill-card stroke-border',
                node.tone === 'ghost' && 'fill-muted/35 stroke-border/80',
              )}
              strokeDasharray={node.tone === 'ghost' ? '2 3' : undefined}
            />
            <text
              x={node.x}
              y={node.y + 3}
              textAnchor="middle"
              className={cn(
                'font-mono text-[5px] font-bold tracking-normal',
                node.tone === 'risk' ? 'fill-destructive' : 'fill-muted-foreground',
                node.tone === 'ghost' && 'fill-muted-foreground/45',
              )}
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </PrimitiveShell>
  )
}

const durationSegments = [
  { id: 'queue', label: 'Queue', value: '2m', width: '10%', className: 'bg-primary/10 border-primary/20 text-primary' },
  { id: 'init', label: 'Init', value: '', width: '5%', className: 'bg-primary/20 border-primary/30 text-primary' },
  { id: 'run', label: 'Run', value: '6m', width: '25%', className: 'bg-primary/75 border-primary text-primary-foreground' },
  { id: 'xfer', label: 'Xfer', value: '', width: '5%', className: 'bg-muted border-border text-muted-foreground' },
  {
    id: 'approve',
    label: 'Approve',
    value: '12m',
    width: '40%',
    className: 'bg-destructive border-destructive text-destructive-foreground',
  },
  { id: 'wait', label: 'Wait', value: '', width: '7%', className: 'bg-muted border-border text-muted-foreground' },
  { id: 'verify', label: 'Verify', value: '', width: '8%', className: 'bg-muted border-border text-muted-foreground' },
] as const

export function DurationBreakdownPrimitive({ className }: PrimitiveProps) {
  return (
    <PrimitiveShell className={className} label="Pipeline latency trace" code="TIME_04" status="bottleneck">
      <div className="grid w-full max-w-[31rem] gap-4">
        <div>
          <div className="flex h-9 w-full gap-px overflow-hidden rounded-md border border-border bg-border">
            {durationSegments.map((segment) => (
              <div
                key={segment.id}
                style={{ width: segment.width }}
                className={cn('flex min-w-0 items-center justify-center border text-center', segment.className)}
                aria-label={`${segment.label} duration ${segment.value || 'unlabeled'}`}
              >
                {segment.value ? (
                  <span className="truncate px-1 font-mono text-[9px] font-semibold uppercase tracking-normal">
                    {segment.value}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1 text-center font-mono text-[8px] font-semibold uppercase leading-3 tracking-normal text-muted-foreground">
            {durationSegments.map((segment) => (
              <span key={segment.id} className={cn('truncate', segment.id === 'approve' && 'text-destructive')}>
                {segment.label}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-border bg-muted/50 p-3">
          <div className="mb-1.5 flex items-center gap-2">
            <Clock3 className="size-3.5 shrink-0 text-destructive" strokeWidth={2.3} />
            <p className="truncate font-mono text-[10px] font-semibold uppercase leading-4 text-muted-foreground">
              latency insight 01
            </p>
          </div>
          <p className="text-xs leading-5 text-foreground">
            Manual approval consumes <span className="font-semibold text-destructive">48%</span> of wall time; move
            safe changes toward contract verification.
          </p>
        </div>
      </div>
    </PrimitiveShell>
  )
}

type BoundaryChip = {
  id: string
  label: string
  detail: string
  Icon: LucideIcon
  className: string
}

const boundaryChips: BoundaryChip[] = [
  {
    id: 'draft',
    label: 'Draft',
    detail: 'AI can create a first pass.',
    Icon: Bot,
    className: 'left-0 top-[22%]',
  },
  {
    id: 'summarize',
    label: 'Summarize',
    detail: 'AI can explain evidence and state.',
    Icon: FileCheck2,
    className: 'right-0 top-[48%]',
  },
]

export function AiBoundaryPrimitive({ className }: PrimitiveProps) {
  return (
    <PrimitiveShell
      className={className}
      label="Governance domains"
      code="AI_BOUNDARY_05"
      status="trust protocol"
      footer={
        <p className="text-center font-mono text-[10px] leading-4 tracking-normal text-muted-foreground">
          AI suggests, pipeline proves, human decides.
        </p>
      }
    >
      <TooltipProvider>
        <div className="relative flex size-[min(16rem,72vw)] items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-dashed border-muted-foreground/40 bg-card/45" />
          <Badge
            variant="outline"
            className="absolute -top-2 border-border bg-card px-2 font-mono text-[8px] font-semibold uppercase tracking-normal text-muted-foreground"
          >
            co-pilot boundary
          </Badge>
          {boundaryChips.map((chip) => {
            const Icon = chip.Icon
            return (
              <Tooltip key={chip.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'absolute flex max-w-[6.5rem] items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1.5 text-left shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      chip.className,
                    )}
                    aria-label={`${chip.label} assistance boundary`}
                  >
                    <Icon className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={2.2} />
                    <span className="truncate font-mono text-[8px] font-semibold uppercase tracking-normal text-foreground">
                      {chip.label}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>{chip.detail}</TooltipContent>
              </Tooltip>
            )
          })}

          <div
            aria-label="Verified pipeline gates surrounding the human release decision"
            className="absolute size-[68%] rounded-full border-2 border-primary/20 bg-accent/60 text-primary"
          >
            <div className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 shadow-sm">
              <ShieldCheck className="size-3.5 shrink-0" strokeWidth={2.1} />
              <span className="whitespace-nowrap font-mono text-[8px] font-semibold uppercase leading-3 tracking-normal">
                Verified gates
              </span>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-card/90 px-2 py-0.5 shadow-sm">
              <span className="whitespace-nowrap font-mono text-[7px] font-semibold uppercase leading-3 tracking-normal text-muted-foreground">
                Runtime proofs
              </span>
            </div>
          </div>

          <div className="status-pulse-active relative z-10 flex size-20 flex-col items-center justify-center rounded-full border-2 border-primary bg-card text-primary shadow-[0_18px_42px_color-mix(in_oklch,var(--primary),transparent_82%)]">
            <User className="size-6" strokeWidth={2.2} />
            <span className="mt-1 font-mono text-[8px] font-semibold uppercase leading-none tracking-normal">
              Release
            </span>
          </div>
        </div>
      </TooltipProvider>
    </PrimitiveShell>
  )
}

const architectureReviewNodes = [
  { id: 'frontend', label: 'UI', Icon: Code2, x: 42, y: 50, tone: 'muted' },
  { id: 'api', label: 'API', Icon: Server, x: 100, y: 38, tone: 'active' },
  { id: 'data', label: 'DB', Icon: Database, x: 158, y: 50, tone: 'muted' },
  { id: 'infra', label: 'INFRA', Icon: Route, x: 68, y: 142, tone: 'muted' },
  { id: 'artifact', label: 'IMG', Icon: PackageCheck, x: 132, y: 142, tone: 'risk' },
] as const

export function AiArchitectureReviewPrimitive({ className }: PrimitiveProps) {
  return (
    <PrimitiveShell className={className} label="Architecture review" code="AI_ARCH_07" status="mapped">
      <div className="grid w-full max-w-[31rem] gap-3 sm:grid-cols-[minmax(0,1fr)_7.5rem] sm:items-center">
        <svg
          role="img"
          aria-label="AI reviews architecture boundaries and maps them to pipeline checks"
          viewBox="0 0 200 180"
          className="h-auto w-full min-w-0"
        >
          <g fill="none" strokeLinecap="round">
            <path d="M42 50 C70 64 78 68 100 38" className="stroke-border" strokeWidth="1.3" />
            <path d="M100 38 C125 64 138 62 158 50" className="stroke-border" strokeWidth="1.3" />
            <path d="M100 38 C94 76 86 105 68 142" className="stroke-primary/55" strokeWidth="1.6" />
            <path d="M100 38 C112 82 120 112 132 142" className="stroke-destructive/70" strokeWidth="1.6" />
            <path d="M68 142 C90 126 110 126 132 142" className="stroke-primary/45" strokeWidth="1.4" strokeDasharray="4 5" />
          </g>

          <g>
            <rect
              x="67"
              y="73"
              width="66"
              height="36"
              rx="5"
              className="fill-card stroke-primary"
              strokeWidth="2"
            />
            <text
              x="100"
              y="90"
              textAnchor="middle"
              className="fill-primary font-mono text-[7px] font-bold uppercase tracking-normal"
            >
              AI REVIEW
            </text>
            <text
              x="100"
              y="101"
              textAnchor="middle"
              className="fill-muted-foreground font-mono text-[5px] font-bold uppercase tracking-normal"
            >
              checks follow shape
            </text>
          </g>

          {architectureReviewNodes.map((node) => {
            const Icon = node.Icon
            return (
              <g key={node.id} transform={`translate(${node.x} ${node.y})`}>
                <circle
                  r="18"
                  className={cn(
                    'fill-card stroke-border',
                    node.tone === 'active' && 'fill-accent stroke-primary',
                    node.tone === 'risk' && 'fill-destructive/10 stroke-destructive/70',
                  )}
                  strokeWidth={node.tone === 'active' ? 1.8 : 1.2}
                />
                <foreignObject x="-7" y="-10" width="14" height="14">
                  <Icon
                    className={cn(
                      'size-3.5 text-muted-foreground',
                      node.tone === 'active' && 'text-primary',
                      node.tone === 'risk' && 'text-destructive',
                    )}
                    strokeWidth={2.2}
                  />
                </foreignObject>
                <text
                  y="12"
                  textAnchor="middle"
                  className={cn(
                    'font-mono text-[5px] font-bold uppercase tracking-normal',
                    node.tone === 'risk' ? 'fill-destructive' : 'fill-muted-foreground',
                    node.tone === 'active' && 'fill-primary',
                  )}
                >
                  {node.label}
                </text>
              </g>
            )
          })}
        </svg>

        <div className="grid gap-2">
          {[
            ['change', 'service map'],
            ['check', 'targeted gates'],
            ['risk', 'artifact drift'],
          ].map(([code, label], index) => (
            <div
              key={code}
              className={cn(
                'min-w-0 rounded-md border border-border bg-card/80 px-2 py-1.5',
                index === 2 && 'border-destructive/30 bg-destructive/5',
              )}
            >
              <p
                className={cn(
                  'truncate font-mono text-[8px] font-semibold uppercase leading-3 tracking-normal text-muted-foreground',
                  index === 2 && 'text-destructive',
                )}
              >
                {code}
              </p>
              <p className="truncate text-[11px] font-semibold leading-4 text-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </PrimitiveShell>
  )
}

const optimizationSignals = [
  { id: 'queue', label: 'Queue', value: '18m', tone: 'risk' },
  { id: 'setup', label: 'Setup', value: '4m', tone: 'muted' },
  { id: 'tests', label: 'Tests', value: '9m', tone: 'active' },
  { id: 'xfer', label: 'Xfer', value: '2m', tone: 'muted' },
] as const

export function OptimizationAssistantPrimitive({ className }: PrimitiveProps) {
  return (
    <PrimitiveShell className={className} label="Optimization strategy" code="AI_OPT_08" status="prove faster">
      <div className="grid w-full max-w-[31rem] gap-3 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-center">
        <div className="rounded-md border border-primary/25 bg-accent/80 p-3 text-primary">
          <div className="mb-2 flex items-center gap-2">
            <Gauge className="size-4 shrink-0" strokeWidth={2.3} />
            <p className="truncate font-mono text-[9px] font-semibold uppercase leading-4 tracking-normal">
              suggestion
            </p>
          </div>
          <p className="text-xs font-semibold leading-5 text-foreground">Fail fast before slow matrix jobs.</p>
          <div className="mt-3 flex items-center gap-1.5 text-muted-foreground">
            <TimerReset className="size-3.5 shrink-0" strokeWidth={2.2} />
            <span className="truncate font-mono text-[9px] uppercase tracking-normal">needs timing proof</span>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex h-9 overflow-hidden rounded-md border border-border bg-border">
            {optimizationSignals.map((signal) => (
              <div
                key={signal.id}
                className={cn(
                  'flex min-w-0 flex-1 items-center justify-center border-r border-border last:border-r-0',
                  signal.tone === 'risk' && 'bg-destructive text-destructive-foreground',
                  signal.tone === 'active' && 'bg-primary text-primary-foreground',
                  signal.tone === 'muted' && 'bg-card text-muted-foreground',
                )}
              >
                <span className="truncate px-1 font-mono text-[9px] font-semibold uppercase tracking-normal">
                  {signal.value}
                </span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1 text-center font-mono text-[8px] font-semibold uppercase leading-3 tracking-normal text-muted-foreground">
            {optimizationSignals.map((signal) => (
              <span key={signal.id} className={cn('truncate', signal.tone === 'risk' && 'text-destructive')}>
                {signal.label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="min-w-0 rounded-md border border-border bg-card/75 p-2">
              <p className="truncate font-mono text-[8px] uppercase leading-3 text-muted-foreground">before</p>
              <p className="truncate text-xs font-semibold leading-4 text-foreground">queue waits hide waste</p>
            </div>
            <Sparkles className="size-4 shrink-0 text-primary" strokeWidth={2.2} />
            <div className="min-w-0 rounded-md border border-primary/25 bg-accent/70 p-2">
              <p className="truncate font-mono text-[8px] uppercase leading-3 text-primary">after</p>
              <p className="truncate text-xs font-semibold leading-4 text-foreground">measure delta first</p>
            </div>
          </div>
        </div>
      </div>
    </PrimitiveShell>
  )
}

const securityGateItems = [
  { id: 'secrets', label: 'Secrets', status: 'blocked', Icon: KeyRound },
  { id: 'scan', label: 'Scan', status: 'reviewed', Icon: ScanSearch },
  { id: 'sign', label: 'SBOM', status: 'attached', Icon: FileCheck2 },
] as const

export function SecurityEvidenceGatesPrimitive({ className }: PrimitiveProps) {
  return (
    <PrimitiveShell className={className} label="Security evidence gates" code="SEC_AI_09" status="enforced">
      <div className="grid w-full max-w-[31rem] gap-3 sm:grid-cols-[minmax(0,1fr)_8rem] sm:items-center">
        <div className="grid gap-2">
          {securityGateItems.map((item) => {
            const Icon = item.Icon
            const isBlocked = item.status === 'blocked'
            return (
              <div
                key={item.id}
                className={cn(
                  'grid grid-cols-[2rem_minmax(0,1fr)_4.5rem] items-center gap-2 rounded-md border border-border bg-card/80 p-2',
                  isBlocked && 'border-destructive/35 bg-destructive/5',
                )}
              >
                <span
                  className={cn(
                    'flex size-8 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground',
                    isBlocked && 'border-destructive/35 bg-destructive text-destructive-foreground',
                  )}
                >
                  <Icon className="size-4" strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold leading-4 text-foreground">{item.label}</p>
                  <p className="truncate font-mono text-[8px] uppercase leading-3 tracking-normal text-muted-foreground">
                    AI summarized evidence
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'h-5 justify-center rounded-sm px-1 font-mono text-[8px] font-semibold uppercase tracking-normal',
                    isBlocked
                      ? 'border-destructive/40 bg-destructive/10 text-destructive'
                      : 'border-primary/25 bg-accent text-primary',
                  )}
                >
                  {item.status}
                </Badge>
              </div>
            )
          })}
        </div>

        <div className="relative flex min-h-32 items-center justify-center">
          <div className="absolute left-0 top-1/2 hidden h-px w-7 bg-border sm:block" />
          <div className="flex size-24 flex-col items-center justify-center rounded-full border-2 border-destructive bg-card text-center text-destructive shadow-[0_14px_36px_color-mix(in_oklch,var(--destructive),transparent_88%)]">
            <XCircle className="size-6" strokeWidth={2.3} />
            <span className="mt-1 font-mono text-[8px] font-semibold uppercase leading-3 tracking-normal">
              gate holds
            </span>
          </div>
        </div>
      </div>
    </PrimitiveShell>
  )
}

const takeawaySteps = [
  { id: 'draft', label: 'Draft', Icon: Bot },
  { id: 'inspect', label: 'Inspect', Icon: ScanSearch },
  { id: 'prove', label: 'Prove', Icon: ShieldCheck },
  { id: 'decide', label: 'Decide', Icon: User },
] as const

export function AiAcceleratorTakeawayPrimitive({ className }: PrimitiveProps) {
  return (
    <PrimitiveShell
      className={className}
      label="Accelerator boundary"
      code="AI_FINAL_10"
      status="not authority"
      footer={
        <p className="text-center font-mono text-[10px] leading-4 tracking-normal text-muted-foreground">
          Speed is useful only while evidence stays attached.
        </p>
      }
    >
      <div className="grid w-full max-w-[31rem] gap-3">
        <div className="grid grid-cols-4 gap-2">
          {takeawaySteps.map((step, index) => {
            const Icon = step.Icon
            const isDecision = step.id === 'decide'
            return (
              <div
                key={step.id}
                className={cn(
                  'relative min-w-0 rounded-md border border-border bg-card/80 p-2 text-center',
                  isDecision && 'border-primary/45 bg-accent ring-2 ring-primary/10',
                )}
              >
                {index > 0 ? (
                  <span
                    aria-hidden="true"
                    className="absolute -left-2 top-1/2 h-px w-2 -translate-y-1/2 bg-border"
                  />
                ) : null}
                <span
                  className={cn(
                    'mx-auto flex size-8 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground',
                    isDecision && 'border-primary/35 bg-primary text-primary-foreground',
                  )}
                >
                  <Icon className="size-4" strokeWidth={2.2} />
                </span>
                <p
                  className={cn(
                    'mt-1.5 truncate font-mono text-[8px] font-semibold uppercase leading-3 tracking-normal text-muted-foreground',
                    isDecision && 'text-primary',
                  )}
                >
                  {step.label}
                </p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="min-w-0 rounded-md border border-primary/25 bg-accent/70 p-2">
            <p className="truncate font-mono text-[8px] font-semibold uppercase leading-3 tracking-normal text-primary">
              accelerator
            </p>
            <p className="truncate text-xs font-semibold leading-4 text-foreground">reduces toil</p>
          </div>
          <BrainCircuit className="size-5 shrink-0 text-primary" strokeWidth={2.2} />
          <div className="min-w-0 rounded-md border border-border bg-card/75 p-2">
            <p className="truncate font-mono text-[8px] font-semibold uppercase leading-3 tracking-normal text-muted-foreground">
              authority
            </p>
            <p className="truncate text-xs font-semibold leading-4 text-foreground">stays human</p>
          </div>
        </div>
      </div>
    </PrimitiveShell>
  )
}

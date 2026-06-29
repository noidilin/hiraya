import { useState } from 'react'
import { Position } from '@xyflow/react'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Boxes,
  ClipboardCheck,
  Database,
  FileCheck2,
  GitBranch,
  Globe2,
  KeyRound,
  Network,
  PackageCheck,
  Route,
  ServerCog,
  ShieldCheck,
  Undo2,
} from 'lucide-react'

import { simplifiedVisualFlowNodeTypes } from '@/features/lab/visuals/flow'
import { cn } from '@/lib/utils'

import { FamilyShell, StatusPill, toneClasses, type CicdSlideVisualProps } from './shared/system-responsibility-kit'
import { SlideFlowCanvas, type SlideFlowCanvasNode, type SlideFlowEdge } from './shared/flow-canvas'
import { VisualStateController } from './shared/visual-state-control'

type RuntimeEnv = 'dev' | 'staging' | 'production'

const artifactDigest = 'sha256:8f3a'
const envs = ['dev', 'staging', 'production'] as const

const runtimeDeps: Array<{
  id: string
  label: string
  Icon: LucideIcon
  code: string
}> = [
  { id: 'network', label: 'Network', Icon: Network, code: 'vpc' },
  { id: 'database', label: 'Database', Icon: Database, code: 'db' },
  { id: 'secrets', label: 'Secrets', Icon: KeyRound, code: 'secret' },
  { id: 'ingress', label: 'Ingress', Icon: Globe2, code: 'route' },
  {
    id: 'observability',
    label: 'Observability',
    Icon: Activity,
    code: 'signals',
  },
]

const evidenceTokens: Array<{
  id: string
  label: string
  code: string
  Icon: LucideIcon
  envStatus: Record<RuntimeEnv, string>
}> = [
  {
    id: 'plan-record',
    label: 'Plan record',
    code: 'plan',
    Icon: FileCheck2,
    envStatus: { dev: 'planned', staging: 'diff kept', production: 'audited' },
  },
  {
    id: 'apply-log',
    label: 'Apply log',
    code: 'apply',
    Icon: ClipboardCheck,
    envStatus: { dev: 'applied', staging: 'applied', production: 'applied' },
  },
  {
    id: 'approval',
    label: 'Approval',
    code: 'approve',
    Icon: ShieldCheck,
    envStatus: { dev: 'auto', staging: 'reviewed', production: 'required' },
  },
  {
    id: 'deploy-trace',
    label: 'Deploy trace',
    code: 'trace',
    Icon: GitBranch,
    envStatus: {
      dev: 'trace dev',
      staging: 'trace stage',
      production: 'trace prod',
    },
  },
  {
    id: 'rollback-ref',
    label: 'Rollback ref',
    code: 'rollback',
    Icon: Undo2,
    envStatus: {
      dev: 'known good',
      staging: 'known good',
      production: 'ready',
    },
  },
]

export function ArtifactToRuntimeMapSlideVisual(props: CicdSlideVisualProps) {
  const [env, setEnv] = useState<RuntimeEnv>('staging')
  const activeEnvIndex = envs.indexOf(env)
  const promotedThrough = (item: RuntimeEnv) => envs.indexOf(item) <= activeEnvIndex

  const envTone = (item: RuntimeEnv) => {
    if (item === env) return 'primary'
    return promotedThrough(item) ? 'success' : 'ghost'
  }

  const nodes: SlideFlowCanvasNode[] = [
    {
      id: 'digest',
      type: 'flowArtifact',
      position: { x: 28, y: 38 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        label: artifactDigest,
        code: 'image',
        detail: `The same image digest ${artifactDigest} starts every environment promotion.`,
        status: 'build once',
        metric: 'same',
        Icon: PackageCheck,
        tone: 'primary',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
    },
    {
      id: 'registry',
      type: 'flowArtifact',
      position: { x: 210, y: 38 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        label: 'Registry record',
        code: 'registry',
        detail: 'The registry stores the signed and scanned artifact record used by every environment.',
        status: 'signed + scanned',
        metric: artifactDigest,
        Icon: Boxes,
        tone: 'primary',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
    },
    {
      id: 'plan',
      type: 'flowStage',
      position: { x: 392, y: 28 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        label: 'Infra plan',
        code: 'plan#42',
        detail: `Infrastructure is planned for ${env} before the artifact is bound to runtime services.`,
        status: `${env} diff`,
        Icon: Route,
        tone: 'primary',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
    },
    {
      id: 'apply',
      type: 'flowStage',
      position: { x: 584, y: 28 },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Left,
      data: {
        label: 'Infra apply',
        code: 'apply#42',
        detail: `The approved infrastructure change binds ${artifactDigest} to ${env} runtime dependencies.`,
        status: `${env} applied`,
        Icon: ServerCog,
        tone: 'primary',
        sourcePosition: Position.Bottom,
        targetPosition: Position.Left,
      },
    },
    ...envs.map(
      (item, index): SlideFlowCanvasNode => ({
        id: item,
        type: 'flowEnvironment',
        position: { x: 78 + index * 270, y: 168 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          label: item,
          code: artifactDigest,
          detail: `${item} receives ${artifactDigest} through promotion only; no environment rebuild is implied.`,
          status: item === env ? 'selected runtime' : promotedThrough(item) ? 'same artifact' : 'awaiting promotion',
          Icon: PackageCheck,
          tone: envTone(item),
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        },
      }),
    ),
    {
      id: 'deploy-target',
      type: 'flowSystem',
      position: { x: 418, y: 292 },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      data: {
        label: 'Deployment target',
        code: 'runtime',
        detail: `The ${env} runtime target runs ${artifactDigest} with external infrastructure bindings.`,
        status: `${env} target`,
        Icon: ServerCog,
        tone: 'primary',
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      },
    },
    ...runtimeDeps.map(
      (dep, index): SlideFlowCanvasNode => ({
        id: dep.id,
        type: 'flowSystem',
        position: { x: 30 + index * 160, y: 428 },
        sourcePosition: Position.Top,
        targetPosition: Position.Top,
        data: {
          label: dep.label,
          code: dep.code,
          detail: `${dep.label} is an explicit ${env} runtime dependency for ${artifactDigest}.`,
          status: `${env} binding`,
          Icon: dep.Icon,
          tone: dep.id === 'secrets' && env === 'production' ? 'warning' : 'muted',
          sourcePosition: Position.Top,
          targetPosition: Position.Top,
        },
      }),
    ),
    ...evidenceTokens.map(
      (token, index): SlideFlowCanvasNode => ({
        id: token.id,
        type: 'flowEvidence',
        position: { x: 824, y: 18 + index * 96 },
        sourcePosition: Position.Left,
        targetPosition: Position.Left,
        data: {
          label: token.label,
          code: token.envStatus[env],
          detail: `${token.label} remains readable evidence for ${env}: ${token.envStatus[env]}.`,
          status: token.envStatus[env],
          Icon: token.Icon,
          tone: token.id === 'approval' && env === 'production' ? 'warning' : token.id === 'rollback-ref' ? 'muted' : 'success',
          sourcePosition: Position.Left,
          targetPosition: Position.Left,
        },
      }),
    ),
  ]

  const promotionEdges: SlideFlowEdge[] = [
    {
      id: 'digest-registry',
      source: 'digest',
      target: 'registry',
      type: 'slideEdge',
      data: { tone: 'primary', animated: true, label: 'signed' },
    },
    {
      id: 'registry-plan',
      source: 'registry',
      target: 'plan',
      type: 'slideEdge',
      data: { tone: 'primary', animated: true, label: 'record' },
    },
    {
      id: 'plan-apply',
      source: 'plan',
      target: 'apply',
      type: 'slideEdge',
      data: { tone: 'primary', animated: true, label: env },
    },
    {
      id: 'apply-dev',
      source: 'apply',
      target: 'dev',
      type: 'slideEdge',
      data: {
        tone: 'primary',
        animated: promotedThrough('dev'),
        label: 'same digest',
      },
    },
    {
      id: 'dev-staging',
      source: 'dev',
      target: 'staging',
      type: 'slideEdge',
      data: {
        tone: promotedThrough('staging') ? 'primary' : 'ghost',
        animated: promotedThrough('staging'),
        dashed: !promotedThrough('staging'),
        label: 'promote',
      },
    },
    {
      id: 'staging-production',
      source: 'staging',
      target: 'production',
      type: 'slideEdge',
      data: {
        tone: promotedThrough('production') ? 'primary' : 'ghost',
        animated: promotedThrough('production'),
        dashed: !promotedThrough('production'),
        label: promotedThrough('production') ? 'approved' : 'no rebuild',
      },
    },
    {
      id: `${env}-deploy-target`,
      source: env,
      target: 'deploy-target',
      type: 'slideEdge',
      data: { tone: 'primary', animated: true, label: 'runs' },
    },
  ]

  const dependencyEdges: SlideFlowEdge[] = runtimeDeps.map(
    (dep): SlideFlowEdge => ({
      id: `deploy-target-${dep.id}`,
      source: 'deploy-target',
      target: dep.id,
      type: 'slideEdge',
      data: {
        tone: dep.id === 'secrets' && env === 'production' ? 'warning' : 'muted',
        label: dep.code,
      },
    }),
  )

  const evidenceEdges: SlideFlowEdge[] = [
    {
      id: 'plan-plan-record',
      source: 'plan',
      target: 'plan-record',
      type: 'slideEdge',
      data: { tone: 'success', label: 'saved' },
    },
    {
      id: 'apply-apply-log',
      source: 'apply',
      target: 'apply-log',
      type: 'slideEdge',
      data: { tone: 'success', label: 'logged' },
    },
    {
      id: 'apply-approval',
      source: 'apply',
      target: 'approval',
      type: 'slideEdge',
      data: {
        tone: env === 'production' ? 'warning' : 'muted',
        dashed: env !== 'production',
        label: env === 'production' ? 'required' : 'policy',
      },
    },
    {
      id: 'deploy-target-deploy-trace',
      source: 'deploy-target',
      target: 'deploy-trace',
      type: 'slideEdge',
      data: { tone: 'success', label: 'trace' },
    },
    {
      id: 'deploy-target-rollback-ref',
      source: 'deploy-target',
      target: 'rollback-ref',
      type: 'slideEdge',
      data: { tone: 'muted', dashed: env !== 'production', label: 'recover' },
    },
  ]

  const edges: SlideFlowEdge[] = [...promotionEdges, ...dependencyEdges, ...evidenceEdges]

  return (
    <FamilyShell
      className={props.className}
      label="Artifact to runtime map"
      code="ART_RUN_13"
      status={`${artifactDigest} in ${env}`}
      railDensity="dense"
      railContent={
        <div className="grid content-start gap-2">
          <div className={cn('rounded-md border p-2', toneClasses.primary.panel)}>
            <p className="font-mono text-[8px] font-semibold uppercase leading-3 text-muted-foreground">same artifact</p>
            <p className="mt-1 text-xs font-semibold leading-4 text-foreground">{artifactDigest}</p>
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">Promoted into {env}; the image is not rebuilt per environment.</p>
          </div>
          <div className="rounded-md border border-border bg-card/80 p-2">
            <p className="font-mono text-[8px] font-semibold uppercase leading-3 text-muted-foreground">selected runtime</p>
            <p className="mt-1 text-xs font-semibold leading-4 text-foreground">{env}</p>
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">Plan/apply, dependencies, and evidence statuses update for this environment.</p>
          </div>
          <div className="grid gap-1.5" aria-label={`${env} evidence tokens`}>
            {evidenceTokens.map((token) => (
              <StatusPill key={token.id} tone={token.id === 'approval' && env === 'production' ? 'warn' : 'good'}>
                {token.label}: {token.envStatus[env]}
              </StatusPill>
            ))}
          </div>
          <p aria-live="polite" className="sr-only">
            {artifactDigest} is promoted through {env} with {runtimeDeps.map((dep) => dep.label).join(', ')} dependencies and evidence tokens for{' '}
            {evidenceTokens.map((token) => token.label).join(', ')}.
          </p>
        </div>
      }
      controls={
        <VisualStateController
          model={{
            label: 'Runtime environment',
            value: env,
            onValueChange: setEnv,
            steps: [
              {
                value: 'dev',
                label: 'Development',
                shortLabel: 'Dev',
                description: 'Shows the signed digest bound to development runtime dependencies.',
                status: 'dev binding',
              },
              {
                value: 'staging',
                label: 'Staging',
                description: 'Shows the same digest promoted with staging bindings and evidence.',
                status: 'staging binding',
              },
              {
                value: 'production',
                label: 'Production',
                shortLabel: 'Prod',
                description: 'Shows the same digest in production with approval evidence highlighted.',
                status: 'approval required',
              },
            ],
          }}
        />
      }
    >
      <SlideFlowCanvas
        key={env}
        aria-label={`Zoomable artifact to runtime map showing ${artifactDigest} promoted to ${env} without rebuild`}
        defaultNodes={nodes}
        defaultEdges={edges}
        layoutCaptureId="slide-13-artifact-runtime"
        nodeTypes={simplifiedVisualFlowNodeTypes}
        fitViewOptions={{ padding: 0.06 }}
        minZoom={0.18}
        maxZoom={1.8}
      />
    </FamilyShell>
  )
}

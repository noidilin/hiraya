import { Position, ReactFlow, type Node } from '@xyflow/react'
import {
  Bot,
  CheckCircle2,
  FileCheck2,
  Gauge,
  GitCommitHorizontal,
  PackageCheck,
  Rocket,
  Server,
} from 'lucide-react'

import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import {
  type VisualFlowNodeData,
  type VisualFlowTone,
  visualFlowNodeTypes,
} from './flow-node-kit'

type FlowNodeReferenceProps = {
  className?: string
}

type ReferenceNode = {
  type: string
  tone: VisualFlowTone
  data: VisualFlowNodeData
}

const referenceNodes: ReferenceNode[] = [
  {
    type: 'flowStage',
    tone: 'primary',
    data: {
      label: 'Build image',
      code: 'BLD',
      detail: 'Pipeline stage compiles, tests, and packages the deployable unit.',
      status: 'running stage',
      metric: '2m 12s',
      Icon: GitCommitHorizontal,
    },
  },
  {
    type: 'flowGate',
    tone: 'warning',
    data: {
      label: 'Release approval',
      code: 'GATE',
      detail: 'Decision point waits for policy, owner, or risk acceptance.',
      status: 'manual gate',
      Icon: CheckCircle2,
    },
  },
  {
    type: 'flowArtifact',
    tone: 'success',
    data: {
      label: 'Signed image',
      code: 'IMG',
      detail: 'Versioned artifact carries digest, signature, and provenance.',
      status: 'verified artifact',
      metric: 'sha256',
      Icon: PackageCheck,
    },
  },
  {
    type: 'flowEnvironment',
    tone: 'muted',
    data: {
      label: 'Staging',
      code: 'STG',
      detail: 'Runtime target receives candidate release before production promotion.',
      status: 'runtime env',
      Icon: Rocket,
    },
  },
  {
    type: 'flowSystem',
    tone: 'muted',
    data: {
      label: 'Orders API',
      code: 'SVC',
      detail: 'Application, platform, or dependency participating in the delivery graph.',
      status: 'service system',
      Icon: Server,
    },
  },
  {
    type: 'flowEvidence',
    tone: 'success',
    data: {
      label: 'Test report',
      code: 'EVD',
      detail: 'Traceable checks, logs, scans, approvals, or rollback references.',
      status: 'evidence kept',
      Icon: FileCheck2,
    },
  },
  {
    type: 'flowMetric',
    tone: 'danger',
    data: {
      label: 'Change failure',
      code: 'CFR',
      detail: 'Operational signal that frames delivery health and recovery risk.',
      status: 'metric alert',
      metric: '18%',
      Icon: Gauge,
    },
  },
  {
    type: 'flowActor',
    tone: 'ghost',
    data: {
      label: 'AI reviewer',
      code: 'AI',
      detail: 'Human, team, or assistant that proposes, reviews, or owns a decision.',
      status: 'advisory actor',
      Icon: Bot,
    },
  },
]

export function FlowNodeReference({ className }: FlowNodeReferenceProps) {
  return (
    <TooltipProvider>
      <section
        aria-label="Semantic React Flow node reference"
        className={cn('grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-2.5', className)}
      >
        {referenceNodes.map((node) => (
          <FlowReferencePreview key={node.type} node={node} />
        ))}
      </section>
    </TooltipProvider>
  )
}

function FlowReferencePreview({ node }: { node: ReferenceNode }) {
  const data = {
    ...node.data,
    tone: node.tone,
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
  }
  const previewNode: Node<VisualFlowNodeData> = {
    id: node.type,
    type: node.type,
    position: { x: 8, y: 8 },
    draggable: false,
    selectable: false,
    data,
  }

  return (
    <div className="h-[12rem] min-w-0 rounded-sm bg-background/45 p-1.5">
      <ReactFlow
        nodes={[previewNode]}
        edges={[]}
        nodeTypes={visualFlowNodeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
        className="h-full w-full min-w-[10.5rem]"
      />
    </div>
  )
}

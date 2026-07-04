import { useMemo, useState } from 'react'
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'

import {
  costTradeoffClassLabels,
  type CostCapacitySnapshot,
  type CostEstimateRow,
  type CostTradeoffClass,
  type CostTradeoffItem,
} from '@/content/hiraya/costTradeoffLedger'
import { cn } from '@/lib/utils'

import { HirayaSectionShell } from './hiraya-section'

type LedgerTab = 'tradeoff-analysis' | 'estimate-details' | 'capacity-decision'

const ledgerTabs: readonly { id: LedgerTab; label: string; meta: string }[] = [
  { id: 'tradeoff-analysis', label: 'Trade-off analysis', meta: 'why it exists' },
  { id: 'estimate-details', label: 'Estimate details', meta: 'monthly view' },
  { id: 'capacity-decision', label: 'Capacity decision', meta: 'pod headroom' },
]

function classLabel(tradeoffClass: CostTradeoffClass) {
  return costTradeoffClassLabels[tradeoffClass]
}

function TradeoffClassTag({ tradeoffClass }: { tradeoffClass: CostTradeoffClass }) {
  return (
    <span className="w-fit font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
      {classLabel(tradeoffClass)}
    </span>
  )
}

function DetailBlock({ title, children }: { title: string; children: string }) {
  return (
    <section className="border-l border-border pl-3">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{children}</p>
    </section>
  )
}

function TradeoffCard({ item }: { item: CostTradeoffItem }) {
  return (
    <article
      tabIndex={0}
      aria-label={`${item.label}: ${classLabel(item.tradeoffClass)} trade-off`}
      className="grid min-w-0 gap-3 border border-border bg-background/78 p-3 outline-none transition-colors hover:border-primary/35 focus-visible:border-primary/45 focus-visible:ring-2 focus-visible:ring-ring/45 md:grid-cols-[160px_1fr]"
    >
      <div className="grid content-start gap-2">
        <TradeoffClassTag tradeoffClass={item.tradeoffClass} />
        <h3 className="text-base font-semibold tracking-normal text-foreground">{item.label}</h3>
        {item.monthlyEstimate ? (
          <span className="w-fit border border-border bg-card px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">
            {item.monthlyEstimate}
          </span>
        ) : null}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <DetailBlock title="accepted benefit">{item.acceptedBenefit}</DetailBlock>
        <DetailBlock title="saved / avoided">
          {item.savingsMechanism ?? 'No direct savings claim; this is an accepted platform cost.'}
        </DetailBlock>
      </div>
    </article>
  )
}

function EstimateDetails({ rows }: { rows: readonly CostEstimateRow[] }) {
  const columns = useMemo<ColumnDef<CostEstimateRow>[]>(
    () => [
      {
        accessorKey: 'item',
        header: 'Cost item',
        cell: ({ row }) => <span className="font-semibold text-foreground">{row.original.item}</span>,
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => (
          <span className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
            {classLabel(row.original.category)}
          </span>
        ),
      },
      {
        accessorKey: 'assumption',
        header: 'Estimate assumption',
      },
      {
        accessorKey: 'monthlyEstimate',
        header: 'Monthly estimate',
        cell: ({ row }) => <span className="font-mono text-xs font-semibold text-primary">{row.original.monthlyEstimate}</span>,
      },
      {
        accessorKey: 'justification',
        header: 'Justification',
      },
    ],
    [],
  )

  // TanStack Table intentionally returns table helpers from this hook; keep usage local to this component.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: rows as CostEstimateRow[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-x-auto border border-border bg-background/72">
      <table className="w-full min-w-[960px] border-collapse text-left text-sm">
        <caption className="sr-only">Capacity trade-off ledger monthly estimate details</caption>
        <thead className="border-b border-border bg-muted/45">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
              {headerGroup.headers.map((header) => (
                <th key={header.id} scope="col" className="px-4 py-3">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-border/80">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-primary/5 focus-within:bg-primary/5">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-4 align-top leading-6 text-muted-foreground">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CapacityDecision({ capacity }: { capacity: CostCapacitySnapshot }) {
  const podUsagePercent = (capacity.currentRunningPods / capacity.totalPodSlots) * 100
  const terraform = capacity.currentTerraformSizing
  const twoNodeSlots = 2 * capacity.podLimitPerNode

  return (
    <div className="grid gap-5">
      <section className="border border-primary/35 bg-primary/10 p-5">
        <div className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr] xl:items-start">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">node count decision</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-normal text-foreground">Keep three t3.medium Spot nodes</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The decision is driven by pod slots, not CPU or memory. The current workload needs{' '}
              <span className="font-mono text-foreground">{capacity.currentRunningPods}</span> running pods; two nodes only provide{' '}
              <span className="font-mono text-foreground">{twoNodeSlots}</span> slots, while three nodes provide{' '}
              <span className="font-mono text-foreground">{capacity.totalPodSlots}</span>.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="border border-border bg-background/78 p-3">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">demand</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{capacity.currentRunningPods} pods</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">current running workload</p>
            </div>
            <div className="border border-border bg-background/78 p-3">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">2 nodes</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{twoNodeSlots} slots</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">insufficient for current pods</p>
            </div>
            <div className="border border-primary/35 bg-card p-3">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">3 nodes</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{capacity.totalPodSlots} slots</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">fits with {capacity.remainingPodSlots} spare slots</p>
            </div>
          </div>
        </div>

        <div
          className="mt-5 h-4 overflow-hidden border border-border bg-background"
          role="meter"
          aria-label="Pod slots used"
          aria-valuemin={0}
          aria-valuemax={capacity.totalPodSlots}
          aria-valuenow={capacity.currentRunningPods}
          aria-valuetext={`${capacity.currentRunningPods} of ${capacity.totalPodSlots} pod slots used`}
        >
          <div className="h-full bg-primary" style={{ width: `${podUsagePercent}%` }} />
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {capacity.currentRunningPods} / {capacity.totalPodSlots} pod slots used. {capacity.cpuMemoryPressureSummary}
        </p>
      </section>

      <section className="border border-border bg-background/78 p-5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">sizing logic</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-3">
            <div className="border-l border-border pl-3">
              <p className="text-sm font-semibold text-foreground">Current Terraform</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                desired / min / max ={' '}
                <span className="font-mono text-foreground">
                  {terraform.desiredSize} / {terraform.minSize} / {terraform.maxSize}
                </span>{' '}
                on <span className="font-mono text-foreground">{terraform.instanceTypes.join(', ')}</span>{' '}
                <span className="font-mono text-foreground">{terraform.capacityType}</span> capacity.
              </p>
            </div>
            <div className="border-l border-primary/60 pl-3">
              <p className="text-sm font-semibold text-foreground">Gap to keep visible</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Desired size already targets three nodes, but minSize is still 2 and maxSize is still 3. That means scale-down can remove the only safe pod-density floor, and there is no fourth-node buffer for Spot replacement or rollout overlap.
              </p>
            </div>
          </div>

          <div className="grid gap-2">
            {capacity.recommendedNextDecision.map((decision, index) => (
              <div key={decision} className="grid grid-cols-[auto_1fr] gap-3 border border-border bg-card/70 p-3">
                <span className="grid size-6 place-items-center border border-primary/35 bg-primary/10 font-mono text-[10px] font-semibold text-primary">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-muted-foreground">{decision}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export function CostCapacityTradeoffLedger({
  title,
  summary,
  tradeoffs,
  estimateRows,
  capacity,
  className,
}: {
  title: string
  summary: string
  tradeoffs: readonly CostTradeoffItem[]
  estimateRows: readonly CostEstimateRow[]
  capacity: CostCapacitySnapshot
  className?: string
}) {
  const [activeTab, setActiveTab] = useState<LedgerTab>('tradeoff-analysis')

  return (
    <HirayaSectionShell
      className={cn('overflow-hidden', className)}
      eyebrow="Cost explanation model"
      title={title}
      description={summary}
      tabs={{
        items: ledgerTabs.map((tab) => ({ value: tab.id, label: tab.label, meta: tab.meta })),
        value: activeTab,
        onValueChange: (value) => setActiveTab(value as LedgerTab),
      }}
    >
      <div className="p-5">
        {activeTab === 'tradeoff-analysis' ? (
          <div className="grid gap-3">
            {tradeoffs.map((item) => (
              <TradeoffCard key={item.id} item={item} />
            ))}
          </div>
        ) : null}

        {activeTab === 'estimate-details' ? <EstimateDetails rows={estimateRows} /> : null}

        {activeTab === 'capacity-decision' ? <CapacityDecision capacity={capacity} /> : null}
      </div>
    </HirayaSectionShell>
  )
}

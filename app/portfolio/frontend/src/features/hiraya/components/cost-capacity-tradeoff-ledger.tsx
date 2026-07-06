import { useMemo, useState } from 'react'
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'

import {
  type CostCapacitySnapshot,
  type CostCapacityTradeoffLedgerChrome,
  type CostCapacityTradeoffLedgerContent,
  type CostEstimateRow,
  type CostTradeoffClass,
  type CostTradeoffItem,
} from '@/content/hiraya/costTradeoffLedger'
import { cn } from '@/lib/utils'

import { HirayaSectionShell } from './hiraya-section'

type LedgerTab = 'tradeoff-analysis' | 'estimate-details' | 'capacity-decision'

function buildLedgerTabs(
  tabs: CostCapacityTradeoffLedgerContent['tabs'],
  chromeTabs: CostCapacityTradeoffLedgerChrome['tabs'],
): readonly { id: LedgerTab; label: string; meta: string }[] {
  return [
    { id: 'tradeoff-analysis', label: tabs.tradeoffAnalysis.label, meta: chromeTabs.tradeoffAnalysis.meta },
    { id: 'estimate-details', label: tabs.estimateDetails.label, meta: chromeTabs.estimateDetails.meta },
    { id: 'capacity-decision', label: tabs.capacityDecision.label, meta: chromeTabs.capacityDecision.meta },
  ]
}

function classLabel(tradeoffClass: CostTradeoffClass, chrome: CostCapacityTradeoffLedgerChrome) {
  return chrome.classLabels[tradeoffClass]
}

function TradeoffClassTag({ tradeoffClass, chrome }: { tradeoffClass: CostTradeoffClass; chrome: CostCapacityTradeoffLedgerChrome }) {
  return (
    <span className="w-fit font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
      {classLabel(tradeoffClass, chrome)}
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

function TradeoffCard({ item, chrome }: { item: CostTradeoffItem; chrome: CostCapacityTradeoffLedgerChrome }) {
  return (
    <article
      tabIndex={0}
      aria-label={`${item.label}: ${classLabel(item.tradeoffClass, chrome)} ${chrome.tradeoffAriaSuffix}`}
      className="grid min-w-0 gap-3 border border-border bg-background/78 p-3 outline-none transition-colors hover:border-primary/35 focus-visible:border-primary/45 focus-visible:ring-2 focus-visible:ring-ring/45 md:grid-cols-[160px_1fr]"
    >
      <div className="grid content-start gap-2">
        <TradeoffClassTag tradeoffClass={item.tradeoffClass} chrome={chrome} />
        <h3 className="text-base font-semibold tracking-normal text-foreground">{item.label}</h3>
        {item.monthlyEstimate ? (
          <span className="w-fit border border-border bg-card px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">
            {item.monthlyEstimate}
          </span>
        ) : null}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <DetailBlock title={chrome.acceptedBenefitLabel}>{item.acceptedBenefit}</DetailBlock>
        <DetailBlock title={chrome.savingsMechanismLabel}>{item.savingsMechanism ?? chrome.noDirectSavingsClaim}</DetailBlock>
      </div>
    </article>
  )
}

function EstimateDetails({ rows, chrome }: { rows: readonly CostEstimateRow[]; chrome: CostCapacityTradeoffLedgerChrome }) {
  const columns = useMemo<ColumnDef<CostEstimateRow>[]>(
    () => [
      {
        accessorKey: 'item',
        header: chrome.tableColumns.item,
        cell: ({ row }) => <span className="font-semibold text-foreground">{row.original.item}</span>,
      },
      {
        accessorKey: 'category',
        header: chrome.tableColumns.category,
        cell: ({ row }) => (
          <span className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
            {classLabel(row.original.category, chrome)}
          </span>
        ),
      },
      {
        accessorKey: 'assumption',
        header: chrome.tableColumns.assumption,
      },
      {
        accessorKey: 'monthlyEstimate',
        header: chrome.tableColumns.monthlyEstimate,
        cell: ({ row }) => <span className="font-mono text-xs font-semibold text-primary">{row.original.monthlyEstimate}</span>,
      },
      {
        accessorKey: 'justification',
        header: chrome.tableColumns.justification,
      },
    ],
    [chrome],
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
        <caption className="sr-only">{chrome.tableCaption}</caption>
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

function CapacityDecision({ capacity, chrome }: { capacity: CostCapacitySnapshot; chrome: CostCapacityTradeoffLedgerChrome }) {
  const podUsagePercent = (capacity.currentRunningPods / capacity.totalPodSlots) * 100
  const terraform = capacity.currentTerraformSizing
  const twoNodeSlots = 2 * capacity.podLimitPerNode

  return (
    <div className="grid gap-5">
      <section className="border border-primary/35 bg-primary/10 p-5">
        <div className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr] xl:items-start">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">{chrome.capacity.decisionEyebrow}</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-normal text-foreground">{chrome.capacity.decisionTitle}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{chrome.capacity.decisionDescription}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="border border-border bg-background/78 p-3">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">{chrome.capacity.demandLabel}</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{capacity.currentRunningPods} {chrome.capacity.podsUnitLabel}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{chrome.capacity.currentWorkloadLabel}</p>
            </div>
            <div className="border border-border bg-background/78 p-3">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">{chrome.capacity.twoNodesLabel}</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{twoNodeSlots} {chrome.capacity.slotsUnitLabel}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{chrome.capacity.insufficientLabel}</p>
            </div>
            <div className="border border-primary/35 bg-card p-3">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">{chrome.capacity.threeNodesLabel}</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{capacity.totalPodSlots} {chrome.capacity.slotsUnitLabel}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{chrome.capacity.fitsWithSpareSlotsLabel}</p>
            </div>
          </div>
        </div>

        <div
          className="mt-5 h-4 overflow-hidden border border-border bg-background"
          role="meter"
          aria-label={chrome.capacity.slotsUsedAriaLabel}
          aria-valuemin={0}
          aria-valuemax={capacity.totalPodSlots}
          aria-valuenow={capacity.currentRunningPods}
          aria-valuetext={chrome.capacity.slotsUsedAriaText}
        >
          <div className="h-full bg-primary" style={{ width: `${podUsagePercent}%` }} />
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {capacity.currentRunningPods} / {capacity.totalPodSlots} {chrome.capacity.slotsUsedSummaryLabel}. {capacity.cpuMemoryPressureSummary}
        </p>
      </section>

      <section className="border border-border bg-background/78 p-5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">{chrome.capacity.sizingLogicLabel}</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-3">
            <div className="border-l border-border pl-3">
              <p className="text-sm font-semibold text-foreground">{chrome.capacity.currentTerraformTitle}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {chrome.capacity.terraformSizingPrefix}{' '}
                <span className="font-mono text-foreground">
                  {terraform.desiredSize} / {terraform.minSize} / {terraform.maxSize}
                </span>{' '}
                {chrome.capacity.terraformSizingConnector} <span className="font-mono text-foreground">{terraform.instanceTypes.join(', ')}</span>{' '}
                <span className="font-mono text-foreground">{terraform.capacityType}</span> {chrome.capacity.capacityWord}.
              </p>
            </div>
            <div className="border-l border-primary/60 pl-3">
              <p className="text-sm font-semibold text-foreground">{chrome.capacity.gapTitle}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{chrome.capacity.gapDescription}</p>
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
  tabs,
  chrome,
  tradeoffs,
  estimateRows,
  capacity,
  className,
}: {
  title: string
  summary: string
  tabs: CostCapacityTradeoffLedgerContent['tabs']
  chrome: CostCapacityTradeoffLedgerContent['chrome']
  tradeoffs: readonly CostTradeoffItem[]
  estimateRows: readonly CostEstimateRow[]
  capacity: CostCapacitySnapshot
  className?: string
}) {
  const [activeTab, setActiveTab] = useState<LedgerTab>('tradeoff-analysis')
  const tabItems = useMemo(() => buildLedgerTabs(tabs, chrome.tabs), [tabs, chrome.tabs])

  return (
    <HirayaSectionShell
      className={cn('overflow-hidden', className)}
      eyebrow={chrome.eyebrow}
      title={title}
      description={summary}
      tabs={{
        items: tabItems.map((tab) => ({ value: tab.id, label: tab.label, meta: tab.meta })),
        value: activeTab,
        onValueChange: (value) => setActiveTab(value as LedgerTab),
      }}
    >
      <div className="p-5">
        {activeTab === 'tradeoff-analysis' ? (
          <div className="grid gap-3">
            {tradeoffs.map((item) => (
              <TradeoffCard key={item.id} item={item} chrome={chrome} />
            ))}
          </div>
        ) : null}

        {activeTab === 'estimate-details' ? <EstimateDetails rows={estimateRows} chrome={chrome} /> : null}

        {activeTab === 'capacity-decision' ? <CapacityDecision capacity={capacity} chrome={chrome} /> : null}
      </div>
    </HirayaSectionShell>
  )
}

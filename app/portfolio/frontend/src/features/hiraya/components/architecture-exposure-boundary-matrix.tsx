import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
} from '@tanstack/react-table'

import type {
  ExposureBoundaryClassId,
  ExposureBoundaryContent,
  ExposureBoundaryRow,
} from '@/content/hiraya/architectureExposureBoundaries'
import { cn } from '@/lib/utils'

import { HirayaSectionShell } from './hiraya-section'

type ArchitectureExposureBoundaryMatrixProps = {
  content: ExposureBoundaryContent
  className?: string
}

type ExposureFilterValue = ExposureBoundaryClassId | 'all'

const exposureColumnId = 'exposureClass'


function getExposureFilter(columnFilters: ColumnFiltersState): ExposureBoundaryClassId | undefined {
  const filterValue = columnFilters.find((filter) => filter.id === exposureColumnId)?.value
  return typeof filterValue === 'string' ? (filterValue as ExposureBoundaryClassId) : undefined
}

function ExposureFilterButton({
  value,
  label,
  count,
  active,
  onSelect,
}: {
  value: ExposureFilterValue
  label: string
  count: number
  active: boolean
  onSelect: (value: ExposureFilterValue) => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onSelect(value)}
      className={cn(
        'inline-flex min-h-8 items-center gap-2 border px-3 py-1.5 text-left text-xs font-medium transition-colors',
        active
          ? 'border-primary/40 bg-primary/10 text-primary shadow-sm'
          : 'border-border/70 bg-background/60 text-muted-foreground hover:border-primary/25 hover:text-foreground',
      )}
    >
      <span>{label}</span>
      <span className="font-mono text-[10px] text-muted-foreground">{count}</span>
    </button>
  )
}

function ExposureBoundaryTable({ content }: { content: ExposureBoundaryContent }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    { id: exposureColumnId, value: content.defaultOpenGroupId },
  ])

  const columns = useMemo<ColumnDef<ExposureBoundaryRow>[]>(
    () => [
      {
        accessorKey: 'surface',
        header: content.chrome.columns.surface,
        cell: ({ row }) => <span className="font-semibold text-foreground">{row.original.surface}</span>,
      },
      {
        accessorKey: 'entryMechanism',
        header: content.chrome.columns.entryMechanism,
      },
      {
        accessorKey: 'boundaryReason',
        header: content.chrome.columns.boundaryReason,
      },
      {
        accessorKey: 'devTradeoff',
        header: content.chrome.columns.devTradeoff,
      },
      {
        accessorKey: exposureColumnId,
        header: content.chrome.columns.exposureClass,
        filterFn: 'equalsString',
      },
    ],
    [content.chrome.columns],
  )
  const rows = useMemo(() => content.groups.flatMap((group) => group.rows), [content.groups])
  const selectedExposureClass = getExposureFilter(columnFilters)
  const selectedGroup = content.groups.find((group) => group.id === selectedExposureClass)

  // TanStack Table intentionally returns table helpers from this hook; keep usage local to this component.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: rows,
    columns,
    state: {
      columnFilters,
    },
    initialState: {
      columnVisibility: {
        [exposureColumnId]: false,
      },
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const filteredRows = table.getFilteredRowModel().rows

  function selectExposureFilter(value: ExposureFilterValue) {
    setColumnFilters((currentFilters) => {
      const nonExposureFilters = currentFilters.filter((filter) => filter.id !== exposureColumnId)

      if (value === 'all') {
        return nonExposureFilters
      }

      return [...nonExposureFilters, { id: exposureColumnId, value }]
    })
  }

  return (
    <div className="bg-background/72">
      <div className="border-b border-border bg-background/70 px-5 py-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(13rem,0.28fr)_minmax(0,1fr)] lg:items-start">
          <div>
            <p className="font-mono text-[9px] font-semibold uppercase tracking-normal text-muted-foreground">{content.chrome.filterEyebrow}</p>
            <p className="mt-1 text-sm font-semibold tracking-normal text-foreground">{content.chrome.filterLabel}</p>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <ExposureFilterButton
              value="all"
              label={content.chrome.allSurfacesLabel}
              count={rows.length}
              active={!selectedExposureClass}
              onSelect={selectExposureFilter}
            />
            {content.groups.map((group) => (
              <ExposureFilterButton
                key={group.id}
                value={group.id}
                label={group.label}
                count={group.rows.length}
                active={selectedExposureClass === group.id}
                onSelect={selectExposureFilter}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full border-collapse text-left text-sm">
          <caption className="sr-only">{selectedGroup?.label ?? content.chrome.captionAllLabel}</caption>
          <thead className="border-b border-border bg-muted/45">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} scope="col" className="px-5 py-3">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border/80">
            {filteredRows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-primary/5 focus-within:bg-primary/5">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-5 py-4 align-top text-muted-foreground">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ArchitectureExposureBoundaryMatrix({ content, className }: ArchitectureExposureBoundaryMatrixProps) {
  return (
    <HirayaSectionShell
      className={cn('overflow-hidden', className)}
      eyebrow={content.chrome.eyebrow}
      title={content.title}
      description={content.summary}
    >
      <ExposureBoundaryTable content={content} />
    </HirayaSectionShell>
  )
}

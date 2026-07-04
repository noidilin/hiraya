import { useMemo, useState } from 'react'
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'

import type {
  ExposureBoundaryClassId,
  ExposureBoundaryContent,
  ExposureBoundaryGroup,
  ExposureBoundaryRow,
} from '@/content/hiraya/exposureBoundaries'
import { cn } from '@/lib/utils'

import { HirayaSectionShell } from './hiraya-section'

type ExposureBoundaryMatrixProps = {
  content: ExposureBoundaryContent
  className?: string
}

const columns: ColumnDef<ExposureBoundaryRow>[] = [
  {
    accessorKey: 'surface',
    header: 'Surface',
    cell: ({ row }) => <span className="font-semibold text-foreground">{row.original.surface}</span>,
  },
  {
    accessorKey: 'entryMechanism',
    header: 'Entry mechanism',
  },
  {
    accessorKey: 'boundaryReason',
    header: 'Boundary reason',
  },
  {
    accessorKey: 'devTradeoff',
    header: 'Dev trade-off',
  },
]

function surfacePreview(group: ExposureBoundaryGroup) {
  const visibleSurfaces = group.rows.slice(0, 3).map((row) => row.surface)
  const remainingCount = group.rows.length - visibleSurfaces.length

  return remainingCount > 0 ? `${visibleSurfaces.join(' · ')} · +${remainingCount}` : visibleSurfaces.join(' · ')
}

function ExposureBoundaryTable({ group }: { group: ExposureBoundaryGroup }) {
  // TanStack Table intentionally returns table helpers from this hook; keep usage local to this component.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: group.rows as ExposureBoundaryRow[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2 border border-border bg-background/70 px-3 py-2">
        <span className="font-mono text-[9px] font-semibold uppercase tracking-normal text-muted-foreground">selected exposure</span>
        <span className="text-sm font-semibold tracking-normal text-foreground">{group.label}</span>
        <span aria-hidden="true" className="hidden font-mono text-[10px] text-border sm:inline">/</span>
        <span className="min-w-[12rem] flex-1 truncate font-mono text-[10px] uppercase leading-4 tracking-normal text-muted-foreground">
          {surfacePreview(group)}
        </span>
        <span className="shrink-0 border border-border bg-card px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-normal text-muted-foreground">
          {group.rows.length} {group.rows.length === 1 ? 'surface' : 'surfaces'}
        </span>
      </div>

      <div className="overflow-x-auto border border-border bg-background/72">
        <table className="min-w-[920px] w-full border-collapse text-left text-sm">
          <caption className="sr-only">Reachability details for {group.label}</caption>
          <thead className="border-b border-border bg-muted/45">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} scope="col" className="px-3 py-3">
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
                  <td key={cell.id} className="px-3 py-4 align-top text-muted-foreground">
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

export function ExposureBoundaryMatrix({ content, className }: ExposureBoundaryMatrixProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<ExposureBoundaryClassId>(content.defaultOpenGroupId)

  const selectedGroup = useMemo(
    () => content.groups.find((group) => group.id === selectedGroupId) ?? content.groups[0],
    [content.groups, selectedGroupId],
  )

  return (
    <HirayaSectionShell
      className={cn('overflow-hidden', className)}
      eyebrow="Exposure boundary"
      title={content.title}
      description={content.summary}
      tabs={{
        items: content.groups.map((group) => ({ value: group.id, label: group.label, meta: group.rows.length })),
        value: selectedGroup.id,
        onValueChange: (value) => setSelectedGroupId(value as ExposureBoundaryClassId),
      }}
    >
      <ExposureBoundaryTable group={selectedGroup} />
    </HirayaSectionShell>
  )
}

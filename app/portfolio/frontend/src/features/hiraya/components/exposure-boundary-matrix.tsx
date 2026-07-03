import { useMemo, useState } from 'react'
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'

import { Tabs, TabsList, TabsTrigger } from '@/components/motion/tabs'
import type {
  ExposureBoundaryClassId,
  ExposureBoundaryContent,
  ExposureBoundaryGroup,
  ExposureBoundaryRow,
} from '@/content/hiraya/exposureBoundaries'
import { cn } from '@/lib/utils'

import { HirayaSectionFrame, HirayaSectionHeader } from './hiraya-section'

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

function ExposureTabs({
  groups,
  selectedGroupId,
  onSelect,
}: {
  groups: readonly ExposureBoundaryGroup[]
  selectedGroupId: ExposureBoundaryClassId
  onSelect: (groupId: ExposureBoundaryClassId) => void
}) {
  return (
    <Tabs variant="dock" value={selectedGroupId} onValueChange={(value) => onSelect(value as ExposureBoundaryClassId)}>
      <div className="border-b border-border bg-card/70 px-5 py-3">
        <TabsList className="flex flex-wrap rounded-xl border border-border/80 bg-background/70 p-1">
          {groups.map((group) => (
            <TabsTrigger
              key={group.id}
              value={group.id}
              className="min-h-9 rounded-xl px-3 py-2 text-xs"
              indicatorClassName="rounded-xl"
            >
              <span>{group.label}</span>
              <span className="ml-2 font-mono text-[10px] text-muted-foreground">{group.rows.length}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  )
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
      <div className="mb-4 grid gap-2 border border-border bg-background/70 p-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">selected exposure class</p>
          <h3 className="mt-1 text-lg font-semibold tracking-normal text-foreground">{group.label}</h3>
          <p className="mt-2 font-mono text-[10px] uppercase leading-4 tracking-normal text-muted-foreground">
            {surfacePreview(group)}
          </p>
        </div>
        <span className="w-fit border border-border bg-card px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
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
    <HirayaSectionFrame className={cn('overflow-hidden', className)}>
      <HirayaSectionHeader eyebrow="Exposure boundary" title={content.title} description={content.summary} />
      <ExposureTabs groups={content.groups} selectedGroupId={selectedGroup.id} onSelect={setSelectedGroupId} />
      <ExposureBoundaryTable group={selectedGroup} />
    </HirayaSectionFrame>
  )
}

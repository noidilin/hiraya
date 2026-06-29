import type { HirayaContentTable } from '@/content/hiraya/types'

export function HirayaContentTableView({ table }: { table: HirayaContentTable }) {
  return (
    <div className="max-w-full overflow-x-auto border border-border bg-background/70">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-border bg-muted/45 font-mono text-[10px] uppercase tracking-normal text-muted-foreground">
          <tr>
            {table.columns.map((column) => (
              <th key={column} className="px-5 py-3 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={row.join('|')} className="border-b border-border/70 last:border-b-0">
              {row.map((cell, cellIndex) => (
                <td
                  key={`${rowIndex}-${table.columns[cellIndex] ?? cell}`}
                  className="px-5 py-4 align-top leading-6 text-muted-foreground first:font-semibold first:text-foreground"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

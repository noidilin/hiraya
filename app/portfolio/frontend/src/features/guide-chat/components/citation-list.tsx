import type { GuideCitation } from '@/lib/guide-api'

export function CitationList({ citations }: { citations: GuideCitation[] }) {
  return (
    <ul className="mt-3 space-y-1 border-t pt-3 font-mono text-[11px] text-muted-foreground">
      {citations.map((citation) => (
        <li key={`${citation.title}-${citation.source}`}>
          {citation.title} · {citation.source}
        </li>
      ))}
    </ul>
  )
}

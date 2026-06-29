import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type SectionLabelProps = {
  number: string
  title: string
  meta?: string
  className?: string
}

export function SectionLabel({ number, title, meta, className }: SectionLabelProps) {
  return (
    <div className={cn('mb-3 flex items-center justify-between gap-3', className)}>
      <div className="flex min-w-0 items-center gap-2">
        <Badge variant="outline" className="font-mono text-[10px] text-primary">
          {number}
        </Badge>
        <h2 className="truncate text-sm font-semibold tracking-normal text-foreground">{title}</h2>
      </div>
      {meta ? <span className="font-mono text-[10px] text-muted-foreground">{meta}</span> : null}
    </div>
  )
}

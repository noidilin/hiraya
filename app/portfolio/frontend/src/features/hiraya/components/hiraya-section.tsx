import type { ReactNode } from 'react'

import type { HirayaContentSection } from '@/content/hiraya/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import { HirayaContentTableView } from './hiraya-content-table'

export function HirayaSectionFrame({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('w-full min-w-0 border border-border bg-card/88 shadow-sm', className)}>
      {children}
    </section>
  )
}

export function HirayaSectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: string
  description?: string
}) {
  return (
    <div className="border-b border-border bg-muted/35 px-5 py-4">
      {eyebrow ? (
        <p className="font-mono text-[10px] font-semibold uppercase leading-none tracking-normal text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 text-xl font-semibold tracking-normal text-foreground first:mt-0">{title}</h2>
      {description ? (
        <p className="mt-1 max-w-4xl text-sm leading-6 text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}

export function HirayaTag({ children }: { children: ReactNode }) {
  return (
    <Badge
      variant="outline"
      className="rounded-full bg-background/75 px-2.5 py-1 font-mono text-[10px] uppercase tracking-normal"
    >
      {children}
    </Badge>
  )
}

export function HirayaSection({ section }: { section: HirayaContentSection }) {
  const hasBodyContent = Boolean(section.bullets || section.tags || section.table)

  return (
    <HirayaSectionFrame>
      <HirayaSectionHeader eyebrow={section.eyebrow} title={section.title} description={section.body} />
      {hasBodyContent ? (
        <div className="grid gap-5 p-5">
          {section.bullets ? (
            <ul className="grid gap-3 md:grid-cols-2">
              {section.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground"
                >
                  <span className="mr-2 font-mono text-[10px] font-semibold text-primary">//</span>
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
          {section.tags ? (
            <div className="flex flex-wrap gap-2">
              {section.tags.map((tag) => (
                <HirayaTag key={tag}>{tag}</HirayaTag>
              ))}
            </div>
          ) : null}
          {section.table ? <HirayaContentTableView table={section.table} /> : null}
        </div>
      ) : null}
    </HirayaSectionFrame>
  )
}

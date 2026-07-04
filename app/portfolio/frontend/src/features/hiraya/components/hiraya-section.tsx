import type { ReactNode } from 'react'

import { Tabs, TabsList, TabsTrigger } from '@/components/motion/tabs'
import type { HirayaContentSection } from '@/content/hiraya/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import { HirayaContentTableView } from './hiraya-content-table'

export type HirayaSectionTabItem = {
  value: string
  label: ReactNode
  meta?: ReactNode
}

export type HirayaSectionTabsConfig = {
  items: readonly HirayaSectionTabItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
  listClassName?: string
}

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

function HirayaSectionTabList({
  items,
  listClassName,
}: {
  items: readonly HirayaSectionTabItem[]
  listClassName?: string
}) {
  return (
    <TabsList className={cn('flex flex-wrap gap-2 bg-transparent p-0', listClassName)}>
      {items.map((item) => (
        <TabsTrigger
          key={item.value}
          value={item.value}
          className="min-h-8 rounded-none border border-border/70 px-3 py-1.5 text-xs shadow-sm"
          indicatorClassName="!rounded-none border border-primary/35 bg-primary/10 shadow-sm"
          activeClassName="border-primary/35 bg-transparent text-primary"
          inactiveClassName="bg-background/35 text-muted-foreground hover:border-primary/25 hover:text-foreground"
        >
          <span>{item.label}</span>
          {item.meta ? <span className="ml-2 font-mono text-[10px] text-muted-foreground">{item.meta}</span> : null}
        </TabsTrigger>
      ))}
    </TabsList>
  )
}

export function HirayaSectionTabs({
  items,
  value,
  defaultValue,
  onValueChange,
  children,
  className,
  listClassName,
}: HirayaSectionTabsConfig & { children?: ReactNode }) {
  return (
    <Tabs
      variant="segment"
      value={value}
      defaultValue={defaultValue ?? items[0]?.value}
      onValueChange={onValueChange}
      className={className}
    >
      <div className="border-b border-border bg-muted/35 px-5 pb-4 pt-0">
        <HirayaSectionTabList items={items} listClassName={listClassName} />
      </div>
      {children}
    </Tabs>
  )
}

export function HirayaSectionShell({
  eyebrow,
  title,
  description,
  children,
  className,
  tabs,
}: {
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
  className?: string
  tabs?: HirayaSectionTabsConfig
}) {
  if (tabs) {
    return (
      <HirayaSectionFrame className={className}>
        <Tabs
          variant="segment"
          value={tabs.value}
          defaultValue={tabs.defaultValue ?? tabs.items[0]?.value}
          onValueChange={tabs.onValueChange}
          className={tabs.className}
        >
          <HirayaSectionHeader
            eyebrow={eyebrow}
            title={title}
            description={description}
            tabs={<HirayaSectionTabList items={tabs.items} listClassName={tabs.listClassName} />}
          />
          {children}
        </Tabs>
      </HirayaSectionFrame>
    )
  }

  return (
    <HirayaSectionFrame className={className}>
      <HirayaSectionHeader eyebrow={eyebrow} title={title} description={description} />
      {children}
    </HirayaSectionFrame>
  )
}

export function HirayaSectionHeader({
  eyebrow,
  title,
  description,
  tabs,
}: {
  eyebrow?: string
  title: string
  description?: string
  tabs?: ReactNode
}) {
  return (
    <div className="border-b border-border bg-muted/35 px-5 py-4">
      <div>
        {eyebrow ? (
          <p className="font-mono text-[10px] font-semibold uppercase leading-none tracking-normal text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 text-xl font-semibold tracking-normal text-foreground first:mt-0">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-6xl text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {tabs ? <div className="mt-4 flex flex-wrap items-center gap-2">{tabs}</div> : null}
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
    <HirayaSectionShell eyebrow={section.eyebrow} title={section.title} description={section.body}>
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
    </HirayaSectionShell>
  )
}

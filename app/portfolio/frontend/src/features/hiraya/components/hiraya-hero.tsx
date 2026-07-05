import { Badge } from '@/components/ui/badge'
import type { HirayaPageContent } from '@/content/hiraya/types'

function getHeroHeading(sourceSection: string) {
  return sourceSection.replace(/^\d+\.\s*/, '')
}

export function HirayaHero({ page }: { page: HirayaPageContent }) {
  const heroHeading = getHeroHeading(page.sourceSection)

  return (
    <section className="border-l-4 border-primary py-4 pl-6 sm:pl-8">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-normal">
          Case study
        </Badge>
        <Badge
          variant="outline"
          className="rounded-full bg-card/75 px-2.5 py-1 font-mono text-[10px] uppercase tracking-normal"
        >
          AWS / EKS
        </Badge>
        <Badge
          variant="secondary"
          className="rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-normal"
        >
          Decision log
        </Badge>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-start">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary/80">{page.title}</p>
          <h1 className="mt-3 max-w-5xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
            {heroHeading}
          </h1>
          <p className="mt-4 max-w-4xl text-base leading-7 text-muted-foreground sm:text-lg">{page.summary}</p>
        </div>
        <aside className="rounded-2xl border border-border bg-card/75 p-4 shadow-sm lg:self-end">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">Design thesis</p>
          <p className="mt-3 border-l border-primary/40 pl-4 text-sm leading-6 text-muted-foreground">{page.thesis}</p>
        </aside>
      </div>
    </section>
  )
}

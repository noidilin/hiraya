import { BookOpenText } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  defaultLabLocale,
  resolveLabLocaleContent,
  type LabLocaleKey,
  type LabTopic,
} from '@/content/labContentTypes'
import { labPresentationUiContent } from '@/content/labVisualContent'

import { VisualSlotRenderer } from './visual-slot-renderer'

type TopicContentProps = {
  topic: LabTopic
  chapterIndex: number
  chapterTitle: string
  locale?: LabLocaleKey
}

function SourceReferenceButton({
  ariaLabel,
  sourceDoc,
  sourceHeadings,
}: {
  ariaLabel: string
  sourceDoc: string
  sourceHeadings: readonly string[]
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            aria-label={ariaLabel}
          >
            <BookOpenText className="size-3.5" aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          sideOffset={8}
          className="block max-h-[min(24rem,calc(100svh-2rem))] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto px-3 py-3 text-left"
        >
          <p className="break-words font-mono text-xs leading-5 text-muted-foreground">{sourceDoc}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {sourceHeadings.map((heading) => (
              <span
                key={heading}
                className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] leading-4 text-foreground/80"
              >
                {heading}
              </span>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function TopicContent({
  topic,
  chapterIndex,
  chapterTitle,
  locale = defaultLabLocale,
}: TopicContentProps) {
  const topicContent = resolveLabLocaleContent(topic.content, locale)
  const uiContent = resolveLabLocaleContent(labPresentationUiContent, locale)

  return (
    <article className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-4 p-4 sm:p-5 xl:p-6">
      <header className="grid min-w-0 gap-2">
        <div className="flex min-h-7 min-w-0 items-center gap-2">
          <Badge variant="outline" className="shrink-0 font-mono text-[10px] text-primary">
            {uiContent.chapterLabel} {String(chapterIndex + 1).padStart(2, '0')}
          </Badge>
          <Badge
            variant="outline"
            className="min-w-0 max-w-[min(28rem,calc(100vw-14rem))] justify-start truncate border-border/80 font-mono text-[10px] text-muted-foreground"
          >
            {chapterTitle}
          </Badge>
          <SourceReferenceButton
            ariaLabel={uiContent.sourceReferenceAriaLabel}
            sourceDoc={topic.sourceDoc}
            sourceHeadings={topic.sourceHeadings}
          />
        </div>

        <div className="w-full min-w-0">
          <h1 className="truncate text-3xl font-semibold leading-[1.05] tracking-normal text-foreground sm:text-4xl lg:text-[2.625rem]">
            {topicContent.title}
          </h1>
          <p className="mt-1 truncate text-sm leading-5 text-muted-foreground/78 sm:text-[0.95rem]">
            {topicContent.summary}
          </p>
        </div>
      </header>

      <VisualSlotRenderer
        visualSlot={topic.visualSlot}
        stage2Notes={topic.stage2Notes}
        locale={locale}
      />
    </article>
  )
}

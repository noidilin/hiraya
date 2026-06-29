import { Boxes } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  resolveLabLocaleContent,
  type LabVisualLocaleContent,
  type LabVisualSlotKey,
} from '@/content/labContentTypes'
import { defaultAppLocale, type AppLocale } from '@/i18n/locales'
import { labPresentationUiContent, labVisualSlotContent } from '@/content/labVisualContent'
import { cn } from '@/lib/utils'

type VisualPlaceholderProps = {
  visualSlot: LabVisualSlotKey
  stage2Notes?: string
  locale?: AppLocale
  visualContent?: LabVisualLocaleContent
  className?: string
}

export function VisualPlaceholder({
  visualSlot,
  stage2Notes,
  locale = defaultAppLocale,
  visualContent,
  className,
}: VisualPlaceholderProps) {
  const uiContent = resolveLabLocaleContent(labPresentationUiContent, locale)
  const resolvedVisualContent = visualContent ?? resolveLabLocaleContent(labVisualSlotContent[visualSlot], locale)

  return (
    <figure
      aria-label={resolvedVisualContent.ariaLabel}
      className={cn(
        'relative min-h-[160px] overflow-hidden rounded-lg border border-dashed border-primary/35 bg-accent/35 p-3 sm:min-h-[180px]',
        className,
      )}
    >
      <div className="absolute inset-x-4 top-5 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="flex h-full min-h-[136px] flex-col justify-between gap-6 sm:min-h-[156px]">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="outline" className="bg-background/70 font-mono text-[10px] text-primary">
            {uiContent.stage2BadgeLabel}
          </Badge>
          <Boxes className="size-4 text-primary/70" aria-hidden="true" />
        </div>

        <div className="max-w-xl">
          <p className="font-mono text-[11px] uppercase tracking-normal text-muted-foreground">
            {uiContent.visualPlaceholderLabel}
          </p>
          <figcaption className="mt-2 break-words font-mono text-sm font-semibold text-foreground">
            {resolvedVisualContent.title}
          </figcaption>
          <p className="mt-2 max-w-[26rem] text-xs leading-5 text-muted-foreground">
            {resolvedVisualContent.summary}
          </p>
          {stage2Notes ? (
            <p className="mt-2 max-w-[26rem] text-[11px] leading-5 text-muted-foreground/80">{stage2Notes}</p>
          ) : null}
        </div>
      </div>
    </figure>
  )
}

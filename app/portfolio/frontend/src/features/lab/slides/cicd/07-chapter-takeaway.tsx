import { ConceptScene } from '@/features/lab/visuals/concept-scene'
import { cn } from '@/lib/utils'

type ChapterTakeawaySlideVisualProps = {
  className?: string
}

export function ChapterTakeawaySlideVisual({ className }: ChapterTakeawaySlideVisualProps) {
  return <ConceptScene className={cn('h-full min-h-[25rem]', className)} />
}

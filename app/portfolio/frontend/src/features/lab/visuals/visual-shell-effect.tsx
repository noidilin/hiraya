import { ShapeGrid } from '@/components/react-bits'
import { cn } from '@/lib/utils'

export type VisualShellEffectTone = 'pipeline' | 'system' | 'metrics' | 'tradeoff'

const effectConfig: Record<
  VisualShellEffectTone,
  {
    borderColor: string
    direction: 'diagonal' | 'up' | 'right' | 'down' | 'left'
    hoverFillColor: string
    speed: number
    squareSize: number
  }
> = {
  pipeline: {
    borderColor: 'rgba(59, 130, 246, 0.08)',
    direction: 'right',
    hoverFillColor: 'rgba(59, 130, 246, 0.04)',
    speed: 0.08,
    squareSize: 48,
  },
  system: {
    borderColor: 'rgba(100, 116, 139, 0.1)',
    direction: 'diagonal',
    hoverFillColor: 'rgba(20, 184, 166, 0.04)',
    speed: 0.07,
    squareSize: 46,
  },
  metrics: {
    borderColor: 'rgba(22, 163, 74, 0.08)',
    direction: 'up',
    hoverFillColor: 'rgba(22, 163, 74, 0.04)',
    speed: 0.06,
    squareSize: 48,
  },
  tradeoff: {
    borderColor: 'rgba(217, 119, 6, 0.08)',
    direction: 'diagonal',
    hoverFillColor: 'rgba(217, 119, 6, 0.04)',
    speed: 0.07,
    squareSize: 46,
  },
}

export function VisualShellEffect({
  className,
  tone,
}: {
  className?: string
  tone: VisualShellEffectTone
}) {
  const config = effectConfig[tone]

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 z-0 opacity-30 [mask-image:linear-gradient(to_bottom,transparent,black_22%,black_78%,transparent)] motion-reduce:opacity-20',
        className,
      )}
    >
      <ShapeGrid
        {...config}
        hoverTrailAmount={0}
        shape="square"
        vignetteColor="transparent"
      />
    </div>
  )
}

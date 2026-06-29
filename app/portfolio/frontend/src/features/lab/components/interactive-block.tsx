import type { CSSProperties, ReactNode } from 'react'
import { useMemo, useState } from 'react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type InteractiveBlockProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
  title?: string
}

export function InteractiveBlock({
  children,
  className,
  contentClassName,
  title,
}: InteractiveBlockProps) {
  const [glow, setGlow] = useState({ x: 50, y: 50 })
  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const style =
    prefersReducedMotion
      ? undefined
      : ({
          '--lab-glow-x': `${glow.x}%`,
          '--lab-glow-y': `${glow.y}%`,
        } as CSSProperties)

  return (
    <Card
      aria-label={title}
      style={style}
      onPointerMove={(event) => {
        if (prefersReducedMotion) return
        const rect = event.currentTarget.getBoundingClientRect()
        setGlow({
          x: ((event.clientX - rect.left) / rect.width) * 100,
          y: ((event.clientY - rect.top) / rect.height) * 100,
        })
      }}
      className={cn(
        'relative overflow-hidden rounded-lg border-border/90 bg-card/90 shadow-none backdrop-blur-md',
        'before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-150 hover:before:opacity-100',
        'before:bg-[radial-gradient(400px_circle_at_var(--lab-glow-x,50%)_var(--lab-glow-y,50%),color-mix(in_oklch,var(--primary),transparent_92%),transparent_42%)]',
        className,
      )}
    >
      <div className={cn('relative z-10 h-full', contentClassName)}>{children}</div>
    </Card>
  )
}

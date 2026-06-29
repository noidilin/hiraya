import { CodeXml } from 'lucide-react'

import { cn } from '@/lib/utils'
import { VisualShellEffect } from './visual-shell-effect'

type ConceptSceneProps = {
  className?: string
}

export function ConceptScene({ className }: ConceptSceneProps) {
  return (
    <div
      aria-label="Concept scene showing the active CI/CD core module"
      className={cn(
        'relative flex min-h-[190px] items-center justify-center overflow-hidden rounded-lg border border-border/80 bg-background/45 px-4',
        'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,color-mix(in_oklch,var(--primary),transparent_90%),transparent_42%)]',
        'after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border),transparent_62%)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border),transparent_62%)_1px,transparent_1px)] after:bg-[size:24px_24px] after:opacity-30',
        className,
      )}
    >
      <VisualShellEffect tone="pipeline" />
      <div className="relative z-10 flex items-center justify-center gap-3 rounded-xl border border-border/90 bg-card/80 px-4 py-3 shadow-none ring-1 ring-border/60 backdrop-blur-md">
        <div
          className="status-pulse-active relative flex size-12 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary text-primary-foreground shadow-[0_0_0_6px_color-mix(in_oklch,var(--primary),transparent_92%)]"
          aria-hidden="true"
        >
          <div className="absolute inset-1.5 rounded-full border border-primary-foreground/20" />
          <CodeXml className="relative size-5" strokeWidth={2.2} />
        </div>

        <div className="min-w-0 text-left">
          <h3 className="truncate text-sm font-semibold leading-5 tracking-normal text-foreground">
            CI/CD Core
          </h3>
          <p className="mt-0.5 font-mono text-[10px] leading-4 text-muted-foreground">
            v2.4.1 Active
          </p>
        </div>
      </div>
    </div>
  )
}

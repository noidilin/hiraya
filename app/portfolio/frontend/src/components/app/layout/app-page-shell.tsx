import type { ReactNode } from "react"

import { BackgroundField } from "@/components/app/layout/background-field"
import { cn } from "@/lib/utils"

type AppPageShellProps = {
  children: ReactNode
  dock?: ReactNode
  reserveBottomNavigation?: boolean
  className?: string
  contentClassName?: string
}

export function AppPageShell({
  children,
  dock,
  reserveBottomNavigation = false,
  className,
  contentClassName,
}: AppPageShellProps) {
  return (
    <div
      className={cn(
        "relative min-h-svh text-foreground",
        reserveBottomNavigation ? "pb-28 md:pb-24" : "pb-8",
        className,
      )}
    >
      <BackgroundField />
      {dock ? (
        <div className="fixed right-3 top-3 z-50 flex items-start justify-end gap-1.5 sm:right-4 sm:top-4">
          {dock}
        </div>
      ) : null}
      <main className={cn("relative z-10", contentClassName)}>{children}</main>
    </div>
  )
}

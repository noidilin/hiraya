import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  max,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const normalizedMax = typeof max === "number" && max > 0 ? max : 100
  const normalizedValue = typeof value === "number" && Number.isFinite(value) ? value : 0
  const percentage = Math.min(100, Math.max(0, (normalizedValue / normalizedMax) * 100))

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      max={max}
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="size-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }

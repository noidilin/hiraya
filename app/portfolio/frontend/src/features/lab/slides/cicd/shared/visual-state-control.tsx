import type { ReactNode } from "react"

import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs"
import { cn } from "@/lib/utils"

export const visualShellStateFooterClassName =
  "flex min-h-12 shrink-0 items-center overflow-x-auto border-t border-border/70 bg-muted/45 px-3 py-1.5"
export const visualShellFooterClassName = visualShellStateFooterClassName

export function VisualShellFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="group"
      aria-label="Visual state controller"
      className={cn(visualShellFooterClassName, className)}
    >
      {children}
    </div>
  )
}

export type VisualControlStep<T extends string = string> = {
  value: T
  label: string
  shortLabel?: string
  description: string
  status?: string
}

export type VisualControlModel<T extends string = string> = {
  label: string
  value: T
  steps: VisualControlStep<T>[]
  onValueChange: (value: T) => void
  ariaValueText?: (step: VisualControlStep<T>, index: number) => string
}

export type VisualStateControllerProps<T extends string = string> = {
  model: VisualControlModel<T>
  className?: string
  showDescription?: boolean
}

export function VisualStateController<T extends string = string>({
  model,
  className,
  showDescription = false,
}: VisualStateControllerProps<T>) {
  const { label, value, steps, onValueChange, ariaValueText } = model
  const selectedIndex = steps.findIndex((step) => step.value === value)
  const hasSelectedStep = selectedIndex >= 0
  const selectedStep = hasSelectedStep ? steps[selectedIndex] : undefined
  const selectedLabel = selectedStep?.shortLabel ?? selectedStep?.label ?? "No state"
  const selectedDescription = selectedStep?.description
  const liveText = selectedStep
    ? `${label}: ${selectedStep.label}. ${selectedStep.description}`
    : `${label}: no state selected.`

  if (steps.length === 0) {
    return (
      <div className={cn("min-w-0 text-[11px] leading-4 text-muted-foreground", className)}>
        <span className="font-medium text-foreground">{label}</span>: no states available.
      </div>
    )
  }

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "pointer-events-auto flex w-full min-w-max items-center gap-3 text-[11px] leading-4 lg:min-w-0",
        className,
      )}
    >
      <div className="flex min-w-[7rem] max-w-[14rem] shrink-0 items-center gap-2">
        <div className="flex min-w-0 items-baseline gap-1.5">
          <span className="shrink-0 font-mono text-[9px] font-semibold uppercase tracking-normal text-muted-foreground">
            {label}
          </span>
          <span className="min-w-0 truncate font-semibold text-foreground">{selectedLabel}</span>
        </div>
        {selectedStep?.status ? (
          <span className="max-w-full shrink-0 truncate rounded-sm border border-border bg-card px-1.5 font-mono text-[8px] font-semibold uppercase tracking-normal text-muted-foreground">
            {selectedStep.status}
          </span>
        ) : null}
      </div>

      <Tabs
        value={value}
        onValueChange={(nextValue) => onValueChange(nextValue as T)}
        variant="segment"
        className="min-w-0 flex-1 overflow-x-auto"
      >
        <TabsList className="inline-flex min-w-max gap-1 bg-card/80 p-1">
          {steps.map((step, index) => {
            const active = index === selectedIndex
            const valueText = ariaValueText?.(step, index)
            return (
              <TabsTrigger
                key={step.value}
                value={step.value}
                indicatorClassName="bg-primary"
                className={cn(
                  "h-7 min-w-[5.5rem] justify-start px-2 py-1 text-left text-[11px] leading-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active && "font-semibold",
                )}
                aria-label={valueText ? `${step.label}: ${valueText}` : `${step.label}: ${step.description}`}
              >
                <span className="min-w-0 truncate">{step.shortLabel ?? step.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {showDescription && selectedDescription ? (
        <p className="min-w-0 text-[11px] leading-4 text-muted-foreground" aria-live="polite">
          <span className="font-medium text-foreground">{selectedStep.label}</span>: {selectedDescription}
        </p>
      ) : null}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveText}
      </p>
    </div>
  )
}

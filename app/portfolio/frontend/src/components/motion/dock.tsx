"use client"

import { motion, useReducedMotion } from "motion/react"
import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react"
import { SPRING_LAYOUT } from "@/lib/ease"
import { cn } from "@/lib/utils"

type DockContextValue = {
  size: number
  pillLayoutId: string
}

const DockContext = createContext<DockContextValue | null>(null)

export interface DockProps {
  children: ReactNode
  className?: string
  /** Size of each item in px. */
  size?: number
}

export function Dock({ children, size = 44, className }: DockProps) {
  const pillLayoutId = useId()
  const ctx = useMemo<DockContextValue>(
    () => ({ size, pillLayoutId }),
    [size, pillLayoutId],
  )

  return (
    <DockContext.Provider value={ctx}>
      <div
        className={cn(
          "inline-flex h-auto items-end gap-1.5 rounded-2xl border border-border bg-card/80 px-2 py-1 shadow-2xl backdrop-blur-xl",
          className,
        )}
      >
        {children}
      </div>
    </DockContext.Provider>
  )
}

export interface DockItemProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "onClick"> {
  children: ReactNode
  /** When set, the item renders as a <button>. Omit when children carry their own link or button. */
  onClick?: () => void
  active?: boolean
}

export const DockItem = forwardRef<HTMLButtonElement | HTMLDivElement, DockItemProps>(function DockItem(
  {
    children,
    className,
    onClick,
    active,
    style,
    ...rest
  },
  ref,
) {
  const dock = useContext(DockContext)
  const reduce = useReducedMotion()
  const size = dock?.size ?? 44
  const pillLayoutId = dock?.pillLayoutId ?? "dock-pill"

  const pill = active ? (
    <motion.span
      layoutId={pillLayoutId}
      transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
      className="absolute inset-0.5 -z-10 rounded-[inherit] bg-primary/5"
    />
  ) : null
  const sharedStyle = { ...style, width: size, height: size }
  const sharedClass = cn(
    "relative flex shrink-0 items-center justify-center rounded-[10px] text-foreground",
    className,
  )

  if (onClick) {
    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        onClick={onClick}
        aria-pressed={active}
        style={sharedStyle}
        className={cn(
          sharedClass,
          "cursor-pointer border-0 bg-transparent p-0 outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
        {...(rest as HTMLAttributes<HTMLButtonElement>)}
      >
        {pill}
        {children}
      </button>
    )
  }

  // Children carry their own link or button (and its accessible name).
  return (
    <div ref={ref as Ref<HTMLDivElement>} style={sharedStyle} className={sharedClass} {...(rest as HTMLAttributes<HTMLDivElement>)}>
      {pill}
      {children}
    </div>
  )
})

export function DockSeparator({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("mx-1 h-6 w-px self-center bg-border", className)}
    />
  )
}

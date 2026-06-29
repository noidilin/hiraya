"use client"

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react"
import {
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"

import { cn } from "@/lib/utils"

const SPRING_GLIDE = { stiffness: 700, damping: 50, mass: 0.5 } as const
const SPRING_BOUNCY = { type: "spring", stiffness: 500, damping: 14, mass: 0.7 } as const

export interface RangeSliderProps {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  showTicks?: boolean
  disabled?: boolean
  className?: string
  "aria-label"?: string
  "aria-valuetext"?: string
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function RangeSlider({
  value,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  showTicks = true,
  disabled = false,
  className,
  "aria-label": ariaLabel,
  "aria-valuetext": ariaValueText,
}: RangeSliderProps) {
  const reduce = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const [internal, setInternal] = useState(defaultValue)
  const [active, setActive] = useState(false)
  const controlled = value !== undefined
  const span = Math.max(max - min, step)
  const current = clamp(controlled ? value : internal, min, max)
  const percent = ((current - min) / span) * 100

  const target = useMotionValue(percent)
  useEffect(() => {
    target.set(percent)
  }, [percent, target])
  const smooth = useSpring(target, SPRING_GLIDE)
  const pos = reduce ? target : smooth
  const left = useMotionTemplate`${pos}%`
  const thumbX = useTransform(pos, (position) => `${-position}%`)

  const steps = Math.floor((max - min) / step)
  const ticks =
    showTicks && steps > 0 && steps <= 50
      ? Array.from({ length: steps + 1 }, (_, index) => min + index * step)
      : []

  const commit = useCallback(
    (next: number) => {
      const snapped = clamp(Math.round((next - min) / step) * step + min, min, max)
      if (!controlled) setInternal(snapped)
      onValueChange?.(snapped)
    },
    [controlled, onValueChange, min, max, step],
  )

  const valueFromX = useCallback(
    (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect()
      if (!rect) return current
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1)
      return min + ratio * (max - min)
    },
    [current, min, max],
  )

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (disabled) return
      event.currentTarget.setPointerCapture(event.pointerId)
      thumbRef.current?.focus()
      setActive(true)
      commit(valueFromX(event.clientX))
    },
    [disabled, commit, valueFromX],
  )

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!active || disabled) return
      commit(valueFromX(event.clientX))
    },
    [active, disabled, commit, valueFromX],
  )

  const endDrag = useCallback((event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    setActive(false)
  }, [])

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return
      const map: Record<string, number> = {
        ArrowRight: current + step,
        ArrowUp: current + step,
        ArrowLeft: current - step,
        ArrowDown: current - step,
        Home: min,
        End: max,
      }
      if (event.key in map) {
        event.preventDefault()
        commit(map[event.key])
      }
    },
    [disabled, current, step, min, max, commit],
  )

  return (
    <div
      ref={trackRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={cn(
        "relative flex h-8 w-full touch-none select-none items-center overflow-hidden rounded-lg border border-border/80 bg-card/80 shadow-inner shadow-foreground/[0.03]",
        disabled ? "pointer-events-none opacity-50" : "cursor-grab active:cursor-grabbing",
        className,
      )}
    >
      <motion.div
        className="absolute inset-y-0 left-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--primary),transparent_48%),color-mix(in_oklch,var(--primary),transparent_68%))]"
        style={{ width: left }}
      />

      <div className="pointer-events-none absolute inset-x-2 inset-y-0">
        {ticks.map((tick) => {
          const tickPercent = ((tick - min) / span) * 100
          const isActiveTick = tick <= current

          return (
            <span
              key={tick}
              className={cn(
                "absolute top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full ring-1 ring-card/80",
                isActiveTick ? "bg-primary/75" : "bg-muted-foreground/25",
              )}
              style={{ left: `${tickPercent}%` }}
            />
          )
        })}
      </div>

      <motion.div
        ref={thumbRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={current}
        aria-valuetext={ariaValueText}
        aria-disabled={disabled || undefined}
        onKeyDown={onKeyDown}
        animate={reduce ? undefined : { scaleY: active ? 1.35 : 1 }}
        transition={SPRING_BOUNCY}
        className="absolute top-1/2 h-5 w-1.5 rounded-sm border border-primary-foreground/40 bg-primary shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary),transparent_86%)] outline-none ring-primary/20 focus-visible:ring-4 focus-visible:ring-ring/35"
        style={{ left, x: thumbX, y: "-50%" }}
      />
    </div>
  )
}

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

type PixelTransitionProps = {
  firstContent: ReactNode | string
  secondContent: ReactNode | string
  gridSize?: number
  pixelColor?: string
  animationStepDuration?: number
  once?: boolean
  className?: string
  style?: CSSProperties
  aspectRatio?: string
}

export function PixelTransition({
  firstContent,
  secondContent,
  gridSize = 7,
  pixelColor = 'currentColor',
  animationStepDuration = 0.3,
  once = false,
  aspectRatio = '100%',
  className = '',
  style = {},
}: PixelTransitionProps) {
  const pixelGridRef = useRef<HTMLDivElement | null>(null)
  const activeRef = useRef<HTMLDivElement | null>(null)
  const delayedCallRef = useRef<gsap.core.Tween | null>(null)
  const [isActive, setIsActive] = useState(false)

  const isTouchDevice =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches

  useEffect(() => {
    const pixelGridEl = pixelGridRef.current
    if (!pixelGridEl) return

    pixelGridEl.innerHTML = ''

    for (let row = 0; row < gridSize; row += 1) {
      for (let col = 0; col < gridSize; col += 1) {
        const pixel = document.createElement('div')
        pixel.classList.add('pixelated-image-card__pixel', 'absolute', 'hidden')
        pixel.style.backgroundColor = pixelColor

        const size = 100 / gridSize
        pixel.style.width = `${size}%`
        pixel.style.height = `${size}%`
        pixel.style.left = `${col * size}%`
        pixel.style.top = `${row * size}%`

        pixelGridEl.appendChild(pixel)
      }
    }
  }, [gridSize, pixelColor])

  useEffect(() => {
    return () => {
      delayedCallRef.current?.kill()
    }
  }, [])

  const animatePixels = (activate: boolean) => {
    setIsActive(activate)

    const pixelGridEl = pixelGridRef.current
    const activeEl = activeRef.current
    if (!pixelGridEl || !activeEl) return

    const pixels = pixelGridEl.querySelectorAll<HTMLDivElement>('.pixelated-image-card__pixel')
    if (!pixels.length) return

    gsap.killTweensOf(pixels)
    delayedCallRef.current?.kill()
    gsap.set(pixels, { display: 'none' })

    const staggerDuration = animationStepDuration / pixels.length

    gsap.to(pixels, {
      display: 'block',
      duration: 0,
      stagger: {
        each: staggerDuration,
        from: 'random',
      },
    })

    delayedCallRef.current = gsap.delayedCall(animationStepDuration, () => {
      activeEl.style.display = activate ? 'block' : 'none'
      activeEl.style.pointerEvents = activate ? 'none' : ''
    })

    gsap.to(pixels, {
      display: 'none',
      duration: 0,
      delay: animationStepDuration,
      stagger: {
        each: staggerDuration,
        from: 'random',
      },
    })
  }

  const handleEnter = () => {
    if (!isActive) animatePixels(true)
  }

  const handleLeave = () => {
    if (isActive && !once) animatePixels(false)
  }

  const handleClick = () => {
    if (!isActive) animatePixels(true)
    else if (!once) animatePixels(false)
  }

  return (
    <div
      className={`relative w-full max-w-full overflow-hidden rounded-lg border border-white/15 bg-zinc-950 text-white outline-none ${className}`}
      style={style}
      onMouseEnter={!isTouchDevice ? handleEnter : undefined}
      onMouseLeave={!isTouchDevice ? handleLeave : undefined}
      onClick={isTouchDevice ? handleClick : undefined}
      onFocus={!isTouchDevice ? handleEnter : undefined}
      onBlur={!isTouchDevice ? handleLeave : undefined}
      tabIndex={0}
    >
      <div style={{ paddingTop: aspectRatio }} />

      <div className="absolute inset-0 h-full w-full" aria-hidden={isActive}>
        {firstContent}
      </div>

      <div
        ref={activeRef}
        className="absolute inset-0 z-[2] hidden h-full w-full"
        aria-hidden={!isActive}
      >
        {secondContent}
      </div>

      <div ref={pixelGridRef} className="pointer-events-none absolute inset-0 z-[3] h-full w-full" />
    </div>
  )
}

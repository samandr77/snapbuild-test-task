import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import { Button } from './Button'

export type TestimonialCarouselItem = {
  id: string
  quote: string
  name: string
  role: string
  avatar: string
}

const glowPalettes = [
  ['#ff916d', '#ff70ad', '#a98bff'],
  ['#5f8cff', '#8e6bff', '#ff7cab'],
  ['#ffc85c', '#ff8261', '#d279ff'],
] as const

export function TestimonialCarousel({
  items,
  label,
  className = '',
}: {
  items: TestimonialCarouselItem[]
  label: string
  className?: string
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [focusPaused, setFocusPaused] = useState(false)
  const [hoverPaused, setHoverPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const dragStart = useRef<{ x: number; y: number; pointerId: number } | null>(null)
  const middle = Math.floor(items.length / 2)
  const showPrevious = () => setActiveIndex((current) => (current - 1 + items.length) % items.length)
  const showNext = () => setActiveIndex((current) => (current + 1) % items.length)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReducedMotion(media.matches)
    media.addEventListener('change', updatePreference)
    return () => media.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    if (focusPaused || hoverPaused || reducedMotion) return

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length)
    }, 5_000)

    return () => window.clearInterval(timer)
  }, [focusPaused, hoverPaused, items.length, reducedMotion])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    if (event.key === 'ArrowLeft') showPrevious()
    else showNext()
  }
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragStart.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current
    dragStart.current = null
    if (!start || start.pointerId !== event.pointerId) return

    const distanceX = event.clientX - start.x
    const distanceY = event.clientY - start.y
    const threshold = Math.max(40, event.currentTarget.clientWidth * 0.15)
    if (Math.abs(distanceX) < threshold || Math.abs(distanceX) <= Math.abs(distanceY)) return

    if (distanceX < 0) showNext()
    else showPrevious()
  }

  return (
    <div
      className={`review-carousel ${className}`.trim()}
      aria-label={label}
      aria-roledescription="карусель"
      role="region"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocusCapture={() => setFocusPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocusPaused(false)
      }}
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
    >
      <div className="review-carousel__glows" aria-hidden="true">
        {items.map((item, index) => {
          const palette = glowPalettes[index % glowPalettes.length]
          return (
            <span
              className={`review-carousel__glow${index === activeIndex ? ' is-active' : ''}`}
              key={item.id}
              style={
                {
                  '--glow-a': palette[0],
                  '--glow-b': palette[1],
                  '--glow-c': palette[2],
                } as CSSProperties
              }
            />
          )
        })}
      </div>
      <div
        className="review-carousel__stage"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          dragStart.current = null
        }}
      >
        {items.map((item, index) => {
          const position = ((index - activeIndex + middle + items.length) % items.length) - middle
          const active = position === 0

          return (
            <article
              className={`review-carousel__card${active ? ' is-active' : ''}`}
              data-active={active}
              data-id={item.id}
              data-position={position}
              aria-hidden={!active}
              aria-label={`Отзыв ${index + 1} из ${items.length}`}
              key={item.id}
              onClick={() => setActiveIndex(index)}
              role="group"
              style={{ '--position': position } as CSSProperties}
            >
              <div className="review-carousel__person">
                <span className="review-carousel__avatar" aria-hidden="true">
                  <img src={item.avatar} alt="" decoding="async" />
                </span>
                <span>
                  <strong className="review-carousel__name">{item.name}</strong>
                  <span className="review-carousel__role">{item.role}</span>
                </span>
              </div>
              <span className="review-carousel__label">Отзыв</span>
              <blockquote className="review-carousel__quote">{item.quote}</blockquote>
            </article>
          )
        })}
      </div>
      <Button
        className="review-carousel__nav review-carousel__nav--previous"
        type="button"
        variant="launch"
        aria-label="Предыдущий отзыв"
        onClick={showPrevious}
      >
        ←
      </Button>
      <Button
        className="review-carousel__nav review-carousel__nav--next"
        type="button"
        variant="launch"
        aria-label="Следующий отзыв"
        onClick={showNext}
      >
        →
      </Button>
    </div>
  )
}

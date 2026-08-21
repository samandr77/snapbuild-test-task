import { useRef } from 'react'
import { roadmap } from '../data'

/**
 * Дорожная карта — горизонтальная лента этапов, как на исходном сайте.
 * Колонки одинаковой ширины идут в ряд, через них проходит линия: серая на
 * всю длину и розовая до последнего пройденного пункта. Лента прокручивается
 * колесом, свайпом и перетаскиванием мышью — на оригинале это тоже drag-scroll.
 */
export function Roadmap() {
  const scroller = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; left: number } | null>(null)
  const reached = roadmap.items.filter((item) => item.reached).length

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // Мышью ленту тянем сами; тач и перо прокручивает сам браузер
    if (event.pointerType !== 'mouse' || !scroller.current) return
    drag.current = { x: event.clientX, left: scroller.current.scrollLeft }
    scroller.current.classList.add('is-dragging')
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !scroller.current) return
    event.preventDefault()
    scroller.current.scrollLeft = drag.current.left - (event.clientX - drag.current.x)
  }

  const stopDrag = () => {
    drag.current = null
    scroller.current?.classList.remove('is-dragging')
  }

  return (
    <section className="rmap" id="roadmap">
      <header className="rmap__header dds-reveal">
        <h2 className="section__title">{roadmap.title}</h2>
        <p className="section__subtitle">{roadmap.subtitle}</p>
      </header>

      <div
        className="rmap__scroller dds-reveal dds-reveal--delay-1"
        ref={scroller}
        role="group"
        aria-label="Этапы развития платформы"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        onPointerLeave={stopDrag}
        onPointerCancel={stopDrag}
      >
        <div
          className="rmap__track"
          style={{ '--rmap-progress': reached } as React.CSSProperties}
        >
          {roadmap.items.map((item) => (
            <article className={`rmap__item${item.reached ? ' is-reached' : ''}`} key={item.name}>
              <span className="rmap__dot" aria-hidden="true">
                <span className="rmap__dot-halo" />
                <span className="rmap__dot-core" />
              </span>
              <div className="rmap__body">
                <h3 className="rmap__name">{item.name}</h3>
                <p className="rmap__desc">{item.desc}</p>
                <p className="rmap__date">{item.date}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

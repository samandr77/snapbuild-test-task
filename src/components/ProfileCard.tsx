import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

export type ProfileItem = {
  id: string
  tab: string
  name: string
  role: string
  initials: string
  body: ReactNode
}

/**
 * Карточка с переключаемыми разделами по мотивам референса.
 * Механика оттуда же: шапка сворачивается (обложка и аватар уменьшаются,
 * имя уезжает влево), раздел проявляется через fadeIn со сдвигом снизу,
 * активная вкладка подчёркивается снизу.
 *
 * Отличие: высота карточки не задана фиксированными значениями под каждое
 * состояние, а измеряется по содержимому — иначе русский текст разной длины
 * либо обрезался бы, либо оставлял пустоту.
 */
export function ProfileCard({
  items,
  className = '',
  label,
}: {
  items: ProfileItem[]
  className?: string
  label: string
}) {
  const [active, setActive] = useState(0)
  const [touched, setTouched] = useState(false)
  const [height, setHeight] = useState<number>()
  const bodyRef = useRef<HTMLDivElement>(null)

  // Высота подстраивается под активный раздел и под смену ширины окна
  useLayoutEffect(() => {
    const el = bodyRef.current
    if (!el) return
    const measure = () => setHeight(el.scrollHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [active])

  const item = items[active]

  const select = (i: number) => {
    if (i === active) return
    setTouched(true)
    setActive(i)
  }

  return (
    <article className={`pcard${touched ? ' is-compact' : ''} ${className}`.trim()}>
      <header className="pcard__header">
        <span className="pcard__cover" aria-hidden="true" />
        <span className="pcard__avatar" aria-hidden="true">
          {item.initials}
        </span>
        <p className="pcard__name">{item.name}</p>
        <p className="pcard__role">{item.role}</p>
      </header>

      <div className="pcard__main">
        <div className="pcard__body" style={height ? { height } : undefined}>
          <div className="pcard__body-inner" ref={bodyRef}>
            <div className="pcard__section" key={item.id} id={`pcard-panel-${item.id}`}>
              {item.body}
            </div>
          </div>
        </div>

        <div className="pcard__tabs" role="tablist" aria-label={label}>
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-controls={`pcard-panel-${it.id}`}
              className={`pcard__tab${i === active ? ' is-active' : ''}`}
              onClick={() => select(i)}
            >
              {it.tab}
            </button>
          ))}
        </div>
      </div>
    </article>
  )
}

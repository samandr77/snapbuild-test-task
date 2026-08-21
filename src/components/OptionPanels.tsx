import type { ComponentType, ReactNode } from 'react'

export type OptionPanel = {
  id: string
  icon: ComponentType<{ className?: string }>
  main: string
  sub?: string
  /** Кадр панели; без него остаётся фирменный градиент */
  media?: string
  /** Содержимое раскрытой панели; у свёрнутых оно скрыто */
  content?: ReactNode
}

/**
 * Раскрывающиеся панели-«гармошка».
 * Механика и тайминги взяты из референса без изменений:
 * активная получает flex-grow: 10000, свёрнутые — 1 и упираются в min-width,
 * тень усиливается, подпись выезжает, а второй строке добавлена задержка 0.1s.
 * Кривая — cubic-bezier(0.05, 0.61, 0.41, 0.95), длительность 0.5s.
 *
 * Панель размечена как div с role="tab", а не кнопкой: внутрь раскрытой панели
 * попадают заголовки и списки, а кнопка по стандарту принимает только строчное
 * содержимое. Клавиатура обрабатывается вручную — Enter и пробел.
 *
 * Размеры считаются через --u, поэтому блок масштабируется вместе с макетом.
 */
export function OptionPanels({
  items,
  label,
  active,
  onSelect,
  panelId,
  className = '',
}: {
  items: OptionPanel[]
  label: string
  active: number
  onSelect: (index: number) => void
  panelId?: string
  className?: string
}) {
  return (
    <div className={`options ${className}`.trim()} role="tablist" aria-label={label}>
      {items.map((item, i) => {
        const Icon = item.icon
        const isActive = i === active
        return (
          <div
            key={item.id}
            role="tab"
            tabIndex={0}
            id={`format-tab-${item.id}`}
            aria-selected={isActive}
            aria-controls={panelId}
            className={`option option--${i + 1}${isActive ? ' active' : ''}`}
            onMouseEnter={() => onSelect(i)}
            onClick={() => onSelect(i)}
            onFocus={() => onSelect(i)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelect(i)
              }
            }}
          >
            {item.media && (
              <img
                className="option__media"
                src={item.media}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
              />
            )}
            <span className="option__shadow" />

            <span className="option__label">
              <span className="option__icon">
                <Icon />
              </span>
              <span className="option__info">
                <span className="option__main">{item.main}</span>
                {item.sub && <span className="option__sub">{item.sub}</span>}
              </span>
            </span>

            {item.content && <div className="option__content">{item.content}</div>}
          </div>
        )
      })}
    </div>
  )
}

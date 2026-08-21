import type { ReactNode } from 'react'

/**
 * Двухпанельная карточка по мотивам референса: слева цветная панель с текстом,
 * справа — белая с содержимым. Скруглена и обрезает содержимое по краю,
 * поэтому панели прилегают к углам без зазоров.
 *
 * Отличие от референса: ниже 768px панели не прячутся, а встают друг под друга —
 * в левой лежит смысловой текст, терять его на телефоне нельзя.
 */
export function SplitCard({
  aside,
  children,
  className = '',
}: {
  aside: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`split-card ${className}`.trim()}>
      <div className="split-card__aside">
        <div className="split-card__aside-inner">{aside}</div>
      </div>
      <div className="split-card__main">
        <div className="split-card__main-inner">{children}</div>
      </div>
    </div>
  )
}

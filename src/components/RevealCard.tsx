import type { ReactNode } from 'react'

type Tone = 'warm' | 'brand' | 'dark'

/**
 * Карточка с раскрытием по наведению.
 * Механика взята из референса: подложка уезжает параллаксом, затемнение
 * сдвигается, а содержимое поднимается снизу — видимой остаётся только «шапка».
 * Всё, что не шапка, проявляется с задержкой.
 *
 * Ниже 768 px и на устройствах без hover карточка всегда раскрыта:
 * тап не должен прятать кнопку. Клавиатура ловится через :focus-within.
 */
export function RevealCard({
  tone = 'brand',
  head,
  children,
  media,
  className = '',
}: {
  tone?: Tone
  head: ReactNode
  children: ReactNode
  /** Кадр карточки; снизу он растворяется, открывая фирменный градиент */
  media?: string
  className?: string
}) {
  return (
    <article className={`reveal-card reveal-card--${tone} ${className}`.trim()}>
      {media && (
        <img
          className="reveal-card__photo"
          src={media}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />
      )}
      <div className="reveal-card__content">
        <div className="reveal-card__head">{head}</div>
        {children}
      </div>
    </article>
  )
}

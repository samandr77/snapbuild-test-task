import { useEffect, useState } from 'react'
import { product } from '../data'

const POINT_DURATION = 5000

/**
 * Продукт — секция собрана как на исходном сайте: полноширинный заголовок,
 * строка вкладок форматов и две колонки под ними. Слева карточки возможностей
 * выбранного формата, справа кадр выбранной возможности.
 *
 * Карточки перелистываются сами; клик по карточке сбрасывает таймер, потому
 * что pointIndex попадает в зависимости эффекта.
 */
export function Product() {
  const [formatIndex, setFormatIndex] = useState(0)
  const [pointIndex, setPointIndex] = useState(0)
  const format = product.formats[formatIndex]

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setTimeout(
      () => setPointIndex((i) => (i + 1) % format.points.length),
      POINT_DURATION,
    )
    return () => window.clearTimeout(id)
  }, [formatIndex, pointIndex, format.points.length])

  const selectFormat = (index: number) => {
    setFormatIndex(index)
    setPointIndex(0)
  }

  return (
    <section className="ucase" id="product">
      <div className="ucase__header dds-reveal">
        <h2 className="ucase__title">{product.title}</h2>

        <div className="ucase__group" role="tablist" aria-label="Форматы материалов">
          {product.formats.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`format-tab-${item.id}`}
              aria-selected={i === formatIndex}
              aria-controls={`format-panel-${item.id}`}
              className={`ucase__tab${i === formatIndex ? ' is-active' : ''}`}
              onClick={() => selectFormat(i)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="ucase__body dds-reveal dds-reveal--delay-1"
        role="tabpanel"
        id={`format-panel-${format.id}`}
        aria-labelledby={`format-tab-${format.id}`}
      >
        <div className="ucase__points">
          {format.points.map((point, i) => (
            <button
              key={point.title}
              type="button"
              className={`ucase__card${i === pointIndex ? ' is-active' : ''}`}
              onClick={() => setPointIndex(i)}
              aria-pressed={i === pointIndex}
            >
              <span className="ucase__card-title">{point.title}</span>
              <span className="ucase__card-desc">
                <span>{point.desc}</span>
              </span>
              <span className="ucase__card-progress" aria-hidden="true">
                <span className="ucase__card-fill" key={`${format.id}-${pointIndex}`} />
              </span>
            </button>
          ))}
        </div>

        {/* Кадр занимает панель целиком — так это сделано на исходном сайте */}
        <div className="ucase__panel">
          {format.points.map((point, i) => (
            <img
              className={`ucase__media${i === pointIndex ? ' is-active' : ''}`}
              key={`${format.id}-${point.title}`}
              src={point.media}
              alt={`${format.label}: ${point.title}`}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              width={2880}
              height={1620}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

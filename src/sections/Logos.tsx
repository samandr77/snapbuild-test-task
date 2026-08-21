import { logos } from '../data'

/**
 * Бегущая строка логотипов клиентов.
 * В исходнике подпись стоит под логотипами (order: 2), поэтому здесь тот же приём.
 * Лента едет только там, где пять логотипов не помещаются в ряд, — на десктопе
 * они стоят статично по центру, как на оригинале.
 */
export function Logos() {
  return (
    <section className="logos" id="logos">
      <div className="logos__track">
        {/* Второй проход нужен для бесшовной прокрутки на узких экранах */}
        {[0, 1].map((pass) => (
          <div className="logos__row" key={pass} aria-hidden={pass === 1 || undefined}>
            {logos.items.map((item) => (
              <span className="logos__item" key={item.name} style={{ aspectRatio: item.ratio }}>
                <img src={item.src} alt={pass === 0 ? item.name : ''} loading="lazy" />
              </span>
            ))}
          </div>
        ))}
      </div>
      <p className="logos__caption">{logos.caption}</p>
    </section>
  )
}

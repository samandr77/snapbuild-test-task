import { steps } from '../data'

/**
 * «Одна платформа — весь маркетинг» — три опоры платформы.
 * Порт секции process исходного сайта: заголовок и подзаголовок стоят в одну
 * строку по краям, ниже три кадра со скруглением и подписи под ними.
 * Подложки у карточки нет — картинка лежит прямо на фоне секции.
 */
export function Steps() {
  return (
    <section className="steps" id="platform">
      <header className="steps__header dds-reveal">
        <h2 className="steps__title">{steps.title}</h2>
        <p className="steps__subtitle">{steps.subtitle}</p>
      </header>

      <div className="steps__grid">
        {steps.cards.map((card, i) => (
          <article className={`steps__card dds-reveal dds-reveal--delay-${i + 1}`} key={card.name}>
            <img
              className="steps__media"
              src={card.media}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
            />
            <div className="steps__copy">
              <h3 className="steps__name">{card.name}</h3>
              <p className="steps__desc">{card.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

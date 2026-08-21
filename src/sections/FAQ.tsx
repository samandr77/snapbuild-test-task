import { useState } from 'react'
import { SectionHeader } from '../components/SectionHeader'
import { faq } from '../data'

/** Аккордеон раскрывается через grid-template-rows: 0fr → 1fr — как в исходнике. */
export function FAQ() {
  const [openId, setOpenId] = useState<number | null>(null)

  const half = Math.ceil(faq.items.length / 2)
  const columns = [faq.items.slice(0, half), faq.items.slice(half)]

  return (
    <section className="section faq" id="faq">
      <SectionHeader className="dds-reveal" title={faq.title} subtitle={faq.subtitle} />

      <div className="faq__list">
        {columns.map((column, colIndex) => (
          <div className="faq__col" key={colIndex}>
            {column.map((item) => {
              const index = faq.items.indexOf(item)
              const isOpen = openId === index
              return (
                <div
                  className={`faq__item dds-reveal${isOpen ? ' is-open' : ''}`}
                  key={item.q}
                >
                  <button
                    className="faq__head"
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                    id={`faq-head-${index}`}
                    onClick={() => setOpenId(isOpen ? null : index)}
                  >
                    <span className="faq__question">{item.q}</span>
                    <span className="faq__icon" aria-hidden="true" />
                  </button>
                  <div
                    className="faq__panel"
                    id={`faq-panel-${index}`}
                    role="region"
                    aria-labelledby={`faq-head-${index}`}
                  >
                    <div className="faq__answer-wrap">
                      <p className="faq__answer">{item.a}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}

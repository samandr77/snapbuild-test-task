import { CheckIcon } from '../components/Icons'
import { SectionHeader } from '../components/SectionHeader'
import { compare } from '../data'

/**
 * Сравнительная таблица исходного сайта.
 * Колонка продукта — единственная выделенная, первый столбец закреплён,
 * а на узких экранах таблица прокручивается внутри себя, не растягивая страницу.
 */
export function Compare() {
  return (
    <section className="section section--tight compare" id="compare">
      <SectionHeader className="dds-reveal" title={compare.title} subtitle={compare.subtitle} />

      <div className="compare__scroll dds-reveal dds-reveal--delay-1">
        <div className="compare__inner">
          {/* Градиентная обводка колонки продукта — тем же приёмом, что в исходнике:
              градиент под маской с mask-composite, поверх лежит только рамка */}
          <span className="compare__ring" aria-hidden="true" />
          <table className="compare__table">
            <colgroup>
              <col className="compare__col compare__col--label" />
              {compare.columns.map((c) => (
                <col className="compare__col" key={c} />
              ))}
            </colgroup>
          <caption className="visually-hidden">
            Сравнение Снэпбилда с альтернативными способами production маркетинговых материалов
          </caption>
          <thead>
            <tr>
              <th scope="col">Особенности</th>
              {compare.columns.map((col, i) => (
                <th scope="col" key={col}>
                  {i === 0 ? <span className="compare__brand">{col}</span> : col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compare.rows.map((row) => (
              <tr key={row.feature}>
                <th scope="row">{row.feature}</th>
                {row.values.map((value, i) => (
                  <td key={i} data-col={compare.columns[i]}>
                    {typeof value === 'boolean' ? (
                      value ? (
                        <>
                          <CheckIcon className="compare__mark" />
                          <span className="visually-hidden">Есть</span>
                        </>
                      ) : (
                        <>
                          <span className="compare__dash" aria-hidden="true" />
                          <span className="visually-hidden">Нет</span>
                        </>
                      )
                    ) : (
                      value
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

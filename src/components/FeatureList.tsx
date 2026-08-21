import { CheckIcon, MinusIcon } from './Icons'

export type Feature = { text: string; included?: boolean }

/**
 * Список пунктов с галочкой или прочерком.
 * Один компонент на тарифы, чек-листы внедрения и задачи команд.
 */
export function FeatureList({
  items,
  marker = 'check',
  className = '',
}: {
  items: Feature[]
  marker?: 'check' | 'dot'
  className?: string
}) {
  return (
    <ul className={`feature-list feature-list--${marker} ${className}`.trim()}>
      {items.map((item) => {
        const included = item.included !== false
        return (
          <li
            className={`feature-list__item${included ? '' : ' feature-list__item--off'}`}
            key={item.text}
          >
            {marker === 'check' &&
              (included ? (
                <CheckIcon className="feature-list__mark" />
              ) : (
                <MinusIcon className="feature-list__mark" />
              ))}
            <span>{item.text}</span>
          </li>
        )
      })}
    </ul>
  )
}

import { useState } from 'react'
import { ButtonLink } from '../components/Button'
import { Badge } from '../components/Badge'
import { FeatureList } from '../components/FeatureList'
import { RevealCard } from '../components/RevealCard'
import { SectionHeader } from '../components/SectionHeader'
import { connection, type Plan } from '../data'

type Period = 'monthly' | 'yearly'

const formatPrice = (value: number) => value.toLocaleString('ru-RU')

function price(plan: Plan, period: Period) {
  if (plan.customPrice) return { amount: plan.customPrice, suffix: '' }
  const value = period === 'monthly' ? plan.monthly : plan.yearly
  if (value === null) return { amount: '—', suffix: '' }
  return { amount: `${formatPrice(value)} ₽`, suffix: '/ мес' }
}

/**
 * НОВАЯ СЕКЦИЯ 4 — «Варианты подключения».
 * Сегментный переключатель периода + три тарифа на карточках с раскрытием:
 * в покое видно только название, при наведении поднимаются цена, состав и кнопка.
 */
export function Connection() {
  const [period, setPeriod] = useState<Period>('monthly')

  return (
    <section className="section connection" id="connection">
      <SectionHeader
        className="dds-reveal"
        title={connection.title}
        subtitle={connection.subtitle}
      />

      <div className="switch dds-reveal dds-reveal--delay-1" role="group" aria-label="Период оплаты">
        <button
          type="button"
          className={`switch__seg${period === 'monthly' ? ' is-active' : ''}`}
          aria-pressed={period === 'monthly'}
          onClick={() => setPeriod('monthly')}
        >
          Помесячно
        </button>
        <button
          type="button"
          className={`switch__seg${period === 'yearly' ? ' is-active' : ''}`}
          aria-pressed={period === 'yearly'}
          onClick={() => setPeriod('yearly')}
        >
          На год
          <Badge variant="accent">−20%</Badge>
        </button>
      </div>

      <div className="connection__grid">
        {connection.plans.map((plan, i) => {
          const { amount, suffix } = price(plan, period)
          return (
            <RevealCard
              key={plan.id}
              tone={plan.tone}
              media={plan.media}
              className={`plan dds-reveal dds-reveal--delay-${i + 1}`}
              head={
                <>
                  <span className="plan__row">
                    <h3 className="plan__name">{plan.name}</h3>
                    {plan.badge && <Badge variant="dark">{plan.badge}</Badge>}
                  </span>
                </>
              }
            >
              <span className="plan__price">
                <span className="plan__amount">{amount}</span>
                {suffix && <span className="plan__period">{suffix}</span>}
              </span>
              <p className="plan__tagline">{plan.tagline}</p>
              <FeatureList className="plan__features" items={plan.features} />
              <p className="plan__note">{plan.note}</p>
              <ButtonLink href="#demo" variant="launch" size="l" className="plan__cta">
                {plan.cta}
              </ButtonLink>
            </RevealCard>
          )
        })}
      </div>

      <p className="connection__footnote dds-reveal">{connection.footnote}</p>
    </section>
  )
}

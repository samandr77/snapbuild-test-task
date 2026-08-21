import { useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { AlertIcon, SuccessIcon } from '../components/Icons'
import { IconTile } from '../components/IconTile'
import { SectionHeader } from '../components/SectionHeader'
import { SplitCard } from '../components/SplitCard'
import { demo } from '../data'

type Values = {
  name: string
  email: string
  company: string
  goal: string
  comment: string
  consent: boolean
}

type Errors = Partial<Record<keyof Values, string>>

const empty: Values = { name: '', email: '', company: '', goal: '', comment: '', consent: false }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Zа-яА-Я]{2,}$/

function validate(values: Values): Errors {
  const errors: Errors = {}

  if (!values.name.trim()) errors.name = 'Укажите, как к вам обращаться'
  else if (values.name.trim().length < 2) errors.name = 'Имя должно быть длиннее одного символа'

  if (!values.email.trim()) errors.email = 'Укажите рабочую почту'
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Проверьте формат адреса: имя@компания.ру'

  if (!values.company.trim()) errors.company = 'Укажите название компании'
  if (!values.goal) errors.goal = 'Выберите, что планируете создавать'
  if (!values.consent) errors.consent = 'Без согласия мы не сможем обработать заявку'

  return errors
}

/**
 * Заявка на демо. Форма собрана по референсу: цветная панель слева,
 * поля справа. Серверная отправка по условиям задачи не требуется —
 * есть валидация, понятные ошибки и состояние успеха.
 */
export function DemoForm() {
  const [values, setValues] = useState<Values>(empty)
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)
  const [sent, setSent] = useState(false)

  const update = <K extends keyof Values>(key: K, value: Values[K]) => {
    const next = { ...values, [key]: value }
    setValues(next)
    if (submitted) setErrors(validate(next))
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      document.getElementById(`demo-${Object.keys(found)[0]}`)?.focus()
      return
    }
    setSent(true)
  }

  const reset = () => {
    setValues(empty)
    setErrors({})
    setSubmitted(false)
    setSent(false)
  }

  const field = (key: keyof Values) => `field${errors[key] ? ' field--invalid' : ''}`

  return (
    <section className="section demo" id="demo">
      <SectionHeader className="dds-reveal" title={demo.title} subtitle={demo.subtitle} />

      <SplitCard
        className="dds-reveal dds-reveal--delay-1"
        aside={
          <>
            <h3 className="split-card__title">Как проходит демо</h3>
            <ol className="demo__points">
              {demo.points.map((point, i) => (
                <li className="demo__point" key={point.title}>
                  <span className="demo__point-num">{i + 1}</span>
                  <span className="demo__point-text">
                    <span className="demo__point-title">{point.title}</span>
                    <span className="demo__point-desc">{point.desc}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="demo__contacts">
              <span className="demo__contacts-title">{demo.contactsTitle}</span>
              <a href={`mailto:${demo.email}`}>{demo.email}</a>
              <a href="#demo">{demo.telegram}</a>
            </div>
          </>
        }
      >
        {sent ? (
          <div className="demo__success" role="status" aria-live="polite">
            <IconTile size="l" className="demo__success-icon">
              <SuccessIcon />
            </IconTile>
            <h3 className="demo__success-title">Заявка отправлена</h3>
            <p className="demo__success-text">
              {values.name.trim()}, спасибо! Мы посмотрим материалы {values.company.trim()} и
              напишем на {values.email.trim()} в течение рабочего дня.
            </p>
            <Button type="button" variant="outline" size="l" onClick={reset}>
              Отправить ещё одну
            </Button>
          </div>
        ) : (
          <form className="demo__form" onSubmit={onSubmit} noValidate>
            <h3 className="split-card__title split-card__title--compact">Как проходит демо</h3>
            <p className="demo__required">* Обязательные поля</p>

            <div className={field('name')}>
              <input
                className="field__control"
                id="demo-name"
                type="text"
                autoComplete="name"
                placeholder="Имя *"
                aria-label="Имя"
                value={values.name}
                onChange={(e) => update('name', e.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'demo-name-error' : undefined}
              />
              {errors.name && (
                <span className="field__error" id="demo-name-error">
                  <AlertIcon />
                  {errors.name}
                </span>
              )}
            </div>

            <div className={field('email')}>
              <input
                className="field__control"
                id="demo-email"
                type="email"
                autoComplete="email"
                placeholder="Рабочая почта *"
                aria-label="Рабочая почта"
                value={values.email}
                onChange={(e) => update('email', e.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'demo-email-error' : undefined}
              />
              {errors.email && (
                <span className="field__error" id="demo-email-error">
                  <AlertIcon />
                  {errors.email}
                </span>
              )}
            </div>

            <div className={field('company')}>
              <input
                className="field__control"
                id="demo-company"
                type="text"
                autoComplete="organization"
                placeholder="Компания *"
                aria-label="Компания"
                value={values.company}
                onChange={(e) => update('company', e.target.value)}
                aria-invalid={Boolean(errors.company)}
                aria-describedby={errors.company ? 'demo-company-error' : undefined}
              />
              {errors.company && (
                <span className="field__error" id="demo-company-error">
                  <AlertIcon />
                  {errors.company}
                </span>
              )}
            </div>

            <div className={field('goal')}>
              <select
                className="field__control"
                id="demo-goal"
                aria-label="Что планируете создавать"
                value={values.goal}
                onChange={(e) => update('goal', e.target.value)}
                aria-invalid={Boolean(errors.goal)}
                aria-describedby={errors.goal ? 'demo-goal-error' : undefined}
              >
                <option value="">Что планируете создавать *</option>
                {demo.goals.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>
              {errors.goal && (
                <span className="field__error" id="demo-goal-error">
                  <AlertIcon />
                  {errors.goal}
                </span>
              )}
            </div>

            <div className="field">
              <textarea
                className="field__control"
                id="demo-comment"
                rows={4}
                placeholder="Расскажите про ближайшую задачу — покажем платформу на ней"
                aria-label="Комментарий"
                value={values.comment}
                onChange={(e) => update('comment', e.target.value)}
              />
            </div>

            <div className={`${field('consent')} field--checkbox`}>
              <input
                id="demo-consent"
                type="checkbox"
                checked={values.consent}
                onChange={(e) => update('consent', e.target.checked)}
                aria-invalid={Boolean(errors.consent)}
                aria-describedby={errors.consent ? 'demo-consent-error' : undefined}
              />
              <span>
                <label htmlFor="demo-consent">
                  Согласен на обработку персональных данных в соответствии с{' '}
                  <a href="#footer">политикой конфиденциальности</a>
                </label>
                {errors.consent && (
                  <span className="field__error" id="demo-consent-error">
                    <AlertIcon />
                    {errors.consent}
                  </span>
                )}
              </span>
            </div>

            <Button type="submit" variant="black" size="l" className="demo__submit">
              Запросить демо
            </Button>
          </form>
        )}
      </SplitCard>
    </section>
  )
}

import type { ReactNode } from 'react'

/**
 * Шапка секции: надзаголовок, заголовок и подзаголовок в едином ритме.
 * Все секции страницы строятся вокруг неё, поэтому кегль и отступы
 * задаются здесь один раз.
 */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  className = '',
  children,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  className?: string
  children?: ReactNode
}) {
  return (
    <div className={`section__header ${className}`.trim()}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="section__title">{title}</h2>
      {subtitle && <p className="section__subtitle">{subtitle}</p>}
      {children}
    </div>
  )
}

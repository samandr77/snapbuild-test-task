import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

type Variant = 'plain' | 'accent' | 'dark' | 'tile'

/**
 * Карточка — базовая поверхность лендинга: белая, крупный радиус, без тени.
 * `accent` рисует фирменную градиентную рамку через padding-box/border-box —
 * тем же приёмом, которым исходный сайт помечает активные элементы.
 */
export function Card({
  as: Tag = 'div',
  variant = 'plain',
  className = '',
  children,
  ...rest
}: {
  as?: ElementType
  variant?: Variant
  className?: string
  children: ReactNode
} & Omit<ComponentPropsWithoutRef<'div'>, 'className' | 'children'>) {
  return (
    <Tag className={`card card--${variant} ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  )
}

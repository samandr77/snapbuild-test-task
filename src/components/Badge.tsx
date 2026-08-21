import type { ReactNode } from 'react'

type Variant = 'soft' | 'accent' | 'dark' | 'outline'

/**
 * Плашка: маленький скруглённый ярлык.
 * Используется для бейджа тарифа, статуса в роадмапе, категории интеграции,
 * скидки в переключателе периода и подписей в мокапе продукта.
 */
export function Badge({
  variant = 'soft',
  children,
  className = '',
}: {
  variant?: Variant
  children: ReactNode
  className?: string
}) {
  return <span className={`badge badge--${variant} ${className}`.trim()}>{children}</span>
}

import type { ReactNode } from 'react'

/**
 * Плитка с иконкой и фирменным свечением снизу.
 * Повторяет приём исходного сайта из блока «Безопасность»;
 * здесь же используется в «Продукте» и в состоянии успеха формы.
 */
export function IconTile({
  size = 'm',
  children,
  className = '',
}: {
  size?: 's' | 'm' | 'l'
  children: ReactNode
  className?: string
}) {
  return (
    <span className={`icon-tile icon-tile--${size} ${className}`.trim()} aria-hidden="true">
      {children}
    </span>
  )
}

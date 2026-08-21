import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'black' | 'gradient' | 'launch' | 'outline'
type Size = 'm' | 'l'

type BaseProps = {
  variant?: Variant
  size?: Size
  children: ReactNode
  className?: string
}

/** Собирает набор классов из варианта и размера — та же логика для кнопки и ссылки. */
function classes({ variant = 'primary', size = 'm', className = '' }: BaseProps) {
  return ['btn', `btn--${variant}`, size === 'l' ? 'btn--l' : '', className]
    .filter(Boolean)
    .join(' ')
}

export function Button({
  variant,
  size,
  children,
  className,
  ...rest
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={classes({ variant, size, children, className })} {...rest}>
      <span className="btn__label">{children}</span>
    </button>
  )
}

export function ButtonLink({
  variant,
  size,
  children,
  className,
  ...rest
}: BaseProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={classes({ variant, size, children, className })} {...rest}>
      <span className="btn__label">{children}</span>
    </a>
  )
}

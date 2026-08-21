import { useEffect, useState } from 'react'
import logo from '../assets/logo.svg'
import { navLinks } from '../data'
import { ButtonLink } from './Button'

/**
 * Шапка исходного сайта: плавающая полупрозрачная капсула с размытием,
 * центрированная и ограниченная по ширине. Логотип слева, навигация по центру,
 * одна чёрная кнопка справа. На планшете и мобильном навигация уходит в меню.
 */
export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  /**
   * Оторвавшись от верха, шапка получает рамку и тень — так же, как в исходнике:
   * там класс переключается по window.scrollY > 12 с троттлингом через rAF.
   */
  useEffect(() => {
    let queued = false
    const update = () => {
      setScrolled(window.scrollY > 12)
      queued = false
    }
    const onScroll = () => {
      if (queued) return
      queued = true
      requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => mq.matches && setOpen(false)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return (
    <header className={`header${scrolled ? ' is-scrolled' : ''}`} id="header">
      <div className="header__bar">
        <a className="header__logo" href="#hero" aria-label="Снэпбилд — на главную">
          <img src={logo} alt="Снэпбилд" width={153} height={22} />
        </a>

        <nav className="header__nav" aria-label="Основная навигация">
          {navLinks.map((link) => (
            <a key={link.href} className="header__link" href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header__actions">
          <ButtonLink href="#demo" variant="black" size="l">
            Начать сейчас
          </ButtonLink>

          <button
            className="header__burger"
            type="button"
            aria-expanded={open}
            aria-controls="header-menu"
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
          </button>
        </div>
      </div>

      <div className={`header__menu${open ? ' is-open' : ''}`} id="header-menu">
        <div className="header__menu-inner">
          {navLinks.map((link) => (
            <a
              key={link.href}
              className="header__menu-link"
              href={link.href}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
            >
              {link.label}
            </a>
          ))}
          <ButtonLink
            className="header__menu-cta"
            href="#demo"
            variant="black"
            size="l"
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
          >
            Запросить демо
          </ButtonLink>
        </div>
      </div>
    </header>
  )
}

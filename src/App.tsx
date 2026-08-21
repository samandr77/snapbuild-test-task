import { useEffect } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Hero } from './sections/Hero'
import { Logos } from './sections/Logos'
import { Steps } from './sections/Steps'
import { Product } from './sections/Product'
import { Compare } from './sections/Compare'
import { Workflow } from './sections/Workflow'
import { Roadmap } from './sections/Roadmap'
import { Connection } from './sections/Connection'
import { FAQ } from './sections/FAQ'
import { DemoForm } from './sections/DemoForm'
import { Testimonials } from './sections/Testimonials'
import { FinalCTA } from './sections/FinalCTA'

export default function App() {
  /**
   * Появление блоков при скролле. Один наблюдатель на страницу вместо
   * состояния в каждом компоненте — так же, как это сделано на исходном сайте.
   * При prefers-reduced-motion наблюдатель не запускается, CSS сразу показывает контент.
   */
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const targets = document.querySelectorAll<HTMLElement>('.dds-reveal')

    if (reduced || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.setAttribute('data-visible', ''))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Именно атрибут, а не класс: React перерисовывает className
            // и стёр бы класс, повешенный извне, — блок стал бы прозрачным
            entry.target.setAttribute('data-visible', '')
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    )

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <a className="skip-link" href="#product">
        Перейти к содержимому
      </a>

      <Header />

      <main id="main">
        {/* Исходные секции лендинга */}
        <Hero />
        <Logos />

        {/* Три опоры платформы — секция process исходного сайта */}
        <Steps />

        <Product />

        {/* Исходная секция */}
        <Compare />

        {/* Новая секция: как проходит внедрение */}
        <Workflow />


        {/* Исходная секция */}
        <Roadmap />

        {/* Новая секция: варианты подключения */}
        <Connection />

        {/* Исходная секция */}
        <FAQ />

        {/* Новая секция: заявка на демо */}
        <DemoForm />

        {/* Новая секция: отзывы клиентов */}
        <Testimonials />

        {/* Исходная секция */}
        <FinalCTA />
      </main>

      <Footer />
    </>
  )
}

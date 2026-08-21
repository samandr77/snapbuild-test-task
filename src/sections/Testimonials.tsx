import { SectionHeader } from '../components/SectionHeader'
import { TestimonialCarousel } from '../components/TestimonialCarousel'
import { testimonials } from '../data'

export function Testimonials() {
  return (
    <section className="section testimonials" id="reviews">
      <SectionHeader
        className="dds-reveal"
        title={testimonials.title}
        subtitle={testimonials.subtitle}
      />

      <TestimonialCarousel
        className="dds-reveal dds-reveal--delay-1"
        items={testimonials.items}
        label="Отзывы клиентов"
      />
    </section>
  )
}

import { ButtonLink } from '../components/Button'
import { finalCta } from '../data'

export function FinalCTA() {
  return (
    <section className="cta" id="cta">
      <span className="cta__shine" aria-hidden="true" />
      <h2 className="cta__title dds-reveal">{finalCta.title}</h2>
      <div className="cta__actions dds-reveal dds-reveal--delay-1">
        <ButtonLink href="#demo" variant="launch" size="l">
          {finalCta.primary}
        </ButtonLink>
      </div>
    </section>
  )
}

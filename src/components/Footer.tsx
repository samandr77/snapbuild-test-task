import logo from '../assets/logo.svg'
import { footer } from '../data'

export function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer__top">
        <div className="footer__brand">
          <a className="footer__logo" href="#hero" aria-label="Снэпбилд — на главную">
            <img src={logo} alt="Снэпбилд" width={153} height={22} />
          </a>
          <p className="footer__tagline">{footer.tagline}</p>
        </div>

        {footer.columns.map((col) => (
          <div className="footer__col" key={col.title}>
            <h3 className="footer__col-title">{col.title}</h3>
            <ul className="footer__list">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a className="footer__link" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer__legal">
        <p className="footer__copyright">{footer.copyright}</p>
        <a className="footer__email" href={`mailto:${footer.email}`}>
          {footer.email}
        </a>
      </div>
    </footer>
  )
}

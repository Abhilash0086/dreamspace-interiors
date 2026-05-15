import './Footer.css'

const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Process', href: '#process' },
  { label: 'Contact', href: '#contact' },
]

const services = [
  'Residential Interiors',
  'Modular Kitchens',
  'False Ceilings',
  'Commercial Spaces',
  'Renovation',
  'Design Consultation',
]

export default function Footer() {
  const handleNav = (href) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <a href="#hero" onClick={() => handleNav('#hero')} className="footer__logo-link">
            <img src="/logo.png" alt="Dreamspace Interiors" className="footer__logo" />
          </a>
          <p className="footer__tagline">
            Luxury in Every Detail.<br />
            Coimbatore's premium interior design studio.
          </p>
          <a
            href="https://www.instagram.com/sandboxinterior?igsh=MXBkMTQ1cnY2aGVqbg=="
            target="_blank"
            rel="noopener noreferrer"
            className="footer__social"
            aria-label="Instagram"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="1.5" y="1.5" width="15" height="15" rx="4" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="9" cy="9" r="3.25" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="13.25" cy="4.75" r="0.875" fill="currentColor"/>
            </svg>
            @sandboxinterior
          </a>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">Navigate</h4>
          <ul className="footer__links">
            {navLinks.map((l) => (
              <li key={l.href}>
                <button className="footer__link" onClick={() => handleNav(l.href)}>
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">Services</h4>
          <ul className="footer__links">
            {services.map((s) => (
              <li key={s}>
                <button className="footer__link" onClick={() => handleNav('#services')}>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">Contact</h4>
          <div className="footer__contact-list">
            <a href="tel:+919876543210" className="footer__contact-item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 3a.7.7 0 01.7-.7h1.68l.84 2.31-.98.7a7 7 0 003.85 3.85l.7-.98 2.31.84v1.68a.7.7 0 01-.7.7C5.11 11.4 2.5 8.79 2.5 3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
              +91 98765 43210
            </a>
            <a href="mailto:sandboxinteriors@gmail.com" className="footer__contact-item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M1 5.5l6 3.5 6-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              sandboxinteriors@gmail.com
            </a>
            <div className="footer__contact-item footer__address">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1.5a4 4 0 014 4C11 8.5 7 12.5 7 12.5S3 8.5 3 5.5a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.2"/>
                <circle cx="7" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              29K, Krishnasamy Street, Indira Nagar,<br />
              Rathinapuri, Coimbatore — 641027
            </div>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="footer__bottom-inner">
          <p className="footer__copy">
            © {new Date().getFullYear()} Dreamspace Interiors. All rights reserved.
          </p>
          <p className="footer__founder">
            Founded by <strong>Aswin Kumar</strong>
          </p>
        </div>
      </div>
    </footer>
  )
}

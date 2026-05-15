import { useState, useEffect } from 'react'
import './Navbar.css'

const links = [
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Process', href: '#process' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNav = (href) => {
    setMenuOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar__inner">
        <a href="#hero" className="navbar__logo" onClick={() => handleNav('#hero')}>
          <img src="/logo.png" alt="Dreamspace Interiors" />
        </a>

        <nav className={`navbar__nav ${menuOpen ? 'open' : ''}`}>
          {links.map((l) => (
            <button key={l.href} className="navbar__link" onClick={() => handleNav(l.href)}>
              {l.label}
            </button>
          ))}
          <button className="btn-primary navbar__cta" onClick={() => handleNav('#contact')}>
            Get a Quote
          </button>
        </nav>

        <button
          className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}

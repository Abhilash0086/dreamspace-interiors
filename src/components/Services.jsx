import { useScrollAnimation } from '../hooks/useScrollAnimation'
import './Services.css'

const services = [
  {
    id: '01',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 36V20L24 8l16 12v16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M18 36v-10h12v10" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M24 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Residential Interiors',
    desc: 'Tailored living spaces that reflect your personality — from elegant drawing rooms to serene bedrooms, every corner crafted with intent.',
    tags: ['Living Rooms', 'Bedrooms', 'Pooja Rooms'],
  },
  {
    id: '02',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="10" width="36" height="28" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M6 18h36" stroke="currentColor" strokeWidth="2"/>
        <path d="M16 18v20M32 18v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="24" cy="14" r="2" fill="currentColor"/>
      </svg>
    ),
    title: 'Modular Kitchens',
    desc: 'Smart, ergonomic kitchen designs that blend beauty with function. Premium finishes, smart storage, and layouts built for modern life.',
    tags: ['L-Shape', 'U-Shape', 'Island Kitchens'],
  },
  {
    id: '03',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 12h36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M10 12v4M20 12v8M30 12v4M38 12v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M8 20h32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3"/>
        <path d="M10 36l4-12M38 36l-4-12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M14 36h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'False Ceilings',
    desc: 'Architectural ceilings that transform a room\'s character — POP, gypsum, and coffered designs with integrated lighting schemes.',
    tags: ['POP Ceilings', 'Gypsum', 'LED Integration'],
  },
  {
    id: '04',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="14" width="40" height="28" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M4 22h40" stroke="currentColor" strokeWidth="2"/>
        <path d="M16 6h16l4 8H12l4-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M14 30h8M14 36h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="36" cy="33" r="4" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    title: 'Commercial Spaces',
    desc: 'Offices, showrooms, and retail spaces designed to impress clients and inspire teams. Brand-forward, functional, and built to last.',
    tags: ['Offices', 'Showrooms', 'Retail'],
  },
  {
    id: '05',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 38V18M38 38V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M6 18h36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M14 18V10h20v8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M18 38v-8h12v8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M6 38h36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Renovation & Makeovers',
    desc: 'Breathe new life into existing spaces. Whether a partial refresh or complete overhaul, we deliver transformation with minimal disruption.',
    tags: ['Full Renovation', 'Partial Refresh', 'Remodelling'],
  },
  {
    id: '06',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2"/>
        <path d="M24 16v8l6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 8l2 4M36 8l-2 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Design Consultation',
    desc: 'Not sure where to start? Our experts work with your budget and vision to create a roadmap — material selection, mood boards, and space planning.',
    tags: ['Mood Boards', 'Material Selection', 'Space Planning'],
  },
]

export default function Services() {
  const ref = useScrollAnimation()

  return (
    <section className="services" id="services" ref={ref}>
      <div className="services__inner">
        <div className="services__header fade-up">
          <p className="section-label">What We Do</p>
          <h2 className="services__title">
            Every Space Has a<br />
            <em>Story to Tell</em>
          </h2>
          <p className="services__subtitle">
            From a cozy home to a commanding office, we handle every inch
            with the same obsessive attention to detail.
          </p>
        </div>

        <div className="services__grid">
          {services.map((s, i) => (
            <div
              key={s.id}
              className={`service-card fade-up delay-${(i % 3) + 1}`}
            >
              <div className="service-card__num">{s.id}</div>
              <div className="service-card__icon">{s.icon}</div>
              <h3 className="service-card__title">{s.title}</h3>
              <p className="service-card__desc">{s.desc}</p>
              <div className="service-card__tags">
                {s.tags.map((t) => (
                  <span key={t} className="service-card__tag">{t}</span>
                ))}
              </div>
              <div className="service-card__arrow">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3.75 9h10.5M10.5 5.25L14.25 9l-3.75 3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

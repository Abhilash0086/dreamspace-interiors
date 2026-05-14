import { useScrollAnimation } from '../hooks/useScrollAnimation'
import './Process.css'

const steps = [
  {
    num: '01',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 4a12 12 0 100 24A12 12 0 0016 4z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M16 10v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 4.5l2 3M22 4.5l-2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Discovery Call',
    desc: 'We start with a free consultation to understand your space, lifestyle, budget, and vision — no jargon, just honest conversation.',
  },
  {
    num: '02',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 11h14M9 16h10M9 21h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="24" cy="21" r="4" fill="var(--orange)" fillOpacity="0.2" stroke="var(--orange)" strokeWidth="1.5"/>
        <path d="M22.5 21l1 1 2-2" stroke="var(--orange)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Concept & Design',
    desc: 'Our designers create mood boards, 3D layouts, and material palettes tailored to your taste. You review, refine, and approve every detail.',
  },
  {
    num: '03',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M6 26V14l10-8 10 8v12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M12 26V19h8v7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M4 14l12-9 12 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Execution',
    desc: 'Our skilled team handles procurement, installation, and on-site coordination. You get regular updates and zero surprises.',
  },
  {
    num: '04',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 4l3.1 6.3 6.9 1-5 4.9 1.18 6.8L16 19.9l-6.18 3.1 1.18-6.8-5-4.9 6.9-1L16 4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Handover & Beyond',
    desc: 'We do a final walkthrough together. Any touch-ups happen before handover. Our relationship doesn\'t end at delivery — we\'re here after too.',
  },
]

export default function Process() {
  const ref = useScrollAnimation()

  return (
    <section className="process" id="process" ref={ref}>
      <div className="process__inner">
        <div className="process__header fade-up">
          <p className="section-label">How It Works</p>
          <h2 className="process__title">
            From Idea to<br />
            <em>Stunning Reality</em>
          </h2>
          <p className="process__subtitle">
            A transparent, collaborative process from the first call to the final reveal.
          </p>
        </div>

        <div className="process__steps">
          {steps.map((s, i) => (
            <div key={s.num} className={`process-step fade-up delay-${i + 1}`}>
              <div className="process-step__left">
                <div className="process-step__num-wrap">
                  <span className="process-step__num">{s.num}</span>
                  <div className="process-step__icon">{s.icon}</div>
                </div>
                {i < steps.length - 1 && <div className="process-step__line" />}
              </div>
              <div className="process-step__content">
                <h3 className="process-step__title">{s.title}</h3>
                <p className="process-step__desc">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="process__cta-strip fade-up">
        <div className="process__cta-strip-inner">
          <div className="process__cta-text">
            <h3>Ready to reimagine your space?</h3>
            <p>Let's start with a free discovery call — no pressure, no commitment.</p>
          </div>
          <button
            className="process__cta-btn"
            onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Book a Free Consultation
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

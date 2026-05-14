import { useScrollAnimation } from '../hooks/useScrollAnimation'
import './About.css'

export default function About() {
  const ref = useScrollAnimation()

  return (
    <section className="about" id="about" ref={ref}>
      <div className="about__inner">
        <div className="about__visual fade-up">
          <div className="about__photo-frame">
            <div className="about__photo-art">
              <div className="about__photo-bg" />
              <div className="about__photo-silhouette" />
              <div className="about__photo-badge">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M11 2.5l2.3 4.7 5.2.76-3.75 3.65.89 5.15L11 14.27l-4.64 2.54.89-5.15L3.5 7.96l5.2-.76L11 2.5z" fill="var(--orange)"/>
                </svg>
                <div>
                  <strong>CPL Winner</strong>
                  <span>Badminton & Pickleball</span>
                </div>
              </div>
            </div>
            <div className="about__deco-ring" />
            <div className="about__deco-dot-grid">
              {Array.from({ length: 25 }).map((_, i) => (
                <span key={i} className="about__dot" />
              ))}
            </div>
          </div>

          <div className="about__legacy-card">
            <p className="about__legacy-label">Business Legacy</p>
            <p className="about__legacy-gen">2<sup>nd</sup> Gen</p>
            <p className="about__legacy-desc">Entrepreneur</p>
          </div>
        </div>

        <div className="about__content">
          <p className="section-label fade-up">About the Founder</p>

          <h2 className="about__title fade-up delay-1">
            Built on Legacy,<br />
            <em>Driven by Vision</em>
          </h2>

          <p className="about__body fade-up delay-2">
            Meet <strong>Aswin Kumar</strong> — the creative force behind Sandbox Interiors.
            A second-generation entrepreneur, Aswin grew up watching his family build and run
            a motor oil manufacturing business. That hands-on foundation gave him something
            most designers lack: a deep understanding of craftsmanship, quality materials,
            and what it takes to build something that lasts.
          </p>

          <p className="about__body fade-up delay-3">
            Outside the studio, Aswin is a competitive Badminton and Pickleball player —
            a CPL tournament winner whose precision on the court mirrors his precision in design.
            Every project he takes on carries the same energy: strategic, detail-obsessed, and
            driven to win.
          </p>

          <div className="about__values fade-up delay-4">
            <div className="about__value">
              <div className="about__value-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l2.4 4.9 5.4.78-3.9 3.8.92 5.37L12 14.27l-4.82 2.53.92-5.37L4.2 7.68l5.4-.78L12 2z" stroke="var(--orange)" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h4>Luxury Craftsmanship</h4>
                <p>Premium materials, zero shortcuts.</p>
              </div>
            </div>
            <div className="about__value">
              <div className="about__value-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="var(--orange)" strokeWidth="1.5"/>
                  <path d="M12 7v5l3 3" stroke="var(--orange)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h4>On-Time Delivery</h4>
                <p>Timelines respected, always.</p>
              </div>
            </div>
            <div className="about__value">
              <div className="about__value-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 21C7 17 3 13.6 3 9a6 6 0 0112 0 6 6 0 0112 0c0 4.6-4 8-9 12z" stroke="var(--orange)" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h4>Client-First Design</h4>
                <p>Your story, your space.</p>
              </div>
            </div>
          </div>

          <button
            className="about__cta fade-up delay-5"
            onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Let's Work Together
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import './Contact.css'

export default function Contact() {
  const ref = useScrollAnimation()
  const [form, setForm] = useState({ name: '', phone: '', email: '', service: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Interior Design Enquiry — ${form.name}`)
    const body = encodeURIComponent(
      `Hi Aswin,\n\nName: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\nService: ${form.service}\n\nMessage:\n${form.message}`
    )
    window.location.href = `mailto:sandboxinteriors@gmail.com?subject=${subject}&body=${body}`
    setSent(true)
  }

  return (
    <section className="contact" id="contact" ref={ref}>
      <div className="contact__inner">
        <div className="contact__info fade-up">
          <p className="section-label">Get in Touch</p>
          <h2 className="contact__title">
            Let's Start Your<br />
            <em>Dream Project</em>
          </h2>
          <p className="contact__subtitle">
            Reach out for a free consultation. We're based in Coimbatore
            and serve clients across Tamil Nadu.
          </p>

          <div className="contact__details">
            <a href="tel:+919876543210" className="contact-item">
              <div className="contact-item__icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3.5 4.5a1 1 0 011-1h2.4l1.2 3.3-1.4 1a10 10 0 005.5 5.5l1-1.4 3.3 1.2v2.4a1 1 0 01-1 1C7.3 16.5 3.5 12.7 3.5 4.5z" stroke="var(--orange)" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <span className="contact-item__label">Phone / WhatsApp</span>
                <span className="contact-item__value">+91 98765 43210</span>
              </div>
            </a>

            <a href="mailto:sandboxinteriors@gmail.com" className="contact-item">
              <div className="contact-item__icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="4" width="16" height="12" rx="2" stroke="var(--orange)" strokeWidth="1.5"/>
                  <path d="M2 7l8 5 8-5" stroke="var(--orange)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <span className="contact-item__label">Email</span>
                <span className="contact-item__value">sandboxinteriors@gmail.com</span>
              </div>
            </a>

            <div className="contact-item">
              <div className="contact-item__icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2a6 6 0 016 6c0 4-6 10-6 10S4 12 4 8a6 6 0 016-6z" stroke="var(--orange)" strokeWidth="1.5"/>
                  <circle cx="10" cy="8" r="2" stroke="var(--orange)" strokeWidth="1.5"/>
                </svg>
              </div>
              <div>
                <span className="contact-item__label">Studio Address</span>
                <span className="contact-item__value">29K, Krishnasamy Street,<br />Indira Nagar, Rathinapuri,<br />Coimbatore — 641027</span>
              </div>
            </div>

            <a href="https://www.instagram.com/sandboxinterior?igsh=MXBkMTQ1cnY2aGVqbg==" target="_blank" rel="noopener noreferrer" className="contact-item">
              <div className="contact-item__icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="2" width="16" height="16" rx="4" stroke="var(--orange)" strokeWidth="1.5"/>
                  <circle cx="10" cy="10" r="3.5" stroke="var(--orange)" strokeWidth="1.5"/>
                  <circle cx="14.5" cy="5.5" r="1" fill="var(--orange)"/>
                </svg>
              </div>
              <div>
                <span className="contact-item__label">Instagram</span>
                <span className="contact-item__value">@sandboxinterior</span>
              </div>
            </a>
          </div>
        </div>

        <div className="contact__form-wrap fade-up delay-2">
          {sent ? (
            <div className="contact__sent">
              <div className="contact__sent-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="18" stroke="var(--orange)" strokeWidth="2"/>
                  <path d="M12 20l5.5 5.5 10-11" stroke="var(--orange)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Message Sent!</h3>
              <p>Your email client has opened. We'll get back to you within 24 hours.</p>
              <button onClick={() => setSent(false)} className="contact__reset-btn">
                Send Another
              </button>
            </div>
          ) : (
            <form className="contact__form" onSubmit={handleSubmit}>
              <h3 className="contact__form-title">Free Consultation Request</h3>

              <div className="contact__form-row">
                <div className="contact__field">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Eg. Ramesh Kumar"
                    required
                  />
                </div>
                <div className="contact__field">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                </div>
              </div>

              <div className="contact__field">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
              </div>

              <div className="contact__field">
                <label>Service Interested In *</label>
                <select name="service" value={form.service} onChange={handleChange} required>
                  <option value="">Select a service...</option>
                  <option value="Residential Interiors">Residential Interiors</option>
                  <option value="Modular Kitchen">Modular Kitchen</option>
                  <option value="False Ceilings">False Ceilings</option>
                  <option value="Commercial Spaces">Commercial Spaces</option>
                  <option value="Renovation">Renovation & Makeover</option>
                  <option value="Design Consultation">Design Consultation</option>
                </select>
              </div>

              <div className="contact__field">
                <label>Tell us about your project</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Brief description of your space, requirements, budget range..."
                  rows={4}
                />
              </div>

              <button type="submit" className="contact__submit">
                Send Enquiry
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8h12M10 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

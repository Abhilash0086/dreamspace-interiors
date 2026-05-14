import { useEffect, useRef, useState } from 'react'
import './Hero.css'

const words = ['Spaces', 'Kitchens', 'Offices', 'Homes', 'Interiors']

export default function Hero() {
  const [wordIndex, setWordIndex] = useState(0)
  const [fading, setFading] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % words.length)
        setFading(false)
      }, 400)
    }, 2400)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let particles = []

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    class Particle {
      constructor() { this.reset() }
      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 1.5 + 0.3
        this.speedX = (Math.random() - 0.5) * 0.3
        this.speedY = -Math.random() * 0.4 - 0.1
        this.opacity = Math.random() * 0.4 + 0.1
      }
      update() {
        this.x += this.speedX
        this.y += this.speedY
        if (this.y < -5) this.reset()
      }
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(232,93,4,${this.opacity})`
        ctx.fill()
      }
    }

    resize()
    window.addEventListener('resize', resize)
    for (let i = 0; i < 60; i++) particles.push(new Particle())

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => { p.update(); p.draw() })
      raf = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const handleScroll = (href) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero" id="hero">
      <canvas ref={canvasRef} className="hero__canvas" />

      <div className="hero__bg-shape" />
      <div className="hero__bg-grid" />

      <div className="hero__inner">
        <div className="hero__content">
          <p className="hero__eyebrow">
            <span className="hero__eyebrow-dot" />
            Coimbatore's Premium Interior Studio
          </p>

          <h1 className="hero__headline">
            We Design
            <br />
            <span className="hero__word-wrap">
              <span className={`hero__word ${fading ? 'fading' : ''}`}>
                {words[wordIndex]}
              </span>
            </span>
            <br />
            <span className="hero__headline-sub">Worth Living In</span>
          </h1>

          <p className="hero__tagline">
            Luxury in every detail — from concept to completion,<br />
            we craft spaces that inspire and endure.
          </p>

          <div className="hero__actions">
            <button className="hero__btn-primary" onClick={() => handleScroll('#contact')}>
              Start Your Project
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="hero__btn-secondary" onClick={() => handleScroll('#services')}>
              Explore Services
            </button>
          </div>

          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-num">2<span className="hero__stat-plus">nd</span></span>
              <span className="hero__stat-label">Gen. Entrepreneur</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-num">4<span className="hero__stat-plus">+</span></span>
              <span className="hero__stat-label">Service Categories</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-num">100<span className="hero__stat-plus">%</span></span>
              <span className="hero__stat-label">Client-First Approach</span>
            </div>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__visual-card hero__visual-card--main">
            <div className="hero__visual-inner">
              <div className="hero__room-art">
                <div className="room-floor" />
                <div className="room-wall-left" />
                <div className="room-wall-back" />
                <div className="room-sofa" />
                <div className="room-table" />
                <div className="room-plant" />
                <div className="room-lamp" />
                <div className="room-art-piece" />
                <div className="room-rug" />
              </div>
              <div className="hero__visual-badge">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2l2.09 4.26L17 7.27l-3.5 3.41.83 4.83L10 13.27l-4.33 2.24.83-4.83L3 7.27l4.91-.01L10 2z" fill="var(--orange)"/>
                </svg>
                <span>Premium Design</span>
              </div>
            </div>
          </div>

          <div className="hero__visual-card hero__visual-card--accent">
            <p className="hero__visual-accent-text">"Luxury in Every Detail"</p>
          </div>

          <div className="hero__visual-card hero__visual-card--tag">
            <span className="hero__visual-tag-dot" />
            <span>Residential & Commercial</span>
          </div>
        </div>
      </div>

      <div className="hero__scroll-hint" onClick={() => handleScroll('#services')}>
        <span>Scroll</span>
        <div className="hero__scroll-line">
          <div className="hero__scroll-dot" />
        </div>
      </div>
    </section>
  )
}

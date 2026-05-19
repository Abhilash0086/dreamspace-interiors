import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getQuote } from './quoteStore'
import './summary.css'

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

export default function QuoteSummary() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quote, setQuote] = useState(null)

  useEffect(() => {
    getQuote(id).then((q) => {
      if (!q) navigate('/studio')
      else setQuote(q)
    })
  }, [id])

  if (!quote) return (
    <div className="summary">
      <div className="studio-loading"><div className="studio-spinner" /></div>
    </div>
  )

  const grandTotal  = quote.grandTotal || 0
  const copMin      = quote.cop?.total    || 0
  const copMax      = quote.cop?.totalMax ?? copMin
  const marginMin   = grandTotal > 0 ? ((grandTotal - copMax) / grandTotal * 100) : 0
  const marginMax   = grandTotal > 0 ? ((grandTotal - copMin) / grandTotal * 100) : 0
  const profitMin   = grandTotal - copMax
  const profitMax   = grandTotal - copMin
  const clientName = [quote.client?.salutation, quote.client?.name].filter(Boolean).join(' ') || 'Client'

  return (
    <div className="summary">
      {/* Header */}
      <header className="studio-header">
        <button className="studio-back" onClick={() => navigate('/studio')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="studio-header__title">
          <h1>{quote.id}</h1>
          <p>{clientName} · {fmtDate(quote.date)}</p>
        </div>
      </header>

      <div className="summary-body">
        <div className="summary-label">Quote saved successfully</div>

        {/* Two cards */}
        <div className="summary-cards">
          <div className="summary-card summary-card--quote">
            <div className="summary-card__icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="3" y="2" width="16" height="18" rx="2.5" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M7 7h8M7 11h8M7 15h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="summary-card__label">Quotation</div>
            <div className="summary-card__amount">{fmt(grandTotal)}</div>
            <div className="summary-card__sub">{quote.items?.length || 0} items</div>
          </div>

          <div className="summary-card summary-card--cop">
            <div className="summary-card__icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 2L3 7v13h16V7L11 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                <path d="M8 22V13h6v9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="summary-card__label">Cost of Production</div>
            <div className="summary-card__amount summary-card__amount--range">
              {copMin === copMax ? fmt(copMin) : <>{fmt(copMin)}<span className="summary-card__range-sep"> – </span>{fmt(copMax)}</>}
            </div>
            <div className="summary-card__sub">internal estimate</div>
          </div>
        </div>

        {/* Margin strip */}
        <div className="summary-margin">
          <div className="summary-margin__row">
            <span>Gross Profit</span>
            <strong>
              {profitMin === profitMax ? fmt(profitMin) : `${fmt(profitMin)} – ${fmt(profitMax)}`}
            </strong>
          </div>
          <div className="summary-margin__row">
            <span>Margin</span>
            <strong className={marginMax < 20 ? 'summary-margin__pct--low' : 'summary-margin__pct--ok'}>
              {marginMin === marginMax ? `${marginMax.toFixed(1)}%` : `${marginMin.toFixed(1)}% – ${marginMax.toFixed(1)}%`}
            </strong>
          </div>
        </div>

        {/* CTA */}
        <button className="summary-cta" onClick={() => navigate(`/studio/${id}`)}>
          View / Edit Quotation
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 8h8M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="summary-cta summary-cta--print" onClick={() => navigate(`/studio/${id}/print`)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 5V2h8v3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            <path d="M2 5h12v6H2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            <path d="M4 9h8v5H4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            <circle cx="12" cy="7.5" r="0.8" fill="currentColor"/>
          </svg>
          Preview &amp; Export PDF
        </button>
      </div>
    </div>
  )
}

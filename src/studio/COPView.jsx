import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadQuotes } from './quoteStore'
import './cop.css'

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

export default function COPView() {
  const navigate = useNavigate()
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadQuotes()
      .then((qs) => {
        setQuotes(qs.filter((q) => q.cop?.total > 0 || q.items?.length > 0))
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = quotes.filter((q) => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      q.id?.toLowerCase().includes(s) ||
      q.client?.name?.toLowerCase().includes(s)
    )
  })

  const totalCOPMin  = filtered.reduce((s, q) => s + (q.cop?.total    || 0), 0)
  const totalCOPMax  = filtered.reduce((s, q) => s + (q.cop?.totalMax ?? q.cop?.total ?? 0), 0)
  const totalQuote   = filtered.reduce((s, q) => s + (q.grandTotal || 0), 0)
  const overallMarginMin = totalQuote > 0 ? ((totalQuote - totalCOPMax) / totalQuote * 100) : 0
  const overallMarginMax = totalQuote > 0 ? ((totalQuote - totalCOPMin) / totalQuote * 100) : 0

  return (
    <div className="cop-view">
      <header className="studio-header">
        <button className="studio-back" onClick={() => navigate('/studio/masters')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="studio-header__title">
          <h1>Cost of Production</h1>
          <p>Internal document · {loading ? '…' : `${filtered.length} quote${filtered.length !== 1 ? 's' : ''}`}</p>
        </div>
      </header>

      {!loading && filtered.length > 0 && (
        <div className="cop-summary-strip">
          <div className="cop-summary-strip__item">
            <span>Total Quotations</span>
            <strong>{fmt(totalQuote)}</strong>
          </div>
          <div className="cop-summary-strip__item">
            <span>Total COP</span>
            <strong>
              {totalCOPMin === totalCOPMax ? fmt(totalCOPMin) : `${fmt(totalCOPMin)} – ${fmt(totalCOPMax)}`}
            </strong>
          </div>
          <div className="cop-summary-strip__item">
            <span>Margin Range</span>
            <strong className={overallMarginMax < 20 ? 'cop-margin--low' : 'cop-margin--ok'}>
              {overallMarginMin === overallMarginMax
                ? `${overallMarginMax.toFixed(1)}%`
                : `${overallMarginMin.toFixed(1)}–${overallMarginMax.toFixed(1)}%`}
            </strong>
          </div>
        </div>
      )}

      <div className="cop-search-wrap">
        <div className="studio-search">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            placeholder="Search by name or quote #"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="studio-loading"><div className="studio-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="studio-empty">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M24 8L8 18v24h32V18L24 8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M18 46V30h12v16" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          <p>No COP data yet</p>
          <button onClick={() => navigate('/studio')}>Go to Quotations</button>
        </div>
      ) : (
        <div className="cop-list">
          {filtered.map((q) => {
            const copMin   = q.cop?.total    || 0
            const copMax   = q.cop?.totalMax ?? copMin
            const grandTotal = q.grandTotal || 0
            const marginMin  = grandTotal > 0 ? ((grandTotal - copMax) / grandTotal * 100) : 0
            const marginMax  = grandTotal > 0 ? ((grandTotal - copMin) / grandTotal * 100) : 0
            const profitMin  = grandTotal - copMax
            const profitMax  = grandTotal - copMin
            const clientName = [q.client?.salutation, q.client?.name].filter(Boolean).join(' ') || 'Unnamed Client'
            const isOpen = expanded === q.id

            return (
              <div key={q.id} className={`cop-card ${isOpen ? 'cop-card--open' : ''}`}>
                <div className="cop-card__header" onClick={() => setExpanded(isOpen ? null : q.id)}>
                  <div className="cop-card__info">
                    <span className="cop-card__id">{q.id}</span>
                    <span className="cop-card__client">{clientName}</span>
                    <span className="cop-card__date">{fmtDate(q.date)}</span>
                  </div>
                  <div className="cop-card__numbers">
                    <div className="cop-card__margin-badge" data-low={marginMax < 20}>
                      {marginMin === marginMax ? `${marginMax.toFixed(1)}%` : `${marginMin.toFixed(1)}–${marginMax.toFixed(1)}%`}
                    </div>
                    <div className="cop-card__totals">
                      <span className="cop-card__quote-val">{fmt(grandTotal)}</span>
                      <span className="cop-card__cop-val">
                        COP {copMin === copMax ? fmt(copMin) : `${fmt(copMin)} – ${fmt(copMax)}`}
                      </span>
                    </div>
                  </div>
                  <svg className="cop-card__chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {isOpen && (
                  <div className="cop-card__body">
                    <div className="cop-card__profit-row">
                      <span>Gross Profit</span>
                      <strong>
                        {profitMin === profitMax ? fmt(profitMin) : `${fmt(profitMin)} – ${fmt(profitMax)}`}
                      </strong>
                    </div>

                    {q.cop?.items?.length > 0 && (
                      <div className="cop-items-table-wrap">
                      <table className="cop-items-table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Category</th>
                            <th>Brand</th>
                            <th>Area / Qty</th>
                            <th>COP Rate (₹)</th>
                            <th>COP Amt</th>
                          </tr>
                        </thead>
                        <tbody>
                          {q.items?.map((item) => {
                            const copItem = q.cop.items.find((ci) => ci.id === item.id)
                            if (!copItem || copItem.copAmount === 0) return null
                            return (
                              <tr key={item.id}>
                                <td>
                                  <span className="cop-items-table__item">{item.itemType}</span>
                                  {item.room && <span className="cop-items-table__room">{item.room}</span>}
                                </td>
                                <td>{item.category || '—'}</td>
                                <td>{item.brand || '—'}</td>
                                <td>{item.area > 0 ? `${item.area} sqft` : item.qty}</td>
                                <td>
                                  {copItem.copRate === copItem.copRateMax
                                    ? copItem.copRate
                                    : `${copItem.copRate}–${copItem.copRateMax}`}
                                </td>
                                <td className="cop-items-table__amt">
                                  {copItem.copAmount === copItem.copAmountMax
                                    ? fmt(copItem.copAmount)
                                    : `${fmt(copItem.copAmount)} – ${fmt(copItem.copAmountMax)}`}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="5" className="cop-items-table__total-label">Total COP</td>
                            <td className="cop-items-table__total-amt">{fmt(copTotal)}</td>
                          </tr>
                        </tfoot>
                      </table>
                      </div>
                    )}

                    <div className="cop-card__actions">
                      <button onClick={() => navigate(`/studio/${q.id}/summary`)}>
                        View Summary
                      </button>
                      <button onClick={() => navigate(`/studio/${q.id}`)}>
                        Open Quote
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

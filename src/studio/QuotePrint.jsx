import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getQuote, STATUS_META, upsertQuote } from './quoteStore'
import './print.css'

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'

export default function QuotePrint() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quote, setQuote] = useState(null)

  useEffect(() => {
    getQuote(id).then((q) => {
      if (!q) navigate('/studio')
      else setQuote(q)
    })
  }, [id])

  const handleWhatsApp = () => {
    if (!quote) return
    const msg = `Hello ${quote.client?.name || ''},\n\nPlease find your interior design quotation from *Sandbox Interiors*.\n\n*Quote #:* ${quote.id}\n*Date:* ${fmtDate(quote.date)}\n*Valid Until:* ${fmtDate(quote.validUntil)}\n*Grand Total:* ${fmt(quote.grandTotal)}\n\nThank you for choosing Sandbox Interiors.\nFor any queries, call us at +91 98765 43210.`
    const phone = quote.client?.phone?.replace(/\D/g, '') || ''
    const url = phone
      ? `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  const handleMarkSent = async () => {
    const updated = { ...quote, status: 'sent' }
    await upsertQuote(updated)
    setQuote(updated)
  }

  if (!quote) return null

  const sm = STATUS_META[quote.status] || STATUS_META.draft
  const comments = quote.comments || []

  return (
    <>
      {/* ── Toolbar (screen only) ── */}
      <div className="print-toolbar no-print">
        <button className="print-back" onClick={() => navigate('/studio')}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 3.5L5.5 9 11 14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <div className="print-toolbar__actions">
          <button className="print-tool-btn print-tool-btn--edit" onClick={() => navigate(`/studio/${id}`)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M11 2l3 3-8 8H3v-3L11 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
            Edit
          </button>
          {quote.status === 'draft' && (
            <button className="print-tool-btn print-tool-btn--sent" onClick={handleMarkSent}>
              Mark Sent
            </button>
          )}
          <button className="print-tool-btn print-tool-btn--whatsapp" onClick={handleWhatsApp}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 2.5A6.9 6.9 0 002.3 11.2L1.5 14.5l3.4-.8A6.9 6.9 0 1013.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M6 6.2c.1.5.5 1.5 1.3 2.3.8.8 1.8 1.2 2.3 1.3.3 0 .6-.1.8-.3l.4-.5c.1-.2 0-.4-.1-.5L9.9 8c-.1-.1-.3-.1-.5 0l-.4.3c-.5-.2-.9-.6-1.2-1.1l.3-.4c.1-.2.1-.4 0-.5L7.3 5.5c-.1-.1-.3-.2-.5-.1l-.5.4C6.1 5.9 6 6.1 6 6.2z" fill="currentColor"/>
            </svg>
            WhatsApp
          </button>
          <button className="print-tool-btn print-tool-btn--print" onClick={() => window.print()}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 5V2h8v3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M2 5h12v6H2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M4 9h8v5H4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <circle cx="12" cy="7.5" r="0.8" fill="currentColor"/>
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* ── Printable Quote ── */}
      <div className="quote-doc">

        {/* Header */}
        <div className="qdoc-header">
          <div className="qdoc-header__brand">
            <img src="/logo.png" alt="Sandbox Interiors" className="qdoc-logo" />
            <div className="qdoc-header__tagline">Luxury in Every Detail</div>
          </div>
          <div className="qdoc-header__meta">
            <h1 className="qdoc-title">QUOTATION</h1>
            <table className="qdoc-meta-table">
              <tbody>
                <tr><td>Quote #</td><td><strong>{quote.id}</strong></td></tr>
                <tr><td>Date</td><td>{fmtDate(quote.date)}</td></tr>
                <tr><td>Valid Until</td><td>{fmtDate(quote.validUntil)}</td></tr>
                {quote.createdBy && <tr><td>Prepared by</td><td>{quote.createdBy}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orange rule */}
        <div className="qdoc-rule" />

        {/* From / To */}
        <div className="qdoc-parties">
          <div className="qdoc-party">
            <div className="qdoc-party__label">FROM</div>
            <div className="qdoc-party__name">Sandbox Interiors</div>
            <div className="qdoc-party__detail">Aswin Kumar (Founder)</div>
            <div className="qdoc-party__detail">29K, Krishnasamy Street, Indira Nagar</div>
            <div className="qdoc-party__detail">Rathinapuri, Coimbatore — 641027</div>
            <div className="qdoc-party__detail">+91 98765 43210 | sandboxinteriors@gmail.com</div>
          </div>
          <div className="qdoc-party qdoc-party--to">
            <div className="qdoc-party__label">TO</div>
            <div className="qdoc-party__name">{quote.client?.name || '—'}</div>
            {quote.client?.phone && <div className="qdoc-party__detail">{quote.client.phone}</div>}
            {quote.client?.address && (
              <div className="qdoc-party__detail" style={{ whiteSpace: 'pre-line' }}>
                {quote.client.address}
              </div>
            )}
            {quote.client?.projectType && (
              <div className="qdoc-party__tag">{quote.client.projectType}</div>
            )}
          </div>
        </div>

        {/* Items table — grouped by room */}
        {(() => {
          const items = quote.items
          if (items.length === 0) return (
            <table className="qdoc-table">
              <thead><tr>
                <th className="qdoc-th--num">#</th>
                <th className="qdoc-th--item">Item</th>
                <th className="qdoc-th--size">Size</th>
                <th className="qdoc-th--qty">Qty</th>
                <th className="qdoc-th--area">Area (sqft)</th>
                <th className="qdoc-th--rate">Rate (₹)</th>
                <th className="qdoc-th--amt">Total (₹)</th>
              </tr></thead>
              <tbody><tr><td colSpan={7} className="qdoc-empty-row">No items added</td></tr></tbody>
            </table>
          )

          const roomOrder = []
          const grouped = {}
          items.forEach((item) => {
            const room = item.room?.trim() || 'General'
            if (!grouped[room]) { grouped[room] = []; roomOrder.push(room) }
            grouped[room].push(item)
          })

          const multipleRooms = roomOrder.length > 1 || (roomOrder.length === 1 && roomOrder[0] !== 'General')
          let globalIdx = 0

          return (
            <table className="qdoc-table">
              <thead><tr>
                <th className="qdoc-th--num">#</th>
                <th className="qdoc-th--item">Item</th>
                <th className="qdoc-th--size">Size</th>
                <th className="qdoc-th--qty">Qty</th>
                <th className="qdoc-th--area">Area (sqft)</th>
                <th className="qdoc-th--rate">Rate (₹)</th>
                <th className="qdoc-th--amt">Total (₹)</th>
              </tr></thead>
              <tbody>
                {roomOrder.map((room) => {
                  const roomItems = grouped[room]
                  const roomTotal = roomItems.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
                  return (
                    <React.Fragment key={room}>
                      {multipleRooms && (
                        <tr key={`hdr-${room}`} className="qdoc-tr--room-header">
                          <td colSpan={7} className="qdoc-td--room-header">
                            <span className="qdoc-room-label">
                              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                                <path d="M5.5 1L1 4.2V10h3V7h3v3h3V4.2L5.5 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                              </svg>
                              {room}
                            </span>
                          </td>
                        </tr>
                      )}
                      {roomItems.map((item) => {
                        globalIdx++
                        const n = globalIdx
                        const isMisc = item.itemType === 'Miscellaneous'
                        return (
                          <tr key={item.id} className={n % 2 === 0 ? 'qdoc-tr--even' : ''}>
                            <td className="qdoc-td--num">{n}</td>
                            <td className="qdoc-td--item">{item.itemType || '—'}</td>
                            {isMisc ? (
                              <>
                                <td className="qdoc-td--size" colSpan={4} style={{ color: '#9A9A9A', fontStyle: 'italic' }}>
                                  Lump sum
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="qdoc-td--size">{item.size || '—'}</td>
                                <td className="qdoc-td--qty">{item.qty || '—'}</td>
                                <td className="qdoc-td--area">{item.area > 0 ? item.area : '—'}</td>
                                <td className="qdoc-td--rate">{item.rate ? fmt(item.rate) : '—'}</td>
                              </>
                            )}
                            <td className="qdoc-td--amt">{fmt(item.amount)}</td>
                          </tr>
                        )
                      })}
                      {multipleRooms && (
                        <tr key={`sub-${room}`} className="qdoc-tr--room-subtotal">
                          <td colSpan={6} className="qdoc-td--room-subtotal-label">
                            {room} subtotal
                          </td>
                          <td className="qdoc-td--room-subtotal-amt">{fmt(roomTotal)}</td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          )
        })()}

        {/* Totals */}
        <div className="qdoc-totals">
          <div className="qdoc-totals__spacer" />
          <div className="qdoc-totals__box">
            <div className="qdoc-total-row">
              <span>Subtotal</span>
              <span>{fmt(quote.subtotal)}</span>
            </div>
            {quote.discountAmt > 0 && (
              <div className="qdoc-total-row qdoc-total-row--discount">
                <span>Discount ({quote.discountPct}%)</span>
                <span>− {fmt(quote.discountAmt)}</span>
              </div>
            )}
            {quote.taxAmt > 0 && (
              <div className="qdoc-total-row">
                <span>GST ({quote.taxRate}%)</span>
                <span>{fmt(quote.taxAmt)}</span>
              </div>
            )}
            <div className="qdoc-total-row qdoc-total-row--grand">
              <span>GRAND TOTAL</span>
              <span>{fmt(quote.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Comments / Material Notes */}
        {comments.length > 0 && (
          <div className="qdoc-comments">
            <div className="qdoc-comments__label">Notes</div>
            <ul className="qdoc-comments__list">
              {comments.filter(c => c.trim()).map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Bank details */}
        {quote.bankDetails && (
          <div className="qdoc-bank">
            <div className="qdoc-bank__label">Payment Details</div>
            <div className="qdoc-bank__content" style={{ whiteSpace: 'pre-line' }}>{quote.bankDetails}</div>
          </div>
        )}

        {/* Terms */}
        {quote.terms && (
          <div className="qdoc-terms">
            <div className="qdoc-terms__label">Terms & Conditions</div>
            <div className="qdoc-terms__content" style={{ whiteSpace: 'pre-line' }}>{quote.terms}</div>
          </div>
        )}

        {/* Signature */}
        <div className="qdoc-signature">
          <div className="qdoc-signature__block">
            <div className="qdoc-signature__line" />
            <div className="qdoc-signature__name">Authorized Signature</div>
            <div className="qdoc-signature__co">Sandbox Interiors</div>
          </div>
          <div className="qdoc-signature__block qdoc-signature__block--client">
            <div className="qdoc-signature__line" />
            <div className="qdoc-signature__name">Client Signature</div>
            <div className="qdoc-signature__co">{quote.client?.name || ''}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="qdoc-footer">
          <span>Sandbox Interiors · sandboxinteriors@gmail.com · +91 98765 43210</span>
          <span>@sandboxinterior</span>
        </div>
      </div>
    </>
  )
}

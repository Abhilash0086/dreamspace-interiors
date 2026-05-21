import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getQuote, STATUS_META, upsertQuote } from './quoteStore'
import { loadSettings, SETTING_DEFAULTS } from './settingsStore'
import './print.css'

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'

export default function QuotePrint() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quote, setQuote] = useState(null)
  const [company, setCompany] = useState(SETTING_DEFAULTS.company)
  const [sharing, setSharing] = useState(false)
  const [wpSheet, setWpSheet] = useState(false)
  const docRef = useRef(null)

  useEffect(() => {
    Promise.all([
      getQuote(id),
      loadSettings().catch(() => ({})),
    ]).then(([q, s]) => {
      if (!q) navigate('/studio')
      else setQuote(q)
      if (s.company) setCompany(s.company)
    })
  }, [id])

  useEffect(() => {
    if (!quote) return
    const salutation = quote.client?.salutation ? quote.client.salutation.replace('.', '') + '_' : ''
    const clientName = (quote.client?.name || 'Client').replace(/\s+/g, '_')
    document.title = `${salutation}${clientName}_Quotation`
    return () => { document.title = 'Dreamspace Interiors' }
  }, [quote])

  const pdfOptions = () => {
    const salutation = quote.client?.salutation ? quote.client.salutation.replace('.', '') + '_' : ''
    const clientName = (quote.client?.name || 'Client').replace(/\s+/g, '_')
    const filename = `${salutation}${clientName}_${quote.id}_Quotation.pdf`
    return {
      opts: {
        margin: 0,
        filename,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      },
      filename,
    }
  }

  const handleWhatsApp = async () => {
    if (!quote || sharing) return
    setSharing(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const { opts, filename } = pdfOptions()
      await html2pdf().set(opts).from(docRef.current).save()
      setWpSheet(true)
    } finally {
      setSharing(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!quote || sharing) return
    setSharing(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const { opts } = pdfOptions()
      await html2pdf().set(opts).from(docRef.current).save()
    } finally {
      setSharing(false)
    }
  }

  const handleEmail = () => {
    if (!quote) return
    const subject = encodeURIComponent(`Quotation ${quote.id} — Dreamspace Interiors`)
    const body = encodeURIComponent(`Dear ${quote.client?.name || ''},\n\nPlease find attached your interior design quotation from ${company.name}.\n\nQuote #: ${quote.id}\nDate: ${fmtDate(quote.date)}\nValid Until: ${fmtDate(quote.validUntil)}\nGrand Total: ${fmt(quote.grandTotal)}\n\nThank you for choosing ${company.name}.`)
    window.location.href = `mailto:${quote.client.email}?subject=${subject}&body=${body}`
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
          {quote.client?.phone && (
            <button className="print-tool-btn print-tool-btn--whatsapp" onClick={handleWhatsApp} disabled={sharing}>
              {sharing ? (
                <div className="studio-spinner" style={{ width: 14, height: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 2.5A6.9 6.9 0 002.3 11.2L1.5 14.5l3.4-.8A6.9 6.9 0 1013.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  <path d="M6 6.2c.1.5.5 1.5 1.3 2.3.8.8 1.8 1.2 2.3 1.3.3 0 .6-.1.8-.3l.4-.5c.1-.2 0-.4-.1-.5L9.9 8c-.1-.1-.3-.1-.5 0l-.4.3c-.5-.2-.9-.6-1.2-1.1l.3-.4c.1-.2.1-.4 0-.5L7.3 5.5c-.1-.1-.3-.2-.5-.1l-.5.4C6.1 5.9 6 6.1 6 6.2z" fill="currentColor"/>
                </svg>
              )}
              {sharing ? 'Preparing…' : 'WhatsApp'}
            </button>
          )}
          {quote.client?.email && (
            <button className="print-tool-btn print-tool-btn--email" onClick={handleEmail}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M1.5 5l6.5 4.5L14.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
              Email
            </button>
          )}
          <button className="print-tool-btn print-tool-btn--print" onClick={handleDownloadPdf} disabled={sharing}>
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

      {/* ── WhatsApp instruction sheet ── */}
      {wpSheet && (() => {
        const phone = quote.client?.phone?.replace(/\D/g, '') || ''
        const clientName = [quote.client?.salutation, quote.client?.name].filter(Boolean).join(' ') || 'Client'
        const msg = `Hello ${quote.client?.name || ''},\n\nPlease find attached your interior design quotation from *${company.name}*.\n\n*Quote #:* ${quote.id}\n*Date:* ${fmtDate(quote.date)}\n*Valid Until:* ${fmtDate(quote.validUntil)}\n*Grand Total:* ${fmt(quote.grandTotal)}\n\nThank you for choosing ${company.name}.`
        const waUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`
        return (
          <div className="wp-overlay" onClick={() => setWpSheet(false)}>
            <div className="wp-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="wp-sheet__title">Send via WhatsApp</div>

              <div className="wp-sheet__steps">
                <div className="wp-sheet__step wp-sheet__step--done">
                  <div className="wp-sheet__step-num">✓</div>
                  <div className="wp-sheet__step-body">
                    <strong>PDF saved to your device</strong>
                    <span>Check your Downloads folder</span>
                  </div>
                </div>
                <div className="wp-sheet__connector" />
                <div className="wp-sheet__step">
                  <div className="wp-sheet__step-num">2</div>
                  <div className="wp-sheet__step-body">
                    <strong>Open the chat below</strong>
                    <span>Tap <b>📎</b> → <b>Document</b> → select the PDF</span>
                  </div>
                </div>
              </div>

              <a
                className="wp-sheet__open-btn"
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setWpSheet(false)}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M15.5 2.5A7.9 7.9 0 002.3 12.2L1.5 16.5l4.4-.9A7.9 7.9 0 1015.5 2.5z" fill="#25D366"/>
                  <path d="M7 7.2c.1.5.5 1.5 1.3 2.3.8.8 1.8 1.2 2.3 1.3.3 0 .6-.1.8-.3l.4-.5c.1-.2 0-.4-.1-.5L10.9 9c-.1-.1-.3-.1-.5 0l-.4.3c-.5-.2-.9-.6-1.2-1.1l.3-.4c.1-.2.1-.4 0-.5L8.3 6.5c-.1-.1-.3-.2-.5-.1l-.5.4C7.1 6.9 7 7.1 7 7.2z" fill="white"/>
                </svg>
                Open WhatsApp chat with {clientName}
              </a>

              <button className="wp-sheet__dismiss" onClick={() => setWpSheet(false)}>Dismiss</button>
            </div>
          </div>
        )
      })()}

      {/* ── Printable Quote ── */}
      <div className="quote-doc" ref={docRef}>

        {/* Header */}
        <div className="qdoc-header">
          <div className="qdoc-header__brand">
            <div className="qdoc-header__company">{company.name}</div>
            <div className="qdoc-header__tagline">{company.tagline}</div>
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
            <div className="qdoc-party__name">{company.name}</div>
          </div>
          <div className="qdoc-party qdoc-party--to">
            <div className="qdoc-party__label">TO</div>
            <div className="qdoc-party__name">
              {[quote.client?.salutation, quote.client?.name].filter(Boolean).join(' ') || '—'}
            </div>
            {quote.client?.phone && <div className="qdoc-party__detail">{quote.client.phone}</div>}
            {quote.client?.email && <div className="qdoc-party__detail">{quote.client.email}</div>}
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
            <div className="qdoc-table-wrap">
              <table className="qdoc-table">
                <thead><tr>
                  <th className="qdoc-th--num">#</th>
                  <th className="qdoc-th--item">Item</th>
                  <th className="qdoc-th--cat">Category</th>
                  <th className="qdoc-th--brand">Brand</th>
                  <th className="qdoc-th--size">Size</th>
                  <th className="qdoc-th--qty">Qty</th>
                  <th className="qdoc-th--area">Area (sqft)</th>
                  <th className="qdoc-th--rate">Rate (₹)</th>
                  <th className="qdoc-th--amt">Total (₹)</th>
                </tr></thead>
                <tbody><tr><td colSpan={9} className="qdoc-empty-row">No items added</td></tr></tbody>
              </table>
            </div>
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
            <div className="qdoc-table-wrap">
            <table className="qdoc-table">
              <thead><tr>
                <th className="qdoc-th--num">#</th>
                <th className="qdoc-th--item">Item</th>
                <th className="qdoc-th--cat">Category</th>
                <th className="qdoc-th--brand">Brand</th>
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
                          <td colSpan={9} className="qdoc-td--room-header">
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
                                <td className="qdoc-td--size" colSpan={6} style={{ color: '#9A9A9A', fontStyle: 'italic' }}>
                                  Lump sum
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="qdoc-td--cat">{item.category || '—'}</td>
                                <td className="qdoc-td--brand">{item.brand || '—'}</td>
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
                          <td colSpan={8} className="qdoc-td--room-subtotal-label">
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
            </div>
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
            <div className="qdoc-signature__co">{company.name}</div>
          </div>
          <div className="qdoc-signature__block qdoc-signature__block--client">
            <div className="qdoc-signature__line" />
            <div className="qdoc-signature__name">Client Signature</div>
            <div className="qdoc-signature__co">{[quote.client?.salutation, quote.client?.name].filter(Boolean).join(' ')}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="qdoc-footer">
          <span>{company.name}</span>
          <span>{company.social}</span>
        </div>
      </div>
    </>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  newBlankQuote, getQuote, upsertQuote, calcTotals, parseArea,
  PROJECT_TYPES, ITEM_TYPES, ROOM_TYPES
} from './quoteStore'
import './studio.css'

const uid = () => Math.random().toString(36).slice(2, 9)
const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })

function ItemRow({ item, onChange, onDelete }) {
  const isMisc = item.itemType === 'Miscellaneous'

  const update = (field, val) => {
    const updated = { ...item, [field]: val }

    if (isMisc || (field === 'itemType' && val === 'Miscellaneous')) {
      onChange(updated)
      return
    }

    const newSize = field === 'size' ? val : updated.size
    const newQty  = field === 'qty'  ? val : updated.qty
    const newRate = field === 'rate' ? val : updated.rate

    const area = parseArea(newSize, newQty)
    updated.area = area
    updated.amount = area > 0
      ? +(area * (parseFloat(newRate) || 0)).toFixed(2)
      : +((parseFloat(newQty) || 0) * (parseFloat(newRate) || 0)).toFixed(2)

    onChange(updated)
  }

  return (
    <div className={`item-row${isMisc ? ' item-row--misc' : ''}`}>
      <div className="item-row__room-row">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="item-row__room-icon">
          <path d="M6.5 1.5L1 5v7h4V8.5h3V12h4V5L6.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        </svg>
        <select
          className="item-row__room"
          value={item.room || ''}
          onChange={(e) => update('room', e.target.value)}
        >
          <option value="">Room / Area</option>
          {ROOM_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button className="item-row__delete" onClick={onDelete} type="button" aria-label="Delete item">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 4h9M5 4V2.5h4V4M5 7v3.5M9 7v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M3.5 4l.6 7h5.8l.6-7" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="item-row__type-row">
        <select
          className={`item-row__item-type ${!item.itemType ? 'placeholder' : ''}`}
          value={item.itemType || ''}
          onChange={(e) => update('itemType', e.target.value)}
        >
          <option value="">— Select item —</option>
          {ITEM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          <option value="Miscellaneous">Miscellaneous (lump sum)</option>
        </select>
      </div>

      {isMisc ? (
        <div className="item-row__misc-fields">
          <div className="item-row__field item-row__field--amount">
            <label>Lump Sum Amount (₹)</label>
            <input
              type="number" inputMode="decimal" min="0"
              value={item.amount || ''} placeholder="0"
              onChange={(e) => update('amount', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      ) : (
        <div className="item-row__fields">
          <div className="item-row__field item-row__field--size">
            <label>Size</label>
            <input
              type="text" inputMode="text"
              value={item.size || ''} placeholder='e.g. 12×8'
              onChange={(e) => update('size', e.target.value)}
            />
          </div>
          <div className="item-row__field item-row__field--qty">
            <label>Qty</label>
            <input
              type="number" inputMode="decimal" min="0"
              value={item.qty || ''} placeholder="1"
              onChange={(e) => update('qty', e.target.value)}
            />
          </div>
          <div className="item-row__field item-row__field--area">
            <label>Area (sqft)</label>
            <span className="item-row__area-display">
              {item.area > 0 ? item.area : '—'}
            </span>
          </div>
          <div className="item-row__field item-row__field--rate">
            <label>Rate (₹/sqft)</label>
            <input
              type="number" inputMode="decimal" min="0"
              value={item.rate || ''} placeholder="0"
              onChange={(e) => update('rate', e.target.value)}
            />
          </div>
          <div className="item-row__field item-row__field--amount item-row__field--readonly">
            <label>Total</label>
            <span className="item-row__amount">{fmt(item.amount)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function QuoteForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const [quote, setQuote] = useState(null)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('client')

  useEffect(() => {
    const init = async () => {
      if (isNew) {
        setQuote(await newBlankQuote())
      } else {
        const existing = await getQuote(id)
        if (!existing) navigate('/studio')
        else setQuote(existing)
      }
    }
    init()
  }, [id])

  const set = useCallback((path, val) => {
    setQuote((q) => {
      const updated = { ...q }
      if (path.startsWith('client.')) {
        updated.client = { ...q.client, [path.split('.')[1]]: val }
      } else {
        updated[path] = val
      }
      if (['discountPct', 'taxRate'].includes(path)) {
        Object.assign(updated, calcTotals(updated.items, updated.discountPct, updated.taxRate))
      }
      return updated
    })
  }, [])

  const addItem = () => {
    setQuote((q) => {
      const items = [...q.items, { id: uid(), room: '', itemType: '', size: '', qty: '', area: 0, rate: '', amount: 0 }]
      return { ...q, items, ...calcTotals(items, q.discountPct, q.taxRate) }
    })
  }

  const updateItem = (idx, updated) => {
    setQuote((q) => {
      const items = q.items.map((it, i) => i === idx ? updated : it)
      return { ...q, items, ...calcTotals(items, q.discountPct, q.taxRate) }
    })
  }

  const deleteItem = (idx) => {
    setQuote((q) => {
      const items = q.items.filter((_, i) => i !== idx)
      return { ...q, items, ...calcTotals(items, q.discountPct, q.taxRate) }
    })
  }

  const updateComment = (idx, val) => {
    setQuote((q) => ({ ...q, comments: q.comments.map((c, i) => i === idx ? val : c) }))
  }

  const addComment = () => {
    setQuote((q) => ({ ...q, comments: [...q.comments, ''] }))
  }

  const deleteComment = (idx) => {
    setQuote((q) => ({ ...q, comments: q.comments.filter((_, i) => i !== idx) }))
  }

  const handleSave = async (status) => {
    setSaving(true)
    try {
      const toSave = { ...quote, status: status || quote.status }
      await upsertQuote(toSave)
      navigate('/studio')
    } finally {
      setSaving(false)
    }
  }

  if (!quote) return <div className="studio studio--loading"><div className="studio-spinner" /></div>

  const sections = ['client', 'items', 'totals', 'terms']
  const sectionLabels = { client: 'Client', items: 'Items', totals: 'Totals', terms: 'Terms' }

  return (
    <div className="studio studio--form">
      <header className="studio-header">
        <button className="studio-back" onClick={() => navigate('/studio')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="studio-header__title">
          <h1>{isNew ? 'New Quotation' : `Edit ${quote.id}`}</h1>
          <p>{fmt(quote.grandTotal)}</p>
        </div>
        <button className="studio-save-btn" onClick={() => handleSave()} disabled={saving}>
          {saving ? '…' : 'Save'}
        </button>
      </header>

      <div className="studio-tabs">
        {sections.map((s) => (
          <button
            key={s}
            className={`studio-tab ${activeSection === s ? 'active' : ''}`}
            onClick={() => setActiveSection(s)}
          >
            {sectionLabels[s]}
          </button>
        ))}
      </div>

      <div className="studio-form-body">

        {activeSection === 'client' && (
          <div className="studio-section">
            <div className="form-row">
              <div className="form-field">
                <label>Quote #</label>
                <input value={quote.id} disabled className="input--muted" />
              </div>
              <div className="form-field">
                <label>Created By</label>
                <input placeholder="Your name" value={quote.createdBy} onChange={(e) => set('createdBy', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Quote Date</label>
                <input type="date" value={quote.date} onChange={(e) => set('date', e.target.value)} />
              </div>
              <div className="form-field">
                <label>Valid Until</label>
                <input type="date" value={quote.validUntil} onChange={(e) => set('validUntil', e.target.value)} />
              </div>
            </div>
            <div className="form-divider">Client Information</div>
            <div className="form-field">
              <label>Client Name *</label>
              <input placeholder="e.g. Rajkamal's Home" value={quote.client.name} onChange={(e) => set('client.name', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Phone</label>
                <input type="tel" inputMode="tel" placeholder="+91 XXXXX XXXXX" value={quote.client.phone} onChange={(e) => set('client.phone', e.target.value)} />
              </div>
              <div className="form-field">
                <label>Project Type</label>
                <select value={quote.client.projectType} onChange={(e) => set('client.projectType', e.target.value)}>
                  {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-field">
              <label>Project Address</label>
              <textarea rows={3} placeholder="Full address of the project site" value={quote.client.address} onChange={(e) => set('client.address', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Status</label>
              <select value={quote.status} onChange={(e) => set('status', e.target.value)}>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <button className="section-next-btn" onClick={() => setActiveSection('items')}>Next: Add Line Items →</button>
          </div>
        )}

        {activeSection === 'items' && (
          <div className="studio-section">
            {quote.items.length === 0 && (
              <div className="items-empty"><p>No items yet. Tap below to add.</p></div>
            )}
            {quote.items.map((item, idx) => (
              <ItemRow key={item.id} item={item} onChange={(u) => updateItem(idx, u)} onDelete={() => deleteItem(idx)} />
            ))}
            <button className="add-item-btn" onClick={addItem} type="button">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add Item
            </button>
            {quote.items.length > 0 && (
              <div className="items-subtotal">Subtotal: <strong>{fmt(quote.subtotal)}</strong></div>
            )}
            <button className="section-next-btn" onClick={() => setActiveSection('totals')}>Next: Totals & Tax →</button>
          </div>
        )}

        {activeSection === 'totals' && (
          <div className="studio-section">
            <div className="totals-card">
              <div className="totals-row">
                <span>Subtotal</span>
                <strong>{fmt(quote.subtotal)}</strong>
              </div>
              <div className="totals-row totals-row--input">
                <label>Discount (%)</label>
                <input type="number" inputMode="decimal" min="0" max="100" value={quote.discountPct} onChange={(e) => set('discountPct', e.target.value)} />
              </div>
              {quote.discountAmt > 0 && (
                <div className="totals-row totals-row--discount">
                  <span>Discount</span><span>− {fmt(quote.discountAmt)}</span>
                </div>
              )}
              <div className="totals-row totals-row--input">
                <label>GST (%)</label>
                <input type="number" inputMode="decimal" min="0" max="28" value={quote.taxRate} onChange={(e) => set('taxRate', e.target.value)} />
              </div>
              {quote.taxAmt > 0 && (
                <div className="totals-row">
                  <span>GST ({quote.taxRate}%)</span><span>{fmt(quote.taxAmt)}</span>
                </div>
              )}
              <div className="totals-row totals-row--grand">
                <span>Grand Total</span><strong>{fmt(quote.grandTotal)}</strong>
              </div>
            </div>
            <div className="form-field" style={{ marginTop: 20 }}>
              <label>Bank Details (for payment)</label>
              <textarea rows={4} value={quote.bankDetails} onChange={(e) => set('bankDetails', e.target.value)} />
            </div>
            <button className="section-next-btn" onClick={() => setActiveSection('terms')}>Next: Terms & Notes →</button>
          </div>
        )}

        {activeSection === 'terms' && (
          <div className="studio-section">
            <div className="form-divider">Material & Warranty Notes</div>
            <div className="comments-list">
              {(quote.comments || []).map((c, idx) => (
                <div key={idx} className="comment-row">
                  <span className="comment-row__bullet">•</span>
                  <input className="comment-row__input" value={c} placeholder="Add note..." onChange={(e) => updateComment(idx, e.target.value)} />
                  <button type="button" className="comment-row__delete" onClick={() => deleteComment(idx)}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
              <button type="button" className="add-comment-btn" onClick={addComment}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                Add Note
              </button>
            </div>

            <div className="form-divider" style={{ marginTop: 24 }}>Terms & Conditions</div>
            <div className="form-field">
              <textarea rows={5} value={quote.terms} onChange={(e) => set('terms', e.target.value)} />
            </div>

            <div className="form-field">
              <label>Internal Notes (not shown on PDF)</label>
              <textarea rows={3} placeholder="e.g. Client prefers earthy tones, site visit on 20th..." value={quote.notes} onChange={(e) => set('notes', e.target.value)} />
            </div>

            <div className="final-actions">
              <button className="final-btn final-btn--draft" onClick={() => handleSave('draft')}>Save as Draft</button>
              <button className="final-btn final-btn--preview" onClick={async () => {
                await upsertQuote(quote)
                navigate(`/studio/${quote.id}/print`)
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 5h12v8H2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  <path d="M4 5V3h8v2" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  <path d="M4 9h8M4 11h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Preview & Export PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

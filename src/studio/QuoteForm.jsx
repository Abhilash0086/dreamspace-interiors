import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  newBlankQuote, getQuote, upsertQuote, calcTotals, calcCOP, parseArea,
  PROJECT_TYPES, ITEM_TYPES, ROOM_TYPES
} from './quoteStore'
import { loadSettings, SETTING_DEFAULTS } from './settingsStore'
import './studio.css'

const uid = () => Math.random().toString(36).slice(2, 9)
const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })

function ItemRow({ item, onChange, onDelete, hideRoom = false, itemTypes = [], roomTypes = [], categoryTypes = [], brandTypes = [], rateGuide = {} }) {
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
      {!hideRoom && (
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
            {roomTypes.map((r) => <option key={r} value={r}>{r}</option>)}
            {item.room && !roomTypes.includes(item.room) && (
              <option value={item.room}>{item.room}</option>
            )}
          </select>
          <button className="item-row__delete" onClick={onDelete} type="button" aria-label="Delete item">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 4h9M5 4V2.5h4V4M5 7v3.5M9 7v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M3.5 4l.6 7h5.8l.6-7" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}

      <div className="item-row__type-row" style={hideRoom ? { display: 'flex', gap: 8, alignItems: 'center' } : {}}>
        <select
          className={`item-row__item-type ${!item.itemType ? 'placeholder' : ''}`}
          value={item.itemType || ''}
          onChange={(e) => update('itemType', e.target.value)}
        >
          <option value="">— Select item —</option>
          {itemTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          {item.itemType && item.itemType !== 'Miscellaneous' && !itemTypes.includes(item.itemType) && (
            <option value={item.itemType}>{item.itemType}</option>
          )}
          <option value="Miscellaneous">Miscellaneous (lump sum)</option>
        </select>
        {hideRoom && (
          <button className="item-row__delete" onClick={onDelete} type="button" aria-label="Delete item">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 4h9M5 4V2.5h4V4M5 7v3.5M9 7v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M3.5 4l.6 7h5.8l.6-7" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {!isMisc && (
        <div className="item-row__meta-row">
          <select
            className={`item-row__category ${!item.category ? 'placeholder' : ''} ${!item.category ? 'item-row__select--error' : ''}`}
            value={item.category || ''}
            onChange={(e) => update('category', e.target.value)}
          >
            <option value="">— Category * —</option>
            {categoryTypes.map((c) => <option key={c} value={c}>{c}</option>)}
            {item.category && !categoryTypes.includes(item.category) && (
              <option value={item.category}>{item.category}</option>
            )}
          </select>
          <select
            className={`item-row__brand ${!item.brand ? 'placeholder' : ''} ${!item.brand ? 'item-row__select--error' : ''}`}
            value={item.brand || ''}
            onChange={(e) => update('brand', e.target.value)}
          >
            <option value="">— Brand * —</option>
            {brandTypes.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      )}

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
            <label>Total (₹)</label>
            <input
              type="number" inputMode="decimal" min="0"
              value={item.amount || ''}
              placeholder="0"
              onChange={(e) => onChange({ ...item, amount: parseFloat(e.target.value) || 0 })}
            />
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
  const [saveError, setSaveError] = useState('')
  const [activeSection, setActiveSection] = useState('client')
  const originalItemsRef = useRef(null)
  const [roomTypes, setRoomTypes] = useState(ROOM_TYPES)
  const [itemTypes, setItemTypes] = useState(ITEM_TYPES)
  const [categoryTypes, setCategoryTypes] = useState(SETTING_DEFAULTS.category_types)
  const [brandTypes, setBrandTypes] = useState(SETTING_DEFAULTS.brand_types)
  const [rateGuide, setRateGuide] = useState(SETTING_DEFAULTS.rate_guide)

  useEffect(() => {
    const init = async () => {
      const [q, settings] = await Promise.all([
        isNew ? newBlankQuote() : getQuote(id),
        loadSettings().catch(() => ({})),
      ])
      if (!isNew && !q) { navigate('/studio'); return }
      setQuote(q)
      originalItemsRef.current = JSON.stringify(q.items || [])
      if (settings.room_types?.length) setRoomTypes(settings.room_types)
      if (settings.item_types?.length) setItemTypes(settings.item_types)
      if (settings.category_types?.length) setCategoryTypes(settings.category_types)
      if (settings.brand_types?.length) setBrandTypes(settings.brand_types)
      if (settings.rate_guide) setRateGuide(settings.rate_guide)
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
      if (path === 'discountPct') {
        Object.assign(updated, calcTotals(updated.items, updated.discountPct))
      }
      return updated
    })
  }, [])

  const updateItem = (itemId, updated) => {
    setQuote((q) => {
      const items = q.items.map((it) => it.id === itemId ? updated : it)
      return { ...q, items, ...calcTotals(items, q.discountPct) }
    })
  }

  const deleteItem = (itemId) => {
    setQuote((q) => {
      const items = q.items.filter((it) => it.id !== itemId)
      return { ...q, items, ...calcTotals(items, q.discountPct) }
    })
  }

  const addRoom = () => {
    setQuote((q) => {
      const items = [...q.items, { id: uid(), room: '', itemType: '', size: '', qty: '', area: 0, rate: '', amount: 0 }]
      return { ...q, items, ...calcTotals(items, q.discountPct) }
    })
  }

  const addItemToRoom = (room, lastItemId) => {
    setQuote((q) => {
      const lastIdx = q.items.findIndex((it) => it.id === lastItemId)
      const newItem = { id: uid(), room, itemType: '', size: '', qty: '', area: 0, rate: '', amount: 0 }
      const items = lastIdx >= 0
        ? [...q.items.slice(0, lastIdx + 1), newItem, ...q.items.slice(lastIdx + 1)]
        : [...q.items, newItem]
      return { ...q, items, ...calcTotals(items, q.discountPct) }
    })
  }

  const changeRoomHeader = (itemIds, newRoom) => {
    const idSet = new Set(itemIds)
    setQuote((q) => {
      const items = q.items.map((it) => idSet.has(it.id) ? { ...it, room: newRoom } : it)
      return { ...q, items, ...calcTotals(items, q.discountPct) }
    })
  }

  const deleteRoom = (itemIds) => {
    const idSet = new Set(itemIds)
    setQuote((q) => {
      const items = q.items.filter((it) => !idSet.has(it.id))
      return { ...q, items, ...calcTotals(items, q.discountPct) }
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

  const validate = () => {
    // Client name required
    if (!quote.client.name?.trim()) {
      setActiveSection('client')
      setSaveError('Client name is required — please enter a name before saving.')
      return false
    }
    // Every item must have an item type selected
    const blankType = quote.items.filter((i) => !i.itemType)
    if (blankType.length > 0) {
      setActiveSection('items')
      setSaveError(`${blankType.length} item${blankType.length > 1 ? 's have' : ' has'} no item type selected — please select a type or remove the row.`)
      return false
    }
    // All non-misc items must have category and brand
    const nonMisc = quote.items.filter((i) => i.itemType && i.itemType !== 'Miscellaneous')
    const missingFields = nonMisc.filter((i) => !i.category || !i.brand)
    if (missingFields.length > 0) {
      setActiveSection('items')
      setSaveError(`${missingFields.length} item${missingFields.length > 1 ? 's are' : ' is'} missing Category or Brand — please fill them before saving.`)
      return false
    }
    // At least something to quote
    if (quote.items.length === 0 && !quote.grandTotal) {
      setActiveSection('items')
      setSaveError('Please add at least one line item before saving.')
      return false
    }
    setSaveError('')
    return true
  }

  const handleSave = async (status) => {
    if (!validate()) return
    setSaving(true)
    try {
      const cop = calcCOP(quote.items, rateGuide)
      const toSave = { ...quote, status: status || quote.status, cop }
      await upsertQuote(toSave)
      const itemsChanged = isNew || JSON.stringify(quote.items) !== originalItemsRef.current
      navigate(itemsChanged ? `/studio/${toSave.id}/summary` : '/studio')
    } catch (err) {
      setSaveError('Failed to save — please check your connection and try again.')
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

      {saveError && (
        <div className="studio-save-error">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M7.5 5v3.5M7.5 10.5v.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {saveError}
          <button onClick={() => setSaveError('')}>✕</button>
        </div>
      )}

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
            <div className="form-row">
              <div className="form-field">
                <label>Salutation</label>
                <select value={quote.client.salutation || ''} onChange={(e) => set('client.salutation', e.target.value)}>
                  <option value="">—</option>
                  <option>Mr.</option>
                  <option>Mrs.</option>
                  <option>Ms.</option>
                  <option>Dr.</option>
                  <option>Prof.</option>
                </select>
              </div>
              <div className="form-field">
                <label>Client Name *</label>
                <input placeholder="Full name" value={quote.client.name} onChange={(e) => set('client.name', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Phone</label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix">+91</span>
                  <input type="tel" inputMode="tel" placeholder="XXXXX XXXXX" value={quote.client.phone} onChange={(e) => set('client.phone', e.target.value)} />
                </div>
              </div>
              <div className="form-field">
                <label>Email</label>
                <input type="email" inputMode="email" placeholder="client@email.com" value={quote.client.email || ''} onChange={(e) => set('client.email', e.target.value)} />
              </div>
            </div>
            <div className="form-field">
              <label>Project Type</label>
              <select value={quote.client.projectType} onChange={(e) => set('client.projectType', e.target.value)}>
                {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
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
              <div className="items-empty"><p>No rooms yet. Tap below to add a room.</p></div>
            )}
            {(() => {
              const groups = []
              quote.items.forEach((item) => {
                const room = item.room || ''
                if (!groups.length || groups[groups.length - 1].room !== room) {
                  groups.push({ room, key: item.id, items: [item] })
                } else {
                  groups[groups.length - 1].items.push(item)
                }
              })
              return groups.map((group) => {
                const itemIds = group.items.map((it) => it.id)
                const lastItemId = itemIds[itemIds.length - 1]
                return (
                  <div key={group.key} className="room-section">
                    <div className="room-section__header">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="room-section__icon">
                        <path d="M6.5 1.5L1 5v7h4V8.5h3V12h4V5L6.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                      </svg>
                      <select
                        className="room-section__room-select"
                        value={group.room}
                        onChange={(e) => changeRoomHeader(itemIds, e.target.value)}
                      >
                        <option value="">— Select Room / Area —</option>
                        {roomTypes.map((r) => <option key={r} value={r}>{r}</option>)}
                        {group.room && !roomTypes.includes(group.room) && (
                          <option value={group.room}>{group.room}</option>
                        )}
                      </select>
                      <button
                        className="room-section__delete-room"
                        type="button"
                        title="Remove room"
                        onClick={() => deleteRoom(itemIds)}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M2.5 4h9M5 4V2.5h4V4M5 7v3.5M9 7v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                          <path d="M3.5 4l.6 7h5.8l.6-7" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                    <div className="room-section__items">
                      {group.items.map((item) => (
                        <ItemRow
                          key={item.id}
                          item={item}
                          onChange={(u) => updateItem(item.id, u)}
                          onDelete={() => deleteItem(item.id)}
                          hideRoom={true}
                          itemTypes={itemTypes}
                          roomTypes={roomTypes}
                          categoryTypes={categoryTypes}
                          brandTypes={brandTypes}
                          rateGuide={rateGuide}
                        />
                      ))}
                    </div>
                    <button
                      className="room-section__add-item"
                      type="button"
                      onClick={() => addItemToRoom(group.room, lastItemId)}
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M6.5 2v9M2 6.5h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                      Add item
                    </button>
                  </div>
                )
              })
            })()}
            <button className="add-room-btn" onClick={addRoom} type="button">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L1 6v9h5V9.5h4V15h5V6L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M8 9v4M6 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Add Room
            </button>
            {quote.items.length > 0 && (
              <div className="items-subtotal">Subtotal: <strong>{fmt(quote.subtotal)}</strong></div>
            )}
            <button className="section-next-btn" onClick={() => setActiveSection('totals')}>Next: Totals →</button>
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
                if (!validate()) return
                const cop = calcCOP(quote.items, rateGuide)
                await upsertQuote({ ...quote, cop })
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

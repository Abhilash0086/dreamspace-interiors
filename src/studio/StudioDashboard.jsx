import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadQuotes, deleteQuote, STATUS_META, calcTotals, newBlankQuote, upsertQuote } from './quoteStore'
import { parseQuoteExcel } from './excelImport'
import { downloadTemplate, downloadTemplateWithExample } from './excelTemplate'
import './studio.css'

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

export default function StudioDashboard() {
  const [quotes, setQuotes] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false)
  const fileInputRef = useRef(null)
  const templateMenuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      if (templateMenuRef.current && !templateMenuRef.current.contains(e.target))
        setTemplateMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('touchstart', handler) }
  }, [])

  const refresh = async () => {
    setLoading(true)
    try {
      setQuotes(await loadQuotes())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  const filtered = quotes.filter((q) => {
    const matchStatus = filter === 'all' || q.status === filter
    const matchSearch = !search ||
      q.id?.toLowerCase().includes(search.toLowerCase()) ||
      q.client?.name?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setImporting(true)
    setImportError('')
    try {
      const parsed = await parseQuoteExcel(file)
      const base = await newBlankQuote()
      const items = parsed.items
      const totals = calcTotals(items, 0, 0)
      const quote = {
        ...base,
        client: { ...base.client, ...parsed.client },
        date: parsed.date || base.date,
        validUntil: parsed.validUntil || base.validUntil,
        createdBy: parsed.createdBy || base.createdBy,
        items,
        comments: parsed.notes.length ? parsed.notes : base.comments,
        terms: parsed.termLines.length ? parsed.termLines.join('\n') : base.terms,
        ...totals,
      }
      await upsertQuote(quote)
      navigate(`/studio/${quote.id}`)
    } catch (err) {
      setImportError(err.message || 'Failed to import. Check the file format.')
    } finally {
      setImporting(false)
    }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (window.confirm('Delete this quotation?')) {
      await deleteQuote(id)
      refresh()
    }
  }

  const totalValue = filtered.reduce((s, q) => s + (q.grandTotal || 0), 0)

  return (
    <div className="studio">
      <header className="studio-header">
        <div className="studio-header__logo">
          <img src="/logo.png" alt="Dreamspace Interiors" />
        </div>
        <div className="studio-header__title">
          <h1>Quotations</h1>
          <p>{loading ? '…' : `${filtered.length} quote${filtered.length !== 1 ? 's' : ''}`}</p>
        </div>
        <div className="studio-header__actions">
          <button className="studio-icon-btn" title="Masters" onClick={() => navigate('/studio/masters')}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.6 3.6l1.4 1.4M13 13l1.4 1.4M3.6 14.4L5 13M13 5l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="template-menu" ref={templateMenuRef}>
            <button
              className="studio-icon-btn"
              title="Download template"
              onClick={() => setTemplateMenuOpen((v) => !v)}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3v9M6 9l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 14h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
            {templateMenuOpen && (
              <div className="template-menu__dropdown">
                <button onClick={() => { downloadTemplate(); setTemplateMenuOpen(false) }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="2" y="2" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M4 6h6M4 8h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  Blank template
                </button>
                <button onClick={() => { downloadTemplateWithExample(); setTemplateMenuOpen(false) }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="2" y="2" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M4 5h6M4 7h6M4 9h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  With example data
                </button>
              </div>
            )}
          </div>
          <button className="studio-icon-btn" title="Import from Excel" onClick={() => fileInputRef.current?.click()} disabled={importing}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 13V4M6 7l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 14h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImport} />
          <button className="studio-fab-inline" onClick={() => navigate('/studio/new')}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            New
          </button>
        </div>
      </header>
      {importError && (
        <div className="studio-import-error">{importError} <button onClick={() => setImportError('')}>✕</button></div>
      )}
      {importing && (
        <div className="studio-import-banner">Importing Excel… <div className="studio-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /></div>
      )}

      <div className="studio-toolbar">
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
        <div className="studio-filters">
          {['all', 'draft', 'sent', 'accepted', 'rejected'].map((s) => (
            <button
              key={s}
              className={`studio-filter-btn ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? 'All' : STATUS_META[s].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="studio-loading">
          <div className="studio-spinner" />
        </div>
      ) : (
        <>
          {filtered.length > 0 && (
            <div className="studio-summary">
              <span>Total value</span>
              <strong>{fmt(totalValue)}</strong>
            </div>
          )}
          <div className="studio-list">
            {filtered.length === 0 ? (
              <div className="studio-empty">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect x="8" y="6" width="32" height="36" rx="4" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M16 16h16M16 22h16M16 28h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p>No quotations yet</p>
                <button onClick={() => navigate('/studio/new')}>Create your first quote</button>
              </div>
            ) : (
              filtered.map((q) => {
                const sm = STATUS_META[q.status] || STATUS_META.draft
                return (
                  <div key={q.id} className="quote-card" onClick={() => navigate(`/studio/${q.id}`)}>
                    <div className="quote-card__top">
                      <span className="quote-card__id">{q.id}</span>
                      <span className="quote-card__status" style={{ color: sm.color, background: sm.bg }}>
                        {sm.label}
                      </span>
                    </div>
                    <div className="quote-card__client">{q.client?.name || 'Unnamed Client'}</div>
                    <div className="quote-card__meta">
                      <span>{q.client?.projectType || '—'}</span>
                      <span>·</span>
                      <span>{fmtDate(q.date)}</span>
                      {q.createdBy && <><span>·</span><span>by {q.createdBy}</span></>}
                    </div>
                    <div className="quote-card__bottom">
                      <span className="quote-card__total">{fmt(q.grandTotal)}</span>
                      <div className="quote-card__actions">
                        <button
                          className="quote-card__action"
                          onClick={(e) => { e.stopPropagation(); navigate(`/studio/${q.id}/print`) }}
                          title="View PDF"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <ellipse cx="8" cy="8" rx="7" ry="4.5" stroke="currentColor" strokeWidth="1.3"/>
                            <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
                          </svg>
                        </button>
                        <button
                          className="quote-card__action quote-card__action--delete"
                          onClick={(e) => handleDelete(e, q.id)}
                          title="Delete"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 5h10M6 5V3h4v2M6 8v4M10 8v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                            <path d="M4 5l.7 8h6.6L12 5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}

      <button className="studio-fab" onClick={() => navigate('/studio/new')} aria-label="New Quote">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}

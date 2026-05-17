import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadSettings, saveSetting, invalidateSettingsCache, SETTING_DEFAULTS } from './settingsStore'
import './masters.css'

export default function Masters() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('rooms')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState('')

  const [roomTypes, setRoomTypes] = useState([])
  const [itemTypes, setItemTypes] = useState([])
  const [defaultTerms, setDefaultTerms] = useState('')
  const [company, setCompany] = useState({ name: '', tagline: '', social: '' })

  const [newRoom, setNewRoom] = useState('')
  const [newItem, setNewItem] = useState('')

  useEffect(() => {
    loadSettings()
      .catch(() => ({}))
      .then((s) => {
        setRoomTypes(s.room_types ?? SETTING_DEFAULTS.room_types)
        setItemTypes(s.item_types ?? SETTING_DEFAULTS.item_types)
        setDefaultTerms(s.default_terms ?? SETTING_DEFAULTS.default_terms)
        setCompany(s.company ?? SETTING_DEFAULTS.company)
        setLoading(false)
      })
  }, [])

  const flash = (key) => {
    setSaved(key)
    setTimeout(() => setSaved(''), 2000)
  }

  const save = async (key, value) => {
    setSaving(true)
    try {
      await saveSetting(key, value)
      invalidateSettingsCache()
      flash(key)
    } finally {
      setSaving(false)
    }
  }

  const addRoom = () => {
    const v = newRoom.trim()
    if (!v || roomTypes.includes(v)) return
    setRoomTypes((r) => [...r, v])
    setNewRoom('')
  }

  const removeRoom = (i) => setRoomTypes((r) => r.filter((_, idx) => idx !== i))

  const addItem = () => {
    const v = newItem.trim()
    if (!v || itemTypes.includes(v)) return
    setItemTypes((r) => [...r, v])
    setNewItem('')
  }

  const removeItem = (i) => setItemTypes((r) => r.filter((_, idx) => idx !== i))

  const tabs = [
    { key: 'rooms', label: 'Rooms' },
    { key: 'items', label: 'Items' },
    { key: 'terms', label: 'Terms' },
    { key: 'company', label: 'Company' },
  ]

  if (loading) return (
    <div className="masters">
      <div className="studio-loading"><div className="studio-spinner" /></div>
    </div>
  )

  return (
    <div className="masters">
      <header className="studio-header">
        <button className="studio-back" onClick={() => navigate('/studio')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="studio-header__title">
          <h1>Masters</h1>
          <p>Manage default data</p>
        </div>
      </header>

      <div className="studio-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`studio-tab ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="masters-body">

        {activeTab === 'rooms' && (
          <div className="masters-section">
            <p className="masters-hint">These appear in the Room / Area dropdown when building a quote.</p>
            <div className="masters-list">
              {roomTypes.map((r, i) => (
                <div key={i} className="masters-list__row">
                  <span>{r}</span>
                  <button className="masters-list__delete" onClick={() => removeRoom(i)} title="Remove">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="masters-add-row">
              <input
                placeholder="Add new room / area…"
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addRoom()}
              />
              <button className="masters-add-btn" onClick={addRoom}>Add</button>
            </div>
            <button
              className={`masters-save-btn ${saved === 'room_types' ? 'masters-save-btn--saved' : ''}`}
              disabled={saving}
              onClick={() => save('room_types', roomTypes)}
            >
              {saved === 'room_types' ? '✓ Saved' : saving ? 'Saving…' : 'Save Rooms'}
            </button>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="masters-section">
            <p className="masters-hint">These appear in the Item Type dropdown when building a quote.</p>
            <div className="masters-list">
              {itemTypes.map((r, i) => (
                <div key={i} className="masters-list__row">
                  <span>{r}</span>
                  <button className="masters-list__delete" onClick={() => removeItem(i)} title="Remove">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="masters-add-row">
              <input
                placeholder="Add new item type…"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
              />
              <button className="masters-add-btn" onClick={addItem}>Add</button>
            </div>
            <button
              className={`masters-save-btn ${saved === 'item_types' ? 'masters-save-btn--saved' : ''}`}
              disabled={saving}
              onClick={() => save('item_types', itemTypes)}
            >
              {saved === 'item_types' ? '✓ Saved' : saving ? 'Saving…' : 'Save Items'}
            </button>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="masters-section">
            <p className="masters-hint">Pre-filled on every new quotation. You can edit per-quote after creation.</p>
            <textarea
              className="masters-textarea"
              rows={8}
              value={defaultTerms}
              onChange={(e) => setDefaultTerms(e.target.value)}
            />
            <button
              className={`masters-save-btn ${saved === 'default_terms' ? 'masters-save-btn--saved' : ''}`}
              disabled={saving}
              onClick={() => save('default_terms', defaultTerms)}
            >
              {saved === 'default_terms' ? '✓ Saved' : saving ? 'Saving…' : 'Save Terms'}
            </button>
          </div>
        )}

        {activeTab === 'company' && (
          <div className="masters-section">
            <p className="masters-hint">Shown on every quotation PDF and in the app.</p>
            <div className="masters-fields">
              <div className="masters-field">
                <label>Company Name</label>
                <input
                  value={company.name || ''}
                  onChange={(e) => setCompany((c) => ({ ...c, name: e.target.value }))}
                />
              </div>
              <div className="masters-field">
                <label>Tagline</label>
                <input
                  value={company.tagline || ''}
                  onChange={(e) => setCompany((c) => ({ ...c, tagline: e.target.value }))}
                />
              </div>
              <div className="masters-field">
                <label>Social Handle</label>
                <input
                  value={company.social || ''}
                  placeholder="@handle"
                  onChange={(e) => setCompany((c) => ({ ...c, social: e.target.value }))}
                />
              </div>
            </div>
            <button
              className={`masters-save-btn ${saved === 'company' ? 'masters-save-btn--saved' : ''}`}
              disabled={saving}
              onClick={() => save('company', company)}
            >
              {saved === 'company' ? '✓ Saved' : saving ? 'Saving…' : 'Save Company'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

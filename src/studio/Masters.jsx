import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadSettings, saveSetting, invalidateSettingsCache, SETTING_DEFAULTS } from './settingsStore'
import { hashPIN, getStoredPinHash, storePinHash } from '../lib/auth'
import './masters.css'

export default function Masters() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('rooms')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState('')

  const [roomTypes, setRoomTypes] = useState([])
  const [itemTypes, setItemTypes] = useState([])
  const [categoryTypes, setCategoryTypes] = useState([])
  const [brandTypes, setBrandTypes] = useState([])
  const [rateGuide, setRateGuide] = useState({})
  const [defaultTerms, setDefaultTerms] = useState('')
  const [company, setCompany] = useState({ name: '', tagline: '', social: '' })

  const [newRoom, setNewRoom] = useState('')
  const [newItem, setNewItem] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newBrand, setNewBrand] = useState('')

  // Security / PIN
  const [pinStep, setPinStep] = useState('current') // 'current' | 'new' | 'confirm'
  const [pinCurrent, setPinCurrent] = useState('')
  const [pinNew, setPinNew] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinSuccess, setPinSuccess] = useState(false)
  const [storedPinHash, setStoredPinHash] = useState(null)

  useEffect(() => {
    loadSettings()
      .catch(() => ({}))
      .then((s) => {
        setRoomTypes(s.room_types ?? SETTING_DEFAULTS.room_types)
        setItemTypes(s.item_types ?? SETTING_DEFAULTS.item_types)
        setCategoryTypes(s.category_types ?? SETTING_DEFAULTS.category_types)
        setBrandTypes(s.brand_types ?? SETTING_DEFAULTS.brand_types)
        setRateGuide(s.rate_guide ?? SETTING_DEFAULTS.rate_guide)
        setDefaultTerms(s.default_terms ?? SETTING_DEFAULTS.default_terms)
        setCompany(s.company ?? SETTING_DEFAULTS.company)
        setStoredPinHash(getStoredPinHash())
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

  const addCategory = () => {
    const v = newCategory.trim()
    if (!v || categoryTypes.includes(v)) return
    setCategoryTypes((r) => [...r, v])
    setNewCategory('')
  }
  const removeCategory = (i) => setCategoryTypes((r) => r.filter((_, idx) => idx !== i))

  const addBrand = () => {
    const v = newBrand.trim()
    if (!v || brandTypes.includes(v)) return
    setBrandTypes((r) => [...r, v])
    setNewBrand('')
  }
  const removeBrand = (i) => setBrandTypes((r) => r.filter((_, idx) => idx !== i))

  const updateRateGuide = (cat, field, val) =>
    setRateGuide((g) => ({ ...g, [cat]: { ...g[cat], [field]: val } }))

  const handlePinChange = async () => {
    setPinError('')
    // Verify current PIN if one exists
    if (storedPinHash) {
      const hash = await hashPIN(pinCurrent)
      if (hash !== storedPinHash) { setPinError('Current PIN is incorrect'); return }
    }
    if (pinNew.length < 4) { setPinError('PIN must be 4 digits'); return }
    if (pinNew !== pinConfirm) { setPinError('New PINs do not match'); return }
    setSaving(true)
    try {
      const hash = await hashPIN(pinNew)
      storePinHash(hash)
      setStoredPinHash(hash)
      setPinCurrent(''); setPinNew(''); setPinConfirm('')
      setPinSuccess(true)
      setTimeout(() => setPinSuccess(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { key: 'rooms',      label: 'Rooms' },
    { key: 'items',      label: 'Items' },
    { key: 'categories', label: 'Category' },
    { key: 'brands',     label: 'Brand' },
    { key: 'rate_guide', label: 'Rate Guide' },
    { key: 'terms',      label: 'Terms' },
    { key: 'company',    label: 'Company' },
    { key: 'security',   label: 'Security' },
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
        <button className="studio-icon-btn" title="Cost of Production" onClick={() => navigate('/studio/masters/cop')}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L2 6.5v10h14v-10L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M6 16.5V11h6v5.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          </svg>
        </button>
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

        {activeTab === 'categories' && (
          <div className="masters-section">
            <p className="masters-hint">These appear in the Category dropdown on each line item.</p>
            <div className="masters-list">
              {categoryTypes.map((r, i) => (
                <div key={i} className="masters-list__row">
                  <span>{r}</span>
                  <button className="masters-list__delete" onClick={() => removeCategory(i)} title="Remove">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="masters-add-row">
              <input
                placeholder="Add new category…"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCategory()}
              />
              <button className="masters-add-btn" onClick={addCategory}>Add</button>
            </div>
            <button
              className={`masters-save-btn ${saved === 'category_types' ? 'masters-save-btn--saved' : ''}`}
              disabled={saving}
              onClick={() => save('category_types', categoryTypes)}
            >
              {saved === 'category_types' ? '✓ Saved' : saving ? 'Saving…' : 'Save Categories'}
            </button>
          </div>
        )}

        {activeTab === 'brands' && (
          <div className="masters-section">
            <p className="masters-hint">These appear in the Brand / Non Brand dropdown on each line item.</p>
            <div className="masters-list">
              {brandTypes.map((r, i) => (
                <div key={i} className="masters-list__row">
                  <span>{r}</span>
                  <button className="masters-list__delete" onClick={() => removeBrand(i)} title="Remove">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="masters-add-row">
              <input
                placeholder="Add new brand type…"
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addBrand()}
              />
              <button className="masters-add-btn" onClick={addBrand}>Add</button>
            </div>
            <button
              className={`masters-save-btn ${saved === 'brand_types' ? 'masters-save-btn--saved' : ''}`}
              disabled={saving}
              onClick={() => save('brand_types', brandTypes)}
            >
              {saved === 'brand_types' ? '✓ Saved' : saving ? 'Saving…' : 'Save Brands'}
            </button>
          </div>
        )}

        {activeTab === 'rate_guide' && (
          <div className="masters-section">
            <p className="masters-hint">Rate ranges (₹/sqft) shown as suggestions when filling a quote. Rows follow your Category list.</p>
            <div className="masters-rate-table-wrap">
              <table className="masters-rate-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Non Brand (₹)</th>
                    <th>Brand (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryTypes.map((cat) => (
                    <tr key={cat}>
                      <td className="masters-rate-table__cat">{cat}</td>
                      <td>
                        <input
                          className="masters-rate-table__input"
                          value={rateGuide[cat]?.nonBrand ?? ''}
                          placeholder="e.g. 300-400"
                          onChange={(e) => updateRateGuide(cat, 'nonBrand', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="masters-rate-table__input"
                          value={rateGuide[cat]?.brand ?? ''}
                          placeholder="e.g. 400-500"
                          onChange={(e) => updateRateGuide(cat, 'brand', e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              className={`masters-save-btn ${saved === 'rate_guide' ? 'masters-save-btn--saved' : ''}`}
              disabled={saving}
              onClick={() => save('rate_guide', rateGuide)}
            >
              {saved === 'rate_guide' ? '✓ Saved' : saving ? 'Saving…' : 'Save Rate Guide'}
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

        {activeTab === 'security' && (
          <div className="masters-section">
            <p className="masters-hint">Change the PIN used to unlock the app.</p>
            <div className="masters-fields">
              {storedPinHash && (
                <div className="masters-field">
                  <label>Current PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="••••"
                    value={pinCurrent}
                    onChange={(e) => { setPinCurrent(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinError('') }}
                  />
                </div>
              )}
              <div className="masters-field">
                <label>New PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={pinNew}
                  onChange={(e) => { setPinNew(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinError('') }}
                />
              </div>
              <div className="masters-field">
                <label>Confirm New PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={pinConfirm}
                  onChange={(e) => { setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinError('') }}
                />
              </div>
            </div>
            {pinError && <p className="masters-pin-error">{pinError}</p>}
            <button
              className={`masters-save-btn ${pinSuccess ? 'masters-save-btn--saved' : ''}`}
              disabled={saving}
              onClick={handlePinChange}
            >
              {pinSuccess ? '✓ PIN Updated' : saving ? 'Saving…' : storedPinHash ? 'Change PIN' : 'Set PIN'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

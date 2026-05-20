import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadSettings, saveSetting, invalidateSettingsCache } from './settingsStore'
import { hashPIN, isAuthenticated, setAuthenticated } from '../lib/auth'
import './pin.css'

const PIN_LENGTH = 4

export default function PINScreen() {
  const navigate = useNavigate()
  const [mode, setMode] = useState(null) // null=loading | 'enter' | 'setup' | 'confirm'
  const [pin, setPin] = useState('')
  const [setupPin, setSetupPin] = useState('')
  const [storedHash, setStoredHash] = useState(null)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (isAuthenticated()) { navigate('/studio', { replace: true }); return }
    loadSettings().catch(() => ({})).then((s) => {
      if (s.pin_hash) { setStoredHash(s.pin_hash); setMode('enter') }
      else setMode('setup')
    })
  }, [])

  // Keyboard support
  useEffect(() => {
    const handler = (e) => {
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key)
      if (e.key === 'Backspace') handleBack()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [pin, mode, setupPin, storedHash, busy])

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleDigit = (d) => {
    if (busy || pin.length >= PIN_LENGTH) return
    const next = pin + d
    setPin(next)
    setError('')
    if (next.length === PIN_LENGTH) setTimeout(() => submit(next), 120)
  }

  const handleBack = () => {
    if (!busy) setPin((p) => p.slice(0, -1))
  }

  const submit = async (value) => {
    if (busy) return
    setBusy(true)
    try {
      if (mode === 'enter') {
        const hash = await hashPIN(value)
        if (hash === storedHash) {
          setAuthenticated()
          navigate('/studio', { replace: true })
        } else {
          triggerShake()
          setError('Incorrect PIN')
          setPin('')
        }
      } else if (mode === 'setup') {
        setSetupPin(value)
        setPin('')
        setMode('confirm')
      } else if (mode === 'confirm') {
        if (value === setupPin) {
          const hash = await hashPIN(value)
          await saveSetting('pin_hash', hash)
          invalidateSettingsCache()
          setAuthenticated()
          navigate('/studio', { replace: true })
        } else {
          triggerShake()
          setError('PINs do not match — try again')
          setPin('')
          setSetupPin('')
          setMode('setup')
        }
      }
    } finally {
      setBusy(false)
    }
  }

  if (!mode) return null

  const dots = Array.from({ length: PIN_LENGTH }).map((_, i) => i < pin.length)
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'back']

  return (
    <div className="pin-screen">
      <div className="pin-logo">
        <img src="/logo.png" alt="Dreamspace Interiors" />
      </div>

      <div className="pin-heading">
        {mode === 'enter'   ? 'Enter PIN'     : null}
        {mode === 'setup'   ? 'Create a PIN'  : null}
        {mode === 'confirm' ? 'Confirm PIN'   : null}
      </div>
      <div className="pin-subheading">
        {mode === 'setup'   ? 'Choose a 4-digit PIN to protect the app' : null}
        {mode === 'confirm' ? 'Re-enter the same PIN to confirm'        : null}
      </div>

      <div className={`pin-dots ${shake ? 'pin-dots--shake' : ''}`}>
        {dots.map((filled, i) => (
          <div key={i} className={`pin-dot ${filled ? 'pin-dot--filled' : ''}`} />
        ))}
      </div>

      {error
        ? <div className="pin-error">{error}</div>
        : <div className="pin-error pin-error--placeholder"> </div>
      }

      <div className="pin-pad">
        {keys.map((k, i) => {
          if (k === null) return <div key={i} className="pin-key pin-key--empty" />
          if (k === 'back') return (
            <button key={i} className="pin-key pin-key--back" onClick={handleBack} aria-label="Backspace">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 10H7M7 10l3.5-3.5M7 10l3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 4.5H16a1.5 1.5 0 011.5 1.5v8A1.5 1.5 0 0116 15.5H5L1.5 10 5 4.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
              </svg>
            </button>
          )
          return (
            <button key={i} className="pin-key" onClick={() => handleDigit(String(k))}>
              {k}
            </button>
          )
        })}
      </div>
    </div>
  )
}

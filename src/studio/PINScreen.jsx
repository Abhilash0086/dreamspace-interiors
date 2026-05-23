import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hashPIN, isAuthenticated, setAuthenticated, getStoredPinHash, storePinHash } from '../lib/auth'
import './pin.css'

const PIN_LENGTH = 4

export default function PINScreen() {
  const navigate = useNavigate()
  const [mode, setMode]         = useState(null) // null | 'enter' | 'setup' | 'confirm'
  const [pin, setPin]           = useState('')
  const [error, setError]       = useState('')
  const [shake, setShake]       = useState(false)
  const [busy, setBusy]         = useState(false)

  // Refs hold the always-current values so async callbacks never see stale state
  const setupPinRef   = useRef('')
  const storedHashRef = useRef(null)
  const modeRef       = useRef(null)
  const busyRef       = useRef(false)

  const setBusySafe = (v) => { busyRef.current = v; setBusy(v) }

  useEffect(() => { modeRef.current = mode }, [mode])

  useEffect(() => {
    const init = async () => {
      if (isAuthenticated()) { navigate('/studio', { replace: true }); return }
      const hash = await getStoredPinHash()
      if (hash) { storedHashRef.current = hash; setMode('enter') }
      else setMode('setup')
    }
    init()
  }, [])

  // Keyboard support
  useEffect(() => {
    const onKey = (e) => {
      if (e.key >= '0' && e.key <= '9') addDigit(e.key)
      if (e.key === 'Backspace') removeDigit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, []) // empty deps — addDigit/removeDigit read from refs

  const triggerShake = () => {
    setShake(true); setTimeout(() => setShake(false), 500)
  }

  // Always read latest pin via functional updater
  const addDigit = (d) => {
    if (busyRef.current) return
    setPin((prev) => {
      if (prev.length >= PIN_LENGTH) return prev
      const next = prev + d
      if (next.length === PIN_LENGTH) {
        // Use setTimeout so the last dot renders before the async work starts
        setTimeout(() => submit(next), 100)
      }
      return next
    })
    setError('')
  }

  const removeDigit = () => {
    if (!busyRef.current) setPin((p) => p.slice(0, -1))
  }

  const submit = async (value) => {
    if (busyRef.current) return
    setBusySafe(true)
    try {
      const currentMode = modeRef.current

      if (currentMode === 'enter') {
        const hash = await hashPIN(value)
        if (hash === storedHashRef.current) {
          setAuthenticated()
          navigate('/studio', { replace: true })
        } else {
          triggerShake()
          setError('Incorrect PIN')
          setPin('')
        }

      } else if (currentMode === 'setup') {
        setupPinRef.current = value   // store in ref — always current
        setPin('')
        setMode('confirm')

      } else if (currentMode === 'confirm') {
        if (value === setupPinRef.current) {
          const hash = await hashPIN(value)
          await storePinHash(hash)
          setAuthenticated()
          navigate('/studio', { replace: true })
        } else {
          triggerShake()
          setError('PINs do not match — try again')
          setPin('')
          setupPinRef.current = ''
          setMode('setup')
        }
      }
    } finally {
      setBusySafe(false)
    }
  }

  if (!mode) return (
    <div className="pin-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <div className="studio-spinner" style={{ borderColor: 'rgba(255,255,255,0.15)', borderTopColor: 'var(--orange)' }} />
      </div>
    </div>
  )

  const dots = Array.from({ length: PIN_LENGTH }).map((_, i) => i < pin.length)
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'back']

  return (
    <div className="pin-screen">
      <div className="pin-logo-wrap">
        <img src="/logo.png" className="pin-logo-img" alt="Dreamspace Interiors" />
      </div>

      <div className="pin-heading">
        {mode === 'enter'   && 'Enter PIN'}
        {mode === 'setup'   && 'Create a PIN'}
        {mode === 'confirm' && 'Confirm PIN'}
      </div>
      <div className="pin-subheading">
        {mode === 'setup'   && 'Choose a 4-digit PIN to protect the app'}
        {mode === 'confirm' && 'Re-enter the same PIN to confirm'}
      </div>

      <div className={`pin-dots ${shake ? 'pin-dots--shake' : ''}`}>
        {dots.map((filled, i) => (
          <div key={i} className={`pin-dot ${filled ? 'pin-dot--filled' : ''}`} />
        ))}
      </div>

      <div className="pin-error">{error || ' '}</div>

      <div className="pin-pad">
        {keys.map((k, i) => {
          if (k === null) return <div key={i} className="pin-key pin-key--empty" />
          if (k === 'back') return (
            <button key={i} className="pin-key pin-key--back" onClick={removeDigit} aria-label="Backspace">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 10H7M7 10l3.5-3.5M7 10l3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 4.5H16a1.5 1.5 0 011.5 1.5v8A1.5 1.5 0 0116 15.5H5L1.5 10 5 4.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
              </svg>
            </button>
          )
          return (
            <button key={i} className="pin-key" onClick={() => addDigit(String(k))}>
              {k}
            </button>
          )
        })}
      </div>
    </div>
  )
}

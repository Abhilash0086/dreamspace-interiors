import { supabase } from './supabase'

const SESSION_KEY = 'sbi_auth'
const PIN_KEY     = 'sbi_pin_hash'   // localStorage cache key
const SALT        = 'dreamspace-interiors-2024'

export async function hashPIN(pin) {
  const data = new TextEncoder().encode(pin + SALT)
  const buf  = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Read: Supabase is the source of truth (same PIN across devices).
// Falls back to localStorage if Supabase is unreachable.
export async function getStoredPinHash() {
  try {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'pin_hash')
      .single()
    if (data?.value) {
      localStorage.setItem(PIN_KEY, data.value) // keep local cache in sync
      return data.value
    }
  } catch {}
  // Offline or Supabase misconfigured — fall back to local cache
  return localStorage.getItem(PIN_KEY) || null
}

// Write: localStorage first (instant, never fails), then sync to Supabase.
// Never throws — if Supabase is down the PIN still works via localStorage.
export async function storePinHash(hash) {
  localStorage.setItem(PIN_KEY, hash)
  try {
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'pin_hash', value: hash, updated_at: new Date().toISOString() })
    if (error) console.warn('PIN Supabase sync failed:', error.message)
  } catch (e) {
    console.warn('PIN Supabase sync failed:', e)
  }
  // localStorage write is the guarantee — Supabase is best-effort sync
}

export function isAuthenticated()  { return sessionStorage.getItem(SESSION_KEY) === '1' }
export function setAuthenticated() { sessionStorage.setItem(SESSION_KEY, '1') }
export function clearAuth()        { sessionStorage.removeItem(SESSION_KEY) }

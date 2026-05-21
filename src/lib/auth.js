import { supabase } from './supabase'

const SESSION_KEY = 'sbi_auth'
const SALT        = 'dreamspace-interiors-2024'

export async function hashPIN(pin) {
  const data = new TextEncoder().encode(pin + SALT)
  const buf  = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

// PIN hash stored in Supabase settings table (key: 'pin_hash')
// so it's the same PIN across all devices / browsers
export async function getStoredPinHash() {
  try {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'pin_hash')
      .single()
    return data?.value || null
  } catch {
    return null
  }
}

export async function storePinHash(hash) {
  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'pin_hash', value: hash, updated_at: new Date().toISOString() })
  if (error) throw error
}

export function isAuthenticated()  { return sessionStorage.getItem(SESSION_KEY) === '1' }
export function setAuthenticated() { sessionStorage.setItem(SESSION_KEY, '1') }
export function clearAuth()        { sessionStorage.removeItem(SESSION_KEY) }

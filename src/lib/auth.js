const SESSION_KEY = 'sbi_auth'
const PIN_KEY     = 'sbi_pin_hash'
const SALT        = 'dreamspace-interiors-2024'

export async function hashPIN(pin) {
  const data = new TextEncoder().encode(pin + SALT)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function getStoredPinHash() {
  return localStorage.getItem(PIN_KEY) || null
}

export function storePinHash(hash) {
  localStorage.setItem(PIN_KEY, hash)
}

export function isAuthenticated() {
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

export function setAuthenticated() {
  sessionStorage.setItem(SESSION_KEY, '1')
}

export function clearAuth() {
  sessionStorage.removeItem(SESSION_KEY)
}

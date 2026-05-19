import { supabase } from '../lib/supabase'
import { loadSettings, SETTING_DEFAULTS } from './settingsStore'

export async function loadQuotes() {
  const { data, error } = await supabase
    .from('quotes')
    .select('data')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map((row) => row.data)
}

export async function getQuote(id) {
  const { data, error } = await supabase
    .from('quotes')
    .select('data')
    .eq('id', id)
    .single()
  if (error) return null
  return data?.data || null
}

export async function upsertQuote(quote) {
  const { error } = await supabase
    .from('quotes')
    .upsert({ id: quote.id, data: quote, updated_at: new Date().toISOString() })
  if (error) throw error
}

export async function deleteQuote(id) {
  const { error } = await supabase.from('quotes').delete().eq('id', id)
  if (error) throw error
}

export async function getNextQuoteNumber() {
  const quotes = await loadQuotes()
  const year = new Date().getFullYear()
  const existing = quotes
    .map((q) => q.id)
    .filter((id) => id?.startsWith(`SBI-${year}-`))
    .map((id) => parseInt(id.split('-')[2], 10))
    .filter((n) => !isNaN(n))
  const next = existing.length ? Math.max(...existing) + 1 : 1
  return `SBI-${year}-${String(next).padStart(3, '0')}`
}

function parseRateLower(rateStr) {
  if (!rateStr || String(rateStr).toLowerCase() === 'nil') return 0
  const m = String(rateStr).match(/^(\d+\.?\d*)/)
  return m ? parseFloat(m[1]) : 0
}

function parseRateUpper(rateStr) {
  if (!rateStr || String(rateStr).toLowerCase() === 'nil') return 0
  const range = String(rateStr).match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/)
  if (range) return parseFloat(range[2])
  const single = String(rateStr).match(/^(\d+\.?\d*)/)
  return single ? parseFloat(single[1]) : 0
}

export function calcCOP(items, rateGuide = {}) {
  let total = 0
  let totalMax = 0
  const copItems = items.map((item) => {
    if (item.itemType === 'Miscellaneous') return { id: item.id, copRate: 0, copRateMax: 0, copAmount: 0, copAmountMax: 0 }
    const guide = rateGuide[item.category]
    const rateStr = item.brand === 'Brand'     ? guide?.brand
      : item.brand === 'Non Brand' ? guide?.nonBrand
      : null
    const copRate    = parseRateLower(rateStr)
    const copRateMax = parseRateUpper(rateStr)
    const qty = parseFloat(item.qty) || 1
    const copAmount    = item.area > 0 ? +(item.area * copRate).toFixed(2)    : +(qty * copRate).toFixed(2)
    const copAmountMax = item.area > 0 ? +(item.area * copRateMax).toFixed(2) : +(qty * copRateMax).toFixed(2)
    total    += copAmount
    totalMax += copAmountMax
    return { id: item.id, copRate, copRateMax, copAmount, copAmountMax }
  })
  return { items: copItems, total: +total.toFixed(2), totalMax: +totalMax.toFixed(2) }
}

export function calcTotals(items, discountPct) {
  const subtotal = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
  const discountAmt = (subtotal * (parseFloat(discountPct) || 0)) / 100
  const grandTotal = subtotal - discountAmt
  return { subtotal, discountAmt, grandTotal }
}

export function parseArea(size, qty) {
  const match = (size || '').match(/^(\d+\.?\d*)\s*[xX×]\s*(\d+\.?\d*)/)
  if (match) {
    return +(parseFloat(match[1]) * parseFloat(match[2]) * (parseFloat(qty) || 1)).toFixed(2)
  }
  const single = (size || '').match(/^(\d+\.?\d*)$/)
  if (single) {
    return +(parseFloat(single[1]) * (parseFloat(qty) || 1)).toFixed(2)
  }
  return 0
}

export async function newBlankQuote() {
  const settings = await loadSettings().catch(() => ({}))
  const today = new Date()
  const validity = new Date(today)
  validity.setDate(validity.getDate() + 30)
  return {
    id: await getNextQuoteNumber(),
    date: today.toISOString().split('T')[0],
    validUntil: validity.toISOString().split('T')[0],
    status: 'draft',
    createdBy: '',
    client: { name: '', phone: '', email: '', address: '', projectType: 'Residential' },
    items: [],
    comments: [
      '15 years Service Warranty',
      'Plywood Used - Premium Ply',
      'Inner Laminate - Half White',
      'Outer Laminate - Customer Choice',
      'Acrylic - Scratch Resistant',
      'Hardwares - EBCO (Soft Closures)',
    ],
    discountPct: 0,
    subtotal: 0,
    discountAmt: 0,
    grandTotal: 0,
    notes: '',
    terms: settings.default_terms ?? SETTING_DEFAULTS.default_terms,
    bankDetails: 'Account Name: Dreamspace Interiors\nBank: [Bank Name]\nAccount No: [Account Number]\nIFSC: [IFSC Code]',
  }
}

export const STATUS_META = {
  draft:    { label: 'Draft',    color: '#6B6B6B', bg: '#F5F5F5' },
  sent:     { label: 'Sent',     color: '#1D6FA4', bg: '#EBF5FB' },
  accepted: { label: 'Accepted', color: '#1A7A3C', bg: '#EAFAF1' },
  rejected: { label: 'Rejected', color: '#B91C1C', bg: '#FEF2F2' },
}

export const PROJECT_TYPES = ['Residential', 'Commercial', 'Modular Kitchen', 'False Ceiling', 'Renovation', 'Consultation']

export const ITEM_TYPES = [
  'TV Unit Panelling',
  'TV Unit Box',
  'TV Unit',
  'False Ceiling',
  'Wall Panelling',
  'Console',
  'Base Unit',
  'Base Unit Shutters',
  'Base Unit (Acrylic)',
  'Wall Unit',
  'Wall Unit Shutters',
  'Wall Unit (Acrylic)',
  'Loft',
  'Loft Shutters',
  'Loft (Acrylic)',
  'Breakfast Counter',
  'Breakfast Counter (Acrylic)',
  'Kitchen Accessories',
  'Shoe Rack',
  'Cupboard Frame & Shutters',
  'Crockery Unit',
  'Wardrobe',
  'Walk-in Wardrobe',
  'Cot with Headboard',
  'Bedside Table',
  'Dresser',
  'Study Table & Wall Unit',
  'Bathroom Vanity',
  'Flooring',
  'Wall Painting',
  'Tiles',
  'Wallpaper',
  'Electrical',
  'Plumbing',
  'Carpentry',
  'Furniture',
  'Other',
]

export const ROOM_TYPES = [
  'Bedroom',
  'Master Bedroom',
  'Ground Floor Master Bedroom',
  'Ground Floor Bedroom',
  'First Floor Master Bedroom',
  'First Floor Guest Bedroom',
  'First Floor Kids Bedroom',
  'First Floor Bedroom 1',
  'First Floor Bedroom 2',
  'Kids Room',
  'Guest Room',
  'Hall',
  'Living Room',
  'Dining Room',
  'Dining',
  'Kitchen',
  'Modular Kitchen',
  'Pooja Room',
  'Pooja',
  'Bathroom',
  'Balcony',
  'Entrance / Foyer',
  'Foyer',
  'Utility Area',
  'Play Area',
  'Office Room',
  'Store Room',
  'Staircase',
  'Additional Works',
  'Other',
]

import { supabase } from '../lib/supabase'

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

export function calcTotals(items, discountPct, taxRate) {
  const subtotal = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
  const discountAmt = (subtotal * (parseFloat(discountPct) || 0)) / 100
  const taxable = subtotal - discountAmt
  const taxAmt = (taxable * (parseFloat(taxRate) || 0)) / 100
  const grandTotal = taxable + taxAmt
  return { subtotal, discountAmt, taxAmt, grandTotal }
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
    taxRate: 18,
    subtotal: 0,
    discountAmt: 0,
    taxAmt: 0,
    grandTotal: 0,
    notes: '',
    terms: `1. Given quotation is for the above mentioned products.\n2. Electrical work, electrical fittings and civil work not included.\n3. Payment: 60% advance on confirmation / 30% on/before door installation / 10% on handover.`,
    bankDetails: 'Account Name: Sandbox Interiors\nBank: [Bank Name]\nAccount No: [Account Number]\nIFSC: [IFSC Code]',
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
  'Wall Unit',
  'Loft',
  'Breakfast Counter',
  'Kitchen Accessories',
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
  'Kids Room',
  'Guest Room',
  'Hall',
  'Living Room',
  'Dining Room',
  'Kitchen',
  'Modular Kitchen',
  'Pooja Room',
  'Bathroom',
  'Balcony',
  'Entrance / Foyer',
  'Play Area',
  'Office Room',
  'Store Room',
  'Staircase',
  'Other',
]

import * as XLSX from 'xlsx'

const DEFAULT_NOTES = [
  '15 years Service Warranty',
  'Plywood Used - Premium Ply',
  'Inner Laminate - Half White',
  'Outer Laminate - Customer Choice',
  'Acrylic - Scratch Resistant',
  'Hardwares - EBCO (Soft Closures)',
]

const DEFAULT_TERMS = [
  '1. Given quotation is for the above mentioned products.',
  '2. Electrical work, electrical fittings and civil work not included.',
  '3. Payment: 60% advance on confirmation / 30% on/before door installation / 10% on handover.',
]

const SAMPLE_ITEMS = [
  ['Living Room', 'TV Unit Panelling', '14x9', 1, 126, 450, ''],
  ['', 'TV Unit Box', '6x2', 1, 12, 850, ''],
  ['', 'False Ceiling', '18x14', 1, 252, 85, ''],
  ['Modular Kitchen', 'Base Unit (Acrylic)', '10x2', 1, 20, 1800, ''],
  ['', 'Wall Unit (Acrylic)', '10x2', 1, 20, 1400, ''],
  ['', 'Loft (Acrylic)', '10x2', 1, 20, 1000, ''],
  ['Master Bedroom', 'Wardrobe', '8x8', 1, 64, 1600, ''],
  ['', 'Bedside Table', '2x2', 2, 8, 850, ''],
  ['', '', '', '', '', '', 25000],  // MISC row — only Total filled
]

export function downloadTemplate() {
  const wb = XLSX.utils.book_new()
  const rows = []

  // ── Client info block ──
  rows.push(['Client Name', '', 'Date', '', 'Valid Until', ''])
  rows.push(['Phone', '', 'Created By', ''])
  rows.push(['Address', ''])
  rows.push(['Project Type', 'Residential'])
  rows.push([]) // blank separator

  // ── Column headers ──
  rows.push(['ROOM', 'ITEM', 'SIZE', 'QTY', 'AREA (sqft)', 'RATE (₹)', 'TOTAL (₹)'])

  // ── Sample items ──
  SAMPLE_ITEMS.forEach((item) => rows.push(item))

  rows.push([]) // blank before notes

  // ── Notes ──
  rows.push(['NOTES'])
  DEFAULT_NOTES.forEach((n) => rows.push([n]))

  rows.push([]) // blank before terms

  // ── Terms ──
  rows.push(['TERMS'])
  DEFAULT_TERMS.forEach((t) => rows.push([t]))

  const ws = XLSX.utils.aoa_to_sheet(rows)

  // Column widths
  ws['!cols'] = [
    { wch: 22 }, // A - Room
    { wch: 28 }, // B - Item
    { wch: 10 }, // C - Size
    { wch: 6  }, // D - Qty
    { wch: 12 }, // E - Area
    { wch: 10 }, // F - Rate
    { wch: 12 }, // G - Total
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Quote')
  XLSX.writeFile(wb, 'Dreamspace Quote Template.xlsx')
}

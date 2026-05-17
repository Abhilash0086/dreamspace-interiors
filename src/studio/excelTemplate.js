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

const COL_WIDTHS = [
  { wch: 22 }, // A - Room
  { wch: 28 }, // B - Item
  { wch: 10 }, // C - Size
  { wch: 6  }, // D - Qty
  { wch: 12 }, // E - Area (sqft)
  { wch: 10 }, // F - Rate (₹)
  { wch: 12 }, // G - Total (₹)
]

function buildSheet(withExample) {
  const rows = []

  // ── Client info ──
  rows.push(['Client Name', withExample ? 'Mr. Ravi Kumar' : '', 'Date', withExample ? '2026-05-16' : '', 'Valid Until', withExample ? '2026-06-15' : ''])
  rows.push(['Phone', withExample ? '9876543210' : '', 'Created By', withExample ? 'Aswin' : ''])
  rows.push(['Address', withExample ? 'No. 12, Anna Nagar, Coimbatore' : ''])
  rows.push(['Project Type', withExample ? 'Residential' : 'Residential'])
  rows.push([]) // blank separator

  // ── Column headers ──
  rows.push(['ROOM', 'ITEM', 'SIZE', 'QTY', 'AREA (sqft)', 'RATE (₹)', 'TOTAL (₹)'])

  if (withExample) {
    // No empty rows needed between rooms — just change Room in col A
    rows.push(['Living Room',    'TV Unit Panelling',  '14x9',  1, 126, 450,  ''])
    rows.push(['',               'TV Unit Box',        '6x2',   1, 12,  850,  ''])
    rows.push(['',               'TV Unit',            '5x2',   1, 10,  950,  ''])
    rows.push(['',               'Wall Panelling',     '10x8',  1, 80,  480,  ''])
    rows.push(['',               'False Ceiling',      '18x14', 1, 252, 85,   ''])
    rows.push(['Master Bedroom', 'Wardrobe',           '8x8',   1, 64,  1600, ''])
    rows.push(['',               'Cot with Headboard', '6x4',   1, 24,  950,  ''])
    rows.push(['',               'Bedside Table',      '2x2',   2, 8,   850,  ''])
    rows.push(['',               'Dresser',            '4x5',   1, 20,  1100, ''])
    rows.push(['',               'False Ceiling',      '14x12', 1, 168, 85,   ''])
    rows.push(['Modular Kitchen','Base Unit (Acrylic)', '10x2', 1, 20,  1800, ''])
    rows.push(['',               'Miscellaneous',      '',      '','',  '',   25000])
  } else {
    rows.push(['', '', '', '', '', '', ''])
  }

  rows.push([]) // blank before notes

  // ── Notes ──
  rows.push(['NOTES'])
  DEFAULT_NOTES.forEach((n) => rows.push([n]))

  rows.push([]) // blank before terms

  // ── Terms ──
  rows.push(['TERMS'])
  DEFAULT_TERMS.forEach((t) => rows.push([t]))

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = COL_WIDTHS
  return ws
}

export function downloadTemplate() {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, buildSheet(false), 'Quote')
  XLSX.writeFile(wb, 'Dreamspace Quote Template.xlsx')
}

export function downloadTemplateWithExample() {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, buildSheet(true), 'Quote')
  XLSX.writeFile(wb, 'Dreamspace Quote Template (Example).xlsx')
}

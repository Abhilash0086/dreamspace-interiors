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

const CATEGORIES   = ['Panelling', 'Carcass', 'Loft', 'False Ceiling', 'Carcass BWP', 'Cot', 'Partition', 'Others']
const BRAND_TYPES  = ['Brand', 'Non Brand', 'NA']

// 9-column layout: Room | Item | Category | Brand/Non Brand | Size | Qty | Area (sqft) | Rate (₹) | Total (₹)
const COL_WIDTHS = [
  { wch: 22 }, // A - Room
  { wch: 26 }, // B - Item
  { wch: 16 }, // C - Category
  { wch: 14 }, // D - Brand/Non Brand
  { wch: 10 }, // E - Size
  { wch: 6  }, // F - Qty
  { wch: 12 }, // G - Area (sqft)
  { wch: 10 }, // H - Rate (₹)
  { wch: 12 }, // I - Total (₹)
]

function buildSheet(withExample) {
  const rows = []

  // ── Client info ──
  rows.push(['Client Name', withExample ? 'Mr. Ravi Kumar' : '',   'Date',        withExample ? '2026-05-16' : '', 'Valid Until', withExample ? '2026-06-15' : ''])
  rows.push(['Phone',       withExample ? '9876543210' : '',        'Email',       withExample ? 'ravi@email.com' : '', 'Created By', withExample ? 'Aswin' : ''])
  rows.push(['Project Type', withExample ? 'Residential' : 'Residential'])
  rows.push([]) // blank separator

  // ── Column headers ──
  rows.push(['ROOM', 'ITEM', 'CATEGORY', 'BRAND/NON BRAND', 'SIZE', 'QTY', 'AREA (sqft)', 'RATE (₹)', 'TOTAL (₹)'])

  if (withExample) {
    rows.push(['Living Room',     'TV Unit Panelling',   'Panelling',    'Brand',     '14x9',  1, 126, 450,  ''])
    rows.push(['',                'TV Unit Box',         'Carcass',      'Non Brand', '6x2',   1, 12,  850,  ''])
    rows.push(['',                'TV Unit',             'Carcass',      'Brand',     '5x2',   1, 10,  950,  ''])
    rows.push(['',                'Wall Panelling',      'Panelling',    'Non Brand', '10x8',  1, 80,  480,  ''])
    rows.push(['',                'False Ceiling',       'False Ceiling','NA',        '18x14', 1, 252, 85,   ''])
    rows.push(['Master Bedroom',  'Wardrobe',            'Carcass',      'Brand',     '8x8',   1, 64,  1600, ''])
    rows.push(['',                'Cot with Headboard',  'Cot',          'Brand',     '6x4',   1, 24,  950,  ''])
    rows.push(['',                'Bedside Table',       'Carcass',      'Non Brand', '2x2',   2, 8,   850,  ''])
    rows.push(['',                'Dresser',             'Others',       'Non Brand', '4x5',   1, 20,  1100, ''])
    rows.push(['',                'False Ceiling',       'False Ceiling','NA',        '14x12', 1, 168, 85,   ''])
    rows.push(['Modular Kitchen', 'Base Unit (Acrylic)', 'Carcass BWP',  'Brand',     '10x2',  1, 20,  1800, ''])
    rows.push(['',                'Miscellaneous',       '',             '',          '',      '', '',  '',   25000])
  } else {
    rows.push(['', '', '', '', '', '', '', '', ''])
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

function buildListsSheet() {
  const maxLen = Math.max(CATEGORIES.length, BRAND_TYPES.length)
  const rows = [
    ['CATEGORY', 'BRAND / NON BRAND'],
    ...Array.from({ length: maxLen }, (_, i) => [CATEGORIES[i] || '', BRAND_TYPES[i] || '']),
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 18 }, { wch: 16 }]
  return ws
}

export function downloadTemplate() {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, buildSheet(false), 'Quote')
  XLSX.utils.book_append_sheet(wb, buildListsSheet(), 'Lists')
  XLSX.writeFile(wb, 'Dreamspace Quote Template.xlsx')
}

export function downloadTemplateWithExample() {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, buildSheet(true), 'Quote')
  XLSX.utils.book_append_sheet(wb, buildListsSheet(), 'Lists')
  XLSX.writeFile(wb, 'Dreamspace Quote Template (Example).xlsx')
}

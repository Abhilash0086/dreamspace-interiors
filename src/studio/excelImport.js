import * as XLSX from 'xlsx'
import { parseArea } from './quoteStore'

const uid = () => Math.random().toString(36).slice(2, 9)

function cellVal(ws, row, col) {
  const addr = XLSX.utils.encode_cell({ r: row, c: col })
  const cell = ws[addr]
  return cell ? String(cell.v ?? '').trim() : ''
}

function numVal(ws, row, col) {
  const addr = XLSX.utils.encode_cell({ r: row, c: col })
  const cell = ws[addr]
  if (!cell) return 0
  const n = parseFloat(cell.v)
  return isNaN(n) ? 0 : n
}

export function parseQuoteExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
        const maxRow = range.e.r
        const rows = []
        for (let r = 0; r <= maxRow; r++) {
          rows.push({
            a: cellVal(ws, r, 0),
            b: cellVal(ws, r, 1),
            c: cellVal(ws, r, 2),
            d: cellVal(ws, r, 3),
            e: cellVal(ws, r, 4),
            f: cellVal(ws, r, 5),
            g: cellVal(ws, r, 6),
            h: cellVal(ws, r, 7),
            i: cellVal(ws, r, 8),
            hNum: numVal(ws, r, 7),
            iNum: numVal(ws, r, 8),
            _r: r,
          })
        }

        // ── Find header row ──
        let headerRow = -1
        for (let i = 0; i < rows.length; i++) {
          const a = rows[i].a.toUpperCase()
          const b = rows[i].b.toUpperCase()
          if (a === 'ROOM' || b === 'ITEM' || a === 'ITEM') {
            headerRow = i
            break
          }
        }

        if (headerRow === -1) {
          reject(new Error('Could not find column headers (ROOM / ITEM) in the file. Make sure you are using the correct template.'))
          return
        }

        // ── Validate 9-column format ──
        const colC = rows[headerRow].c.toUpperCase()
        const colD = rows[headerRow].d.toUpperCase()
        const isOldFormat = colC.includes('SIZE') || colC.includes('QTY')
        const missingCategoryCol = !colC.includes('CAT')
        const missingBrandCol = !colD.includes('BRAND') && !colD.includes('NON')

        if (isOldFormat) {
          reject(new Error(
            'This file uses the old 7-column format (Room, Item, Size, Qty, Area, Rate, Total).\n' +
            'Please download the updated template which includes Category and Brand/Non Brand columns.'
          ))
          return
        }

        if (missingCategoryCol || missingBrandCol) {
          const missing = []
          if (missingCategoryCol) missing.push('Category (column C)')
          if (missingBrandCol) missing.push('Brand/Non Brand (column D)')
          reject(new Error(
            `Required columns are missing: ${missing.join(', ')}.\n` +
            'Please download the latest template and ensure columns are in the correct order:\n' +
            'Room | Item | Category | Brand/Non Brand | Size | Qty | Area | Rate | Total'
          ))
          return
        }

        // ── Client info ──
        const client = { name: '', phone: '', email: '', address: '', projectType: 'Residential' }
        let date = new Date().toISOString().split('T')[0]
        const validity = new Date(); validity.setDate(validity.getDate() + 30)
        let validUntil = validity.toISOString().split('T')[0]
        let createdBy = ''

        for (let i = 0; i < headerRow; i++) {
          const row = rows[i]
          const label  = row.a.toUpperCase()
          const val    = row.b
          const label2 = row.c.toUpperCase()
          const val2   = row.d
          const label3 = row.e.toUpperCase()
          const val3   = row.f

          if (label.includes('CLIENT') || label.includes('NAME')) client.name = val
          if (label.includes('PHONE')) client.phone = val
          if (label.includes('EMAIL')) client.email = val
          if (label2.includes('EMAIL')) client.email = val2 || client.email
          if (label3.includes('EMAIL')) client.email = val3 || client.email
          if (label.includes('ADDRESS')) client.address = val
          if (label.includes('PROJECT')) client.projectType = val || 'Residential'

          if (label.includes('DATE') && !label.includes('VALID')) date = val || date
          if (label2.includes('DATE') && !label2.includes('VALID')) date = val2 || date
          if (label3.includes('DATE') && !label3.includes('VALID')) date = val3 || date

          if (label.includes('VALID'))  validUntil = val  || validUntil
          if (label2.includes('VALID')) validUntil = val2 || validUntil
          if (label3.includes('VALID')) validUntil = val3 || validUntil

          if (label.includes('CREATED'))  createdBy = val  || createdBy
          if (label2.includes('CREATED')) createdBy = val2 || createdBy
          if (label3.includes('CREATED')) createdBy = val3 || createdBy
        }

        // ── Parse items, notes, terms ──
        // 9-col: A=Room B=Item C=Category D=Brand E=Size F=Qty G=Area H=Rate I=Total
        const items = []
        const notes = []
        const termLines = []
        const warnings = []
        let mode = 'items'
        let lastRoom = ''

        for (let i = headerRow + 1; i < rows.length; i++) {
          const row = rows[i]
          const aUp = row.a.toUpperCase()

          if (aUp === 'NOTES') { mode = 'notes'; continue }
          if (aUp === 'TERMS') { mode = 'terms'; continue }
          if (mode === 'notes') { if (row.a) notes.push(row.a); continue }
          if (mode === 'terms') { if (row.a) termLines.push(row.a); continue }

          const room     = row.a || lastRoom
          const itemType = row.b
          const category = row.c
          const brand    = row.d
          const size     = row.e
          const qty      = row.f || '1'
          const areaRaw  = parseFloat(row.g) > 0 ? parseFloat(row.g) : 0
          const rateVal  = row.hNum
          const totalVal = row.iNum

          if (!itemType && !totalVal) {
            if (row.a) lastRoom = row.a
            continue
          }
          if (row.a) lastRoom = row.a

          const isMisc = !itemType && totalVal > 0
          const rowLabel = itemType ? `"${itemType}"` : `Row ${i + 1}`

          if (!isMisc) {
            if (!category) warnings.push(`${rowLabel} (${room || 'no room'}): Category is missing`)
            if (!brand)    warnings.push(`${rowLabel} (${room || 'no room'}): Brand/Non Brand is missing`)
          }

          const area = areaRaw > 0 ? areaRaw : parseArea(size, qty)
          const amount = totalVal > 0
            ? totalVal
            : area > 0
              ? +(area * rateVal).toFixed(2)
              : +((parseFloat(qty) || 1) * rateVal).toFixed(2)

          if (!isMisc && amount === 0) {
            warnings.push(`${rowLabel} (${room || 'no room'}): Amount is zero — check Rate and Size/Qty`)
          }

          items.push({
            id:       uid(),
            room:     isMisc ? '' : room,
            itemType: isMisc ? 'Miscellaneous' : (itemType || 'Other'),
            category: isMisc ? '' : (category || ''),
            brand:    isMisc ? '' : (brand || ''),
            size:     size || '',
            qty:      isMisc ? '' : String(qty),
            area:     isMisc ? 0 : area,
            rate:     isMisc ? '' : String(rateVal || ''),
            amount,
          })
        }

        resolve({ client, date, validUntil, createdBy, items, notes, termLines, warnings })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

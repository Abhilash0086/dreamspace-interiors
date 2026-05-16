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
            e: numVal(ws, r, 4),
            f: numVal(ws, r, 5),
            g: numVal(ws, r, 6),
            _r: r,
          })
        }

        // ── Find header row (contains "ROOM" or "ITEM" in col A or B) ──
        let headerRow = -1
        for (let i = 0; i < rows.length; i++) {
          const a = rows[i].a.toUpperCase()
          const b = rows[i].b.toUpperCase()
          if (a === 'ROOM' || b === 'ITEM' || a === 'ITEM') {
            headerRow = i
            break
          }
        }

        // ── Client info: rows before header ──
        const client = { name: '', phone: '', email: '', address: '', projectType: 'Residential' }
        let date = new Date().toISOString().split('T')[0]
        const validity = new Date(); validity.setDate(validity.getDate() + 30)
        let validUntil = validity.toISOString().split('T')[0]
        let createdBy = ''

        for (let i = 0; i < (headerRow === -1 ? rows.length : headerRow); i++) {
          const label = rows[i].a.toUpperCase()
          const val = rows[i].b
          const label2 = rows[i].c.toUpperCase()
          const val2 = rows[i].d
          const label3 = rows[i].e ? String(rows[i].e) : rows[i].a
          // handle multi-column info rows
          if (label.includes('CLIENT') || label.includes('NAME')) client.name = val
          if (label.includes('PHONE')) client.phone = val
          if (label.includes('ADDRESS')) client.address = val
          if (label.includes('PROJECT')) client.projectType = val || 'Residential'
          if (label.includes('DATE') && !label.includes('VALID')) date = val || date
          if (label2.includes('DATE') && !label2.includes('VALID')) date = val2 || date
          if (label.includes('VALID') || label2.includes('VALID')) validUntil = val2 || val || validUntil
          if (label.includes('CREATED') || label2.includes('CREATED')) createdBy = val2 || val
          // also check col C/D/E/F for date/valid/created
          const label4 = rows[i].c.toUpperCase()
          const val4d = rows[i].d
          if (label4.includes('DATE') && !label4.includes('VALID')) date = val4d || date
          if (label4.includes('VALID')) validUntil = val4d || validUntil
          if (label4.includes('CREATED')) createdBy = val4d || createdBy
          // col E as label, col F as value (for 3-pair rows)
          const eLabel = String(numVal(ws, i, 4) || cellVal(ws, i, 4)).toUpperCase()
          const fVal = cellVal(ws, i, 5)
          if (eLabel.includes('VALID')) validUntil = fVal || validUntil
        }

        if (headerRow === -1) {
          reject(new Error('Could not find item headers (ROOM / ITEM columns) in the file.'))
          return
        }

        // ── Parse items, notes, terms after header row ──
        const items = []
        const notes = []
        const termLines = []
        let mode = 'items' // 'items' | 'notes' | 'terms'
        let lastRoom = ''

        for (let i = headerRow + 1; i < rows.length; i++) {
          const row = rows[i]
          const aUp = row.a.toUpperCase()

          if (aUp === 'NOTES') { mode = 'notes'; continue }
          if (aUp === 'TERMS') { mode = 'terms'; continue }

          if (mode === 'notes') {
            if (row.a) notes.push(row.a)
            continue
          }
          if (mode === 'terms') {
            if (row.a) termLines.push(row.a)
            continue
          }

          // items mode
          const room = row.a || lastRoom
          const itemType = row.b
          const size = row.c
          const qty = row.d ? String(row.d) : '1'
          const rateVal = row.f
          const totalVal = row.g

          // Skip fully blank rows and section header rows (room label, no item)
          if (!itemType && !totalVal) {
            if (row.a) lastRoom = row.a // it's a room section label
            continue
          }

          if (row.a) lastRoom = row.a

          // Determine if misc (no size/rate, just total)
          const isMisc = !itemType && totalVal > 0

          let area = row.e > 0 ? row.e : parseArea(size, qty)
          let amount = totalVal > 0
            ? totalVal
            : area > 0
              ? +(area * rateVal).toFixed(2)
              : +((parseFloat(qty) || 1) * rateVal).toFixed(2)

          items.push({
            id: uid(),
            room: isMisc ? '' : room,
            itemType: isMisc ? 'Miscellaneous' : (itemType || 'Other'),
            size: size || '',
            qty: isMisc ? '' : qty,
            area: isMisc ? 0 : area,
            rate: isMisc ? '' : String(rateVal || ''),
            amount,
          })
        }

        resolve({ client, date, validUntil, createdBy, items, notes, termLines })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

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
            eNum: numVal(ws, r, 4),
            fNum: numVal(ws, r, 5),
            gNum: numVal(ws, r, 6),
            hNum: numVal(ws, r, 7),
            iNum: numVal(ws, r, 8),
            _r: r,
          })
        }

        // ── Find header row ──
        let headerRow = -1
        let newFormat = false // 9-col format with Category + Brand
        for (let i = 0; i < rows.length; i++) {
          const a = rows[i].a.toUpperCase()
          const b = rows[i].b.toUpperCase()
          const c = rows[i].c.toUpperCase()
          if (a === 'ROOM' || b === 'ITEM' || a === 'ITEM') {
            headerRow = i
            // Detect new 9-column format: col C is CATEGORY
            newFormat = c.includes('CATEGORY') || c.includes('CAT')
            break
          }
        }

        // ── Client info ──
        const client = { name: '', phone: '', email: '', address: '', projectType: 'Residential' }
        let date = new Date().toISOString().split('T')[0]
        const validity = new Date(); validity.setDate(validity.getDate() + 30)
        let validUntil = validity.toISOString().split('T')[0]
        let createdBy = ''

        for (let i = 0; i < (headerRow === -1 ? rows.length : headerRow); i++) {
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
          if (label.includes('ADDRESS')) client.address = val
          if (label.includes('PROJECT')) client.projectType = val || 'Residential'

          if (label.includes('DATE') && !label.includes('VALID')) date = val || date
          if (label2.includes('DATE') && !label2.includes('VALID')) date = val2 || date
          if (label3.includes('DATE') && !label3.includes('VALID')) date = val3 || date

          if (label.includes('VALID')) validUntil = val || validUntil
          if (label2.includes('VALID')) validUntil = val2 || validUntil
          if (label3.includes('VALID')) validUntil = val3 || validUntil

          if (label.includes('CREATED')) createdBy = val || createdBy
          if (label2.includes('CREATED')) createdBy = val2 || createdBy
          if (label3.includes('CREATED')) createdBy = val3 || createdBy

          if (label2.includes('EMAIL')) client.email = val2 || client.email
          if (label3.includes('EMAIL')) client.email = val3 || client.email
        }

        if (headerRow === -1) {
          reject(new Error('Could not find item headers (ROOM / ITEM columns) in the file.'))
          return
        }

        // ── Parse items ──
        // New format (9 cols): A=Room B=Item C=Category D=Brand E=Size F=Qty G=Area H=Rate I=Total
        // Old format (7 cols): A=Room B=Item C=Size D=Qty E=Area F=Rate G=Total
        const items = []
        const notes = []
        const termLines = []
        let mode = 'items'
        let lastRoom = ''

        for (let i = headerRow + 1; i < rows.length; i++) {
          const row = rows[i]
          const aUp = row.a.toUpperCase()

          if (aUp === 'NOTES') { mode = 'notes'; continue }
          if (aUp === 'TERMS') { mode = 'terms'; continue }

          if (mode === 'notes') { if (row.a) notes.push(row.a); continue }
          if (mode === 'terms') { if (row.a) termLines.push(row.a); continue }

          // items mode — column mapping depends on format
          const room     = row.a || lastRoom
          const itemType = row.b

          let category, brand, size, qty, rateVal, totalVal

          if (newFormat) {
            category = row.c
            brand    = row.d
            size     = row.e
            qty      = row.f || '1'
            // area col G may be pre-filled or we compute it
            rateVal  = row.hNum
            totalVal = row.iNum
          } else {
            category = ''
            brand    = ''
            size     = row.c
            qty      = row.d || '1'
            rateVal  = row.fNum
            totalVal = row.gNum
          }

          if (!itemType && !totalVal) {
            if (row.a) lastRoom = row.a
            continue
          }
          if (row.a) lastRoom = row.a

          const isMisc = !itemType && totalVal > 0
          const area = newFormat
            ? (parseFloat(row.g) > 0 ? parseFloat(row.g) : parseArea(size, qty))
            : (row.eNum > 0 ? row.eNum : parseArea(size, qty))

          const amount = totalVal > 0
            ? totalVal
            : area > 0
              ? +(area * rateVal).toFixed(2)
              : +((parseFloat(qty) || 1) * rateVal).toFixed(2)

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

        resolve({ client, date, validUntil, createdBy, items, notes, termLines })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

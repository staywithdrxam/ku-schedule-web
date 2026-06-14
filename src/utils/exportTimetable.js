import { THEMES, LIGHT_THEMES } from '../themes'
import { DAYS, DAY_FULL, TIMES, t2m } from '../constants'

const START_M = 7 * 60
const END_M   = 20 * 60
const TOTAL_M = END_M - START_M

const DAY_PASTEL_DARK  = [
  'rgba(120,160,255,0.10)','rgba(255,140,180,0.10)','rgba(100,220,160,0.10)',
  'rgba(255,190,100,0.10)','rgba(200,150,255,0.10)','rgba(100,220,220,0.10)',
  'rgba(255,200,140,0.10)',
]
const DAY_PASTEL_LIGHT = [
  'rgba(100,140,255,0.13)','rgba(255,100,160,0.13)','rgba(60,200,130,0.13)',
  'rgba(255,160,60,0.13)','rgba(170,100,255,0.13)','rgba(40,200,200,0.13)',
  'rgba(255,160,100,0.13)',
]
const DAY_HEADER_DARK  = ['#6ea8ff','#ff8ab4','#5cd89a','#ffb84a','#c084fc','#34d4d4','#ffb07a']
const DAY_HEADER_LIGHT = ['#3b7eff','#e0457a','#28a870','#d97706','#7c3aed','#0891b2','#c2410c']

export function exportTimetable({ schedule, conflicts, theme, semester }) {
  // A3 landscape @ 150 dpi-ish  →  4200 × 2970  → scale down to print nicely
  const W = 4200
  const H = 2970

  const canvas = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const t       = THEMES[theme] || THEMES.Dark
  const isLight = LIGHT_THEMES.has(theme)
  const DAY_BG  = isLight ? DAY_PASTEL_LIGHT : DAY_PASTEL_DARK
  const DAY_HDR = isLight ? DAY_HEADER_LIGHT : DAY_HEADER_DARK

  const LABEL_W = 110
  const INFO_H  = 80
  const HEAD_H  = 80
  const FOOT_H  = 56
  const CELL_W  = (W - LABEL_W) / DAYS.length
  const CELL_H  = H - INFO_H - HEAD_H - FOOT_H
  const TOP     = INFO_H  // where the timetable area starts

  const f = (size, bold = false) =>
    `${bold ? 'bold ' : ''}${size}px 'Noto Sans Thai', sans-serif`

  // ── Background ──────────────────────────────────────────────────────
  ctx.fillStyle = t.BG
  ctx.fillRect(0, 0, W, H)

  // ── Info bar ─────────────────────────────────────────────────────────
  ctx.fillStyle = t.CARD
  ctx.fillRect(0, 0, W, INFO_H)
  ctx.fillStyle = t.ACCENT
  ctx.fillRect(0, 0, W, 6)   // accent stripe top

  const totalCr    = schedule.reduce((s, c) => s + (Number(c.credits) || 0), 0)
  const totalSlots = schedule.reduce((s, c) => s + (c.slots || []).length, 0)

  ctx.fillStyle = t.TEXT
  ctx.font = f(28, true)
  ctx.textAlign = 'left'
  ctx.fillText('ตารางเรียน', 24, INFO_H / 2 + 10)

  ctx.fillStyle = t.MUTED
  ctx.font = f(22)
  ctx.fillText(
    `${semester}   ·   ${schedule.length} วิชา   ·   ${totalCr} หน่วยกิต   ·   ${totalSlots} คาบ/สัปดาห์`,
    280, INFO_H / 2 + 10
  )

  const now     = new Date()
  const dateStr = `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()+543}`
  ctx.textAlign = 'right'
  ctx.font = f(20)
  ctx.fillText(dateStr, W - 24, INFO_H / 2 + 10)

  // ── Day column tinted backgrounds ────────────────────────────────────
  DAYS.forEach((_, di) => {
    ctx.fillStyle = DAY_BG[di]
    ctx.fillRect(LABEL_W + di * CELL_W, TOP + HEAD_H, CELL_W, CELL_H)
  })

  // ── Horizontal grid lines ────────────────────────────────────────────
  const marks = TIMES.map(tm => t2m(tm))
  marks.forEach(m => {
    if (m < START_M || m > END_M) return
    const y      = TOP + HEAD_H + ((m - START_M) / TOTAL_M) * CELL_H
    const isHour = m % 60 === 0
    ctx.strokeStyle = isHour ? t.GRID_MAJOR : t.GRID_MINOR
    ctx.lineWidth   = isHour ? 1.5 : 0.7
    ctx.beginPath(); ctx.moveTo(LABEL_W, y); ctx.lineTo(W, y); ctx.stroke()
    if (isHour) {
      ctx.fillStyle = t.MUTED
      ctx.font      = f(20, true)
      ctx.textAlign = 'right'
      ctx.fillText(`${Math.floor(m / 60)}:00`, LABEL_W - 10, y + 8)
    }
  })

  // ── Vertical separators ──────────────────────────────────────────────
  DAYS.forEach((_, di) => {
    const x = LABEL_W + di * CELL_W
    ctx.strokeStyle = t.GRID_MAJOR; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(x, TOP); ctx.lineTo(x, TOP + HEAD_H + CELL_H); ctx.stroke()
  })
  ctx.beginPath(); ctx.moveTo(W, TOP);      ctx.lineTo(W, TOP + HEAD_H + CELL_H); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(LABEL_W, TOP); ctx.lineTo(LABEL_W, TOP + HEAD_H + CELL_H); ctx.stroke()

  // ── Day headers ──────────────────────────────────────────────────────
  DAYS.forEach((d, di) => {
    const x0 = LABEL_W + di * CELL_W
    const cx  = x0 + CELL_W / 2
    ctx.fillStyle = DAY_BG[di]
    ctx.fillRect(x0, TOP, CELL_W, HEAD_H)
    // accent bar bottom of header
    ctx.fillStyle = DAY_HDR[di]
    ctx.globalAlpha = 0.7
    ctx.fillRect(x0 + 10, TOP + HEAD_H - 6, CELL_W - 20, 6)
    ctx.globalAlpha = 1
    ctx.fillStyle  = DAY_HDR[di]
    ctx.font       = f(26, true)
    ctx.textAlign  = 'center'
    ctx.fillText(DAY_FULL[d] || d, cx, TOP + HEAD_H / 2 + 10)
  })

  // header bottom border
  ctx.strokeStyle = t.GRID_MAJOR; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(0, TOP + HEAD_H); ctx.lineTo(W, TOP + HEAD_H); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, TOP);           ctx.lineTo(W, TOP);           ctx.stroke()

  // ── Course blocks ────────────────────────────────────────────────────
  schedule.forEach((course, ci) => {
    const isConflict = conflicts.has(ci)
    ;(course.slots || []).forEach(slot => {
      const di = DAYS.indexOf(slot.day); if (di < 0) return
      const sM = t2m(slot.start), eM = t2m(slot.end)
      if (eM <= START_M || sM >= END_M) return
      const y0 = TOP + HEAD_H + ((Math.max(sM, START_M) - START_M) / TOTAL_M) * CELL_H
      const y1 = TOP + HEAD_H + ((Math.min(eM, END_M)   - START_M) / TOTAL_M) * CELL_H
      const PAD = 6
      const x0  = LABEL_W + di * CELL_W + PAD
      const bw  = CELL_W - PAD * 2
      const bh  = y1 - y0 - 3

      ctx.shadowColor = 'rgba(0,0,0,0.22)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4
      ctx.globalAlpha = 0.92
      ctx.fillStyle   = course.color || '#b4d4ff'
      rr(ctx, x0, y0, bw, bh, 10); ctx.fill()
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
      ctx.globalAlpha = 1

      // left accent stripe
      ctx.fillStyle   = darken(course.color || '#b4d4ff', 0.28)
      ctx.globalAlpha = 0.85
      ctx.fillRect(x0, y0 + 6, 6, bh - 12)
      ctx.globalAlpha = 1

      if (isConflict) {
        ctx.globalAlpha = 0.2; ctx.fillStyle = '#ff4444'
        rr(ctx, x0, y0, bw, bh, 10); ctx.fill()
        ctx.globalAlpha = 1; ctx.strokeStyle = '#ff4444'; ctx.lineWidth = 3
        rr(ctx, x0, y0, bw, bh, 10); ctx.stroke()
      }

      // text
      ctx.globalAlpha = 0.95
      ctx.fillStyle   = isLight ? '#111827' : '#0d0d1a'
      ctx.textAlign   = 'center'
      if (bh > 30) {
        ctx.font = f(22, true)
        ctx.fillText((course.code || course.name || '').substring(0, 12), x0 + bw/2, y0 + 28, bw - 16)
      }
      if (bh > 58 && course.name) {
        ctx.font = f(19); ctx.globalAlpha = 0.72
        const nm = course.name.length > 14 ? course.name.substring(0, 13) + '…' : course.name
        ctx.fillText(nm, x0 + bw/2, y0 + 50, bw - 16)
        ctx.globalAlpha = 0.95
      }
      if (bh > 80 && slot.room) {
        ctx.font = f(18); ctx.globalAlpha = 0.6
        ctx.fillText(slot.room.substring(0, 12), x0 + bw/2, y0 + 70, bw - 16)
      }
      ctx.globalAlpha = 1
    })
  })

  // ── Footer ───────────────────────────────────────────────────────────
  const fy = TOP + HEAD_H + CELL_H
  ctx.fillStyle = t.CARD
  ctx.fillRect(0, fy, W, FOOT_H)
  ctx.fillStyle = t.ACCENT
  ctx.fillRect(0, H - 5, W, 5)

  ctx.fillStyle  = t.MUTED
  ctx.font       = f(18)
  ctx.textAlign  = 'left'
  ctx.fillText('by น้องดรีม · วิทย์คอม ปี 2 ม.เกษตรศาสตร์ กำแพงแสน', 24, fy + FOOT_H/2 + 7)
  ctx.textAlign  = 'right'
  ctx.fillText('Schedule Planner', W - 24, fy + FOOT_H/2 + 7)

  // ── Download as PNG ──────────────────────────────────────────────────
  const url  = canvas.toDataURL('image/png')
  const a    = document.createElement('a')
  a.href     = url
  a.download = `ตารางเรียน_${dateStr.replace(/\//g, '-')}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w/2, h/2)
  ctx.beginPath()
  ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y, x+w, y+r)
  ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h)
  ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r)
  ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y)
  ctx.closePath()
}

function darken(hex, amt) {
  try {
    const n = parseInt(hex.replace('#', ''), 16)
    const r = Math.max(0, (n >> 16) - Math.round(amt * 255))
    const g = Math.max(0, ((n >> 8) & 0xff) - Math.round(amt * 255))
    const b = Math.max(0, (n & 0xff) - Math.round(amt * 255))
    return `rgb(${r},${g},${b})`
  } catch { return hex }
}

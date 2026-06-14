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
  // Horizontal layout: days = rows, time = columns (matches screen timetable)
  const W       = 4800
  const INFO_H  = 110   // top info bar
  const LABEL_W = 170   // day label column on left
  const HEAD_H  = 90    // time header row
  const ROW_H   = 270   // height per day row — generous for readability
  const FOOT_H  = 70
  const H       = INFO_H + HEAD_H + DAYS.length * ROW_H + FOOT_H
  const TIME_W  = W - LABEL_W

  const canvas = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const t       = THEMES[theme] || THEMES.Dark
  const isLight = LIGHT_THEMES.has(theme)
  const DAY_BG  = isLight ? DAY_PASTEL_LIGHT : DAY_PASTEL_DARK
  const DAY_HDR = isLight ? DAY_HEADER_LIGHT : DAY_HEADER_DARK

  const f = (size, bold = false) =>
    `${bold ? '700 ' : '400 '}${size}px 'Noto Sans Thai', sans-serif`

  const TIMETABLE_TOP = INFO_H

  // ── Background ────────────────────────────────────────────
  ctx.fillStyle = t.CANVAS_BG || t.BG
  ctx.fillRect(0, 0, W, H)

  // ── Info bar ──────────────────────────────────────────────
  ctx.fillStyle = t.CARD || t.BG
  ctx.fillRect(0, 0, W, INFO_H)
  ctx.fillStyle = t.ACCENT
  ctx.fillRect(0, 0, W, 7)

  const totalCr    = schedule.reduce((s, c) => s + (Number(c.credits) || 0), 0)
  const totalSlots = schedule.reduce((s, c) => s + (c.slots || []).length, 0)

  ctx.fillStyle = t.TEXT
  ctx.font = f(36, true)
  ctx.textAlign = 'left'
  ctx.fillText('ตารางเรียน', 28, INFO_H / 2 + 13)

  ctx.fillStyle = t.MUTED
  ctx.font = f(26)
  ctx.fillText(
    `${semester}   ·   ${schedule.length} วิชา   ·   ${totalCr} หน่วยกิต   ·   ${totalSlots} คาบ/สัปดาห์`,
    340, INFO_H / 2 + 13
  )

  const now     = new Date()
  const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear() + 543}`
  ctx.textAlign = 'right'
  ctx.font = f(24)
  ctx.fillText(dateStr, W - 28, INFO_H / 2 + 13)

  // ── Day row tinted backgrounds ────────────────────────────
  DAYS.forEach((_, di) => {
    ctx.fillStyle = DAY_BG[di]
    ctx.fillRect(LABEL_W, TIMETABLE_TOP + HEAD_H + di * ROW_H, TIME_W, ROW_H)
  })

  // ── Vertical time grid + time labels ─────────────────────
  TIMES.map(tm => t2m(tm)).forEach(m => {
    if (m < START_M || m > END_M) return
    const x      = LABEL_W + ((m - START_M) / TOTAL_M) * TIME_W
    const isHour = m % 60 === 0
    ctx.strokeStyle = isHour ? t.GRID_MAJOR : t.GRID_MINOR
    ctx.lineWidth   = isHour ? 1.5 : 0.6
    ctx.beginPath()
    ctx.moveTo(x, TIMETABLE_TOP + HEAD_H)
    ctx.lineTo(x, TIMETABLE_TOP + HEAD_H + DAYS.length * ROW_H)
    ctx.stroke()

    if (isHour) {
      const hh     = String(Math.floor(m / 60)).padStart(2, '0')
      const labelY = TIMETABLE_TOP + HEAD_H / 2 + 10
      ctx.fillStyle = t.MUTED
      ctx.font      = f(26, true)
      if (m === START_M) {
        ctx.textAlign = 'left'
        ctx.fillText(`${hh}:00`, x + 4, labelY)
      } else if (m === END_M) {
        ctx.textAlign = 'right'
        ctx.fillText(`${hh}:00`, x - 4, labelY)
      } else {
        ctx.textAlign = 'center'
        ctx.fillText(`${hh}:00`, x, labelY)
      }
    }
  })

  // ── Horizontal day separator lines ────────────────────────
  for (let di = 0; di <= DAYS.length; di++) {
    const y = TIMETABLE_TOP + HEAD_H + di * ROW_H
    ctx.strokeStyle = t.GRID_MAJOR
    ctx.lineWidth   = di === 0 || di === DAYS.length ? 1.5 : 0.8
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  // ── Day label column ──────────────────────────────────────
  DAYS.forEach((d, di) => {
    const y0 = TIMETABLE_TOP + HEAD_H + di * ROW_H
    const cy = y0 + ROW_H / 2

    // row bg tint in label area
    ctx.fillStyle = DAY_BG[di]
    ctx.fillRect(0, y0, LABEL_W, ROW_H)

    // left accent bar
    ctx.fillStyle   = DAY_HDR[di]
    ctx.globalAlpha = 0.9
    ctx.fillRect(0, y0 + 12, 7, ROW_H - 24)
    ctx.globalAlpha = 1

    // day name full Thai
    ctx.fillStyle = DAY_HDR[di]
    ctx.font      = f(28, true)
    ctx.textAlign = 'center'
    ctx.fillText(DAY_FULL[d] || d, LABEL_W / 2, cy + 10)
  })

  // ── Corner cell ───────────────────────────────────────────
  ctx.fillStyle = t.CANVAS_BG || t.BG
  ctx.fillRect(0, TIMETABLE_TOP, LABEL_W, HEAD_H)
  ctx.fillStyle = t.MUTED
  ctx.font      = f(22, true)
  ctx.textAlign = 'center'
  ctx.fillText('วัน', LABEL_W / 2, TIMETABLE_TOP + HEAD_H / 2 - 4)
  ctx.fillText('เวลา', LABEL_W / 2, TIMETABLE_TOP + HEAD_H / 2 + 24)

  // ── Border lines ──────────────────────────────────────────
  ctx.strokeStyle = t.GRID_MAJOR; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(0, TIMETABLE_TOP + HEAD_H); ctx.lineTo(W, TIMETABLE_TOP + HEAD_H); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(LABEL_W, TIMETABLE_TOP); ctx.lineTo(LABEL_W, TIMETABLE_TOP + HEAD_H + DAYS.length * ROW_H); ctx.stroke()

  // ── Course blocks ─────────────────────────────────────────
  schedule.forEach((course, ci) => {
    const isConflict = conflicts.has(ci)
    ;(course.slots || []).forEach(slot => {
      const di = DAYS.indexOf(slot.day)
      if (di < 0) return
      const sM = t2m(slot.start), eM = t2m(slot.end)
      if (eM <= START_M || sM >= END_M) return

      const PAD = 5
      const x0  = LABEL_W + ((Math.max(sM, START_M) - START_M) / TOTAL_M) * TIME_W + PAD
      const x1  = LABEL_W + ((Math.min(eM, END_M)   - START_M) / TOTAL_M) * TIME_W - PAD
      const y0  = TIMETABLE_TOP + HEAD_H + di * ROW_H + PAD
      const bw  = x1 - x0
      const bh  = ROW_H - PAD * 2
      if (bw <= 0) return

      const base = course.color || '#b4d4ff'

      // Shadow + fill
      ctx.shadowColor   = 'rgba(0,0,0,0.22)'
      ctx.shadowBlur    = 14
      ctx.shadowOffsetY = 4
      ctx.globalAlpha   = 0.93
      ctx.fillStyle     = base
      rr(ctx, x0, y0, bw, bh, 12); ctx.fill()
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
      ctx.globalAlpha = 1

      // Top accent stripe
      ctx.fillStyle   = darken(base, 0.25)
      ctx.globalAlpha = 0.8
      rr(ctx, x0, y0, bw, 8, 4); ctx.fill()
      ctx.globalAlpha = 1

      // Conflict overlay
      if (isConflict) {
        ctx.globalAlpha = 0.2; ctx.fillStyle = '#ff4444'
        rr(ctx, x0, y0, bw, bh, 12); ctx.fill()
        ctx.globalAlpha = 1; ctx.strokeStyle = '#ff4444'; ctx.lineWidth = 3
        rr(ctx, x0, y0, bw, bh, 12); ctx.stroke()
      }

      // ── Text ──
      const tc  = isLight ? '#111827' : '#0d0d1a'
      const tx  = x0 + 14
      const avW = bw - 28
      ctx.textAlign = 'left'

      // Time range (small, top)
      ctx.font        = f(20)
      ctx.fillStyle   = tc
      ctx.globalAlpha = 0.55
      ctx.fillText(`${slot.start} – ${slot.end}`, tx, y0 + 26, avW)
      ctx.globalAlpha = 1

      // Code (large bold)
      if (bh > 40) {
        ctx.font      = f(36, true)
        ctx.fillStyle = tc
        ctx.fillText((course.code || course.name || '').substring(0, 13), tx, y0 + 72, avW)
      }

      // Name
      if (bh > 86 && course.name) {
        ctx.font        = f(26)
        ctx.globalAlpha = 0.75
        const nm = course.name.length > 22 ? course.name.substring(0, 21) + '…' : course.name
        ctx.fillText(nm, tx, y0 + 108, avW)
        ctx.globalAlpha = 1
      }

      // Room
      if (bh > 120 && slot.room) {
        ctx.font        = f(22)
        ctx.globalAlpha = 0.6
        ctx.fillText(slot.room.substring(0, 18), tx, y0 + 140, avW)
        ctx.globalAlpha = 1
      }

      // Instructor
      if (bh > 155 && course.instructor) {
        ctx.font        = f(22)
        ctx.globalAlpha = 0.55
        ctx.fillText(course.instructor.substring(0, 22), tx, y0 + 168, avW)
        ctx.globalAlpha = 1
      }

      // Section badge (top-right)
      if (course.section) {
        ctx.font        = f(20, true)
        ctx.fillStyle   = tc
        ctx.globalAlpha = 0.6
        ctx.textAlign   = 'right'
        ctx.fillText(`หมู่ ${course.section}`, x0 + bw - 10, y0 + 26, 120)
        ctx.textAlign   = 'left'
        ctx.globalAlpha = 1
      }

      // LAB badge
      if (slot.isLab) {
        ctx.font        = f(18, true)
        ctx.fillStyle   = '#5b21b6'
        ctx.globalAlpha = 0.85
        ctx.textAlign   = 'right'
        ctx.fillText('LAB', x0 + bw - 10, y0 + 50)
        ctx.textAlign   = 'left'
        ctx.globalAlpha = 1
      }
    })
  })

  // ── Footer ────────────────────────────────────────────────
  const fy = TIMETABLE_TOP + HEAD_H + DAYS.length * ROW_H
  ctx.fillStyle = t.CARD || t.BG
  ctx.fillRect(0, fy, W, FOOT_H)
  ctx.fillStyle = t.ACCENT
  ctx.fillRect(0, H - 6, W, 6)

  ctx.fillStyle = t.MUTED
  ctx.font      = f(22)
  ctx.textAlign = 'left'
  ctx.fillText('by น้องดรีม · วิทย์คอม ปี 2 ม.เกษตรศาสตร์ กำแพงแสน', 28, fy + FOOT_H / 2 + 8)
  ctx.textAlign = 'right'
  ctx.font      = f(20)
  ctx.fillText('powered by staywithdrxam · Schedule Planner', W - 28, fy + FOOT_H / 2 + 8)

  // ── Download ──────────────────────────────────────────────
  const url  = canvas.toDataURL('image/png')
  const a    = document.createElement('a')
  a.href     = url
  a.download = `ตารางเรียน_${dateStr.replace(/\//g, '-')}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y)
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

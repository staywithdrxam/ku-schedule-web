import { THEMES, LIGHT_THEMES } from '../themes'
import { DAYS, TIMES, t2m } from '../constants'

const START_M = 7 * 60
const END_M   = 20 * 60
const TOTAL_M = END_M - START_M

const DAY_EN = { จ:'MON', อ:'TUE', พ:'WED', พฤ:'THU', ศ:'FRI', ส:'SAT', อา:'SUN' }

const DAY_PASTEL_DARK  = [
  'rgba(120,160,255,0.10)','rgba(255,140,180,0.10)','rgba(100,220,160,0.10)',
  'rgba(255,190,100,0.10)','rgba(200,150,255,0.10)','rgba(100,220,220,0.10)',
  'rgba(255,200,140,0.10)',
]
const DAY_PASTEL_LIGHT = [
  'rgba(100,140,255,0.10)','rgba(255,100,160,0.10)','rgba(60,200,130,0.10)',
  'rgba(255,160,60,0.10)','rgba(170,100,255,0.10)','rgba(40,200,200,0.10)',
  'rgba(255,160,100,0.10)',
]
const DAY_HEADER_DARK  = ['#6ea8ff','#ff8ab4','#5cd89a','#ffb84a','#c084fc','#34d4d4','#ffb07a']
const DAY_HEADER_LIGHT = ['#3b7eff','#e0457a','#28a870','#d97706','#7c3aed','#0891b2','#c2410c']

function loadImg(src) {
  return new Promise((res) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = () => res(null)
    img.src = src
  })
}

export async function exportTimetable({ schedule, conflicts, theme, semester }) {
  const logo = await loadImg('/KU_SubLogo.png')

  const W       = 4800
  const INFO_H  = 130
  const LABEL_W = 160
  const HEAD_H  = 76
  const ROW_H   = 260
  const FOOT_H  = 70
  const H       = INFO_H + HEAD_H + DAYS.length * ROW_H + FOOT_H
  const TIME_W  = W - LABEL_W

  const canvas = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const t       = THEMES[theme] || THEMES.Light
  const isLight = LIGHT_THEMES.has(theme)
  const DAY_BG  = isLight ? DAY_PASTEL_LIGHT : DAY_PASTEL_DARK
  const DAY_HDR = isLight ? DAY_HEADER_LIGHT : DAY_HEADER_DARK

  const f = (size, w = 400) => `${w} ${size}px 'Noto Sans Thai', sans-serif`
  const TIMETABLE_TOP = INFO_H
  const now = new Date()
  const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear() + 543}`
  const yearBE = now.getFullYear() + 543
  const semShort = semester.replace('การศึกษา', '').trim()

  // ── Background ──────────────────────────────────────────
  ctx.fillStyle = t.CANVAS_BG || t.BG
  ctx.fillRect(0, 0, W, H)

  // ── Info bar ─────────────────────────────────────────────
  ctx.fillStyle = t.CARD || t.BG
  ctx.fillRect(0, 0, W, INFO_H)
  // top accent stripe
  ctx.fillStyle = t.ACCENT
  ctx.fillRect(0, 0, W, 8)
  // bottom border
  ctx.strokeStyle = t.GRID_MAJOR; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(0, INFO_H); ctx.lineTo(W, INFO_H); ctx.stroke()

  // KU Logo
  if (logo) {
    const lh = 80, lw = lh * (logo.width / logo.height)
    ctx.drawImage(logo, 28, (INFO_H - lh) / 2, lw, lh)
  }

  // Title: year/semester
  ctx.fillStyle = t.TEXT
  ctx.font = f(52, 800)
  ctx.textAlign = 'center'
  ctx.fillText(`${yearBE} / ${semShort}`, W / 2, INFO_H / 2 + 18)

  // Right: "Schedule Planner"
  ctx.font = f(30, 700)
  ctx.textAlign = 'right'
  ctx.fillStyle = t.MUTED
  ctx.fillText('Schedule Planner', W - 32, INFO_H / 2 + 12)

  // ── Day row tinted backgrounds ────────────────────────────
  DAYS.forEach((_, di) => {
    ctx.fillStyle = DAY_BG[di]
    ctx.fillRect(LABEL_W, TIMETABLE_TOP + HEAD_H + di * ROW_H, TIME_W, ROW_H)
  })

  // ── Vertical time grid + time labels ─────────────────────
  TIMES.map(tm => t2m(tm)).forEach(m => {
    if (m < START_M || m > END_M) return
    const x = LABEL_W + ((m - START_M) / TOTAL_M) * TIME_W
    const isHour = m % 60 === 0
    ctx.strokeStyle = isHour ? t.GRID_MAJOR : t.GRID_MINOR
    ctx.lineWidth   = isHour ? 1.2 : 0.5
    ctx.beginPath()
    ctx.moveTo(x, TIMETABLE_TOP + HEAD_H)
    ctx.lineTo(x, TIMETABLE_TOP + HEAD_H + DAYS.length * ROW_H)
    ctx.stroke()

    if (isHour) {
      const hh = Math.floor(m / 60)
      const labelY = TIMETABLE_TOP + HEAD_H / 2 + 10
      ctx.fillStyle = t.MUTED
      ctx.font = f(24, 600)
      if (m === START_M) {
        ctx.textAlign = 'left'; ctx.fillText(`${hh}:00`, x + 4, labelY)
      } else if (m === END_M) {
        ctx.textAlign = 'right'; ctx.fillText(`${hh}:00`, x - 4, labelY)
      } else {
        ctx.textAlign = 'center'; ctx.fillText(`${hh}:00`, x, labelY)
      }
    }
  })

  // ── Horizontal day separator lines ────────────────────────
  for (let di = 0; di <= DAYS.length; di++) {
    const y = TIMETABLE_TOP + HEAD_H + di * ROW_H
    ctx.strokeStyle = t.GRID_MAJOR
    ctx.lineWidth = di === 0 || di === DAYS.length ? 1.5 : 0.8
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  // ── Day label column ──────────────────────────────────────
  DAYS.forEach((d, di) => {
    const y0 = TIMETABLE_TOP + HEAD_H + di * ROW_H
    const cy = y0 + ROW_H / 2

    ctx.fillStyle = DAY_BG[di]
    ctx.fillRect(0, y0, LABEL_W, ROW_H)

    // left accent bar
    ctx.fillStyle = DAY_HDR[di]
    ctx.globalAlpha = 0.9
    ctx.fillRect(0, y0 + 14, 8, ROW_H - 28)
    ctx.globalAlpha = 1

    // English abbreviation (large)
    ctx.fillStyle = DAY_HDR[di]
    ctx.font = f(30, 800)
    ctx.textAlign = 'center'
    ctx.fillText(DAY_EN[d] || d, LABEL_W / 2, cy + 10)
  })

  // ── Corner cell ───────────────────────────────────────────
  ctx.fillStyle = t.CANVAS_BG || t.BG
  ctx.fillRect(0, TIMETABLE_TOP, LABEL_W, HEAD_H)
  ctx.fillStyle = t.MUTED
  ctx.font = f(20, 700)
  ctx.textAlign = 'center'
  ctx.fillText('Day / Time', LABEL_W / 2, TIMETABLE_TOP + HEAD_H / 2 + 7)

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

      // Shadow
      ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 3
      ctx.globalAlpha = 0.95
      ctx.fillStyle = base
      rr(ctx, x0, y0, bw, bh, 10); ctx.fill()
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
      ctx.globalAlpha = 1

      // Left accent stripe
      ctx.fillStyle = darken(base, 0.28)
      ctx.globalAlpha = 0.9
      ctx.fillRect(x0, y0 + 8, 7, bh - 16)
      ctx.globalAlpha = 1

      // Conflict overlay
      if (isConflict) {
        ctx.globalAlpha = 0.2; ctx.fillStyle = '#ff4444'
        rr(ctx, x0, y0, bw, bh, 10); ctx.fill()
        ctx.globalAlpha = 1; ctx.strokeStyle = '#ff4444'; ctx.lineWidth = 3
        rr(ctx, x0, y0, bw, bh, 10); ctx.stroke()
      }

      // ── Text ──
      const tc  = isLight ? '#1a1a2e' : '#0d0d1a'
      const tx  = x0 + 20  // left margin (after stripe)
      const avW = bw - 36

      // Row 1: course code (left) + [start – end] (right)
      ctx.font = f(22, 600)
      ctx.fillStyle = tc; ctx.globalAlpha = 0.7
      ctx.textAlign = 'left'
      ctx.fillText(course.code || '', tx, y0 + 28, avW / 2)
      ctx.textAlign = 'right'
      ctx.fillText(`[${slot.start} – ${slot.end}]`, x0 + bw - 12, y0 + 28, avW / 2)
      ctx.globalAlpha = 1

      // Row 2: course name (large bold)
      if (bh > 44) {
        ctx.font = f(32, 800)
        ctx.fillStyle = tc; ctx.textAlign = 'left'
        const maxName = Math.floor(avW / 19)
        const name = course.name || course.code || ''
        const nameShort = name.length > maxName ? name.slice(0, maxName - 1) + '…' : name
        ctx.fillText(nameShort, tx, y0 + 76, avW)
      }

      // Row 3: room (left) + section (right)
      if (bh > 90) {
        ctx.font = f(22, 400)
        ctx.globalAlpha = 0.65
        if (slot.room) {
          ctx.textAlign = 'left'
          ctx.fillText(`ห้อง: ${slot.room}`, tx, y0 + 118, avW / 2)
        }
        if (course.section) {
          ctx.textAlign = 'right'
          const stype = slot.isLab ? 'Lab' : 'บรรยาย'
          ctx.fillText(`หมู่ ${course.section} ${stype}`, x0 + bw - 12, y0 + 118, avW / 2)
        }
        ctx.globalAlpha = 1
      }

      // LAB badge
      if (slot.isLab) {
        ctx.font = f(20, 700)
        ctx.fillStyle = '#5b21b6'
        ctx.globalAlpha = 0.85
        ctx.textAlign = 'right'
        ctx.fillText('LAB', x0 + bw - 12, y0 + 28 - 14 + 14, 80)
        // small colored pill
        const lw2 = 60, lh2 = 26
        ctx.fillStyle = '#5b21b6'
        ctx.globalAlpha = 0.15
        rr(ctx, x0 + bw - lw2 - 12, y0 + 6, lw2, lh2, 8)
        ctx.fill()
        ctx.globalAlpha = 0.85
        ctx.fillStyle = '#5b21b6'
        ctx.font = f(18, 700)
        ctx.textAlign = 'center'
        ctx.fillText('LAB', x0 + bw - lw2/2 - 12, y0 + 23)
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
  ctx.strokeStyle = t.GRID_MAJOR; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, fy); ctx.lineTo(W, fy); ctx.stroke()

  ctx.fillStyle = t.MUTED; ctx.font = f(20, 400)
  ctx.textAlign = 'left'
  ctx.fillText(`by น้องดรีม · วิทย์คอม ปี 2 · ม.เกษตรศาสตร์ กำแพงแสน  |  บันทึกวันที่ ${dateStr}`, 28, fy + FOOT_H / 2 + 7)
  ctx.textAlign = 'right'
  ctx.fillText('powered by staywithdrxam · ku-schedule-web.vercel.app', W - 28, fy + FOOT_H / 2 + 7)

  // ── Download ──────────────────────────────────────────────
  const url = canvas.toDataURL('image/png')
  const a   = document.createElement('a')
  a.href    = url
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

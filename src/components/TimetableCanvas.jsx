import React, { useRef, useEffect, useCallback } from 'react'
import { THEMES, LIGHT_THEMES } from '../themes'
import { DAYS, DAY_FULL, TIMES, t2m } from '../constants'

const START_M = 7 * 60
const END_M = 20 * 60
const TOTAL_M = END_M - START_M

const DAY_PASTEL_DARK = [
  'rgba(120,160,255,0.08)',
  'rgba(255,140,180,0.08)',
  'rgba(100,220,160,0.08)',
  'rgba(255,190,100,0.08)',
  'rgba(200,150,255,0.08)',
  'rgba(100,220,220,0.08)',
  'rgba(255,200,140,0.08)',
]
const DAY_PASTEL_LIGHT = [
  'rgba(100,140,255,0.11)',
  'rgba(255,100,160,0.11)',
  'rgba(60,200,130,0.11)',
  'rgba(255,160,60,0.11)',
  'rgba(170,100,255,0.11)',
  'rgba(40,200,200,0.11)',
  'rgba(255,160,100,0.11)',
]
const DAY_HEADER_DARK  = ['#6ea8ff','#ff8ab4','#5cd89a','#ffb84a','#c084fc','#34d4d4','#ffb07a']
const DAY_HEADER_LIGHT = ['#3b7eff','#e0457a','#28a870','#d97706','#7c3aed','#0891b2','#c2410c']

const LABEL_W = 80
const HEAD_H  = 48

export default function TimetableCanvas({ schedule, conflicts, theme, pendingDelete, onSlotHover, onSlotClick, onEmptyClick }) {
  const canvasRef = useRef()
  const hoverPosRef = useRef(null)
  const rafRef = useRef(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    if (!W || !H) return
    canvas.width  = W * window.devicePixelRatio
    canvas.height = H * window.devicePixelRatio
    const ctx = canvas.getContext('2d')
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const t = THEMES[theme] || THEMES.Dark
    const isLight = LIGHT_THEMES.has(theme)
    const DAY_BG  = isLight ? DAY_PASTEL_LIGHT : DAY_PASTEL_DARK
    const DAY_HDR = isLight ? DAY_HEADER_LIGHT : DAY_HEADER_DARK

    const ROW_H  = (H - HEAD_H) / DAYS.length
    const TIME_W = W - LABEL_W

    // ── Background ──────────────────────────────────────
    ctx.fillStyle = t.CANVAS_BG || t.BG
    ctx.fillRect(0, 0, W, H)

    // ── Day row tinted backgrounds ───────────────────────
    DAYS.forEach((_, di) => {
      ctx.fillStyle = DAY_BG[di]
      ctx.fillRect(LABEL_W, HEAD_H + di * ROW_H, TIME_W, ROW_H)
    })

    // ── Hover highlight ──────────────────────────────────
    const hover = hoverPosRef.current
    if (hover !== null && hover.di >= 0 && hover.di < DAYS.length) {
      const hy0 = HEAD_H + hover.di * ROW_H
      // row glow
      ctx.fillStyle = DAY_HDR[hover.di]
      ctx.globalAlpha = 0.18
      ctx.fillRect(LABEL_W, hy0, TIME_W, ROW_H)
      // left label glow
      ctx.globalAlpha = 0.25
      ctx.fillRect(0, hy0, LABEL_W, ROW_H)
      ctx.globalAlpha = 1
      // vertical time cursor
      if (hover.minM >= START_M && hover.minM <= END_M) {
        const hx = LABEL_W + ((hover.minM - START_M) / TOTAL_M) * TIME_W
        ctx.strokeStyle = DAY_HDR[hover.di]
        ctx.globalAlpha = 0.55
        ctx.lineWidth = 1.5
        ctx.setLineDash([5, 4])
        ctx.beginPath(); ctx.moveTo(hx, HEAD_H); ctx.lineTo(hx, H); ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1
      }
    }

    // ── Vertical time grid ───────────────────────────────
    TIMES.map(tm => t2m(tm)).forEach(m => {
      if (m < START_M || m > END_M) return
      const x = LABEL_W + ((m - START_M) / TOTAL_M) * TIME_W
      const isHour = m % 60 === 0
      ctx.strokeStyle = isHour ? t.GRID_MAJOR : t.GRID_MINOR
      ctx.lineWidth   = isHour ? 0.8 : 0.4
      ctx.beginPath(); ctx.moveTo(x, HEAD_H); ctx.lineTo(x, H); ctx.stroke()

      if (isHour) {
        const hh = String(Math.floor(m / 60)).padStart(2, '0')
        ctx.fillStyle = t.MUTED
        ctx.font      = `600 11px 'Noto Sans Thai', sans-serif`
        const labelY  = HEAD_H / 2 + 5
        if (m === START_M) {
          ctx.textAlign = 'left'
          ctx.fillText(`${hh}:00`, x + 3, labelY)
        } else if (m === END_M) {
          ctx.textAlign = 'right'
          ctx.fillText(`${hh}:00`, x - 3, labelY)
        } else {
          ctx.textAlign = 'center'
          ctx.fillText(`${hh}:00`, x, labelY)
        }
      }
    })

    // ── Horizontal day separator lines ───────────────────
    for (let di = 0; di <= DAYS.length; di++) {
      const y = HEAD_H + di * ROW_H
      ctx.strokeStyle = t.GRID_MAJOR
      ctx.lineWidth   = di === 0 || di === DAYS.length ? 1 : 0.6
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    }

    // ── Day label column ─────────────────────────────────
    DAYS.forEach((d, di) => {
      const y0 = HEAD_H + di * ROW_H
      const cy = y0 + ROW_H / 2

      // Row bg tint in label area
      ctx.fillStyle = DAY_BG[di]
      ctx.fillRect(0, y0, LABEL_W, ROW_H)

      // Left accent bar
      ctx.fillStyle   = DAY_HDR[di]
      ctx.globalAlpha = 0.9
      ctx.fillRect(0, y0 + 5, 3, ROW_H - 10)
      ctx.globalAlpha = 1

      // Day name (full Thai)
      ctx.fillStyle  = DAY_HDR[di]
      ctx.font       = `700 10px 'Noto Sans Thai', sans-serif`
      ctx.textAlign  = 'center'
      ctx.fillText(DAY_FULL[d] || d, LABEL_W / 2, cy + 4)
    })

    // ── Header top-left corner ───────────────────────────
    ctx.fillStyle = t.CANVAS_BG || t.BG
    ctx.fillRect(0, 0, LABEL_W, HEAD_H)
    ctx.fillStyle = t.MUTED
    ctx.font      = `600 10px 'Noto Sans Thai', sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText('วัน', LABEL_W / 2, HEAD_H / 2 - 2)
    ctx.fillText('เวลา', LABEL_W / 2, HEAD_H / 2 + 11)

    // ── Border lines ─────────────────────────────────────
    ctx.strokeStyle = t.GRID_MAJOR; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, HEAD_H);  ctx.lineTo(W, HEAD_H);  ctx.stroke()
    ctx.beginPath(); ctx.moveTo(LABEL_W, 0); ctx.lineTo(LABEL_W, H); ctx.stroke()

    // ── Current time indicator (vertical line) ───────────
    const now = new Date()
    const curM = now.getHours() * 60 + now.getMinutes()
    if (curM >= START_M && curM <= END_M) {
      const x = LABEL_W + ((curM - START_M) / TOTAL_M) * TIME_W
      ctx.strokeStyle = isLight ? 'rgba(160,80,80,0.22)' : 'rgba(255,160,160,0.18)'
      ctx.lineWidth   = 1
      ctx.setLineDash([3, 5])
      ctx.beginPath(); ctx.moveTo(x, HEAD_H + 2); ctx.lineTo(x, H - 2); ctx.stroke()
      ctx.setLineDash([])
    }

    // ── Course blocks ────────────────────────────────────
    schedule.forEach((course, ci) => {
      const isConflict = conflicts.has(ci)
      ;(course.slots || []).forEach(slot => {
        const di = DAYS.indexOf(slot.day)
        if (di < 0) return
        const sM = t2m(slot.start), eM = t2m(slot.end)
        if (eM <= START_M || sM >= END_M) return

        const PAD = 3
        const x0 = LABEL_W + ((Math.max(sM, START_M) - START_M) / TOTAL_M) * TIME_W + PAD
        const x1 = LABEL_W + ((Math.min(eM, END_M)   - START_M) / TOTAL_M) * TIME_W - PAD
        const y0 = HEAD_H + di * ROW_H + PAD
        const bw = x1 - x0
        const bh = ROW_H - PAD * 2
        if (bw <= 0) return

        const base = course.color || '#b4d4ff'

        // Shadow
        ctx.shadowColor   = 'rgba(0,0,0,0.22)'
        ctx.shadowBlur    = 5
        ctx.shadowOffsetY = 2

        // Fill
        ctx.globalAlpha = 0.93
        ctx.fillStyle   = base
        roundRect(ctx, x0, y0, bw, bh, 6)
        ctx.fill()
        ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
        ctx.globalAlpha = 1

        // Top accent stripe
        ctx.fillStyle   = darken(base, 0.22)
        ctx.globalAlpha = 0.75
        roundRect(ctx, x0, y0, bw, 3, 3)
        ctx.fill()
        ctx.globalAlpha = 1

        // Conflict overlay
        if (isConflict) {
          ctx.globalAlpha = 0.2
          ctx.fillStyle = '#ff4444'
          roundRect(ctx, x0, y0, bw, bh, 6); ctx.fill()
          ctx.globalAlpha = 1
          ctx.strokeStyle = t.DANGER; ctx.lineWidth = 1.5
          roundRect(ctx, x0, y0, bw, bh, 6); ctx.stroke()
        }

        // ── Text inside block ────────────────────────────
        const tc    = isLight ? '#1a1a2e' : '#0d0d1a'
        const tx    = x0 + 8
        const avail = bw - 16

        const hasBottom = bh > 46 && (slot.room || course.section)
        const topY      = y0 + 13

        // Row 1: code (left) + [time] (right)
        ctx.fillStyle   = tc
        ctx.globalAlpha = 0.85
        ctx.font        = `700 11px 'Noto Sans Thai', sans-serif`
        ctx.textAlign   = 'left'
        ctx.fillText(course.code || '', tx, topY, avail * 0.55)
        ctx.font        = `500 10px 'Noto Sans Thai', sans-serif`
        ctx.globalAlpha = 0.55
        ctx.textAlign   = 'right'
        ctx.fillText(`[${slot.start}–${slot.end}]`, x0 + bw - 6, topY, avail * 0.55)
        ctx.globalAlpha = 1

        // Row 2: course name — vertically centered in remaining space
        if (bh > 20 && course.name) {
          const midTop    = topY + 4
          const midBot    = hasBottom ? y0 + bh - 16 : y0 + bh - 4
          const nameY     = (midTop + midBot) / 2 + 5
          const fontSize  = bh > 50 ? 13 : bh > 32 ? 11 : 10
          ctx.font        = `800 ${fontSize}px 'Noto Sans Thai', sans-serif`
          ctx.fillStyle   = tc
          ctx.globalAlpha = 0.92
          ctx.textAlign   = 'center'
          const maxChars  = Math.floor(avail / (fontSize * 0.62))
          const ns        = course.name.length > maxChars ? course.name.substring(0, maxChars - 1) + '…' : course.name
          ctx.fillText(ns, x0 + bw / 2, nameY, avail)
          ctx.globalAlpha = 1
        }

        // Row 3: room (left) + section (right)
        if (hasBottom) {
          ctx.font        = `500 10px 'Noto Sans Thai', sans-serif`
          ctx.globalAlpha = 0.62
          ctx.fillStyle   = tc
          if (slot.room) {
            ctx.textAlign = 'left'
            ctx.fillText(`ห้อง: ${slot.room}`, tx, y0 + bh - 5, avail * 0.55)
          }
          if (course.section) {
            ctx.textAlign = 'right'
            const stype = slot.isLab ? 'Lab' : 'บรรยาย'
            ctx.fillText(`หมู่ ${course.section} ${stype}`, x0 + bw - 6, y0 + bh - 5, avail * 0.55)
          }
          ctx.globalAlpha = 1
        }

        // LAB badge when no bottom row
        if (slot.isLab && !hasBottom) {
          ctx.font        = `bold 8px sans-serif`
          ctx.fillStyle   = '#5b21b6'
          ctx.globalAlpha = 0.8
          ctx.textAlign   = 'right'
          ctx.fillText('LAB', x0 + bw - 5, topY)
        }
        ctx.globalAlpha = 1
        ctx.textAlign   = 'left'
      })
    })

    // ── Pending delete highlight ──────────────────────────
    if (pendingDelete !== null && schedule[pendingDelete]) {
      ;(schedule[pendingDelete].slots || []).forEach(slot => {
        const di = DAYS.indexOf(slot.day)
        if (di < 0) return
        const sM = t2m(slot.start), eM = t2m(slot.end)
        if (eM <= START_M || sM >= END_M) return
        const PAD = 3
        const x0 = LABEL_W + ((Math.max(sM, START_M) - START_M) / TOTAL_M) * TIME_W + PAD
        const x1 = LABEL_W + ((Math.min(eM, END_M)   - START_M) / TOTAL_M) * TIME_W - PAD
        const y0 = HEAD_H + di * ROW_H + PAD
        const bw = x1 - x0, bh = ROW_H - PAD * 2
        if (bw <= 0) return
        ctx.globalAlpha = 0.45
        ctx.fillStyle = '#ff2222'
        roundRect(ctx, x0, y0, bw, bh, 6); ctx.fill()
        ctx.globalAlpha = 1
        ctx.strokeStyle = '#ff0000'; ctx.lineWidth = 2
        roundRect(ctx, x0, y0, bw, bh, 6); ctx.stroke()
        ctx.fillStyle = '#fff'
        ctx.font = `700 10px 'Noto Sans Thai', sans-serif`
        ctx.textAlign = 'center'; ctx.globalAlpha = 0.92
        ctx.fillText('กดอีกครั้งเพื่อลบ', x0 + bw / 2, y0 + bh / 2 + 4, bw - 8)
        ctx.globalAlpha = 1
      })
    }
  }, [schedule, conflicts, theme, pendingDelete])

  useEffect(() => { draw() }, [draw])

  useEffect(() => {
    const obs = new ResizeObserver(draw)
    if (canvasRef.current) obs.observe(canvasRef.current.parentElement)
    return () => obs.disconnect()
  }, [draw])

  function getSlotAt(e) {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const W = rect.width, H = rect.height
    if (mx < LABEL_W || my < HEAD_H) return null
    const ROW_H  = (H - HEAD_H) / DAYS.length
    const TIME_W = W - LABEL_W
    const di     = Math.floor((my - HEAD_H) / ROW_H)
    const fracX  = (mx - LABEL_W) / TIME_W
    const minM   = START_M + fracX * TOTAL_M
    for (let ci = schedule.length - 1; ci >= 0; ci--) {
      for (const slot of schedule[ci].slots || []) {
        if (DAYS.indexOf(slot.day) !== di) continue
        if (t2m(slot.start) <= minM && minM <= t2m(slot.end))
          return { course: schedule[ci], ci, slot, x: e.clientX, y: e.clientY }
      }
    }
    return null
  }

  function getPosAt(e) {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const W = rect.width, H = rect.height
    if (mx < LABEL_W || my < HEAD_H || mx > W || my > H) return null
    const ROW_H  = (H - HEAD_H) / DAYS.length
    const TIME_W = W - LABEL_W
    const di     = Math.floor((my - HEAD_H) / ROW_H)
    if (di < 0 || di >= DAYS.length) return null
    const minM = START_M + ((mx - LABEL_W) / TIME_W) * TOTAL_M
    return { di, minM }
  }

  function updateHover(e) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const W = rect.width, H = rect.height
    if (mx >= LABEL_W && my >= HEAD_H && mx <= W && my <= H) {
      const rh = (H - HEAD_H) / DAYS.length
      const di = Math.floor((my - HEAD_H) / rh)
      if (di >= 0 && di < DAYS.length) {
        const minM = START_M + ((mx - LABEL_W) / (W - LABEL_W)) * TOTAL_M
        hoverPosRef.current = { di, minM }
      } else {
        hoverPosRef.current = null
      }
    } else {
      hoverPosRef.current = null
    }
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => { draw(); rafRef.current = null })
    }
  }

  function handleMouseMove(e) {
    updateHover(e)
    onSlotHover && onSlotHover(getSlotAt(e) || null)
  }
  function handleClick(e) {
    const hit = getSlotAt(e)
    if (hit) {
      onSlotClick && onSlotClick(hit.ci)
    } else {
      const pos = getPosAt(e)
      if (pos) onEmptyClick && onEmptyClick(pos)
    }
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        hoverPosRef.current = null
        draw()
        onSlotHover && onSlotHover(null)
      }}
      onClick={handleClick}
      onTouchStart={e => {
        const touch = e.touches[0]
        if (touch) handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY })
      }}
      onTouchEnd={() => onSlotHover && onSlotHover(null)}
    />
  )
}

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2)
  if (r < 0) return
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function darken(hex, amt) {
  try {
    const n = parseInt(hex.replace('#', ''), 16)
    const r = Math.max(0, (n >> 16)        - Math.round(amt * 255))
    const g = Math.max(0, ((n >> 8) & 0xff) - Math.round(amt * 255))
    const b = Math.max(0, (n & 0xff)        - Math.round(amt * 255))
    return `rgb(${r},${g},${b})`
  } catch { return hex }
}

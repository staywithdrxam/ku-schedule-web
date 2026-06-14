import React, { useRef, useEffect, useCallback } from 'react'
import { THEMES, LIGHT_THEMES } from '../themes'
import { DAYS, DAY_FULL, TIMES, t2m } from '../constants'

const START_M = 7 * 60
const END_M = 20 * 60
const TOTAL_M = END_M - START_M

// Pastel hue per day — used for column bg + header accent
const DAY_PASTEL_DARK = [
  'rgba(120,160,255,0.07)',  // จ  – blue
  'rgba(255,140,180,0.07)',  // อ  – pink
  'rgba(100,220,160,0.07)',  // พ  – green
  'rgba(255,190,100,0.07)',  // พฤ – amber
  'rgba(200,150,255,0.07)',  // ศ  – purple
  'rgba(100,220,220,0.07)',  // ส  – teal
  'rgba(255,200,140,0.07)',  // อา – peach
]
const DAY_PASTEL_LIGHT = [
  'rgba(100,140,255,0.10)',
  'rgba(255,100,160,0.10)',
  'rgba(60,200,130,0.10)',
  'rgba(255,160,60,0.10)',
  'rgba(170,100,255,0.10)',
  'rgba(40,200,200,0.10)',
  'rgba(255,160,100,0.10)',
]
// Header accent colors (solid, per day)
const DAY_HEADER_DARK = [
  '#6ea8ff', '#ff8ab4', '#5cd89a', '#ffb84a', '#c084fc', '#34d4d4', '#ffb07a',
]
const DAY_HEADER_LIGHT = [
  '#3b7eff', '#e0457a', '#28a870', '#d97706', '#7c3aed', '#0891b2', '#c2410c',
]

export default function TimetableCanvas({ schedule, conflicts, theme, onSlotHover, onSlotClick }) {
  const canvasRef = useRef()

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    if (!W || !H) return
    canvas.width = W * window.devicePixelRatio
    canvas.height = H * window.devicePixelRatio
    const ctx = canvas.getContext('2d')
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const t = THEMES[theme] || THEMES.Dark
    const isLight = LIGHT_THEMES.has(theme)
    const DAY_BG = isLight ? DAY_PASTEL_LIGHT : DAY_PASTEL_DARK
    const DAY_HDR = isLight ? DAY_HEADER_LIGHT : DAY_HEADER_DARK

    const LABEL_W = 46
    const HEAD_H = 40
    const CELL_W = (W - LABEL_W) / DAYS.length
    const CELL_H = H - HEAD_H

    // ── Background ──────────────────────────────────────
    ctx.fillStyle = t.BG
    ctx.fillRect(0, 0, W, H)

    // ── Day column tinted backgrounds ────────────────────
    DAYS.forEach((_, di) => {
      ctx.fillStyle = DAY_BG[di]
      ctx.fillRect(LABEL_W + di * CELL_W, HEAD_H, CELL_W, CELL_H)
    })

    // ── Horizontal grid lines ────────────────────────────
    const marks = TIMES.map(tm => t2m(tm))
    marks.forEach(m => {
      if (m < START_M || m > END_M) return
      const y = HEAD_H + ((m - START_M) / TOTAL_M) * CELL_H
      const isHour = m % 60 === 0
      ctx.strokeStyle = isHour ? t.GRID_MAJOR : t.GRID_MINOR
      ctx.lineWidth = isHour ? 0.8 : 0.4
      ctx.beginPath(); ctx.moveTo(LABEL_W, y); ctx.lineTo(W, y); ctx.stroke()

      if (isHour) {
        const hh = Math.floor(m / 60)
        ctx.fillStyle = t.MUTED
        ctx.font = `600 9px 'Noto Sans Thai', sans-serif`
        ctx.textAlign = 'right'
        ctx.fillText(`${hh}:00`, LABEL_W - 5, y + 4)
      }
    })

    // ── Vertical separators ──────────────────────────────
    DAYS.forEach((_, di) => {
      const x = LABEL_W + di * CELL_W
      ctx.strokeStyle = t.GRID_MAJOR
      ctx.lineWidth = 0.8
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
    })
    // right edge
    ctx.strokeStyle = t.GRID_MAJOR; ctx.lineWidth = 0.8
    ctx.beginPath(); ctx.moveTo(W, 0); ctx.lineTo(W, H); ctx.stroke()
    // label divider
    ctx.strokeStyle = t.GRID_MAJOR; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(LABEL_W, 0); ctx.lineTo(LABEL_W, H); ctx.stroke()

    // ── Day header cells ─────────────────────────────────
    DAYS.forEach((d, di) => {
      const x0 = LABEL_W + di * CELL_W
      const cx = x0 + CELL_W / 2

      // Header background (slightly tinted)
      ctx.fillStyle = DAY_BG[di]
      ctx.fillRect(x0, 0, CELL_W, HEAD_H)

      // Bottom accent bar per day
      ctx.fillStyle = DAY_HDR[di]
      ctx.globalAlpha = 0.7
      ctx.fillRect(x0 + 4, HEAD_H - 3, CELL_W - 8, 3)
      ctx.globalAlpha = 1

      // Day name
      ctx.fillStyle = DAY_HDR[di]
      ctx.font = `700 11px 'Noto Sans Thai', sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(DAY_FULL[d] || d, cx, HEAD_H / 2 + 4)
    })

    // Top border under header
    ctx.strokeStyle = t.GRID_MAJOR
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, HEAD_H); ctx.lineTo(W, HEAD_H); ctx.stroke()

    // ── Current time indicator (subtle) ─────────────────
    const now = new Date()
    const curM = now.getHours() * 60 + now.getMinutes()
    if (curM >= START_M && curM <= END_M) {
      const y = HEAD_H + ((curM - START_M) / TOTAL_M) * CELL_H
      ctx.strokeStyle = isLight ? 'rgba(160,80,80,0.2)' : 'rgba(255,160,160,0.18)'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 5])
      ctx.beginPath(); ctx.moveTo(LABEL_W + 2, y); ctx.lineTo(W - 2, y); ctx.stroke()
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
        const y0 = HEAD_H + ((Math.max(sM, START_M) - START_M) / TOTAL_M) * CELL_H
        const y1 = HEAD_H + ((Math.min(eM, END_M) - START_M) / TOTAL_M) * CELL_H
        const PAD = 3
        const x0 = LABEL_W + di * CELL_W + PAD
        const bw = CELL_W - PAD * 2
        const bh = y1 - y0 - 1

        const baseColor = course.color || '#b4d4ff'

        // Shadow
        ctx.shadowColor = 'rgba(0,0,0,0.25)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetY = 2

        // Fill
        ctx.globalAlpha = 0.9
        ctx.fillStyle = baseColor
        roundRect(ctx, x0, y0, bw, bh, 5)
        ctx.fill()
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetY = 0
        ctx.globalAlpha = 1

        // Left accent stripe
        ctx.fillStyle = darken(baseColor, 0.25)
        ctx.globalAlpha = 0.8
        ctx.fillRect(x0, y0 + 2, 3, bh - 4)
        ctx.globalAlpha = 1

        // Conflict overlay
        if (isConflict) {
          ctx.globalAlpha = 0.2
          ctx.fillStyle = '#ff4444'
          roundRect(ctx, x0, y0, bw, bh, 5)
          ctx.fill()
          ctx.globalAlpha = 1
          ctx.strokeStyle = t.DANGER
          ctx.lineWidth = 1.5
          roundRect(ctx, x0, y0, bw, bh, 5)
          ctx.stroke()
        }

        // Text
        const textColor = isLight ? '#1a1a2e' : '#0d0d1a'
        ctx.globalAlpha = 0.95
        ctx.fillStyle = textColor

        if (bh > 14) {
          ctx.font = `700 10px 'Noto Sans Thai', sans-serif`
          ctx.textAlign = 'center'
          const codeLabel = course.code || ''
          ctx.fillText(codeLabel.substring(0, 11), x0 + bw / 2, y0 + 13, bw - 8)
        }
        if (bh > 26 && course.name) {
          ctx.font = `500 9px 'Noto Sans Thai', sans-serif`
          ctx.globalAlpha = 0.75
          const nameShort = course.name.length > 10 ? course.name.substring(0, 9) + '…' : course.name
          ctx.fillText(nameShort, x0 + bw / 2, y0 + 23, bw - 8)
          ctx.globalAlpha = 0.95
        }
        if (bh > 38 && slot.room) {
          ctx.font = `9px 'Noto Sans Thai', sans-serif`
          ctx.globalAlpha = 0.65
          ctx.fillText(slot.room.substring(0, 9), x0 + bw / 2, y0 + 33, bw - 8)
          ctx.globalAlpha = 1
        }
        if (slot.isLab) {
          ctx.font = `bold 7px sans-serif`
          ctx.fillStyle = '#5b21b6'
          ctx.globalAlpha = 0.85
          ctx.fillText('LAB', x0 + 5, y0 + 9)
        }
        ctx.globalAlpha = 1
      })
    })
  }, [schedule, conflicts, theme])

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
    const LABEL_W = 46, HEAD_H = 40
    if (mx < LABEL_W || my < HEAD_H) return null
    const CELL_W = (W - LABEL_W) / DAYS.length
    const CELL_H = H - HEAD_H
    const di = Math.floor((mx - LABEL_W) / CELL_W)
    const fracY = (my - HEAD_H) / CELL_H
    const minM = START_M + fracY * TOTAL_M
    for (let ci = schedule.length - 1; ci >= 0; ci--) {
      for (const slot of schedule[ci].slots || []) {
        if (DAYS.indexOf(slot.day) !== di) continue
        if (t2m(slot.start) <= minM && minM <= t2m(slot.end))
          return { course: schedule[ci], ci, slot, x: e.clientX, y: e.clientY }
      }
    }
    return null
  }

  function handleMouseMove(e) {
    const hit = getSlotAt(e)
    onSlotHover && onSlotHover(hit || null)
  }

  function handleClick(e) {
    const hit = getSlotAt(e)
    if (hit) onSlotClick && onSlotClick(hit.ci)
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair', imageRendering: 'auto' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => onSlotHover && onSlotHover(null)}
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
    const r = Math.max(0, (n >> 16) - Math.round(amt * 255))
    const g = Math.max(0, ((n >> 8) & 0xff) - Math.round(amt * 255))
    const b = Math.max(0, (n & 0xff) - Math.round(amt * 255))
    return `rgb(${r},${g},${b})`
  } catch { return hex }
}

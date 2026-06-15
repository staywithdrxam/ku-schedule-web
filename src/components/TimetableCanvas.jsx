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

function mToTime(m) {
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

export default function TimetableCanvas({
  schedule, conflicts, theme, selectedIdx,
  onSlotHover, onSlotClick, onSlotEdit, onEmptyClick, onSlotMove
}) {
  const canvasRef  = useRef()
  const hoverRef   = useRef(null)
  const rafRef     = useRef(null)
  const dragRef    = useRef(null)
  // dragRef = { active, ci, slotIdx, duration, offsetM, ghost:{di,startM}|null, moved, startX, startY }
  const lastClickRef = useRef({ ci: -1, time: 0 })

  // Keep a stable ref to handlers so the non-passive touchmove listener can always call the latest version
  const touchMoveHandlerRef = useRef()

  // ── Draw ─────────────────────────────────────────────
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

    const t      = THEMES[theme] || THEMES.Dark
    const isLight = LIGHT_THEMES.has(theme)
    const DAY_BG  = isLight ? DAY_PASTEL_LIGHT : DAY_PASTEL_DARK
    const DAY_HDR = isLight ? DAY_HEADER_LIGHT : DAY_HEADER_DARK
    const ROW_H   = (H - HEAD_H) / DAYS.length
    const TIME_W  = W - LABEL_W
    const drag    = dragRef.current

    // Background
    ctx.fillStyle = t.CANVAS_BG || t.BG
    ctx.fillRect(0, 0, W, H)

    // Day row tinted backgrounds
    DAYS.forEach((_, di) => {
      ctx.fillStyle = DAY_BG[di]
      ctx.fillRect(LABEL_W, HEAD_H + di * ROW_H, TIME_W, ROW_H)
    })

    // Hover highlight (skip while dragging)
    const hover = hoverRef.current
    if (!drag?.moved && hover !== null && hover.di >= 0 && hover.di < DAYS.length) {
      const hy0 = HEAD_H + hover.di * ROW_H
      ctx.fillStyle = DAY_HDR[hover.di]
      ctx.globalAlpha = 0.18
      ctx.fillRect(LABEL_W, hy0, TIME_W, ROW_H)
      ctx.globalAlpha = 0.25
      ctx.fillRect(0, hy0, LABEL_W, ROW_H)
      ctx.globalAlpha = 1
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

    // Vertical time grid — hour lines only
    TIMES.map(tm => t2m(tm)).forEach(m => {
      if (m < START_M || m > END_M) return
      if (m % 60 !== 0) return
      const x = LABEL_W + ((m - START_M) / TOTAL_M) * TIME_W
      ctx.strokeStyle = t.GRID_MAJOR
      ctx.globalAlpha = 0.45
      ctx.lineWidth   = 0.6
      ctx.beginPath(); ctx.moveTo(x, HEAD_H); ctx.lineTo(x, H); ctx.stroke()
      ctx.globalAlpha = 1

      const hh = String(Math.floor(m / 60)).padStart(2, '0')
      ctx.fillStyle = t.MUTED
      ctx.font      = `600 11px 'Noto Sans Thai', sans-serif`
      const labelY  = HEAD_H / 2 + 5
      if (m === START_M) {
        ctx.textAlign = 'left';  ctx.fillText(`${hh}:00`, x + 3, labelY)
      } else if (m === END_M) {
        ctx.textAlign = 'right'; ctx.fillText(`${hh}:00`, x - 3, labelY)
      } else {
        ctx.textAlign = 'center'; ctx.fillText(`${hh}:00`, x, labelY)
      }
    })

    // Horizontal day separator lines
    for (let di = 0; di <= DAYS.length; di++) {
      const y = HEAD_H + di * ROW_H
      const isEdge = di === 0 || di === DAYS.length
      ctx.strokeStyle = t.GRID_MAJOR
      ctx.globalAlpha = isEdge ? 0.7 : 0.25
      ctx.lineWidth   = isEdge ? 0.8 : 0.5
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      ctx.globalAlpha = 1
    }

    // Day label column
    DAYS.forEach((d, di) => {
      const y0 = HEAD_H + di * ROW_H
      const cy = y0 + ROW_H / 2
      ctx.fillStyle = DAY_BG[di]
      ctx.fillRect(0, y0, LABEL_W, ROW_H)
      ctx.fillStyle   = DAY_HDR[di]
      ctx.globalAlpha = 0.9
      ctx.fillRect(0, y0 + 5, 3, ROW_H - 10)
      ctx.globalAlpha = 1
      ctx.fillStyle    = DAY_HDR[di]
      ctx.font         = `700 11px 'Noto Sans Thai', sans-serif`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(DAY_FULL[d] || d, LABEL_W / 2, cy)
      ctx.textBaseline = 'alphabetic'
    })

    // Header corner
    ctx.fillStyle = t.CANVAS_BG || t.BG
    ctx.fillRect(0, 0, LABEL_W, HEAD_H)
    ctx.fillStyle = t.MUTED
    ctx.font      = `600 10px 'Noto Sans Thai', sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText('วัน',  LABEL_W / 2, HEAD_H / 2 - 2)
    ctx.fillText('เวลา', LABEL_W / 2, HEAD_H / 2 + 11)

    // Border lines
    ctx.strokeStyle = t.GRID_MAJOR; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, HEAD_H);  ctx.lineTo(W, HEAD_H);  ctx.stroke()
    ctx.beginPath(); ctx.moveTo(LABEL_W, 0); ctx.lineTo(LABEL_W, H); ctx.stroke()

    // Current-time indicator
    const now  = new Date()
    const curM = now.getHours() * 60 + now.getMinutes()
    if (curM >= START_M && curM <= END_M) {
      const x = LABEL_W + ((curM - START_M) / TOTAL_M) * TIME_W
      ctx.strokeStyle = isLight ? 'rgba(160,80,80,0.22)' : 'rgba(255,160,160,0.18)'
      ctx.lineWidth   = 1
      ctx.setLineDash([3, 5])
      ctx.beginPath(); ctx.moveTo(x, HEAD_H + 2); ctx.lineTo(x, H - 2); ctx.stroke()
      ctx.setLineDash([])
    }

    // Course blocks
    schedule.forEach((course, ci) => {
      const isConflict = conflicts.has(ci)
      ;(course.slots || []).forEach((slot, slotIdx) => {
        // Hide original while being dragged — ghost shows where it'll land
        if (drag?.active && drag.moved && drag.ci === ci && drag.slotIdx === slotIdx) return

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

        ctx.shadowColor   = 'rgba(0,0,0,0.22)'
        ctx.shadowBlur    = 5
        ctx.shadowOffsetY = 2
        ctx.globalAlpha   = 0.93
        ctx.fillStyle     = base
        roundRect(ctx, x0, y0, bw, bh, 6); ctx.fill()
        ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
        ctx.globalAlpha = 1

        ctx.fillStyle   = darken(base, 0.22)
        ctx.globalAlpha = 0.75
        roundRect(ctx, x0, y0, bw, 3, 3); ctx.fill()
        ctx.globalAlpha = 1

        if (isConflict) {
          ctx.globalAlpha = 0.2; ctx.fillStyle = '#ff4444'
          roundRect(ctx, x0, y0, bw, bh, 6); ctx.fill()
          ctx.globalAlpha = 1; ctx.strokeStyle = t.DANGER; ctx.lineWidth = 1.5
          roundRect(ctx, x0, y0, bw, bh, 6); ctx.stroke()
        }

        // Selection glow border + hint text
        if (selectedIdx === ci) {
          ctx.globalAlpha = 0.12; ctx.fillStyle = '#6c63ff'
          roundRect(ctx, x0, y0, bw, bh, 6); ctx.fill()
          ctx.globalAlpha = 0.9; ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2.5
          ctx.setLineDash([])
          roundRect(ctx, x0, y0, bw, bh, 6); ctx.stroke()
          ctx.globalAlpha = 1
          ctx.fillStyle = '#6c63ff'
          ctx.font = `600 9px 'Noto Sans Thai', sans-serif`
          ctx.textAlign = 'center'; ctx.globalAlpha = 0.88
          ctx.fillText('กดอีกครั้งเพื่อทำการแก้ไข', x0 + bw / 2, y0 + bh - 5, bw - 8)
          ctx.globalAlpha = 1
        }

        const tc      = isLight ? '#1a1a2e' : '#0d0d1a'
        const tx      = x0 + 8
        const avail   = bw - 16
        const LAB_W   = slot.isLab ? 30 : 0
        const hasBot  = bh > 46 && (slot.room || course.section)
        const topY    = y0 + 13

        if (slot.isLab) {
          const pw = 28, ph = 14, pr = 5
          const px = x0 + bw - pw - 5, py = y0 + 4
          ctx.fillStyle = '#7c3aed'; ctx.globalAlpha = 0.9
          ctx.beginPath(); ctx.roundRect(px, py, pw, ph, pr); ctx.fill()
          ctx.globalAlpha = 1
          ctx.font = `bold 9px sans-serif`; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'
          ctx.fillText('LAB', px + pw / 2, py + 10)
        }

        ctx.fillStyle = tc; ctx.globalAlpha = 0.88
        ctx.font = `700 10px 'Noto Sans Thai', sans-serif`; ctx.textAlign = 'left'
        ctx.fillText(course.code || '', tx, topY, avail - LAB_W - 4)

        ctx.font = `500 9px 'Noto Sans Thai', sans-serif`; ctx.globalAlpha = 0.52
        ctx.fillText(`[${slot.start}–${slot.end}]`, tx, topY + 12, avail - LAB_W - 4)
        ctx.globalAlpha = 1

        if (bh > 20 && course.name) {
          const midTop   = topY + 16
          const midBot   = hasBot ? y0 + bh - 16 : y0 + bh - 4
          const nameY    = (midTop + midBot) / 2 + 5
          const fontSize = bh > 50 ? 13 : bh > 32 ? 11 : 10
          ctx.font = `800 ${fontSize}px 'Noto Sans Thai', sans-serif`
          ctx.fillStyle = tc; ctx.globalAlpha = 0.92; ctx.textAlign = 'center'
          const maxC = Math.floor(avail / (fontSize * 0.62))
          const ns   = course.name.length > maxC ? course.name.slice(0, maxC - 1) + '…' : course.name
          ctx.fillText(ns, x0 + bw / 2, nameY, avail)
          ctx.globalAlpha = 1
        }

        if (hasBot) {
          ctx.font = `500 10px 'Noto Sans Thai', sans-serif`; ctx.globalAlpha = 0.62; ctx.fillStyle = tc
          if (slot.room) {
            ctx.textAlign = 'left'
            ctx.fillText(`ห้อง: ${slot.room}`, tx, y0 + bh - 5, avail * 0.55)
          }
          if (course.section) {
            ctx.textAlign = 'right'
            ctx.fillText(`หมู่ ${course.section} ${slot.isLab ? 'Lab' : 'บรรยาย'}`, x0 + bw - 6, y0 + bh - 5, avail * 0.55)
          }
          ctx.globalAlpha = 1
        }
        ctx.globalAlpha = 1; ctx.textAlign = 'left'
      })
    })

    // Drag ghost block
    if (drag?.active && drag.moved && drag.ghost) {
      const g   = drag.ghost
      const PAD = 3
      const gx0 = LABEL_W + ((g.startM - START_M) / TOTAL_M) * TIME_W + PAD
      const gx1 = LABEL_W + ((g.startM + drag.duration - START_M) / TOTAL_M) * TIME_W - PAD
      const gy0 = HEAD_H + g.di * ROW_H + PAD
      const gbw = gx1 - gx0
      const gbh = ROW_H - PAD * 2
      if (gbw > 0) {
        const base = schedule[drag.ci]?.color || '#b4d4ff'
        ctx.globalAlpha = 0.55; ctx.fillStyle = base
        roundRect(ctx, gx0, gy0, gbw, gbh, 6); ctx.fill()
        ctx.globalAlpha = 1
        ctx.strokeStyle = darken(base, 0.25); ctx.lineWidth = 2
        ctx.setLineDash([5, 3])
        roundRect(ctx, gx0, gy0, gbw, gbh, 6); ctx.stroke()
        ctx.setLineDash([])
      }
    }

  }, [schedule, conflicts, theme, selectedIdx])

  useEffect(() => { draw() }, [draw])
  useEffect(() => {
    const obs = new ResizeObserver(draw)
    if (canvasRef.current) obs.observe(canvasRef.current.parentElement)
    return () => obs.disconnect()
  }, [draw])

  // Register non-passive touchmove so we can call preventDefault during drag
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const fn = (e) => touchMoveHandlerRef.current?.(e)
    canvas.addEventListener('touchmove', fn, { passive: false })
    return () => canvas.removeEventListener('touchmove', fn)
  }, [])

  // ── Helpers ───────────────────────────────────────────
  function metrics() {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect   = canvas.getBoundingClientRect()
    const W = rect.width, H = rect.height
    return { rect, W, H, ROW_H: (H - HEAD_H) / DAYS.length, TIME_W: W - LABEL_W }
  }

  function slotAt(clientX, clientY) {
    const m = metrics(); if (!m) return null
    const mx = clientX - m.rect.left, my = clientY - m.rect.top
    if (mx < LABEL_W || my < HEAD_H) return null
    const di   = Math.floor((my - HEAD_H) / m.ROW_H)
    const minM = START_M + ((mx - LABEL_W) / m.TIME_W) * TOTAL_M
    for (let ci = schedule.length - 1; ci >= 0; ci--) {
      const slots = schedule[ci].slots || []
      for (let si = 0; si < slots.length; si++) {
        const slot = slots[si]
        if (DAYS.indexOf(slot.day) !== di) continue
        if (t2m(slot.start) <= minM && minM <= t2m(slot.end))
          return { course: schedule[ci], ci, slot, slotIdx: si }
      }
    }
    return null
  }

  function posAt(clientX, clientY) {
    const m = metrics(); if (!m) return null
    const mx = clientX - m.rect.left, my = clientY - m.rect.top
    if (mx < LABEL_W || my < HEAD_H || mx > m.W || my > m.H) return null
    const di = Math.floor((my - HEAD_H) / m.ROW_H)
    if (di < 0 || di >= DAYS.length) return null
    return { di, minM: START_M + ((mx - LABEL_W) / m.TIME_W) * TOTAL_M }
  }

  function scheduleRedraw() {
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => { draw(); rafRef.current = null })
    }
  }

  function updateHoverFrom(clientX, clientY) {
    const m = metrics(); if (!m) return
    const mx = clientX - m.rect.left, my = clientY - m.rect.top
    if (mx >= LABEL_W && my >= HEAD_H && mx <= m.W && my <= m.H) {
      const di = Math.floor((my - HEAD_H) / m.ROW_H)
      hoverRef.current = (di >= 0 && di < DAYS.length)
        ? { di, minM: START_M + ((mx - LABEL_W) / m.TIME_W) * TOTAL_M }
        : null
    } else {
      hoverRef.current = null
    }
  }

  function beginDrag(clientX, clientY, hit) {
    const m   = metrics(); if (!m) return
    const mx  = clientX - m.rect.left
    const dur = t2m(hit.slot.end) - t2m(hit.slot.start)
    const clickM  = START_M + ((mx - LABEL_W) / m.TIME_W) * TOTAL_M
    const offsetM = Math.max(0, Math.min(dur, clickM - t2m(hit.slot.start)))
    dragRef.current = {
      active: true, moved: false,
      ci: hit.ci, slotIdx: hit.slotIdx,
      duration: dur, offsetM,
      ghost: null,
      startX: clientX, startY: clientY,
    }
  }

  function updateDragGhost(clientX, clientY) {
    const drag = dragRef.current; if (!drag?.active) return
    const m = metrics(); if (!m) return
    const mx  = clientX - m.rect.left, my = clientY - m.rect.top
    const di  = Math.max(0, Math.min(DAYS.length - 1, Math.floor((my - HEAD_H) / m.ROW_H)))
    const raw = START_M + ((mx - LABEL_W) / m.TIME_W) * TOTAL_M - drag.offsetM
    const startM = Math.max(START_M, Math.min(END_M - drag.duration, Math.round(raw / 30) * 30))
    drag.ghost = { di, startM }
  }

  function finalizeDrag() {
    const drag = dragRef.current
    if (!drag?.active) return false
    const { moved, ghost, ci, slotIdx, duration } = drag
    dragRef.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair'
    if (moved && ghost) {
      onSlotMove && onSlotMove(ci, slotIdx, DAYS[ghost.di], mToTime(ghost.startM), mToTime(ghost.startM + duration))
      scheduleRedraw()
      return true
    }
    scheduleRedraw()
    return false
  }

  // ── Mouse ─────────────────────────────────────────────
  function handleMouseDown(e) {
    if (e.button !== 0) return
    const hit = slotAt(e.clientX, e.clientY)
    if (hit) beginDrag(e.clientX, e.clientY, hit)
  }

  function handleMouseMove(e) {
    const drag = dragRef.current
    if (drag?.active) {
      const dx = e.clientX - drag.startX, dy = e.clientY - drag.startY
      if (!drag.moved && Math.sqrt(dx * dx + dy * dy) > 5) {
        drag.moved = true
        if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing'
      }
      if (drag.moved) {
        updateDragGhost(e.clientX, e.clientY)
        onSlotHover && onSlotHover(null)
        scheduleRedraw()
        return
      }
    }
    updateHoverFrom(e.clientX, e.clientY)
    const hit = slotAt(e.clientX, e.clientY)
    onSlotHover && onSlotHover(hit ? { ...hit, x: e.clientX, y: e.clientY } : null)
    if (canvasRef.current) canvasRef.current.style.cursor = hit ? 'grab' : 'crosshair'
    scheduleRedraw()
  }

  function handleMouseUp(e) {
    const drag = dragRef.current
    if (drag?.active) {
      const ci = drag.ci
      const wasDrag = finalizeDrag()
      if (!wasDrag) {
        const now = Date.now()
        const last = lastClickRef.current
        if (last.ci === ci && now - last.time < 350) {
          onSlotEdit && onSlotEdit(ci)
          lastClickRef.current = { ci: -1, time: 0 }
        } else {
          lastClickRef.current = { ci, time: now }
          onSlotClick && onSlotClick(ci)
        }
      }
    } else {
      const pos = posAt(e.clientX, e.clientY)
      if (pos) onEmptyClick && onEmptyClick(pos)
    }
  }

  function handleMouseLeave() {
    if (dragRef.current?.active) {
      dragRef.current = null
      if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair'
    }
    hoverRef.current = null
    onSlotHover && onSlotHover(null)
    scheduleRedraw()
  }

  // ── Touch ─────────────────────────────────────────────
  function handleTouchStart(e) {
    const touch = e.touches[0]; if (!touch) return
    const hit = slotAt(touch.clientX, touch.clientY)
    if (hit) beginDrag(touch.clientX, touch.clientY, hit)
    updateHoverFrom(touch.clientX, touch.clientY)
    scheduleRedraw()
  }

  // Assigned to ref so the non-passive listener always calls the latest version
  touchMoveHandlerRef.current = function handleTouchMove(e) {
    const touch = e.touches[0]; if (!touch) return
    const drag  = dragRef.current
    if (drag?.active) {
      const dx = touch.clientX - drag.startX, dy = touch.clientY - drag.startY
      if (!drag.moved && Math.sqrt(dx * dx + dy * dy) > 8) drag.moved = true
      if (drag.moved) {
        e.preventDefault()
        updateDragGhost(touch.clientX, touch.clientY)
        scheduleRedraw()
      }
    }
  }

  function handleTouchEnd(e) {
    const touch = e.changedTouches[0]
    const drag  = dragRef.current
    if (drag?.active) {
      const ci = drag.ci
      const wasDrag = finalizeDrag()
      if (!wasDrag) {
        const now = Date.now()
        const last = lastClickRef.current
        if (last.ci === ci && now - last.time < 450) {
          onSlotEdit && onSlotEdit(ci)
          lastClickRef.current = { ci: -1, time: 0 }
        } else {
          lastClickRef.current = { ci, time: now }
          onSlotClick && onSlotClick(ci)
        }
      }
    } else if (touch) {
      const pos = posAt(touch.clientX, touch.clientY)
      if (pos) onEmptyClick && onEmptyClick(pos)
    }
    hoverRef.current = null
    onSlotHover && onSlotHover(null)
    scheduleRedraw()
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    />
  )
}

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2); if (r < 0) return
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
    const r = Math.max(0, (n >> 16)         - Math.round(amt * 255))
    const g = Math.max(0, ((n >> 8) & 0xff) - Math.round(amt * 255))
    const b = Math.max(0, (n & 0xff)        - Math.round(amt * 255))
    return `rgb(${r},${g},${b})`
  } catch { return hex }
}

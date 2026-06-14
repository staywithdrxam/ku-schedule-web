import React, { useRef, useEffect, useState, useCallback } from 'react'

const SIZE = 180

function hslToRgb(h, s, l) {
  s /= 100; l /= 100
  const k = n => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [Math.round(f(0)*255), Math.round(f(8)*255), Math.round(f(4)*255)]
}

function rgbToHex(r, g, b) {
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('')
}

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1,3),16)/255
  const g = parseInt(hex.slice(3,5),16)/255
  const b = parseInt(hex.slice(5,7),16)/255
  const max = Math.max(r,g,b), min = Math.min(r,g,b)
  let h, s, l = (max+min)/2
  if (max === min) { h = s = 0 } else {
    const d = max - min
    s = l > 0.5 ? d/(2-max-min) : d/(max+min)
    switch(max) {
      case r: h = ((g-b)/d + (g<b?6:0))/6; break
      case g: h = ((b-r)/d + 2)/6; break
      default: h = ((r-g)/d + 4)/6
    }
  }
  return [h*360, s*100, l*100]
}

export default function ColorWheel({ color, onChange }) {
  const wheelRef   = useRef()
  const [open, setOpen]         = useState(false)
  const [bright, setBright]     = useState(55)
  const popRef = useRef()

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = e => { if (popRef.current && !popRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Draw wheel
  useEffect(() => {
    if (!open || !wheelRef.current) return
    const canvas = wheelRef.current
    const ctx    = canvas.getContext('2d')
    const cx = SIZE/2, cy = SIZE/2, r = SIZE/2 - 2
    const img = ctx.createImageData(SIZE, SIZE)
    for (let x = 0; x < SIZE; x++) {
      for (let y = 0; y < SIZE; y++) {
        const dx = x-cx, dy = y-cy, dist = Math.sqrt(dx*dx+dy*dy)
        if (dist > r) continue
        const hue = (Math.atan2(dy, dx)*180/Math.PI + 360) % 360
        const sat = (dist/r) * 100
        const [rr,gg,bb] = hslToRgb(hue, sat, bright)
        const i = (y*SIZE+x)*4
        img.data[i]=rr; img.data[i+1]=gg; img.data[i+2]=bb; img.data[i+3]=255
      }
    }
    ctx.putImageData(img, 0, 0)

    // Draw cursor at current color position
    if (/^#[0-9a-fA-F]{6}$/.test(color)) {
      const [h,s] = hexToHsl(color)
      const rad = h * Math.PI / 180
      const dist = (s/100) * r
      const px = cx + Math.cos(rad)*dist
      const py = cy + Math.sin(rad)*dist
      ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI*2)
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.stroke()
      ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI*2)
      ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke()
    }
  }, [open, bright, color])

  function pick(e) {
    const canvas = wheelRef.current
    const rect   = canvas.getBoundingClientRect()
    const sx = (e.clientX - rect.left) * (SIZE / rect.width)
    const sy = (e.clientY - rect.top)  * (SIZE / rect.height)
    const cx = SIZE/2, cy = SIZE/2, r = SIZE/2 - 2
    const dx = sx-cx, dy = sy-cy, dist = Math.sqrt(dx*dx+dy*dy)
    if (dist > r) return
    const hue = (Math.atan2(dy,dx)*180/Math.PI + 360) % 360
    const sat = Math.min((dist/r)*100, 100)
    const [rr,gg,bb] = hslToRgb(hue, sat, bright)
    onChange(rgbToHex(rr,gg,bb))
  }

  // drag support
  const dragging = useRef(false)
  function onMouseDown(e) { dragging.current=true; pick(e) }
  function onMouseMove(e) { if (dragging.current) pick(e) }
  function onMouseUp()    { dragging.current=false }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={popRef}>
      {/* Swatch trigger */}
      <div onClick={() => setOpen(o => !o)} style={{
        width: 36, height: 36, borderRadius: 9, background: color,
        cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,.35)',
        border: '2px solid var(--BORDER)', transition: 'transform .12s',
        transform: open ? 'scale(1.1)' : 'scale(1)'
      }} title="เลือกสี" />

      {open && (
        <>
          {/* backdrop */}
          <div style={{ position: 'fixed', inset: 0, zIndex: 600 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'fixed',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 601,
            background: 'var(--CARD)', border: '1px solid var(--BORDER)',
            borderRadius: 14, padding: 14,
            boxShadow: '0 12px 40px rgba(0,0,0,.6)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            minWidth: 210,
          }}>
          {/* Wheel */}
          <canvas
            ref={wheelRef} width={SIZE} height={SIZE}
            style={{ width: SIZE, height: SIZE, borderRadius: '50%', cursor: 'crosshair', display: 'block' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          />

          {/* Brightness slider */}
          <div style={{ width: '100%' }}>
            <div style={{ fontSize: 10, color: 'var(--MUTED)', marginBottom: 4 }}>ความสว่าง</div>
            <div style={{ position: 'relative', height: 12, borderRadius: 6,
              background: 'linear-gradient(to right, #000, hsl(0,0%,'+bright+'%), #fff)',
              cursor: 'pointer'
            }}>
              <input type="range" min={25} max={80} value={bright}
                onChange={e => setBright(Number(e.target.value))}
                style={{ position:'absolute', inset:0, width:'100%', opacity:0, cursor:'pointer', margin:0 }}
              />
              <div style={{
                position:'absolute', top:'50%', left: `${(bright-25)/55*100}%`,
                transform:'translate(-50%,-50%)',
                width:16, height:16, borderRadius:'50%',
                background:'var(--TEXT)', boxShadow:'0 1px 4px rgba(0,0,0,.4)',
                pointerEvents:'none'
              }} />
            </div>
          </div>

          {/* Preview + hex */}
          <div style={{ display:'flex', alignItems:'center', gap:8, width:'100%' }}>
            <div style={{ width:32, height:32, borderRadius:8, background:color, flexShrink:0, border:'1px solid var(--BORDER)' }} />
            <input
              className="form-input"
              value={color}
              onChange={e => onChange(e.target.value)}
              style={{ fontFamily:'monospace', fontSize:12, letterSpacing:1 }}
              placeholder="#rrggbb"
            />
          </div>
        </div>
        </>
      )}
    </div>
  )
}

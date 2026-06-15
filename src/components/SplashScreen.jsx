import React, { useState, useEffect } from 'react'
import { THEMES } from '../themes'

export default function SplashScreen({ theme }) {
  const [fadeOut, setFadeOut] = useState(false)
  const t = THEMES[theme] || THEMES.Light

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 1100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`splash${fadeOut ? ' fade-out' : ''}`} style={{ background: t.BG }}>
      <img src="/KU_SubLogo.png" alt="KU Logo"
        onError={e => { e.target.style.display = 'none' }} />
      <div style={{ marginTop: 20, fontSize: 15, fontWeight: 700, color: t.ACCENT, letterSpacing: 1 }}>
        Schedule Planner
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: t.MUTED }}>
        กำลังโหลด...
      </div>
      <div style={{
        position: 'absolute', bottom: 24,
        fontSize: 10, color: t.MUTED,
        letterSpacing: 0.3, opacity: 0.6, whiteSpace: 'nowrap'
      }}>
        powered by staywithdrxam
      </div>
    </div>
  )
}

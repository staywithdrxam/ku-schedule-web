import React, { useState, useEffect } from 'react'

export default function SplashScreen() {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setFadeOut(true), 1100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`splash${fadeOut ? ' fade-out' : ''}`}>
      <img src="/KU_SubLogo.png" alt="KU Logo"
        onError={e => { e.target.style.display = 'none' }} />
      <div style={{ marginTop: 20, fontSize: 15, fontWeight: 700, color: '#6c63ff', letterSpacing: 1 }}>
        Schedule Planner
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: '#9090b0' }}>
        กำลังโหลด...
      </div>
      <div style={{
        position: 'absolute', bottom: 24,
        fontSize: 10, color: '#c0b8d8', letterSpacing: 0.3, opacity: 0.7
      }}>
        powered by staywithdrxam
      </div>
    </div>
  )
}

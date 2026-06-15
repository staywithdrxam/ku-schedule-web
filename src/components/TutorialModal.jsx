import React, { useEffect, useState } from 'react'

const TUTO_HIDE_KEY = 'ku_tutorial_hide_until'

const TIPS = [
  {
    icon: '＋',
    color: '#6c63ff',
    bg: 'rgba(108,99,255,0.12)',
    title: 'เพิ่มวิชา',
    desc: 'กดปุ่ม + หรือแตะช่องว่างในตารางตรงวันและเวลาที่ต้องการ',
  },
  {
    icon: '✎',
    color: '#e05a7a',
    bg: 'rgba(224,90,122,0.12)',
    title: 'แก้ไข / ลบวิชา',
    desc: 'แตะวิชา 1 ครั้งเพื่อเลือก แล้วกดปุ่มที่ปรากฏ หรือแตะ 2 ครั้งเพื่อแก้ไขทันที',
  },
  {
    icon: '↓',
    color: '#28a870',
    bg: 'rgba(40,168,112,0.12)',
    title: 'บันทึก',
    desc: 'กด "บันทึก" เก็บข้อมูล หรือ "บันทึกรูปภาพ" ส่งออกเป็น PNG',
  },
  {
    icon: '◀',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    title: 'ดูตารางเต็มจอ',
    desc: 'กดปุ่มลูกศร ‹ มุมบนเพื่อพับแผงซ้าย แล้วดูตารางแบบเต็มจอ',
  },
]

export default function TutorialModal({ onClose }) {
  const [hideForDay, setHideForDay] = useState(false)

  function handleClose() {
    if (hideForDay) {
      localStorage.setItem(TUTO_HIDE_KEY, String(Date.now() + 24 * 60 * 60 * 1000))
    }
    onClose()
  }

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [hideForDay])

  return (
    <div className="tut-overlay" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="tut-modal">

        <div className="tut-header">
          <div className="tut-header-left">
            <div className="tut-app-icon">📅</div>
            <div>
              <div className="tut-title">วิธีใช้งาน</div>
              <div className="tut-subtitle">Schedule Planner</div>
            </div>
          </div>
          <button className="tut-close" onClick={handleClose} title="ปิด (ESC)">✕</button>
        </div>

        <div className="tut-body">
          {TIPS.map((tip, i) => (
            <div className="tut-tip-row" key={i}>
              <div className="tut-tip-dot" style={{ background: tip.bg, color: tip.color }}>
                <span>{tip.icon}</span>
              </div>
              <div className="tut-tip-text">
                <div className="tut-tip-title" style={{ color: tip.color }}>{tip.title}</div>
                <div className="tut-tip-desc">{tip.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="tut-footer">
          <label className="tut-skip-label">
            <input
              type="checkbox"
              className="tut-skip-check"
              checked={hideForDay}
              onChange={e => setHideForDay(e.target.checked)}
            />
            <span>ไม่แสดงหน้านี้อีก 1 วัน</span>
          </label>
          <button className="tut-btn-start" onClick={handleClose}>เริ่มใช้งาน →</button>
        </div>

      </div>
    </div>
  )
}
